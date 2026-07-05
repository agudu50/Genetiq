/**
 * Extract readable text from lab result photos using browser OCR.
 * Used when the loaded AI model is text-only (e.g. Gemma 2 2B on CPU).
 */

import { preprocessLabImageDataUrl } from "./preprocessLabImage";

export async function extractLabTextFromImage(
	imageBase64: string,
	onProgress?: (pct: number) => void,
): Promise<string> {
	const { default: Tesseract } = await import("tesseract.js");
	let dataUrl = imageBase64.startsWith("data:")
		? imageBase64
		: `data:image/png;base64,${imageBase64}`;

	try {
		dataUrl = await preprocessLabImageDataUrl(dataUrl);
	} catch {
		// use original if preprocessing fails
	}

	const result = await Tesseract.recognize(dataUrl, "eng", {
		logger: (m) => {
			if (m.status === "recognizing text" && onProgress) {
				onProgress(Math.round(m.progress * 100));
			}
		},
	});

	return result.data.text.replace(/\r/g, "\n").trim();
}

/** OCR multiple lab photos and combine the text. */
export async function extractLabTextFromImages(
	imagesBase64: string[],
	onProgress?: (pct: number) => void,
): Promise<string> {
	if (imagesBase64.length === 0) return "";
	if (imagesBase64.length === 1) {
		return extractLabTextFromImage(imagesBase64[0], onProgress);
	}

	const parts: string[] = [];
	for (let i = 0; i < imagesBase64.length; i++) {
		const pctBase = Math.round((i / imagesBase64.length) * 100);
		const text = await extractLabTextFromImage(imagesBase64[i], (inner) => {
			const overall = pctBase + Math.round(inner / imagesBase64.length);
			onProgress?.(overall);
		});
		if (text) parts.push(`--- Report ${i + 1} ---\n${text}`);
	}
	return parts.join("\n\n");
}

/** True if OCR output looks like it captured lab content. */
export function isUsableLabText(text: string): boolean {
	if (text.length < 8) return false;
	return (
		/[\d]/.test(text) &&
		/\b(hb|hemoglobin|wbc|rbc|glucose|protein|albumin|globulin|creatinine|bilirubin|alt|alat|ast|asat|got|gpt|alk|phos|mg|g\/dl|mmol|test|result|lab|urine|blood|malaria|rdt|u\/l|serum|evaluation|ref)\b/i.test(
			text,
		)
	);
}
