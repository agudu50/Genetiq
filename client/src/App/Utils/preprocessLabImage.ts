/** Improve contrast and size before OCR for clearer text recognition. */
export function preprocessLabImageDataUrl(dataUrl: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const maxDim = 2400;
			const scale = Math.min(2.5, maxDim / Math.max(img.width, img.height, 1));
			const canvas = document.createElement("canvas");
			canvas.width = Math.round(img.width * scale);
			canvas.height = Math.round(img.height * scale);
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				resolve(dataUrl);
				return;
			}
			ctx.filter = "grayscale(1) contrast(1.35) brightness(1.05)";
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			resolve(canvas.toDataURL("image/png"));
		};
		img.onerror = () => reject(new Error("Could not load image for preprocessing"));
		img.src = dataUrl;
	});
}
