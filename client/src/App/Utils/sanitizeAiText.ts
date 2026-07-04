/** Remove em dashes, en dashes, and hyphenated compounds from user-facing AI text. */
export function sanitizeAiText(text: string): string {
	return text
		.replace(/\r\n/g, "\n")
		.replace(/\s*[—–]\s*/g, ", ")
		.replace(/(\d+)\s*-\s*(\d+)/g, "$1 to $2")
		.replace(/([A-Za-zÀ-ÿ])\s*-\s*([A-Za-zÀ-ÿ])/g, "$1 $2")
		.replace(/,\s*,+/g, ", ")
		.replace(/,\s+\./g, ".")
		.replace(/\s+,/g, ",")
		.trim();
}
