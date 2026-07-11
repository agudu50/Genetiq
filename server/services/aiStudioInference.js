/**
 * aiStudioInference.js
 * ═══════════════════════════════════════════════════════════════════════════════
 * Wrapper around the official Google AI Studio API for Gemma/Gemini chat completions.
 * Uses the @google/genai package to call hosted models.
 */

const { GoogleGenAI } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Gemma 4 31B — the flagship open model from Google DeepMind, used for this hackathon
const MODEL_ID = process.env.GEMMA_MODEL || "gemma-4-31b-it";

if (!GEMINI_API_KEY) {
	console.warn(
		"⚠️  No GEMINI_API_KEY set — AI API calls will fail. Add GEMINI_API_KEY to your .env"
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
async function chatCompletion(messages, maxTokens = 8192) {
	if (!ai) {
		throw new Error("GEMINI_API_KEY is missing. Cannot call Google AI Studio.");
	}

	try {
		const contents = [];
		for (const msg of messages) {
			const parts = [];
			if (msg.image_base64) {
				// Extract base64 and mime type if it's a data URL
				const matches = msg.image_base64.match(/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/);
				if (matches) {
					parts.push({
						inlineData: {
							mimeType: matches[1],
							data: matches[2]
						}
					});
				} else {
					// Fallback if it's just raw base64
					parts.push({
						inlineData: {
							mimeType: "image/jpeg",
							data: msg.image_base64
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
				// Note: responseMimeType is NOT supported by Gemma 4 thinking models
			}
		});

		// Gemma 4 is a thinking model — response.text returns only non-thought parts.
		// If response.text is undefined (e.g. all tokens consumed by thinking), fall back
		// to manually extracting text from candidate parts.
		let text = response.text;
		if (text === undefined || text === null) {
			const candidate = response.candidates?.[0];
			if (candidate?.content?.parts) {
				// Prefer non-thought parts; if none, use all parts
				const nonThought = candidate.content.parts
					.filter(p => !p.thought)
					.map(p => p.text)
					.join("");
				text = nonThought || candidate.content.parts.map(p => p.text).join("");
			}
		}

		if (!text) {
			throw new Error("Model returned empty response");
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
