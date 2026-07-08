/**
 * Extract readable text from uploaded lab files (PDF, CSV, TXT).
 * Photos are handled separately via OCR in extractLabText.ts.
 */

export interface ExtractedPdf {
	/** Text found in the PDF's text layer (empty for scanned PDFs). */
	text: string;
	/** Page images (base64 PNG, no data: prefix) for OCR when there is no text layer. */
	pageImagesBase64: string[];
}

async function loadPdfJs() {
	const pdfjs = await import("pdfjs-dist");
	const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
	pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
	return pdfjs;
}

/**
 * Read a PDF lab report. Returns its embedded text when available;
 * for scanned PDFs (no text layer) renders each page to an image for OCR.
 */
export async function extractPdfContent(file: File, maxPages = 5): Promise<ExtractedPdf> {
	const pdfjs = await loadPdfJs();
	const buffer = await file.arrayBuffer();
	const doc = await pdfjs.getDocument({ data: buffer }).promise;

	const pages = Math.min(doc.numPages, maxPages);
	const textParts: string[] = [];

	for (let i = 1; i <= pages; i++) {
		const page = await doc.getPage(i);
		const content = await page.getTextContent();
		const pageText = content.items
			.map((item) => ("str" in item ? item.str : ""))
			.join(" ")
			.replace(/\s+/g, " ")
			.trim();
		if (pageText) textParts.push(pageText);
	}

	const text = textParts.join("\n\n").trim();

	// Enough embedded text — no need to rasterise
	if (text.length >= 40) {
		await doc.destroy();
		return { text, pageImagesBase64: [] };
	}

	// Scanned PDF — render pages to images so Tesseract can OCR them
	const pageImagesBase64: string[] = [];
	for (let i = 1; i <= pages; i++) {
		const page = await doc.getPage(i);
		const viewport = page.getViewport({ scale: 2 });
		const canvas = document.createElement("canvas");
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) continue;
		await page.render({ canvasContext: ctx, viewport, canvas }).promise;
		pageImagesBase64.push(canvas.toDataURL("image/png").split(",")[1]);
	}

	await doc.destroy();
	return { text, pageImagesBase64 };
}

/** Read plain-text files (CSV, TXT) uploaded as lab reports. */
export function readTextFile(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || "").trim());
		reader.onerror = reject;
		reader.readAsText(file);
	});
}
