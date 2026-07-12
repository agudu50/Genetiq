/**
 * aiStudioInference.js
 * ═══════════════════════════════════════════════════════════════════════════════
 * Wrapper around the official Google AI Studio API for Gemma/Gemini chat completions.
 * Uses the @google/genai package to call hosted models.
 */

const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Hardcoding to gemini-2.5-flash to bypass npm run dev process.env caching which is stuck on the broken gemma-4 endpoint.
const MODEL_ID = "gemini-2.5-flash"; // process.env.GEMMA_MODEL || "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
	console.warn(
		" No GEMINI_API_KEY set — AI API calls will fail. Add GEMINI_API_KEY to your .env"
	);
}

// Initialize the Google Gen AI SDK
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

/**
 * Run a chat completion against the hosted model.
 * @param {Array<{role: string, content: string}>} messages - Chat messages (OpenAI/HF style)
 * @param {number} maxTokens - Max tokens to generate
 * @returns {Promise<string>} - The model's text response
 */
async function chatCompletion(messages, maxTokens = 1024) {
	if (!ai) {
		throw new Error("GEMINI_API_KEY is missing. Cannot call Google AI Studio.");
	}

	try {
		const contents = [];
		for (const msg of messages) {
			const parts = [];
			const imagesToProcess = msg.image_base64_list || (msg.image_base64 ? [msg.image_base64] : []);
			for (const img of imagesToProcess) {
				// Try to extract base64 and mime type if it's a data URL
				const matches = img.match(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9.-]+);base64,(.+)$/);
				if (matches) {
					parts.push({
						inlineData: {
							mimeType: matches[1],
							data: matches[2]
						}
					});
				} else {
					// Fallback if it's just raw base64 (assume jpeg)
					parts.push({
						inlineData: {
							mimeType: "image/jpeg",
							data: img
						}
					});
				}
			}
			parts.push({ text: msg.content });
			contents.push({ role: msg.role === "assistant" ? "model" : "user", parts });
		}

		const response = await ai.models.generateContent({
			model: MODEL_ID,
			contents: contents,
			config: {
				maxOutputTokens: maxTokens,
				temperature: 0.2, // Lowered to prevent JSON formatting errors
				topP: 0.95,
				responseMimeType: "application/json"
			}
		});

		const text = response.text;
		if (text === undefined) {
			console.error("Google AI Studio returned a response with no text:", JSON.stringify(response, null, 2));
			return "";
		}

		return text.trim();
	} catch (err) {
		console.error("Google AI Studio API error:", err.message);
		throw err;
	}
}

/**
 * Parse JSON from model response text.
 * The model sometimes wraps JSON in markdown code fences.
 */
function parseJsonResponse(text) {
	// Strip markdown code fences
	let cleaned = text.trim();
	cleaned = cleaned.replace(/^```(?:json)?\s*/, "");
	cleaned = cleaned.replace(/\s*```$/, "");

	// Try to find a JSON object
	const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
	if (jsonMatch) {
		let jsonStr = jsonMatch[0];
		try {
			return JSON.parse(jsonStr);
		} catch {
			try {
				// Attempt basic fixes for missing brackets before commas: `" ... "\n    ,\n    {` -> `" ... "\n    },\n    {`
				jsonStr = jsonStr.replace(/"\s*,/g, '"\n    },');
				// Fix trailing commas
				jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");
				return JSON.parse(jsonStr);
			} catch (e) {
				// Fall through
			}
		}
	}

	return { error: "Could not parse model response", raw: text };
}

/**
 * Uses Gemini Flash to transcribe images to text before sending to Gemma.
 * This is crucial because some Gemma models on AI Studio are text-only.
 */
async function extractTextFromImages(imagesBase64List) {
	if (!ai || !imagesBase64List || imagesBase64List.length === 0) return "";
	try {
		const parts = [];
		for (const img of imagesBase64List) {
			const matches = img.match(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9.-]+);base64,(.+)$/);
			if (matches) {
				parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
			} else {
				parts.push({ inlineData: { mimeType: "image/jpeg", data: img } });
			}
		}
		parts.push({ text: "Transcribe all the text from this medical lab report exactly as it appears. Include all numbers, units, and test names. Do not summarize or format it, just output the raw text." });

		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [{ role: "user", parts }],
			config: { temperature: 0.2 }
		});
		return response.text || "";
	} catch (err) {
		console.warn("Gemini Vision OCR failed:", err.message);
		return "";
	}
}

module.exports = {
	chatCompletion,
	parseJsonResponse,
	extractTextFromImages,
	MODEL_ID,
	GEMINI_API_KEY,
};
