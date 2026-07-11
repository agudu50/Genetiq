/**
 * aiStudioInference.js
 * ═══════════════════════════════════════════════════════════════════════════════
 * Wrapper around the official Google AI Studio API for Gemma/Gemini chat completions.
 * Uses the @google/genai package to call hosted models.
 */

const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// The hackathon uses Gemma 4, so we'll default to the standard model string convention
const MODEL_ID = process.env.GEMMA_MODEL || "gemini-2.5-flash"; // Fallback to a fast model if Gemma 4 specific ID isn't provided, but you should use the exact Gemma 4 ID provided by the hackathon.

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
				temperature: 0.7,
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
		try {
			return JSON.parse(jsonMatch[0]);
		} catch {
			// Fall through
		}
	}

	return { error: "Could not parse model response", raw: text };
}

module.exports = {
	chatCompletion,
	parseJsonResponse,
	MODEL_ID,
	GEMINI_API_KEY,
};
