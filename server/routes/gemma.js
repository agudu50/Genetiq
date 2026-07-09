/**
 * routes/gemma.js
 * ═══════════════════════════════════════════════════════════════════════════════
 * Express routes that mirror the Python FastAPI Gemma endpoints.
 * Uses the Hugging Face Inference API instead of local model loading.
 *
 * Endpoints:
 *   GET  /health       — AI readiness check
 *   POST /analyze      — Lab result analysis
 *   POST /chat         — Health symptom chat
 *   POST /action-plan  — Personalized action plan
 *   POST /translate    — Ghanaian language translation
 */

const express = require("express");
const router = express.Router();
const { chatCompletion, parseJsonResponse, MODEL_ID, GEMINI_API_KEY } = require("../services/aiStudioInference");
const {
	LAB_ANALYSIS_SYSTEM_PROMPT,
	LAB_TEXT_ANALYSIS_SYSTEM_PROMPT,
	CHAT_SYSTEM_PROMPT,
	CHAT_SYSTEM_PROMPT_SHORT,
	ACTION_PLAN_SYSTEM_PROMPT,
	TRANSLATION_PROMPT,
	PRESET_CASES,
	TRANSLATIONS,
	getSmallTalkResponse,
} = require("../services/prompts");

// ─── Health Check ────────────────────────────────────────────────────────────

router.get("/health", (_req, res) => {
	res.json({
		status: "ok",
		model_loaded: Boolean(GEMINI_API_KEY),
		model_id: MODEL_ID,
		device: "google-ai-studio",
		supports_vision: true,
	});
});

// ─── Analyze Lab Results ─────────────────────────────────────────────────────

router.post("/analyze", async (req, res) => {
	try {
		const {
			image_base64,
			lab_text,
			preset_id,
			patient_age = "35",
			patient_gender = "unknown",
			language = "english",
		} = req.body;

		let userContent = "";
		let systemPrompt = LAB_ANALYSIS_SYSTEM_PROMPT;

		if (preset_id && PRESET_CASES[preset_id]) {
			const preset = PRESET_CASES[preset_id];
			userContent = preset.prompt
				.replace("{age}", patient_age)
				.replace("{gender}", patient_gender);
		} else if (lab_text && lab_text.trim()) {
			systemPrompt = LAB_TEXT_ANALYSIS_SYSTEM_PROMPT;
			const labBody = lab_text.trim().slice(0, 4000);
			userContent =
				`Analyze this lab result text for a ${patient_age} year old ${patient_gender} patient in Ghana.\n` +
				`The text was extracted from a photo (OCR) and may contain minor errors.\n\n` +
				`--- LAB REPORT TEXT ---\n${labBody}\n--- END ---`;
		} else if (image_base64) {
			systemPrompt = LAB_ANALYSIS_SYSTEM_PROMPT;
			userContent = `Analyze this lab result photo for a ${patient_age} year old ${patient_gender} patient in Ghana.`;
		} else {
			return res.status(400).json({
				detail: "Provide preset_id, lab_text, or image_base64",
			});
		}

		const messages = [
			{ role: "user", content: systemPrompt + "\n\n" + userContent, image_base64 },
		];

		const rawResponse = await chatCompletion(messages, 1024);
		const result = parseJsonResponse(rawResponse);

		if (result.error && result.raw) {
			return res.status(502).json({ detail: "Model returned unparseable analysis" });
		}

		// Add language translations if requested
		if (language !== "english" && TRANSLATIONS[language]) {
			result.translations = TRANSLATIONS[language];
		}

		return res.json(result);
	} catch (err) {
		console.error("Analyze error:", err);
		return res.status(500).json({ detail: err.message });
	}
});

// ─── Chat ────────────────────────────────────────────────────────────────────

router.post("/chat", async (req, res) => {
	try {
		const { message, language = "english", image_base64 } = req.body;

		// Small-talk fast-path — instant response, no API call needed
		const smallTalk = getSmallTalkResponse(message, language);
		if (smallTalk) {
			if (language !== "english" && TRANSLATIONS[language]) {
				smallTalk.translations = TRANSLATIONS[language];
			}
			return res.json(smallTalk);
		}

		// Use shorter system prompt for brief messages
		const useShort = message.trim().length < 150;
		const systemPrompt = useShort ? CHAT_SYSTEM_PROMPT_SHORT : CHAT_SYSTEM_PROMPT;

		const messages = [
			{ role: "user", content: systemPrompt + "\n\n" + message, image_base64 },
		];

		const rawResponse = await chatCompletion(messages, 256);
		let result = parseJsonResponse(rawResponse);

		// If JSON parsing failed, build a fallback structure
		if (result.error && result.raw) {
			// Strip markdown from raw text
			let cleaned = result.raw.trim();
			cleaned = cleaned.replace(/^```(?:json)?\s*/, "");
			cleaned = cleaned.replace(/\s*```$/, "");
			result = {
				message: cleaned,
				bodySystem: "total",
				urgency: "Yellow",
				condition: "Symptom discussion",
				system: "General",
			};
		}

		if (language !== "english" && TRANSLATIONS[language]) {
			result.translations = TRANSLATIONS[language];
		}

		return res.json(result);
	} catch (err) {
		console.error("Chat error:", err);
		return res.status(500).json({ detail: err.message });
	}
});

