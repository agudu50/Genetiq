/**
 * hfInference.js
 * ═══════════════════════════════════════════════════════════════════════════════
 * Thin wrapper around the Hugging Face Inference API for Gemma chat completions.
 * Uses the @huggingface/inference package to call hosted Gemma models.
 */

const { HfInference } = require("@huggingface/inference");

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_ID = process.env.GEMMA_MODEL || "google/gemma-2-2b-it";

if (!HF_TOKEN) {
	console.warn(
		"⚠️  No HF_TOKEN set — Gemma API calls will fail. Add HF_TOKEN to your .env"
	);
}

const hf = new HfInference(HF_TOKEN);

/**
 * Run a chat completion against the hosted Gemma model.
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {number} maxTokens - Max tokens to generate (default 512)
 * @returns {Promise<string>} - The model's text response
 */
async function chatCompletion(messages, maxTokens = 512) {
	try {
		const response = await hf.chatCompletion({
			model: MODEL_ID,
			messages,
			max_tokens: maxTokens,
			temperature: 0.7,
			top_p: 0.95,
		});

		const text = response.choices?.[0]?.message?.content || "";
		return text.trim();
	} catch (err) {
		console.error("HF Inference API error:", err.message);
		throw err;
	}
}

/**
 * Parse JSON from model response text.
 * Gemma sometimes wraps JSON in markdown code fences.
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
	HF_TOKEN,
};