// ─── Action Plan ─────────────────────────────────────────────────────────────

router.post("/action-plan", async (req, res) => {
	try {
		const {
			patient_age = "unknown",
			patient_gender = "unknown",
			health_score,
			summary,
			findings = [],
			recommendations = [],
			symptoms = [],
			medical_conditions = [],
			medications = [],
			lifestyle = {},
			bmi,
			language = "english",
		} = req.body;

		const promptParts = [
			"Create a personalized action plan for this patient in Ghana.",
			`Age: ${patient_age} | Gender: ${patient_gender}`,
		];

		if (health_score) promptParts.push(`Health score: ${health_score}/100`);
		if (bmi) promptParts.push(`BMI: ${bmi.toFixed(1)}`);
		if (summary) promptParts.push(`\nLab summary:\n${summary}`);

		if (findings.length > 0) {
			const lines = findings.slice(0, 12).map((f) => {
				const marker = f.marker || f.name || "Unknown";
				const value = f.value || "";
				const status = f.status || "";
				const note = f.note || "";
				return `- ${marker}: ${value} (${status}) — ${note}`;
			});
			promptParts.push(`\nLab findings:\n${lines.join("\n")}`);
		}

		if (recommendations.length > 0) {
			const lines = recommendations.slice(0, 8).map((r) => {
				return `- ${r.title || ""}: ${r.body || ""}`;
			});
			promptParts.push(`\nExisting recommendations:\n${lines.join("\n")}`);
		}

		if (symptoms.length > 0) {
			promptParts.push(`\nReported symptoms: ${symptoms.join(", ")}`);
		}
		if (medical_conditions.length > 0) {
			promptParts.push(`\nMedical conditions: ${medical_conditions.join(", ")}`);
		}
		if (medications.length > 0) {
			const medLines = medications
				.filter((m) => m.name)
				.map((m) => `- ${m.name} (${m.dosage || ""}, ${m.frequency || ""})`);
			if (medLines.length > 0) {
				promptParts.push(`\nCurrent medications:\n${medLines.join("\n")}`);
			}
		}
		if (Object.keys(lifestyle).length > 0) {
			promptParts.push(
				`\nLifestyle: smoking=${lifestyle.smoking || "unknown"}, ` +
					`alcohol=${lifestyle.alcohol || "unknown"}, ` +
					`exercise=${lifestyle.exercise || "unknown"}, ` +
					`diet=${lifestyle.diet || "unknown"}`
			);
		}

		const messages = [
			{
				role: "user",
				content: ACTION_PLAN_SYSTEM_PROMPT + "\n\n" + promptParts.join("\n"),
			},
		];

		const rawResponse = await chatCompletion(messages, 768);
		const result = parseJsonResponse(rawResponse);

		if (language !== "english" && TRANSLATIONS[language]) {
			result.translations = TRANSLATIONS[language];
		}

		result.source = "gemma";
		return res.json(result);
	} catch (err) {
		console.error("Action plan error:", err);
		return res.status(500).json({ detail: err.message });
	}
});

// ─── Translate ───────────────────────────────────────────────────────────────

router.post("/translate", async (req, res) => {
	try {
		const { text, language } = req.body;

		// Check offline dictionary first
		if (TRANSLATIONS[language] && TRANSLATIONS[language][text]) {
			return res.json({
				translation: TRANSLATIONS[language][text],
				source: "offline",
			});
		}

		// Use Gemma via HF Inference for full translation
		const prompt = TRANSLATION_PROMPT.replace(/\{language\}/g, language).replace(
			"{text}",
			text
		);

		const translation = await chatCompletion(
			[{ role: "user", content: prompt }],
			512
		);

		return res.json({ translation, source: "gemma" });
	} catch (err) {
		return res.json({ translation: req.body.text, source: "fallback", error: err.message });
	}
});

module.exports = router;
