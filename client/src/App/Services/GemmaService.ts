/**
 * GemmaService.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 * Frontend service layer for communicating with the Gemma 4 Python backend.
 * Falls back to a smart offline simulator when the server is unavailable.
 *
 * Architecture:
 *   React UI  →  GemmaService  →  Python FastAPI (Gemma 4 12B-it)
 *                     ↓ (fallback)
 *              Smart Offline Simulator
 */

import { sanitizeAiText } from "@/App/Utils/sanitizeAiText";
import { extractLabTextFromImages, isUsableLabText } from "@/App/Utils/extractLabText";
import { parseAndBuildFallback } from "@/App/Utils/parseLabOcrText";
import { inferPlanIconId } from "@/Features/Dashboard/PlanWidget/helpers/planItemIcons";
import type { PlanSection } from "@/Features/Dashboard/PlanWidget/helpers/planMockData";

// ─── Types ───────────────────────────────────────────────────────────────────

export type GemmaLanguage = "english" | "twi" | "ga" | "ewe" | "fante";

export interface GemmaFinding {
	id: string;
	name: string;
	marker: string;
	value: string;
	status: "normal" | "elevated" | "low" | "action";
	statusLabel: string;
	note: string;
}

export interface GemmaRecommendation {
	icon: string;
	title: string;
	body: string;
}

export interface GemmaAnalysisResult {
	healthScore: number;
	findings: GemmaFinding[];
	recommendations: GemmaRecommendation[];
	summary: string;
	bodySystem: string;
	summarySections?: Array<{
		id: string;
		title: string;
		body: string;
		tone?: "info" | "caution" | "neutral";
	}>;
	translations?: Record<string, string>;
}

export interface GemmaChatResult {
	message: string;
	bodySystem: string;
	urgency: "Green" | "Yellow" | "Red";
	condition: string;
	system: string;
	translations?: Record<string, string>;
}

export type GemmaMode = "gemma-local" | "demo-offline";

function finalizeChatResult(result: GemmaChatResult): GemmaChatResult {
	return { ...result, message: sanitizeAiText(result.message) };
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** In dev, use Vite proxy (same origin). Override with VITE_GEMMA_URL if needed. */
const GEMMA_BASE_URL =
	import.meta.env.VITE_GEMMA_URL ??
	(import.meta.env.DEV ? "" : "http://localhost:8000");

function fetchWithTimeout(url: string, ms = 15_000): Promise<Response> {
	if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
		return fetch(url, { signal: AbortSignal.timeout(ms) });
	}
	const controller = new AbortController();
	const timer = window.setTimeout(() => controller.abort(), ms);
	return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ─── Service State ───────────────────────────────────────────────────────────

let _healthCache: {
	available: boolean;
	modelLoaded: boolean;
	modelId: string;
	device: string;
	supportsVision: boolean;
	checkedAt: number;
} | null = null;
const HEALTH_CHECK_INTERVAL = 15_000;
const HEALTH_STALE_OK_MS = 90_000;

export function invalidateGemmaHealthCache(): void {
	_healthCache = null;
}

export type GemmaHealthStatus = {
	available: boolean;
	modelLoaded: boolean;
	modelId: string;
	device: string;
	supportsVision: boolean;
};

// ─── Health Check ────────────────────────────────────────────────────────────

export async function checkGemmaHealth(force = false): Promise<GemmaHealthStatus> {
	const now = Date.now();
	if (!force && _healthCache && now - _healthCache.checkedAt < HEALTH_CHECK_INTERVAL) {
		return _healthCache;
	}

	const previous = _healthCache;

	try {
		const res = await fetchWithTimeout(`${GEMMA_BASE_URL}/api/gemma/health`, 12_000);
		if (res.ok) {
			const data = await res.json();
			_healthCache = {
				available: true,
				modelLoaded: Boolean(data.model_loaded),
				modelId: data.model_id ?? "",
				device: data.device ?? "none",
				supportsVision: Boolean(data.supports_vision),
				checkedAt: now,
			};
			return _healthCache;
		}
	} catch {
		// Server busy or unreachable — keep last good status briefly
		if (previous?.available && now - previous.checkedAt < HEALTH_STALE_OK_MS) {
			return previous;
		}
	}

	if (previous?.available && now - previous.checkedAt < HEALTH_STALE_OK_MS) {
		return previous;
	}

	_healthCache = {
		available: false,
		modelLoaded: false,
		modelId: "",
		device: "none",
		supportsVision: false,
		checkedAt: now,
	};
	return _healthCache;
}

export function getGemmaMode(): GemmaMode {
	return _healthCache?.modelLoaded ? "gemma-local" : "demo-offline";
}

export function isCpuInference(): boolean {
	return _healthCache?.device === "cpu";
}

// ─── Analyze Lab Results ─────────────────────────────────────────────────────

export type AnalyzeProgressPhase = "ocr" | "ai";

function isValidAnalysisResult(r: unknown): r is GemmaAnalysisResult {
	if (!r || typeof r !== "object") return false;
	const x = r as GemmaAnalysisResult;
	return (
		typeof x.healthScore === "number" &&
		Array.isArray(x.findings) &&
		typeof x.summary === "string" &&
		x.summary.length > 0
	);
}

export async function analyzeLabResults(opts: {
	imageBase64?: string;
	imageBase64List?: string[];
	labText?: string;
	presetId?: string;
	patientAge: string;
	patientGender: string;
	language: GemmaLanguage;
	onProgress?: (phase: AnalyzeProgressPhase, message: string, pct?: number) => void;
}): Promise<GemmaAnalysisResult> {
	const health = await checkGemmaHealth();
	let labText = opts.labText?.trim() || "";

	const images =
		opts.imageBase64List?.length
			? opts.imageBase64List
			: opts.imageBase64
				? [opts.imageBase64]
				: [];

	// Always OCR uploaded photos before sending to the API.
	// This gives us labText to use as a fallback if the AI Studio API returns a 500 error.
	if (!labText && images.length > 0 && !opts.presetId) {
		opts.onProgress?.("ocr", images.length > 1 ? "Reading your lab photos…" : "Reading text from your lab photo…", 0);
		try {
			const extracted = await extractLabTextFromImages(images, (pct) =>
				opts.onProgress?.("ocr", "Reading text from your lab photo…", pct),
			);
			if (isUsableLabText(extracted)) {
				labText = extracted;
			}
		} catch (e) {
			console.warn("OCR failed:", e);
		}
	}

	const useVision = health.supportsVision && images.length > 0 && !opts.presetId && !labText;
	const onCpu = /cpu/i.test(health.device);

	let result: GemmaAnalysisResult | null = null;

	// CPU Gemma analysis can take 5–15+ min — use OCR + local parser for instant results
	if (onCpu && health.modelLoaded) {
		if (opts.presetId) {
			opts.onProgress?.("ai", "Building your analysis…");
			result = simulateLabAnalysis({ ...opts, labText });
		} else if (labText) {
			opts.onProgress?.("ai", "Interpreting your lab values…");
			result = parseAndBuildFallback(labText, opts.patientAge, opts.patientGender);
		}
	}

	if (!result && health.available && health.modelLoaded) {
		try {
			opts.onProgress?.("ai", "Analysing your results with Gemma AI…");
			const res = await fetch(`${GEMMA_BASE_URL}/api/gemma/analyze`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					image_base64_list: useVision ? images : undefined,
					lab_text: labText || undefined,
					preset_id: opts.presetId,
					patient_age: opts.patientAge,
					patient_gender: opts.patientGender,
					language: opts.language,
				}),
				signal: AbortSignal.timeout(onCpu ? 90_000 : 300_000),
			});
			if (res.ok) {
				const data = await res.json();
				if (isValidAnalysisResult(data)) {
					result = data as GemmaAnalysisResult;
				} else {
					console.warn("Gemma returned incomplete analysis, using local parser");
				}
			} else {
				const errBody = await res.json().catch(() => null);
				console.warn("Gemma analyze failed:", res.status, errBody);
			}
		} catch (e) {
			console.warn("Gemma server error, falling back:", e);
		}
	}

	// Local parser fallback — works even when AI server is offline
	if (!result && labText && !opts.presetId) {
		result = parseAndBuildFallback(labText, opts.patientAge, opts.patientGender);
	}

	if (!result) {
		result = simulateLabAnalysis({ ...opts, labText });
	}

	return translateAnalysisResult(result, opts.language);
}

// ─── Chat with Gemma ─────────────────────────────────────────────────────────

const MEDICAL_KEYWORDS_RE =
	/fever|pain|painful|aching|aches?|hurts?|hurt|injur|wound|fracture|bruise|cut|burn|sprain|accident|fell|fall|broken|lacerat|bleed|head|headache|migraine|cough|symptom|vomit|diarr|chill|nausea|dizz|weak|tired|breath|chest|stomach|malaria|typhoid|urin|swell|rash|sick|ill|unwell|sore|cramp|infection|anemia|diabet|pressure|body\s*pain|throat|ear|eye|appetite|weight\s*loss|can'?t\s*eat|not\s*eating|constipat|bloat|fatigue|insomnia|sleep|palpit|swollen|jaundice|dehydrat|defecat|bowel|stool|feces|faeces|poop|toilet|lavatory|loose\s*stool|ankle|knee|leg|arm|hand|foot|finger|toe|back|neck|shoulder|wrist|hip|bite|sting|allerg/i;

/** Broader check — avoids sending real symptom messages to the generic redirect. */
function isLikelyHealthMessage(text: string): boolean {
	if (hasMedicalIntent(text)) return true;
	const lower = text.toLowerCase();
	if (
		/\b(health|injur|wound|hurt|accident|fell|fall|broken|bleed|doctor|hospital|clinic|bother|wrong|sick|symptom|problem|help|advice|unwell|ache|aching|discomfort|concern|worried|worry)\b/.test(
			lower,
		)
	) {
		return true;
	}
	if (/\b(feel(ing)?|not\s+well|under\s+the\s+weather|something\s+wrong|going\s+on)\b/.test(lower)) {
		return true;
	}
	// In a health chat, substantive messages are almost always symptom-related
	const trimmed = text.trim();
	if (trimmed.length >= 8 && /[a-z]{3,}/i.test(trimmed) && !/^(hi|hello|hey|thanks|thank\s*you|ok|okay|yes|no|maybe)\b/i.test(trimmed)) {
		return true;
	}
	return false;
}

/** Detect symptom descriptions even when phrasing is informal ("my head is aching"). */
function hasMedicalIntent(text: string): boolean {
	const lower = text.toLowerCase();
	if (MEDICAL_KEYWORDS_RE.test(lower)) return true;
	if (
		/\b(head|stomach|chest|back|throat|ear|eyes?|neck|joint|muscle|leg|arm|knee|ankle|hand|foot|finger|toe|shoulder|wrist|hip)\b/.test(lower) &&
		/\b(ach|pain|hurt|sore|swell|bleed|stiff|numb|tingl)/.test(lower)
	) {
		return true;
	}
	if (
		/\b(lost|losing|loss|no|lack|poor|low|reduced|decreased)\b/.test(lower) &&
		/\b(appetite|weight|energy|sleep|hair|hearing|vision)\b/.test(lower)
	) {
		return true;
	}
	if (
		/\b(rest|sleep|exhaust|fatigue|insomnia|drained|burned?\s*out|tired)\b/.test(lower) ||
		/\b(not enough|don't have enough|dont have enough|need more|lack of|haven't had enough)\b.*\b(rest|sleep)\b/.test(
			lower,
		) ||
		/\b(enough rest|not enough rest|need rest|need sleep|no rest)\b/.test(lower) ||
		/\bit seems\b.*\b(rest|sleep|tired|fatigue)\b/.test(lower)
	) {
		return true;
	}
	if (
		/\b(i have|i've|i am|i'?m|im experiencing|suffering from|what might|what could|why do i|feel(ing)?)\b/.test(
			lower,
		) &&
		/\b(pain|fever|ache|symptom|problem|issues?|wrong|sick|unwell|well|tired|weak|dizzy|nausea|vomit|cough|head|stomach|appetite|weight|sleep|breath|swell|rash|infection|eating|eat|bowel|stool|diarr|injur|hurt|wound|bleed|off|bad|terrible|awful)\b/.test(
			lower,
		)
	) {
		return true;
	}
	return false;
}

const SMALL_TALK_RESPONSES: Record<
	GemmaLanguage,
	{ greeting: string; wellbeingReply: string; wellbeingQuestion: string; thanksReply: string; redirect: string }
> = {
	english: {
		greeting:
			"Hello! I'm your Genetiq Health Assistant. Describe your symptoms or tap a quick suggestion below — that helps me give you a faster, more useful answer.",
		wellbeingReply:
			"That's great to hear! I'm doing well too — thanks for asking. Whenever you're ready, tell me how you're feeling or what's bothering you (fever, headache, stomach pain, etc.), or tap a quick suggestion below.",
		wellbeingQuestion:
			"I'm here and ready to help! How are you feeling health-wise today? Any symptoms like fever, cough, or body pain I can help with?",
		thanksReply:
			"You're welcome! If you have any other health questions, I'm here to help.",
		redirect:
			"I'm here for health questions! Tell me what's bothering you — for example fever, headache, stomach pain, or cough — or tap one of the quick suggestions for a faster answer.",
	},
	twi: {
		greeting:
			"Maakye/Maaha/Maadi! Me ne wo Gemma Ahoɔden Boafo. Kyerɛ me wo yare anaa kɔfa nhwɛsoɔ a ɛwɔ ase ha — ɛbɛma me ama wo ntɛm.",
		wellbeingReply:
			"Ɛyɛ anigyeɛ sɛ wote yie! Me nso mete yie — meda wo ase. Sɛ wobɛyɛ a, kyerɛ me sɛnea wote anaa deɛ ɛhaw wo, anaa paw nhwɛsoɔ bi wɔ ase ha.",
		wellbeingQuestion:
			"Mewɔ ha na mɛboa wo! Ɛte sɛn nnɛ wɔ wo ahoɔden ho? Wo wɔ yare bi a metumi aboa wo?",
		thanksReply: "Meda wo ase! Sɛ wɔ asɛm foforo bi a ɛfa wo ahoɔden ho a, bisa me.",
		redirect:
			"Mewɔ ha ma ahoɔden ho asɛm! Kyerɛ me deɛ ɛhaw wo — te sɛ ayerɛ, ti yare, yafunu mu yare — anaa paw nhwɛsoɔ bi wɔ ase ha.",
	},
	ga: {
		greeting:
			"Ojekoo! Mi ji Gemma Hewale Yelikɛlɔ. Kɛɛ mi bo ni hewale shishi aloo fĩi nhwɛsoɔ ko wɔ shishi nɛɛ.",
		wellbeingReply:
			"Ehi kpakpa! Mi nɔ yɛɛ ehi tamɔ — akpe. Kɛji wobɛyɛ a, kɛɛ mi bo ni hewale shishi aloo fĩi nhwɛsoɔ ko.",
		wellbeingQuestion:
			"Mi wɔ he ni mɛbaaye abua bo! Ɛte sɛn wɔ wo hewale he nnɛ?",
		thanksReply: "Akpe! Sɛ wò wɔ hewale asɛm foforo a, bi mi sane.",
		redirect:
			"Mi wɔ he ma hewale asɛm! Kɛɛ mi bo ni ɛhaw wo aloo fĩi nhwɛsoɔ ko.",
	},
	ewe: {
		greeting:
			"Woezɔ! Nye nye Gemma Lãmesẽ Boafo. Kpɔ wò lãmesẽ ŋu alo tia nɔnɔme bubu le ete.",
		wellbeingReply:
			"Enyo ŋutɔ! Nye hã le dɔwɔwɔ me. Ne èdi be yee la, kpɔ wò lãmesẽ ŋu alo tia nɔnɔme bubu le ete.",
		wellbeingQuestion:
			"Nye le afi be nàte ŋu! Aleke nèlãmesẽ le egbe?",
		thanksReply: "Akpe na wò! Ne èle lãmesẽ ŋutɔ bubu la, bi nye.",
		redirect:
			"Nye le afi ma lãmesẽ ŋutɔ! Kpɔ nusi ɖe wò ŋu alo tia nɔnɔme bubu le ete.",
	},
	fante: {
		greeting:
			"Maakye/Maaha! Me ne wo Gemma Ahoɔden Boafo. Kyerɛ me wo yare anaa paw nhwɛsoɔ bi wɔ ase ha.",
		wellbeingReply:
			"Ɛyɛ anigye sɛ wote yie! Me nso mete yie. Sɛ wobɛyɛ a, kyerɛ me sɛnea wote anaa paw nhwɛsoɔ bi wɔ ase ha.",
		wellbeingQuestion:
			"Mewɔ ha na mɛboa wo! Ɛte sɛn nnɛ wɔ wo ahoɔden ho?",
		thanksReply: "Meda wo ase! Sɛ wɔ asɛm foforo bi a ɛfa wo ahoɔden ho a, bisa me.",
		redirect:
			"Mewɔ ha ma ahoɔden ho asɛm! Kyerɛ me deɛ ɛhaw wo, anaa paw nhwɛsoɔ bi wɔ ase ha.",
	},
};

function getSmallTalkResponse(
	message: string,
	language: GemmaLanguage,
	recentUserMessages: string[] = [],
): GemmaChatResult | null {
	const text = message.trim();
	const lower = text.toLowerCase();
	const copy = SMALL_TALK_RESPONSES[language] || SMALL_TALK_RESPONSES.english;

	// Symptom messages must go to triage, not small-talk redirect
	if (isLikelyHealthMessage(text)) return null;

	const toResult = (msg: string): GemmaChatResult => ({
		message: msg,
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	});

	const isGreeting = (s: string) =>
		/^(hi|hello|hey|hola|greetings|good\s*(morning|afternoon|evening)|howdy|sup|yo)[\s!?.，]*$/i.test(
			s.trim(),
		);

	if (isGreeting(text)) {
		const saidHiBefore = recentUserMessages.some(isGreeting);
		if (saidHiBefore) {
			return toResult(
				"I'm still here! Tap a quick suggestion below (like Malaria symptoms) or tell me what's bothering you: fever, headache, stomach pain, etc.",
			);
		}
		return toResult(copy.greeting);
	}

	if (/^(thanks|thank\s*you|thx|cheers|much appreciated)[\s!?.，]*$/i.test(text.trim())) {
		return toResult(copy.thanksReply);
	}

	if (/how\s*(are|r)\s*you|how\s*you\s*doing|how'?s\s*it\s*going/i.test(lower)) {
		return toResult(copy.wellbeingQuestion);
	}

	if (
		/\b(i'?m|i am)\s+(good|fine|well|ok|okay|great)\b/i.test(lower) &&
		!/\b(not|don'?t|dont|never)\b/i.test(lower)
	) {
		return toResult(copy.wellbeingReply);
	}
	if (/\bdoing\s+well\b/i.test(lower) && !/\bnot\b/i.test(lower)) {
		return toResult(copy.wellbeingReply);
	}
	if (/(yourself|and\s*you|what\s*about\s*you)/i.test(lower)) {
		return toResult(copy.wellbeingReply);
	}
	if (/^good\s*(thanks|thank\s*you)?[\s!?.]*$/i.test(lower)) {
		return toResult(copy.wellbeingReply);
	}

	// Only redirect very short, clearly non-medical messages (e.g. "ok", "yes")
	if (text.length <= 12 && !isLikelyHealthMessage(text) && /^(ok|okay|k|yes|no|maybe|sure|cool|nice|hm+|m+)\s*[!?.]*$/i.test(text)) {
		return toResult(copy.redirect);
	}

	return null;
}

export async function chatWithGemma(opts: {
	message: string;
	language: GemmaLanguage;
	imageBase64?: string;
	recentUserMessages?: string[];
}): Promise<GemmaChatResult> {
	// Instant replies for greetings & casual chat (works online and offline)
	if (!opts.imageBase64) {
		const smallTalk = getSmallTalkResponse(
			opts.message,
			opts.language,
			opts.recentUserMessages,
		);
		if (smallTalk) return finalizeChatResult(smallTalk);
	}

	const health = await checkGemmaHealth();
	const onGpu = /cuda|google-ai-studio/i.test(health.device);

	// GPU: real Gemma inference. CPU: instant triage (Gemma takes minutes per reply).
	if (health.available && health.modelLoaded && onGpu) {
		try {
			const res = await fetch(`${GEMMA_BASE_URL}/api/gemma/chat`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: opts.message,
					language: opts.language,
					image_base64: opts.imageBase64,
				}),
				signal: AbortSignal.timeout(300_000),
			});
			if (res.ok) {
				return finalizeChatResult((await res.json()) as GemmaChatResult);
			}
		} catch (e) {
			console.warn("Gemma chat error, falling back to simulator:", e);
		}
	}

	return finalizeChatResult(simulateChat(opts));
}

// ─── Action Plan ───────────────────────────────────────────────────────────────

export interface GemmaActionPlanItem {
	name: string;
	description: string;
	icon?: string;
	dosage?: string;
	frequency?: string;
}

export interface GemmaActionPlanSection {
	title: string;
	items: GemmaActionPlanItem[];
}

export interface GemmaActionPlanResult {
	sections: PlanSection[];
	source: "gemma" | "health-data";
}

const ACTION_PLAN_SECTIONS = [
	"Follow-up Care",
	"Supplements",
	"Lifestyle",
] as const;

function isValidActionPlanResponse(r: unknown): r is { sections: GemmaActionPlanSection[] } {
	if (!r || typeof r !== "object") return false;
	const x = r as { sections?: unknown };
	if (!Array.isArray(x.sections)) return false;
	return x.sections.some(
		(s) =>
			s &&
			typeof s === "object" &&
			Array.isArray((s as GemmaActionPlanSection).items) &&
			(s as GemmaActionPlanSection).items.length > 0,
	);
}

function convertGemmaActionPlan(raw: { sections: GemmaActionPlanSection[] }): GemmaActionPlanResult {
	const sectionMap = new Map<string, GemmaActionPlanSection>();
	for (const sec of raw.sections) {
		if (sec?.title) sectionMap.set(sec.title, sec);
	}

	const dataSections = ACTION_PLAN_SECTIONS.map((title) => {
		const sec = sectionMap.get(title);
		const items = (sec?.items ?? []).map((item) => ({
			name: sanitizeAiText(item.name),
			description: sanitizeAiText(item.description),
			icon: inferPlanIconId(item.icon, item.name),
			dosage: item.dosage ? sanitizeAiText(item.dosage) : undefined,
			frequency: item.frequency ? sanitizeAiText(item.frequency) : undefined,
			group: title,
		}));
		return { title, data: items };
	});

	return {
		sections: [
			{ title: "Action Plan", type: "aggregated", data: [] },
			...dataSections,
		],
		source: "gemma",
	};
}

export async function generateActionPlan(opts: {
	patientAge: string;
	patientGender: string;
	healthScore: number;
	summary: string;
	findings: GemmaFinding[];
	recommendations: GemmaRecommendation[];
	symptoms: string[];
	medicalConditions: string[];
	medications: { name: string; dosage: string; frequency: string }[];
	lifestyle: Record<string, string>;
	bmi?: number;
	language: string;
}): Promise<GemmaActionPlanResult | null> {
	const health = await checkGemmaHealth();

	if (!health.available || !health.modelLoaded) {
		return null;
	}

	try {
		const res = await fetch(`${GEMMA_BASE_URL}/api/gemma/action-plan`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				patient_age: opts.patientAge,
				patient_gender: opts.patientGender,
				health_score: opts.healthScore,
				summary: opts.summary,
				findings: opts.findings,
				recommendations: opts.recommendations,
				symptoms: opts.symptoms,
				medical_conditions: opts.medicalConditions,
				medications: opts.medications,
				lifestyle: opts.lifestyle,
				bmi: opts.bmi,
				language: opts.language,
			}),
			signal: AbortSignal.timeout(300_000),
		});

		if (res.ok) {
			const data = await res.json();
			if (isValidActionPlanResponse(data)) {
				return convertGemmaActionPlan(data);
			}
			console.warn("Gemma action plan incomplete");
		} else {
			console.warn("Gemma action-plan failed:", res.status);
		}
	} catch (e) {
		console.warn("Gemma action plan error:", e);
	}

	return null;
}

// ─── Ghanaian Language Translations ──────────────────────────────────────────

const OFFLINE_TRANSLATIONS: Record<string, Record<string, string>> = {
	twi: {
		"Report Overview": "Nkyerɛkyerɛmu Titire",
		"Check original report": "Sɔw krataa ankasa no hwɛ",
		"Seen on report": "Wɔhunuu wɔ krataa no so",
		"Monoclonal Gammopathy (M-spike)": "Monoclonal Gammopathy (M-spike / Protein sononko)",
		"Protein Electrophoresis - M-spike": "Protein Electrophoresis - M-spike",
		"Requires Urgent Medical Attention": "Hia ayaresa ntɛmpɛ",
		"Faint restricted band detected": "Wɔhunuu protein band a ɛnyɛ den wɔ krataa no so",
		"Consult Your Doctor Immediately": "Kɔ wo dɔkota nkyɛn ntɛm pa ara",
		"Maintain a Balanced Ghanaian Diet": "Di Ghana aduane pa a ahoɔden wɔ mu daa",
		"Stay Well Hydrated": "Nom nsuo pa pii daa",
		"Manage Stress and Get Rest": "Gye wo ho na home yiye",
		"Your lab report indicates a significant finding: a 'faint restricted band' or 'M-spike' in your blood. This abnormal protein requires immediate medical follow-up, specifically an 'Immunofixation' test, to determine its cause and significance. While this finding can sometimes be benign, it can also be an early sign of more serious conditions. It is crucial to consult your doctor without delay for further evaluation and guidance. Please remember, this analysis is AI-assisted and not a replacement for a qualified medical doctor.": "Wo lab krataa no kyerɛ nsɛm titire bi: protein band a ɛnyɛ den anaa 'M-spike' wɔ wo mogya mu. Saa protein sononko yi hia dɔkota nhwehwɛmu ntɛmpɛ, titire ne 'Immunofixation' nhwehwɛmu, na wɔahunu ne fapem ne deɛ ɛkyerɛ. Ɛwom sɛ eyi betumi ayɛ deɛ ɛnnyɛ bɔne deɛ, nanso ɛbetumi nso ayɛ yadeɛ mu den foforo nsɛnkyerɛnneɛ. Ɛho hia pa ara sɛ wobɛkɔ wo dɔkota nkyɛn a kyɛre nni mu ma wafeɛ mu bio na wama wo afotuo. Yɛsrɛ wo kae sɛ, saa nhwehwɛmu yi yɛ AI mmoa na ɛnnyɛ dɔkota pa ananmu.",
		"Your lab report indicates the presence of a 'faint restricted band' or 'M-spike' in the gamma globulin region. This M-spike is an abnormal protein that can be a sign of a condition called monoclonal gammopathy. While it can sometimes be harmless (known as MGUS - Monoclonal Gammopathy of Undetermined Significance), it can also be an early indicator of more serious conditions affecting the blood cells, such as multiple myeloma. It is crucial to follow up with a doctor for further investigation, as recommended by the lab report, specifically an 'Immunofixation' test, to understand the nature of this protein.": "Wo lab krataa no kyerɛ sɛ protein band sononko anaa 'M-spike' wɔ gamma globulin mu. Saa M-spike yi yɛ protein a ɛnyɛ deɛ ɛtaa yɛ a ɛbetumi ayɛ monoclonal gammopathy yadeɛ nsɛnkyerɛnneɛ. Ɛwom sɛ ɛbetumi ayɛ deɛ pɔtee biara nni mu (a wɔfrɛ no MGUS), nanso ɛbetumi nso ayɛ mogya yadeɛ a ɛyɛ den te sɛ multiple myeloma nsɛnkyerɛnneɛ. Ɛho hia pa ara sɛ wobɛdi akyi wɔ dɔkota nkyɛn na wode 'Immunofixation' nhwehwɛmu bɛsɔ ahwɛ sɛdeɛ ebɛyɛ a wobɛte protein yi ase yiye.",
		"The most important step is to take this lab report to your doctor as soon as possible. Discuss the finding of the 'faint restricted band' (M-spike) and the lab's recommendation for an 'Immunofixation' test. This follow-up test is essential to determine the exact type and significance of the abnormal protein found in your blood. Do not delay this consultation.": "Anamɔn a ɛho hia sen biara ne sɛ wode saa lab krataa yi bɛkɔ wo dɔkota nkyɛn ntɛmpɛ. Kasa fa protein band sononko (M-spike) no ne lab no afotuo a ɛfa 'Immunofixation' nhwehwɛmu ho. Saa nhwehwɛmu foforo yi ho hia na wɔahunu protein sononko a wɔhunuu wɔ wo mogya mu no su ne deɛ ɛkyerɛ. Mma kyɛre nni eyi kɔ mu.",
		"While awaiting further diagnosis, continue to support your overall health with a nutritious diet. Focus on local Ghanaian foods rich in vitamins and minerals. Include plenty of kontomire (cocoyam leaves), garden eggs, and other dark leafy greens. Incorporate fruits like mangoes, oranges, and pineapples. Reduce your intake of processed foods, excessive salt, and sugary drinks. A healthy diet helps your body function optimally and can support your immune system.": "Wɔberɛ a woretwɛn nhwehwɛmu foforo no, kɔ so boa wo ahoɔden koraa de aduane pa. Di Ghana aduane ahodoɔ a vitamins ne minerals wɔ mu pii. Di kontomire, ntoropo, ne nhaban frɔmfrɔm ahodoɔ pii. Di nsuaba te sɛ mangoes, ankaa, ne aborɔbɛ. Te aduane a wɔayɛ no package, nkyene pii, ne nsuo a ɛyɛ dɛ so. Aduane pa boa wo honam ma ɛyɛ adwuma yiye na ɛma wo yareɛ banbɔ mu yɛ den.",
		"Ensure you are drinking enough clean water throughout the day. Staying hydrated is vital for all bodily functions, including kidney health and blood circulation. You can also supplement with natural Ghanaian options like fresh coconut water, which is a good source of electrolytes, or light koko (porridge) to keep your energy levels up.": "Hwɛ sɛ worenom nsuo fiideɛ a ɛdɔɔso da mu nyinaa. Nsuo a worenom no ho hia ma wo honam dwumadie nyinaa, a berebo ne mogya kɔ ne ba ka ho. Wobɛtumi nso anom nneɛma pa a ɛwɔ Ghana te sɛ kubesuo foforo a ɛma ahoɔden, anaa koko mmerɛw sɛdeɛ ebɛma wo ho ayɛ den.",
		"Receiving an abnormal lab result can be stressful. Try to manage stress through relaxation techniques, light exercise, or spending time with loved ones. Ensure you are getting adequate sleep each night. A well-rested body is better equipped to handle any health challenges. Consider traditional Ghanaian practices like meditation or spending time in nature if that brings you calm.": "Lab nhwehwɛmu a ɛnyɛ papa a wobɛnya no betumi ama woadwen pii. Bɔ mmodden sɛ wobɛte adwenehaw so denam home, apɔw-mu-teɛteɛ mmerɛw, anaa deɛ wode berɛ bɛdi kɔmfo mu wɔ wo nnipa dɔfoɔ nkyɛn. Hwɛ sɛ wobɛda yiye anadwo biara. Honam a ahome yiye na ɛtumi ko yareɛ ahodoɔ. Dwen nneɛma pa ho anaa kɔ nsubonten ne mfanti mu sɛ eyi bɛma wo ho adwo wo a.",
		"Total protein measures the combined amount of albumin and globulin in your blood — it reflects hydration, nutrition, and immune activity.": "Total protein susuw albumin ne globulin dodoɔ a ɛwɔ wo mogya mu — ɛkyerɛ nsuo dodoɔ, aduane pa, ne honam mu banbɔ.",
		"Common reasons include dehydration, chronic inflammation, or infection.": "Nneɛma a ɛtaa de ba ne nsuo a ɛnnɔɔso, ahonam a ɛhuru, anaa yadeɛ mmoawa.",
		"Bring your original report to your clinic so your doctor can confirm the number and decide if more tests are needed.": "Fa wo krataa ankasa no kɔ wo clinic sɛdeɛ wo dɔkota bɛtumi ahwɛ akontaahyɛdeɛ no na wafeɛ sɛ wohia nhwehwɛmu foforo.",
		"One test is outside the usual range on your report.": "Nhwehwɛmu baako mfa deɛ ɛtaa yɛ mu wɔ wo krataa no so.",
		"That is a signal to follow up — not a diagnosis.": "Ɛyɛ nsɛnkyerɛnneɛ a wobɛdi akyi — ɛnnyɛ yadeɛ a wɔahunu.",
		"Dehydration, a recent infection, or even a blurry photo can affect results.": "Nsuo a ɛnnɔɔso wɔ wo mu, ɔyare foforo, anaasɛ mfoni a ɛnna hɔ yie betumi asesa nhwehwɛmu no.",
		"A doctor who knows you is the best person to say what it means.": "Dɔkota a onim wo yɛ obi a ɔbɛtumi aka deɛ ɛkyerɛ.",
		"Your report includes blood protein tests (such as total protein or an M-spike on SPEP).": "Wo krataa no ka mogya protein nhwehwɛmu ho asɛm (te sɛ total protein anaa M-spike wɔ SPEP so).",
		"These show the mix of proteins in your blood.": "Yeinom kyerɛ sɛnea protein ahodoɔ wɔ wo mogya mu.",
		"Unusual patterns are a common reason for follow-up blood work — they are not usually an emergency on their own.": "Nsɛm a ɛnyɛ deɛ ɛtaa yɛ taa yɛ nea ɛma wɔyɛ mogya nhwehwɛmu foforo — ɛnyɛ mmerɛ nyinaa deɛ ɛyɛ ntɛmpɛ.",
		"Visit your clinic or hospital, bring the original lab slip, and ask whether you need a test called immunofixation.": "Kɔ wo clinic anaa ayaresabea, fa krataa ankasa no kɔ, na bisa sɛ wohia nhwehwɛmu bi a wɔfrɛ no immunofixation anaa.",
		"This summary is meant to help you understand your report — it is not medical advice or a final diagnosis.": "Saa nkyerɛkyerɛmu yi yɛ sɛ ɛbɛboa wo ma woate wo krataa no ase — ɛnnyɛ ayaresa afotuo anaa yadeɛ a wɔahunu koraa.",
		"Only a qualified clinician can confirm your results and tell you what to do next.": "Dɔkota pa nko ara na ɔbɛtumi agye wo nhwehwɛmu no ato mu na waka deɛ ɛsɛ sɛ woyɛ.",
		"Your results are ready": "Wo ntoboa no awie",
		"Normal": "Ɛyɛ papa",
		"A little high": "Ɛkɔ soro kakra",
		"Lower than ideal": "Ɛyɛ ketewa sene deɛ ɛsɛ",
		"Low — see a doctor": "Ɛyɛ ketewa — kɔ dɔkota nkyɛn",
		"Health Score": "Ahoɔden Bɔ",
		"You are here": "Wowɔ ha",
		"Hide Details": "Kata nsɛm no so",
		"Brief insights from your data.": "Nsɛm tiawa a ɛfiri wo nsɛm mu.",
		"What we found": "Deɛ yɛhuu",
		"What to do next": "Deɛ ɛsɛ sɛ woyɛ",
		"Please see a doctor immediately": "Yɛsrɛ wo, kɔ dɔkota nkyɛn ntɛm",
		"Drink plenty of water": "Nom nsuo pii",
		"Malaria detected": "Malaria aba",
		"Take your medication": "Fa wo aduro sɛnea dɔkota kaeɛ",
		"Visit your nearest CHPS compound": "Kɔ CHPS a ɛbɛn wo nkyɛn",
		"This analysis is for information only": "Saa nhwehwɛmu yi yɛ nimdeɛ nko ara",
		"Needs attention": "Hian nhwehwɛmu",
		"Room to improve": "Betumi ayɛ yie",
		"Good": "Ɛyɛ papa",
		"Excellent": "Ɛyɛ kyɛn so",
		"Looking good": "Ɛyɛ yie",
		"Hide": "Kata so",
		"Why this matters": "Adɛn nti na eyi ho hia",
		"Read in your language": "Kenkan wɔ wo kasa mu",
		"What this means for you": "Deɛ yeinom kyerɛ ma wo",
		"Some results look off. Take this to a clinic soon.": "Nhwehwɛmu bi nyɛ deɛ ɛtaa yɛ. Fa yei kɔ clinic ntɛm.",
		"A few values need follow-up. Ask your doctor what to watch.": "Nsɛm kakraa bi hia sɛ wodi akyi. Bisa wo dɔkota deɛ ɛsɛ sɛ wohwɛ.",
		"Most results look fine. Keep healthy habits and check-ups.": "Nhwehwɛmu dodoɔ no ara yɛ papa. Kɔ so yɛ akwahosan nneyɛeɛ na kɔ nhwehwɛmu daa.",
		"Your results look strong overall. Stay consistent.": "Wo nhwehwɛmu nyinaa yɛ den. Kɔ so saa ara.",
		"What we looked at": "Deɛ yɛhwɛeɛ",
		"Good news at a glance": "Asɛmpa a wobɛhunu ntɛm",
		"Double-check the numbers": "Hwɛ akontaahyɛdeɛ no bio",
		"One result stood out": "Nhwehwɛmu baako da nsow",
		"About the protein tests": "Ɛfa protein nhwehwɛmu ho",
		"About the liver-related tests": "Ɛfa berebo nhwehwɛmu ho",
		"Important": "Ɛho hia",
		"Every value we could read looks within the normal ranges printed on your report. Keep your healthy habits and routine check-ups.": "Nsɛm a yɛtumi kenkanee nyinaa wɔ deɛ ɛtaa yɛ mu wɔ wo krataa no so. Kɔ so yɛ akwahosan nneyɛeɛ na kɔ nhwehwɛmu daa.",
		"At least one value may have been misread from the photo. Compare this summary with your paper report or lab printout — if a number looks wrong, trust the original document and ask the lab to confirm.": "Ebia yɛankenkan akontaahyɛdeɛ baako yiye wɔ mfoni no mu. Fa saa nkyerɛkyerɛmu yi toto wo krataa anaa lab printout no ho — sɛ akontaahyɛdeɛ bi nte sɛ deɛ ɛtaa yɛ a, gye krataa ankasa no die na bisa lab no.",
		"Some liver markers on your report are outside the usual range. That can reflect diet, alcohol, medicines, or infection. Avoid alcohol until your doctor reviews the results, stay hydrated, and mention any stomach pain, yellow skin, or dark urine.": "Berebo nhwehwɛmu bi a ɛwɔ wo krataa no so mfa deɛ ɛtaa yɛ mu. Ɛbɛtumi afiri aduane a wodie, nsa, aduro, anaa ɔyare foforo. Nnom nsa kɔsi sɛ wo dɔkota bɛhwɛ nsonsonoeɛ no mu, nom nsuo pii, na sɛ wote yafunu yaw, ahonam a ayɛ akɔkɔsrade, anaa ahomirim a ɛyɛ tuntum a, ka kyerɛ wo dɔkota.",
		"Looks typical": "Ɛte sɛ deɛ ɛtaa yɛ",
		"Higher than usual": "Ɛkorɔn sen deɛ ɛtaa yɛ",
		"Lower than usual": "Ɛba fam sen deɛ ɛtaa yɛ",
		"Worth a doctor visit": "Ɛfata sɛ wokɔ dɔkota nkyɛn",
		"M-spike (protein band)": "M-spike (protein sononko)",
		"SPEP M-spike": "SPEP M-spike",
		"Ask about a specialist follow-up": "Bisa ɛfa specialist nhwehwɛmu ho",
		"Your report flags an M-spike — an unusual protein band on a blood protein test (SPEP). That means the lab saw a protein pattern worth a closer look. It does not mean you are definitely seriously ill — infections and other conditions can sometimes look similar. See your doctor soon; they may order a follow-up test called immunofixation to learn more.": "Wo krataa no kyerɛ M-spike — protein sononko bi a ɛda adi wɔ mogya protein nhwehwɛmu (SPEP) mu. Ɛkyerɛ sɛ lab no hunuu protein nhyehyɛeɛ bi a ɛsɛ sɛ wɔhwɛ mu yiye. Ɛnkyerɛ sɛ wo yadeɛ mu yɛ den ankasa — ɔyare foforo betumi ayɛ sɛ eyi ara. Kɔ wo dɔkota nkyɛn ntɛm; ebia ɔbɛma wo nhwehwɛmu foforo a wɔfrɛ no immunofixation na woahunu pii.",
		"Share these results with your doctor": "Fa saa nsɛm yi kɔma wo dɔkota",
		"Take this summary and your original lab report to your clinic or hospital so they can confirm the findings and plan next steps.": "Fa saa nkyerɛkyerɛmu yi ne wo krataa ankasa no kɔ wo clinic anaa ayaresabea sɛdeɛ wɔbɛtumi agye atom na wɔahyehyɛ deɛ ɛdi hɔ.",
		"Ask about follow-up tests": "Bisa nhwehwɛmu foforo ho asɛm",
		"If your report mentions an M-spike or unusual protein band, ask your doctor whether you need immunofixation or a referral to a blood specialist.": "Sɛ wo krataa no ka M-spike anaa protein sononko bi ho asɛm a, bisa wo dɔkota sɛ wohia immunofixation anaa sɛ wɔmfa wo nkɔ mogya ho specialist nkyɛn.",
		"Keep a copy of your report": "Kora wo krataa no bi so",
		"Save the photo and this summary so you can compare with future tests.": "Kora mfoni no ne saa nkyerɛkyerɛmu yi so sɛdeɛ wobɛtumi de atoto nhwehwɛmu a ɛbɛba akyiri no ho.",
		"Support your liver while you wait": "Boa wo berebo wɔ ɛberɛ a woretwɛn",
		"Avoid alcohol, stay hydrated, eat balanced meals, and avoid unnecessary herbal mixes unless your doctor approves them.": "Nnom nsa, nom nsuo pii, di aduane pa, na nnye aduro a wɔde nhahan ayɛ a wo dɔkota nnii ho adanse.",
		"We started reading your photo, but couldn't finish the analysis.": "Yɛhyɛɛ aseɛ kenkan wo mfoni no, nanso yɛantumi anwie nhwehwɛmu no.",
		"This usually means the photo was unclear, or the AI helper isn't connected yet.": "Ɛkyerɛ sɛ mfoni no anna hɔ yie, anaasɛ AI helper no mmfa ne ho mmɔɔ nkyɛn ɛ.",
		"We couldn't read enough from your photo.": "Yɛantumi ankenkan wo mfoni no mu ade dodoɔ.",
		"Try a brighter, straighter photo — or type your lab values instead.": "Sɔ mfoni a ɛda hɔ yie na ɛtene hwɛ — anaasɛ twerɛ wo lab akontaahyɛdeɛ no.",
		"Take a clearer photo": "Fa mfoni a ɛda hɔ yie",
		"Use good lighting, hold your phone steady, and make sure all the text on your lab report is visible. Then upload again.": "Fa kanea pa, sɔ wo phone mu yie, na hwɛ sɛ nsɛm a ɛwɔ wo lab krataa no so nyinaa da adi. Ɛno akyi san to gua bio.",
		"Type your results instead": "Twerɛ wo nsɛm no mmom",
		"On the upload page, paste or type the values from your report — for example: Hemoglobin 7.2 g/dL, WBC 6.2.": "Wɔ upload krataa no so, paste anaa twerɛ akontaahyɛdeɛ a ɛwɔ wo krataa no so — sɛnkyerɛase: Hemoglobin 7.2 g/dL, WBC 6.2.",
		"Use the box on the upload page to paste or type values from your lab report.": "Fa box a ɛwɔ upload krataa no so paste anaa twerɛ akontaahyɛdeɛ a ɛfiri wo lab krataa no mu.",
		"Try a sample report": "Sɔ nhwɛso krataa bi hwɛ",
		"Pick one of our example cases (Malaria, Anemia, Typhoid, or Urinalysis) to see how the analysis works.": "Paw yɛn nhwɛso yadeɛ no mu baako (Malaria, Anemia, Typhoid, anaa Urinalysis) na hwɛ sɛnea nhwehwɛmu no yɛ adwuma.",
		"Choose an example case to preview what your results will look like.": "Paw nhwɛso yadeɛ bi na hwɛ sɛnea wo nsɛm no bɛyɛ.",
		"Upload a clearer photo": "To mfoni a ɛda hɔ yie gua",
		"Lay the report flat, avoid shadows, and zoom in so the numbers are easy to read.": "Fa krataa no to hɔ tamaa, twe wo ho firi sunsuma ho, na zoom in ma akontaahyɛdeɛ no ayɛ mmerɛw sɛ wɔbɛkenkan.",
		"Each result explained in plain English — no medical jargon.": "Nhwehwɛmu biara gu kasa a ɛteaseɛ mu — ayaresa kasa a ɛyɛ den biara nni mu.",
		"Simple steps based on your results.": "Anamɔn nketewa a wobɛtu afiri wo nhwehwɛmu no mu.",
		"Always speak to a qualified doctor about your health.": "Kasa kyerɛ dɔkota pa biara ɛfa wo ahoɔden ho daa.",
		"Go to my dashboard": "Kɔ m'akannifoɔ kratafa",
		"View clinical history": "Hwɛ wo yareɛ abakɔsɛm",
		"Upload more results": "San to nhwehwɛmu foforo gua",
		"Go back and select a Preset Case": "San kɔ akyi na paw Preset yareɛ bi",
		"Click 'Upload more results' below and select one of the preloaded clinical cases to preview the analysis interface immediately.": "Kanyan 'Upload more results' wɔ ase ha na paw clinical cases a yɛahyehyɛ no baako sɛnea ɛbɛyɛ a wobɛhwɛ analysis interface no ntɛm.",
		"Start the Genetiq Local AI Service": "Sɔ Genetiq Local AI Asoeɛ no",
		"Make sure the Genetiq Local AI Helper application is started on your computer. Once the helper is running, this page will automatically process and read any lab photo you upload.": "Hwɛ sɛ Genetiq Local AI Helper application no asɔ wɔ wo computer so. Sɛ helper no hyɛ aseɛ dwuma a, kratafa yi bɛkan mfoni biara a wode bɛto gua afiri lab no mu.",
		"⚠️ DEMO NOTICE: You uploaded a custom image. In full GPU mode, Google Gemma 4 Multimodal Vision reads this image to extract health data. Because the local Gemma 4 server is currently not running, we cannot analyze custom images.\n\nTo test the interface, please go back and select one of the pre-loaded 'Ghanaian Medical Case Presets' (such as Malaria RDT Strip, CBC Severe Anemia, or Typhoid Report) which work fully offline.": "⚠️ SƆHWƐ NKRATO: Wode mfoni foforo na ɛtooo gua. Sɛ full GPU dwumadie no da adi a, Google Gemma 4 Multimodal Vision bɛkan saa mfoni yi de ayi yareɛ ho nsɛm afiri mu. Esiane sɛ local Gemma 4 server no nnwuma mprempren nti, yɛntumi nhwehwɛ mfoni foforo mu.\n\nSɛ wobɛsɔ interface yi ahwɛ a, yɛsrɛ wo san kɔ akyi na kɔfa 'Ghanaian Medical Case Presets' (te sɛ Malaria RDT Strip, CBC Severe Anemia, anaa Typhoid Report) a ɛyɛ adwuma offline fully no baako."
	},
	ga: {
		"Report Overview": "Report mli nsɛm",
		"Check original report": "Kwɛ krataa diɛŋtsɛ lɛ",
		"Seen on report": "Aná yɛ report lɛ nɔ",
		"Monoclonal Gammopathy (M-spike)": "Monoclonal Gammopathy (M-spike)",
		"Protein Electrophoresis - M-spike": "Protein Electrophoresis - M-spike",
		"Requires Urgent Medical Attention": "Hia yelikɛlɔ ntɛm pa ara",
		"Faint restricted band detected": "Aná protein band a eyeee faŋŋ yɛ report lɛ nɔ",
		"Consult Your Doctor Immediately": "Yaa o dɔkita he ntɛm pa ara",
		"Maintain a Balanced Ghanaian Diet": "Ye Ghana niyenii kpakpa ni yɔɔ hewalɛ daa",
		"Stay Well Hydrated": "Nu nu pii daa",
		"Manage Stress and Get Rest": "Jɔɔ ohe ni ojɔɔ ohe yiye",
		"Your lab report indicates a significant finding: a 'faint restricted band' or 'M-spike' in your blood. This abnormal protein requires immediate medical follow-up, specifically an 'Immunofixation' test, to determine its cause and significance. While this finding can sometimes be benign, it can also be an early sign of more serious conditions. It is crucial to consult your doctor without delay for further evaluation and guidance. Please remember, this analysis is AI-assisted and not a replacement for a qualified medical doctor.": "O lab report lɛ tsɔɔ sane titiri ko: protein band ko ni eyeee faŋŋ loo 'M-spike' yɛ o la mli. Sane nɛɛ hiaa akɛ aya dɔkita he ntɛm pa ara yɛ 'Immunofixation' kaimɔ nɔ...",
		"Your lab report indicates the presence of a 'faint restricted band' or 'M-spike' in the gamma globulin region. This M-spike is an abnormal protein that can be a sign of a condition called monoclonal gammopathy. While it can sometimes be harmless (known as MGUS - Monoclonal Gammopathy of Undetermined Significance), it can also be an early indicator of more serious conditions affecting the blood cells, such as multiple myeloma. It is crucial to follow up with a doctor for further investigation, as recommended by the lab report, specifically an 'Immunofixation' test, to understand the nature of this protein.": "O lab report lɛ tsɔɔ akɛ M-spike loo protein band ko yɛ gamma globulin mli. Enɛ baanyɛ afee monoclonal gammopathy okadi...",
		"The most important step is to take this lab report to your doctor as soon as possible. Discuss the finding of the 'faint restricted band' (M-spike) and the lab's recommendation for an 'Immunofixation' test. This follow-up test is essential to determine the exact type and significance of the abnormal protein found in your blood. Do not delay this consultation.": "Nɔ ni he hiaa fe fɛɛ ji akɛ okɛ lab report nɛɛ aya o dɔkita he ekpakpa. Wiemɔ yɛ M-spike kɛ Immunofixation kaimɔ lɛ he. Enɛ baaye abua kɛha la kaimɔ foforo...",
		"While awaiting further diagnosis, continue to support your overall health with a nutritious diet. Focus on local Ghanaian foods rich in vitamins and minerals. Include plenty of kontomire (cocoyam leaves), garden eggs, and other dark leafy greens. Incorporate fruits like mangoes, oranges, and pineapples. Reduce your intake of processed foods, excessive salt, and sugary drinks. A healthy diet helps your body function optimally and can support your immune system.": "Beni okwɛɔ kaimɔ foforo, yaa nɔ kɛ niyenii kpakpa ni yɔɔ hewalɛ yɛ Ghana tamɔ kontomire, gbonu, kɛ yibii...",
		"Ensure you are drinking enough clean water throughout the day. Staying hydrated is vital for all bodily functions, including kidney health and blood circulation. You can also supplement with natural Ghanaian options like fresh coconut water, which is a good source of electrolytes, or light koko (porridge) to keep your energy levels up.": "Kwɛ akɛ eenu nu pii ni tse yɛ gbi lɛ mli fɛɛ. Nu ni eenu lɛ he hiaa kɛha o berebo kɛ la tsuɔmɔ...",
		"Receiving an abnormal lab result can be stressful. Try to manage stress through relaxation techniques, light exercise, or spending time with loved ones. Ensure you are getting adequate sleep each night. A well-rested body is better equipped to handle any health challenges. Consider traditional Ghanaian practices like meditation or spending time in nature if that brings you calm.": "Kɛji oná lab result ni eyeee faŋŋ lɛ, ebaanyɛ eha ojɔɔ ohe pii. Bɔ mɔdɛŋ ni ojɔɔ ohe yɛ jɔɔmɔ, kɛ wɔmɔ jogbaŋŋ mli...",
		"Total protein measures the combined amount of albumin and globulin in your blood — it reflects hydration, nutrition, and immune activity.": "Total protein susuo albumin kɛ globulin ni yɛ o la mli — etsɔɔ nu ni obɛ, niyenii, kɛ hewalɛ.",
		"Common reasons include dehydration, chronic inflammation, or infection.": "Nii ni fɔɔ haa ji nu ni obɛnu, hela foforɔ, loo mmoawa.",
		"Bring your original report to your clinic so your doctor can confirm the number and decide if more tests are needed.": "Kɛ o report diɛŋtsɛ lɛ yaa o clinic koni o dɔkita ekwɛ akontaabuu lɛ ni ebi kɛji ohiaa kaimɔi Pii.",
		"One test is outside the usual range on your report.": "Test kome eyeee tamɔ bɔ ni efɔɔ mli yɛ o report lɛ nɔ.",
		"That is a signal to follow up — not a diagnosis.": "Eji okadi ni obaadi sɛɛ — ejeee hela ni ana.",
		"Dehydration, a recent infection, or even a blurry photo can affect results.": "Nu ni obɛnu, hela foforɔ, loo mfoni ni eyeee faŋŋ baanyɛ atsake results.",
		"A doctor who knows you is the best person to say what it means.": "Dɔkita ni le bo ji mɔ ni baanyɛ atsɔɔ nɔ ni ejɛɔ mli.",
		"Your report includes blood protein tests (such as total protein or an M-spike on SPEP).": "O report lɛ kɛ la protein kaimɔi ba (tamɔ total protein loo M-spike yɛ SPEP nɔ).",
		"These show the mix of proteins in your blood.": "Nɛɛ tsɔɔ bɔ ni protein srɔtoi yɛ o la mli.",
		"Unusual patterns are a common reason for follow-up blood work — they are not usually an emergency on their own.": "Nii ni eyeee tamɔ bɔ ni efɔɔ mli ji nɔ ni haa akɛ ayafee la kaimɔ ekoŋŋ — ejeee oyaigbamɔ daa diɛŋtsɛ.",
		"Visit your clinic or hospital, bring the original lab slip, and ask whether you need a test called immunofixation.": "Yaa o clinic loo tsɔfabuu, kɛmɔ krataa diɛŋtsɛ lɛ yaa, ni obi kɛji ohiaa kaimɔ ko ni atsɛɔ lɛ immunofixation.",
		"This summary is meant to help you understand your report — it is not medical advice or a final diagnosis.": "Sane kuku nɛɛ hewɔ ji akɛ eeye ebua bo ni onu o report lɛ shishi — ejeee tsofai ŋaawoo loo hela ni ana kwraa.",
		"Only a qualified clinician can confirm your results and tell you what to do next.": "Dɔkita kpakpa pɛ baanyɛ akɛ o results ato mli ni etsɔɔ bo nɔ ni esa akɛ oyɛ.",
		"Your results are ready": "Wo results lɛ esɛɛ",
		"Normal": "Enyɛ bɔɔlɛ",
		"A little high": "Eji ko pipi",
		"Lower than ideal": "Ekɛ tsɔɔ",
		"Low — see a doctor": "Ekɛ tsɔɔ — yaa dɔkita he",
		"Health Score": "Hewale Score",
		"You are here": "Oyɛ biɛ",
		"Hide Details": "Tsĩ saneyitsoo lɛ",
		"Brief insights from your data.": "Sane fioo kɛjɛ o data lɛ mli.",
		"What we found": "Nii míhùù",
		"What to do next": "Nii mɛɛhe eyɛ",
		"Please see a doctor immediately": "Mitsɛɔ bo, yaa dɔkita he ntɛɛ",
		"Drink plenty of water": "Nu nù puputu",
		"Malaria detected": "Malaria bɛ ba",
		"Needs attention": "Hia yelikɛlɔ",
		"Room to improve": "Ebaanyɛ ehi",
		"Good": "Ehi",
		"Excellent": "Ehi kpakpa",
		"Looking good": "Eyeɔ jogbaŋŋ",
		"Hide": "Tsĩ",
		"Why this matters": "Mɛɛ hewɔ nɛɛ he hiaa",
		"Read in your language": "Kane yɛ wo wiemɔ mli",
		"What this means for you": "Nii nɛɛ tsɔɔ kɛha bo",
		"Some results look off. Take this to a clinic soon.": "Results komɛi eyeee tamɔ bɔ ni efɔɔ mli. Kɛ nɛɛ yaa clinic ekpakpa.",
		"A few values need follow-up. Ask your doctor what to watch.": "Nii fioo komɛi hiaa akɛ okwɛ sɛɛ. Bi o dɔkita nii ni esa akɛ okwɛ.",
		"Most results look fine. Keep healthy habits and check-ups.": "Results pii eyeɔ jogbaŋŋ. Yaa nɔ kɛ hewalɛ kɛjɔɔmɔi kɛ kwɛmɔi daa.",
		"Your results look strong overall. Stay consistent.": "O results fɛɛ eyeɔ kpakpa. Yaa nɔ nakai.",
		"What we looked at": "Nii wɔkwɛɔ",
		"Good news at a glance": "Sane kpakpa ni oobaana oyabu",
		"Double-check the numbers": "Kwɛ akontaabuu lɛ shi bio",
		"One result stood out": "Result kome je kpo",
		"About the protein tests": "Yɛ protein kaimɔi ahe",
		"About the liver-related tests": "Yɛ berebo kaimɔi ahe",
		"Important": "Ehe hiaa",
		"Looks typical": "Eyeɔ tamɔ bɔ ni efɔɔ mli",
		"Higher than usual": "Eyi kɛ nɔ ni efɔɔ mli",
		"Lower than usual": "Eba shi fe fe ni efɔɔ mli",
		"Worth a doctor visit": "Esa akɛ oyaa dɔkita he",
		"M-spike (protein band)": "M-spike (protein srɔtoi)",
		"SPEP M-spike": "SPEP M-spike",
		"Ask about a specialist follow-up": "Bi specialist kaimɔ he sane",
		"Your report flags an M-spike — an unusual protein band on a blood protein test (SPEP). That means the lab saw a protein pattern worth a closer look. It does not mean you are definitely seriously ill — infections and other conditions can sometimes look similar. See your doctor soon; they may order a follow-up test called immunofixation to learn more.": "O report lɛ tsɔɔ M-spike — protein srɔto ko ni eyeee tamɔ bɔ ni efɔɔ mli yɛ la protein kaimɔ (SPEP) nɔ. Enɛ tsɔɔ akɛ lab lɛ ná protein nhyehyɛeɛ ko ni esa akɛ akwɛ mli jogbaŋŋ. Ekɔɔɔ akɛ o hela mli wa diɛŋtsɛ — hela foforɔ baanyɛ afee nakai. Yaa o dɔkita he ekpakpa; ebaanyɛ akɛ ohia kaimɔ foforɔ ni atsɛɔ lɛ immunofixation ni ona pii.",
		"Share these results with your doctor": "Kɛ nɛɛ results ha o dɔkita",
		"Take this summary and your original lab report to your clinic or hospital so they can confirm the findings and plan next steps.": "Kɛ sane kuku nɛɛ kɛ o krataa diɛŋtsɛ lɛ yaa o clinic loo tsɔfabuu koni amɛto mli ni amɛto gbɛ ni baanyi.",
		"Ask about follow-up tests": "Bi kaimɔ foforɔ he sane",
		"If your report mentions an M-spike or unusual protein band, ask your doctor whether you need immunofixation or a referral to a blood specialist.": "Kɛji o report lɛ wie M-spike loo protein srɔto ko he lɛ, bi o dɔkita kɛji ohiaa immunofixation loo akɛ afee bo la specialist.",
		"Keep a copy of your report": "Hi o report lɛ mli kome",
		"Save the photo and this summary so you can compare with future tests.": "Hi mfoni lɛ kɛ sane kuku nɛɛ mli koni obaanyɛ akɛto kaimɔi ni baaba sɛɛ mli.",
		"Support your liver while you wait": "Fĩ o berebo he beni okwɛɔ",
		"Avoid alcohol, stay hydrated, eat balanced meals, and avoid unnecessary herbal mixes unless your doctor approves them.": "Ke dãa, nu nu pii, ye niyenii ni sa, ni ke tsofai ni afee kɛ tso ni o dɔkita ekpaaa gbɛ.",
		"We started reading your photo, but couldn't finish the analysis.": "Wɔje shishi wɔkane o mfoni lɛ, shi wɔnyɛɛ wɔwie kaimɔ lɛ.",
		"This usually means the photo was unclear, or the AI helper isn't connected yet.": "Enɛ tsɔɔ akɛ mfoni lɛ eyeee faŋŋ, loo AI helper lɛ eshwieee shishi kɔkɔɔkɔ.",
		"We couldn't read enough from your photo.": "Wɔnyɛɛ wɔkane nii pii kɛjɛ o mfoni lɛ mli.",
		"Try a brighter, straighter photo — or type your lab values instead.": "Sɔ mfoni ni eyeɔ faŋŋ ni etsɔ hwɛ — loo ŋmala o lab akontaabuu lɛ.",
		"Take a clearer photo": "Kɛ mfoni ni eyeɔ faŋŋ",
		"Use good lighting, hold your phone steady, and make sure all the text on your lab report is visible. Then upload again.": "Kɛ la kpakpa, mɔ o phone lɛ shiŋŋ, ni kwɛ akɛ nsɛm ni yɛ o lab report lɛ nɔ fɛɛ eeje kpo. Kɛkɛ ni otsi bio.",
		"Type your results instead": "Ŋmala o results lɛ",
		"On the upload page, paste or type the values from your report — for example: Hemoglobin 7.2 g/dL, WBC 6.2.": "Yɛ upload baafa lɛ nɔ, paste loo ŋmala akontaabuu ni jɛ o report lɛ mli — okadi: Hemoglobin 7.2 g/dL, WBC 6.2.",
		"Use the box on the upload page to paste or type values from your lab report.": "Kɛ box ni yɛ upload baafa lɛ nɔ paste loo ŋmala akontaabuu ni jɛ o lab report lɛ mli.",
		"Try a sample report": "Sɔ nhwɛso report kome hwɛ",
		"Pick one of our example cases (Malaria, Anemia, Typhoid, or Urinalysis) to see how the analysis works.": "Hala wɔ nhwɛso hela komɛi lɛ mli kome (Malaria, Anemia, Typhoid, loo Urinalysis) ni ona bɔ ni kaimɔ lɛ tsuɔ nii.",
		"Choose an example case to preview what your results will look like.": "Hala nhwɛso hela kome ni ona bɔ ni o results baaba.",
		"Upload a clearer photo": "Tsi mfoni ni eyeɔ faŋŋ kɛba",
		"Lay the report flat, avoid shadows, and zoom in so the numbers are easy to read.": "Fa report lɛ to shi tamaa, tsi ohe kɛjɛ hɔhɔɔi ahe, ni zoom in koni akontaabuu lɛ ayɛ mlɛo akɛ akane.",
		"Each result explained in plain English — no medical jargon.": "Okadii fɛɛ yaa jwɛŋmɔ shishi ni yɛɛ hela tsofa sanegbaa kusuu.",
		"Simple steps based on your results.": "Gbɛtsɔɔmɔi nketewa kɛha wo results.",
		"Always speak to a qualified doctor about your health.": "Wiemɔ kɛ datrɛfonyo kpakpa yɛ wo hewale he daa.",
		"Go to my dashboard": "Yaa mi hewale kratafa",
		"View clinical history": "Kwɛ hela abotsi",
		"Upload more results": "Tsi hela foforɔ kɛba",
		"Go back and select a Preset Case": "Yaa sɛɛ ni owie Preset hela ko",
		"Click 'Upload more results' below and select one of the preloaded clinical cases to preview the analysis interface immediately.": "Fĩi 'Upload more results' yɛ shishi nɛɛ ni owie hela foforɔ kɛha sɔhwɛ mra.",
		"Start the Genetiq Local AI Service": "Tsi Genetiq Local AI He",
		"Make sure the Genetiq Local AI Helper application is started on your computer. Once the helper is running, this page will automatically process and read any lab photo you upload.": "Hwɛ kɛji Genetiq Local AI Helper asoeɛ lɛ eje shishi yɛ computer lɛ nɔ. Kɛji eye shishi, kratafa nɛɛ baakane lab mfoni fɛɛ ni okɛba.",
		"⚠️ DEMO NOTICE: You uploaded a custom image. In full GPU mode, Google Gemma 4 Multimodal Vision reads this image to extract health data. Because the local Gemma 4 server is currently not running, we cannot analyze custom images.\n\nTo test the interface, please go back and select one of the pre-loaded 'Ghanaian Medical Case Presets' (such as Malaria RDT Strip, CBC Severe Anemia, or Typhoid Report) which work fully offline.": "⚠️ DEMO NOTICE: O-upload mfoni kroko. Kɛji GPU asoeɛ lɛ yaa nɔ, Google Gemma 4 Multimodal Vision baakane mfoni nɛɛ kɛha hewale he. Kɛji local Gemma 4 server lɛ yɛɛɛ nɔ mprempren, wónyɛɛ woloa hela he.\n\nKɛha sɔhwɛ, yaa sɛɛ ni owie 'Ghanaian Medical Case Presets' (tamɔ Malaria RDT Strip, CBC Severe Anemia, aloo Typhoid Report) ni yaa nɔ offline."
	},
	ewe: {
		"Report Overview": "Nusi le agbalẽa me",
		"Check original report": "Kpɔ agbalẽ ŋutɔŋutɔ la",
		"Seen on report": "Wokpɔe le agbalẽ la dzi",
		"Monoclonal Gammopathy (M-spike)": "Monoclonal Gammopathy (M-spike)",
		"Protein Electrophoresis - M-spike": "Protein Electrophoresis - M-spike",
		"Requires Urgent Medical Attention": "Hiã dɔnɔkɔdola kaba",
		"Faint restricted band detected": "Wokpɔ protein band aɖe le agbalẽ la dzi",
		"Consult Your Doctor Immediately": "Yi wò dɔnɔkɔdola gbɔ kaba",
		"Maintain a Balanced Ghanaian Diet": "Ɖu Ghana nuɖuɖu nyui siwo me lãmesẽ le daa",
		"Stay Well Hydrated": "No tsi geɖe daa",
		"Manage Stress and Get Rest": "Ɖe fu kpo eye nàgbɔ ɖe eme",
		"Your lab report indicates a significant finding: a 'faint restricted band' or 'M-spike' in your blood. This abnormal protein requires immediate medical follow-up, specifically an 'Immunofixation' test, to determine its cause and significance. While this finding can sometimes be benign, it can also be an early sign of more serious conditions. It is crucial to consult your doctor without delay for further evaluation and guidance. Please remember, this analysis is AI-assisted and not a replacement for a qualified medical doctor.": "Wò lab agbalẽ la fia nu vevi aɖe: protein band aɖe alo 'M-spike' le wò ʋu me. Esia hiã be nàyi dɔnɔkɔdola gbɔ kaba le 'Immunofixation' dodokpɔ ŋuti...",
		"Your lab report indicates the presence of a 'faint restricted band' or 'M-spike' in the gamma globulin region. This M-spike is an abnormal protein that can be a sign of a condition called monoclonal gammopathy. While it can sometimes be harmless (known as MGUS - Monoclonal Gammopathy of Undetermined Significance), it can also be an early indicator of more serious conditions affecting the blood cells, such as multiple myeloma. It is crucial to follow up with a doctor for further investigation, as recommended by the lab report, specifically an 'Immunofixation' test, to understand the nature of this protein.": "Wò lab agbalẽ la fia be M-spike alo protein band aɖe le gamma globulin me. Esia ate ŋu anye monoclonal gammopathy dɔléle dzesi...",
		"The most important step is to take this lab report to your doctor as soon as possible. Discuss the finding of the 'faint restricted band' (M-spike) and the lab's recommendation for an 'Immunofixation' test. This follow-up test is essential to determine the exact type and significance of the abnormal protein found in your blood. Do not delay this consultation.": "Afɔɖeɖe vevitɔ nye be nàtsɔ lab agbalẽ sia ayi wò dɔnɔkɔdola gbɔ kaba...",
		"While awaiting further diagnosis, continue to support your overall health with a nutritious diet. Focus on local Ghanaian foods rich in vitamins and minerals. Include plenty of kontomire (cocoyam leaves), garden eggs, and other dark leafy greens. Incorporate fruits like mangoes, oranges, and pineapples. Reduce your intake of processed foods, excessive salt, and sugary drinks. A healthy diet helps your body function optimally and can support your immune system.": "Esime nèle lalam na dodokpɔ bubu la, yi edzi nàɖu Ghana nuɖuɖu nyuiwo abe kontomire, agboma, kple atitowo ene...",
		"Ensure you are drinking enough clean water throughout the day. Staying hydrated is vital for all bodily functions, including kidney health and blood circulation. You can also supplement with natural Ghanaian options like fresh coconut water, which is a good source of electrolytes, or light koko (porridge) to keep your energy levels up.": "Kpɔ egbɔ be nàno tsi dzadzɛ geɖe le ŋkeke la me katã...",
		"Receiving an abnormal lab result can be stressful. Try to manage stress through relaxation techniques, light exercise, or spending time with loved ones. Ensure you are getting adequate sleep each night. A well-rested body is better equipped to handle any health challenges. Consider traditional Ghanaian practices like meditation or spending time in nature if that brings you calm.": "Xɔxɔ lab ŋkuɖoɖo si mele nyuie o la ate ŋu ana nàtsi dzi. Te kpɔ be nàɖe fu kpo eye nàdɔ alɔ̃ nyuie...",
		"Total protein measures the combined amount of albumin and globulin in your blood — it reflects hydration, nutrition, and immune activity.": "Total protein dzidzonu albumin kple globulin le wò ʋu me — efia tsi, nuɖuɖu, kple lãmesẽ.",
		"Common reasons include dehydration, chronic inflammation, or infection.": "Nusiwo hea esia vee nye tsi manɔmee, atike fufui, alo dɔléle.",
		"Bring your original report to your clinic so your doctor can confirm the number and decide if more tests are needed.": "Tsɔ wò agbalẽ ŋutɔŋutɔ la yi wò kɔdzi be wò dɔnɔkɔdola naxɔ xexlẽmea se eye wòatso nya ne èhiã dodokpɔ bubuwo.",
		"One test is outside the usual range on your report.": "Dodokpɔ ɖeka mele abe ale si wònɔna ene le wò agbalẽ la dzi o.",
		"That is a signal to follow up — not a diagnosis.": "Enye dzesi be nàdze eyome — menye dɔléle si wokpɔ o.",
		"Dehydration, a recent infection, or even a blurry photo can affect results.": "Tsi manɔmee, dɔléle aɖe si va yi la nu, alo foto si mele nyuie o gɔ̃ hã ate ŋu atrɔ ŋkuɖoɖoawo.",
		"A doctor who knows you is the best person to say what it means.": "Dɔnɔkɔdola si nya wò lae anya gblɔ nusi wòfia.",
		"Your report includes blood protein tests (such as total protein or an M-spike on SPEP).": "Wò agbalẽ la lɔ ʋu me protein dodokpɔwo ɖe eme (abe total protein alo M-spike le SPEP dzi ene).",
		"These show the mix of proteins in your blood.": "Esiawo fia protein ƒomevi siwo le wò ʋu me.",
		"Unusual patterns are a common reason for follow-up blood work — they are not usually an emergency on their own.": "Nɔnɔme siwo mele abe ale si wònɔna ene la zua susu na ʋudodokpɔ bubu — womenye dzɔdzɔmenya gbegblẽ le wo ɖokui si o.",
		"Visit your clinic or hospital, bring the original lab slip, and ask whether you need a test called immunofixation.": "Yi wò kɔdzi alo kɔdzigã, tsɔ agbalẽ gbãtɔ la yi, eye nàbia ne èhiã dodokpɔ bubu si woyɔna be immunofixation.",
		"This summary is meant to help you understand your report — it is not medical advice or a final diagnosis.": "Nyatakaka sia ɖo be wòakpe ɖe ŋuwò nàse wò agbalẽ la gɔme — menye dɔnɔkɔdola ƒe aɖaŋuɖoɖo alo dɔléle si wokpɔ mlɔeba o.",
		"Only a qualified clinician can confirm your results and tell you what to do next.": "Dɔnɔkɔdola nyuitɔ koe ate ŋu akpɔ wò ŋkuɖoɖoawo dzi ɖa eye wòagblɔ nusi wòle be nàwɔ emegbe.",
		"Your results are ready": "Wò ŋkuɖoɖo siwo sɔ",
		"Normal": "Edzɔ le eŋu",
		"A little high": "Ede ɖe dzi viɖe",
		"Lower than ideal": "Ege ɖe anyi wu alesi enyo",
		"Low — see a doctor": "Ege ɖe anyi — yi dɔkta gbɔ",
		"Health Score": "Lãmesẽ Xexlẽme",
		"You are here": "Èle afii",
		"Hide Details": "Ɣla nyatakakawo",
		"Brief insights from your data.": "Nyatakaka kpui siwo tso wò data me.",
		"What we found": "Nusi míkpɔ",
		"What to do next": "Nusi nàwɔ eyome",
		"Please see a doctor immediately": "Meɖe kuku, yi dɔkta gbɔ kaba",
		"Drink plenty of water": "No tsi gbɔ̃ vitɔ",
		"Malaria detected": "Asrã va",
		"Needs attention": "Hiã lãmesẽ",
		"Room to improve": "Ate ŋu anyo wu",
		"Good": "Edzɔ",
		"Excellent": "Enyo ŋutɔ",
		"Looking good": "Enyo",
		"Hide": "Ɣla",
		"Why this matters": "Nu si ŋuti esia le vevie",
		"Read in your language": "Xlẽe le wò gbe me",
		"What this means for you": "Nusi wòfia na wò",
		"Some results look off. Take this to a clinic soon.": "Ŋkuɖoɖo aɖewo mele abe ale si wònɔna ene o. Tsɔ esia yi kɔdzi kaba.",
		"A few values need follow-up. Ask your doctor what to watch.": "Xexlẽme ʋee aɖewo hiã be nàkpɔ wo ɖa. Bia wò dɔnɔkɔdola nusi wòle be nàkpɔ ɖa.",
		"Most results look fine. Keep healthy habits and check-ups.": "Ŋkuɖoɖo geɖe le nyuie. Yi edzi kple lãmesẽ nɔnɔme nyuiwo kple dodokpɔ.",
		"Your results look strong overall. Stay consistent.": "Wò ŋkuɖoɖo katã le sesẽ. Yi edzi nenema.",
		"What we looked at": "Nusi míekpɔ ɖa",
		"Good news at a glance": "Nya nyui aɖe le afii",
		"Double-check the numbers": "Gakpɔ xexlẽmeawo ɖa",
		"One result stood out": "Ŋkuɖoɖo ɖeka dze ame",
		"About the protein tests": "Tso protein dodokpɔwo ŋu",
		"About the liver-related tests": "Tso aklã dodokpɔwo ŋu",
		"Important": "Vevie",
		"Every value we could read looks within the normal ranges printed on your report. Keep your healthy habits and routine check-ups.": "Xexlẽme ɖesiaɖe si míate ŋu axlẽ la le abe ale si wònɔna ene le wò agbalẽ la dzi. Yi edzi kple lãmesẽ nɔnɔme nyuiwo kple dodokpɔ.",
		"At least one value may have been misread from the photo. Compare this summary with your paper report or lab printout — if a number looks wrong, trust the original document and ask the lab to confirm.": "Ate ŋu anye be woaxlẽ xexlẽme ɖeka gbegblẽ le foto la me. Tsɔ nyatakaka sia sɔ kple wò agbalẽ alo lab ƒe nuŋlɔɖi la — ne xexlẽme aɖe mele eme o la, xɔ agbalẽ gbãtɔ dzi se, eye nàbia lab la be wòakpɔ egbɔ.",
		"Looks typical": "Ele abe ale si wònɔna ene",
		"Higher than usual": "Kɔkɔ wu ale si wònɔna",
		"Lower than usual": "Ede ɖe anyi wu ale si wònɔna",
		"Worth a doctor visit": "Edze be meyi dɔkta gbɔ",
		"M-spike (protein band)": "M-spike (protein ƒomevi)",
		"SPEP M-spike": "SPEP M-spike",
		"Ask about a specialist follow-up": "Bia nunyala ƒe dodokpɔ bubu ŋu nya",
		"Your report flags an M-spike — an unusual protein band on a blood protein test (SPEP). That means the lab saw a protein pattern worth a closer look. It does not mean you are definitely seriously ill — infections and other conditions can sometimes look similar. See your doctor soon; they may order a follow-up test called immunofixation to learn more.": "Wò agbalẽ la fia M-spike — protein ƒomevi si mele abe ale si wònɔna ene le ʋu protein dodokpɔ (SPEP) me. Esia fia be lab la kpɔ protein ƒe nɔnɔme aɖe si dze be woakpɔ ɖa nyuie. Mefia be wò dɔléle sesẽ tututu o — dɔléle bubuwo hã ate ŋu adze nenema. Yi wò dɔnɔkɔdola gbɔ kaba; ate ŋu aɖe se dodokpɔ bubu si woyɔna be immunofixation be yeanya nu geɖe.",
		"Share these results with your doctor": "Tsɔ ŋkuɖoɖo siawo na wò dɔnɔkɔdola",
		"Take this summary and your original lab report to your clinic or hospital so they can confirm the findings and plan next steps.": "Tsɔ nyatakaka sia kple wò agbalẽ gbãtɔ la yi wò kɔdzi alo kɔdzigã be woakpɔ nudidiawo dzi ɖa eye woaɖo tanya na emegbe.",
		"Ask about follow-up tests": "Bia dodokpɔ bubuwo ŋu nya",
		"If your report mentions an M-spike or unusual protein band, ask your doctor whether you need immunofixation or a referral to a blood specialist.": "Ne wò agbalẽ la yɔ M-spike alo protein ƒomevi aɖe si mele abe ale si wònɔna ene o la, bia wò dɔnɔkɔdola ne èhiã immunofixation alo ne woadɔ wò ɖe ʋu ŋuti nunyala gbɔ.",
		"Keep a copy of your report": "Dzra wò agbalẽ la ƒe kɔpi ɖeka ɖo",
		"Save the photo and this summary so you can compare with future tests.": "Dzra foto la kple nyatakaka sia ɖo be nàte ŋu atsɔe asɔ kple dodokpɔ siwo ava emegbe.",
		"Support your liver while you wait": "Kpe ɖe wò aklã ŋu esime nèle lalam",
		"Avoid alcohol, stay hydrated, eat balanced meals, and avoid unnecessary herbal mixes unless your doctor approves them.": "Ƒo asa na aha, no tsi geɖe, ɖu nuɖuɖu nyuiwo, eye nàƒo asa na atike ƒomevi siwo wò dɔnɔkɔdola mekpɔ gome ɖe eme o.",
		"We started reading your photo, but couldn't finish the analysis.": "Míedze wò foto la xexlẽ gɔme, gake míete ŋu wu numekɔkɔ la nu o.",
		"This usually means the photo was unclear, or the AI helper isn't connected yet.": "Esia fia be foto la mekɔ nyuie o, alo AI kpeɖeŋutɔ la mele dɔ wɔm haɖe o.",
		"We couldn't read enough from your photo.": "Míete ŋu xlẽ nu geɖe le wò foto la me o.",
		"Try a brighter, straighter photo — or type your lab values instead.": "Te foto si kɔ nyuie kpɔ — alo ŋlɔ wò lab xexlẽmeawo ɖe eteƒe.",
		"Take a clearer photo": "Ɖe foto si kɔ nyuie",
		"Use good lighting, hold your phone steady, and make sure all the text on your lab report is visible. Then upload again.": "Zã kekeli nyui, lé wò fon me tututu, eye kpɔ egbɔ be nya siwo katã le wò lab agbalẽ la dzi le dze dzedzee. Emegbe gaɖoe ɖe wò computer dzi.",
		"Type your results instead": "Ŋlɔ wò ŋkuɖoɖoawo ɖe eteƒe",
		"On the upload page, paste or type the values from your report — for example: Hemoglobin 7.2 g/dL, WBC 6.2.": "Le upload axa la dzi, tsɔ alo ŋlɔ xexlẽme siwo le wò agbalẽ la dzi — kpɔɖeŋu: Hemoglobin 7.2 g/dL, WBC 6.2.",
		"Use the box on the upload page to paste or type values from your lab report.": "Zã aɖaka si le upload axa la dzi tsɔ alo ŋlɔ xexlẽme siwo tso wò lab agbalẽ la dzi.",
		"Try a sample report": "Te kpɔɖeŋu agbalẽ ɖeka kpɔ",
		"Pick one of our example cases (Malaria, Anemia, Typhoid, or Urinalysis) to see how the analysis works.": "Tia míaƒe kpɔɖeŋu nyawo dometɔ ɖeka (Malaria, Anemia, Typhoid, alo Urinalysis) be nàkpɔ ale si numekɔkɔ la wɔa dɔe.",
		"Choose an example case to preview what your results will look like.": "Tia kpɔɖeŋu nya ɖeka be nàkpɔ ale si wò ŋkuɖoɖoawo anɔ.",
		"Upload a clearer photo": "Ɖo foto si kɔ nyuie ɖe computer dzi",
		"Lay the report flat, avoid shadows, and zoom in so the numbers are easy to read.": "Tsɔ agbalẽ la mlɔ anyi tamaa, ƒo asa na vɔvɔli, eye zoom in be xexlẽmeawo naxlẽ bɔbɔe.",
		"Each result explained in plain English — no medical jargon.": "Okadi ɖe sia ɖe le dzesi me gbegbɔgblɔ me — atike nya sesẽ aɖeke mele eme o.",
		"Simple steps based on your results.": "Atikewɔwɔ afɔku siwo sɔ na wò.",
		"Always speak to a qualified doctor about your health.": "Ƒo nu kple dɔnɔkɔdola daa tso lãmesẽ wò ŋu.",
		"Go to my dashboard": "Yi lãmesẽ dɔwɔƒe",
		"View clinical history": "Kpɔ lãmesẽ abakɔsɛm",
		"Upload more results": "Sɔ lãmesẽ foto bubu de eme",
		"Go back and select a Preset Case": "Trɔ yi megbe nàfia Preset dɔléle aɖe",
		"Click 'Upload more results' below and select one of the preloaded clinical cases to preview the analysis interface immediately.": "Tia 'Upload more results' le afi sia na Preset nyuitɔ kaba.",
		"Start the Genetiq Local AI Service": "Sɔ Genetiq Local AI Dɔwɔƒe",
		"Make sure the Genetiq Local AI Helper application is started on your computer. Once the helper is running, this page will automatically process and read any lab photo you upload.": "Hwɛ be Genetiq Local AI Helper le computer dzi. Ne dɔwɔla le dɔwɔm la, axlẽ lab foto sia foforo.",
		"⚠️ DEMO NOTICE: You uploaded a custom image. In full GPU mode, Google Gemma 4 Multimodal Vision reads this image to extract health data. Because the local Gemma 4 server is currently not running, we cannot analyze custom images.\n\nTo test the interface, please go back and select one of the pre-loaded 'Ghanaian Medical Case Presets' (such as Malaria RDT Strip, CBC Severe Anemia, or Typhoid Report) which work fully offline.": "⚠️ DEMO NOTICE: Wòe-upload foto foforo. Le GPU full me la, Google Gemma 4 Multimodal Vision baaxlẽ foto sia na lãmesẽ nyaso. Elabena local Gemma 4 server megbam o, míate ŋu axlẽ lãmesẽ foto siwo sɔ o.\n\nNa sɔsɔ la, de fu kpo na lãmesẽ Preset siwo nye (Malaria RDT Strip, CBC Severe Anemia, alo Typhoid Report) siwo dɔwɔna offline fully."
	},
	fante: {
		"Report Overview": "Nkyerɛkyerɛmu Titir",
		"Check original report": "Hwɛ krataa ankasa no",
		"Seen on report": "Wɔhunuu wɔ krataa no do",
		"Monoclonal Gammopathy (M-spike)": "Monoclonal Gammopathy (M-spike / Protein sononko)",
		"Protein Electrophoresis - M-spike": "Protein Electrophoresis - M-spike",
		"Requires Urgent Medical Attention": "Hia ayaresa ntɛmpɛ",
		"Faint restricted band detected": "Wɔhunuu protein band a ɔnnyɛ dzen wɔ krataa no do",
		"Consult Your Doctor Immediately": "Kɔ wo datser nkyɛn ntɛm pa ara",
		"Maintain a Balanced Ghanaian Diet": "Dzi Ghana aduane pa a ahoɔden wɔ mu daa",
		"Stay Well Hydrated": "Nom nsuo pa pii daa",
		"Manage Stress and Get Rest": "Gye wo ho na home yie",
		"Your lab report indicates a significant finding: a 'faint restricted band' or 'M-spike' in your blood. This abnormal protein requires immediate medical follow-up, specifically an 'Immunofixation' test, to determine its cause and significance. While this finding can sometimes be benign, it can also be an early sign of more serious conditions. It is crucial to consult your doctor without delay for further evaluation and guidance. Please remember, this analysis is AI-assisted and not a replacement for a qualified medical doctor.": "Wo lab krataa no kyerɛ nsɛm titir bi: protein band a ɔnnyɛ dzen anaa 'M-spike' wɔ wo mogya mu. Saa protein sononko yi hia datser nhwehwɛmu ntɛmpɛ...",
		"Your lab report indicates the presence of a 'faint restricted band' or 'M-spike' in the gamma globulin region. This M-spike is an abnormal protein that can be a sign of a condition called monoclonal gammopathy. While it can sometimes be harmless (known as MGUS - Monoclonal Gammopathy of Undetermined Significance), it can also be an early indicator of more serious conditions affecting the blood cells, such as multiple myeloma. It is crucial to follow up with a doctor for further investigation, as recommended by the lab report, specifically an 'Immunofixation' test, to understand the nature of this protein.": "Wo lab krataa no kyerɛ dɛ protein band sononko anaa 'M-spike' wɔ gamma globulin mu. Saa M-spike yi yɛ protein a ɔnnyɛ dɛ ɔtaa yɛ...",
		"The most important step is to take this lab report to your doctor as soon as possible. Discuss the finding of the 'faint restricted band' (M-spike) and the lab's recommendation for an 'Immunofixation' test. This follow-up test is essential to determine the exact type and significance of the abnormal protein found in your blood. Do not delay this consultation.": "Anamɔn a ɔho hia sen biara ne dɛ wode saa lab krataa yi bɛkɔ wo datser nkyɛn ntɛmpɛ...",
		"While awaiting further diagnosis, continue to support your overall health with a nutritious diet. Focus on local Ghanaian foods rich in vitamins and minerals. Include plenty of kontomire (cocoyam leaves), garden eggs, and other dark leafy greens. Incorporate fruits like mangoes, oranges, and pineapples. Reduce your intake of processed foods, excessive salt, and sugary drinks. A healthy diet helps your body function optimally and can support your immune system.": "Ber a woretwɛn nhwehwɛmu fofor no, kɔ do boa wo ahoɔden koraa de aduane pa. Dzi Ghana aduane ahorow tse dɛ kontomire, ntoropo, ne nsuaba...",
		"Ensure you are drinking enough clean water throughout the day. Staying hydrated is vital for all bodily functions, including kidney health and blood circulation. You can also supplement with natural Ghanaian options like fresh coconut water, which is a good source of electrolytes, or light koko (porridge) to keep your energy levels up.": "Hwɛ dɛ worenom nsuo fiewedze a ɔdɔso da mu nyina...",
		"Receiving an abnormal lab result can be stressful. Try to manage stress through relaxation techniques, light exercise, or spending time with loved ones. Ensure you are getting adequate sleep each night. A well-rested body is better equipped to handle any health challenges. Consider traditional Ghanaian practices like meditation or spending time in nature if that brings you calm.": "Lab nhwehwɛmu a ɔnnyɛ papa a wobɛnya no botum ma woadwen pii. Bɔ mbɔdzen dɛ wobɛte adwenehaw do...",
		"Total protein measures the combined amount of albumin and globulin in your blood — it reflects hydration, nutrition, and immune activity.": "Total protein susuw albumin ne globulin dodow a ɛwɔ wo mogya mu — ɛkyerɛ nsuo dodow, aduane pa, ne honam mu banbɔ.",
		"Common reasons include dehydration, chronic inflammation, or infection.": "Ndzɛmba a ɔtaa de ba ne nsuo a ɔnnɔso, ahonam a ɛhuru, anaa yarba mmoawa.",
		"Bring your original report to your clinic so your doctor can confirm the number and decide if more tests are needed.": "Fa wo krataa ankasa no kɔ wo clinic sɛdɛ wo datser bɛtum ahwɛ akontaahyɛdze no na wafeɛ sɛ wohia nhwehwɛmu fofor.",
		"One test is outside the usual range on your report.": "Nhwehwɛmu kor mfa dɛ ɔtaa yɛ mu wɔ wo krataa no do.",
		"That is a signal to follow up — not a diagnosis.": "Ɔyɛ nsɛnkyerɛdze a wobɛdzi ekyir — ɔnnyɛ yarba a wɔahu.",
		"Dehydration, a recent infection, or even a blurry photo can affect results.": "Nsuo a ɔnnɔso wɔ wo mu, yarba fofor, anaadɛ mfonyin a ɛnna hɔ yie botum sesa nhwehwɛmu no.",
		"A doctor who knows you is the best person to say what it means.": "Datser a onyim wo yɛ obi a ɔbɛtum aka deɛ ɔkyerɛ.",
		"Your report includes blood protein tests (such as total protein or an M-spike on SPEP).": "Wo krataa no ka mogya protein nhwehwɛmu ho asɛm (tse dɛ total protein anaa M-spike wɔ SPEP do).",
		"These show the mix of proteins in your blood.": "Yeinom kyerɛ dɛ protein ahodow wɔ wo mogya mu.",
		"Unusual patterns are a common reason for follow-up blood work — they are not usually an emergency on their own.": "Nsɛm a ɔnnyɛ dɛ ɔtaa yɛ taa yɛ dza ɛma wɔyɛ mogya nhwehwɛmu fofor — ɔnnyɛ mmerɛ nyina dza ɛyɛ ntɛmpɛ.",
		"Visit your clinic or hospital, bring the original lab slip, and ask whether you need a test called immunofixation.": "Kɔ wo clinic anaa ayaresabea, fa krataa ankasa no kɔ, na bisa dɛ wohia nhwehwɛmu bi a wɔfrɛ no immunofixation anaa.",
		"This summary is meant to help you understand your report — it is not medical advice or a final diagnosis.": "Saa nkyerɛkyerɛmu yi yɛ dɛ ɛbɛboa wo ma woate wo krataa no ase — ɔnnyɛ ayaresa afotu anaa yarba a wɔahu koraa.",
		"Only a qualified clinician can confirm your results and tell you what to do next.": "Datser pa nko ara na ɔbɛtum agye wo nhwehwɛmu no to mu na waka deɛ ɛsɛ dɛ woyɛ.",
		"Your results are ready": "Wo results no awie",
		"Normal": "Ɛyɛ papa",
		"A little high": "Ɛkɔ soro kakra",
		"Lower than ideal": "Ɛyɛ ketewa sen deɛ ɛsɛ",
		"Low — see a doctor": "Ɛyɛ ketewa — kɔ dɔkota nkyɛn",
		"Health Score": "Ahoɔden Bɔ",
		"You are here": "Wowɔ ha",
		"Hide Details": "Kata nsɛm no do",
		"Brief insights from your data.": "Nsɛm tiawa a ɛfiri wo nsɛm mu.",
		"What we found": "Deɛ yɛhuu",
		"What to do next": "Deɛ ɛsɛ sɛ woyɛ",
		"Please see a doctor immediately": "Mesrɛ wo, kɔ dɔkota nkyɛn ntɛm",
		"Malaria detected": "Malaria aba",
		"Needs attention": "Hian nhwehwɛmu",
		"Room to improve": "Obotum ayɛ yie",
		"Good": "Ɔyɛ papa",
		"Excellent": "Ɔyɛ kyɛn so",
		"Looking good": "Ɔyɛ yie",
		"Hide": "Kata do",
		"Why this matters": "Adɛn ntsi na eyi ho hia",
		"Read in your language": "Kenkan wɔ wo kasa mu",
		"What this means for you": "Deɛ yeinom kyerɛ ma wo",
		"Some results look off. Take this to a clinic soon.": "Nhwehwɛmu bi nnyɛ dɛ ɔtaa yɛ. Fa yei kɔ clinic ntɛm.",
		"A few values need follow-up. Ask your doctor what to watch.": "Nsɛm kakraa bi hia dɛ wodzi ekyir. Bisa wo datser dɛ ɛsɛ dɛ wohwɛ.",
		"Most results look fine. Keep healthy habits and check-ups.": "Nhwehwɛmu dodow no ara yɛ papa. Kɔ do yɛ akwahoodzen nneyɛe na kɔ nhwehwɛmu daa.",
		"Your results look strong overall. Stay consistent.": "Wo nhwehwɛmu nyina yɛ dzen. Kɔ do saa ara.",
		"What we looked at": "Deɛ yɛhwɛe",
		"Good news at a glance": "Asɛmpa a wobɛhu ntɛm",
		"Double-check the numbers": "Hwɛ akontaahyɛdze no bio",
		"One result stood out": "Nhwehwɛmu kor da nsow",
		"About the protein tests": "Ɔfa protein nhwehwɛmu ho",
		"About the liver-related tests": "Ɔfa berebo nhwehwɛmu ho",
		"Important": "Ɔho hia",
		"Every value we could read looks within the normal ranges printed on your report. Keep your healthy habits and routine check-ups.": "Nsɛm a yɛtum kenkanee nyina wɔ dɛ ɔtaa yɛ mu wɔ wo krataa no do. Kɔ do yɛ akwahoodzen nneyɛe na kɔ nhwehwɛmu daa.",
		"At least one value may have been misread from the photo. Compare this summary with your paper report or lab printout — if a number looks wrong, trust the original document and ask the lab to confirm.": "Ebia yɛnkenkan akontaahyɛdze kor yie wɔ mfonyin no mu. Fa saa nkyerɛkyerɛmu yi toto wo krataa anaa lab printout no ho — sɛ akontaahyɛdze bi nntsi dɛ ɔtaa yɛ a, gye krataa ankasa no dzi na bisa lab no.",
		"Looks typical": "Ɔte dɛ deɛ ɔtaa yɛ",
		"Higher than usual": "Ɔkorɔn sen dɛ ɔtaa yɛ",
		"Lower than usual": "Ɔba fam sen dɛ ɔtaa yɛ",
		"Worth a doctor visit": "Ɔfata dɛ wokɔ dɔkota nkyɛn",
		"M-spike (protein band)": "M-spike (protein sononko)",
		"SPEP M-spike": "SPEP M-spike",
		"Ask about a specialist follow-up": "Bisa ɔfa specialist nhwehwɛmu ho",
		"Your report flags an M-spike — an unusual protein band on a blood protein test (SPEP). That means the lab saw a protein pattern worth a closer look. It does not mean you are definitely seriously ill — infections and other conditions can sometimes look similar. See your doctor soon; they may order a follow-up test called immunofixation to learn more.": "Wo krataa no kyerɛ M-spike — protein sononko bi a ɛda edzi wɔ mogya protein nhwehwɛmu (SPEP) mu. Ɛkyerɛ dɛ lab no hunuu protein nhyehyɛe bi a ɛsɛ dɛ wɔhwɛ mu yie. Ɛnkyerɛ dɛ wo yarba mu yɛ dzen ankasa — yarba fofor botum ayɛ dɛ eyi ara. Kɔ wo datser nkyɛn ntɛm; ebia ɔbɛma wo nhwehwɛmu fofor a wɔfrɛ no immunofixation na woahu pii.",
		"Share these results with your doctor": "Fa saa nsɛm yi kɔma wo datser",
		"Take this summary and your original lab report to your clinic or hospital so they can confirm the findings and plan next steps.": "Fa saa nkyerɛkyerɛmu yi ne wo krataa ankasa no kɔ wo clinic anaa ayaresabea sɛdɛ wɔbɛtum agye atom na wɔahyehyɛ deɛ ɛdzi ho.",
		"Ask about follow-up tests": "Bisa nhwehwɛmu fofor ho asɛm",
		"If your report mentions an M-spike or unusual protein band, ask your doctor whether you need immunofixation or a referral to a blood specialist.": "Sɛ wo krataa no ka M-spike anaa protein sononko bi ho asɛm a, bisa wo datser dɛ wohia immunofixation anaa dɛ wɔmfa wo nkɔ mogya ho specialist nkyɛn.",
		"Keep a copy of your report": "Kora wo krataa no bi so",
		"Save the photo and this summary so you can compare with future tests.": "Kora mfonyin no ne saa nkyerɛkyerɛmu yi so sɛdɛ wobɛtum de toto nhwehwɛmu a ɛbɛba ekyir no ho.",
		"Support your liver while you wait": "Boa wo berebo wɔ ber a woretwɛn",
		"Avoid alcohol, stay hydrated, eat balanced meals, and avoid unnecessary herbal mixes unless your doctor approves them.": "Nnom nsa, nom nsuo pii, dzi aduane pa, na nngye aduro a wɔde nhahan ayɛ a wo datser nnii ho adanse.",
		"We started reading your photo, but couldn't finish the analysis.": "Yɛhyɛɛ ase kenkan wo mfonyin no, nanso yɛantum anwie nhwehwɛmu no.",
		"This usually means the photo was unclear, or the AI helper isn't connected yet.": "Ɛkyerɛ dɛ mfonyin no anna hɔ yie, anaadɛ AI helper no mfa ne ho mmɔ nkyɛn ɛ.",
		"We couldn't read enough from your photo.": "Yɛantum ankenkan wo mfonyin no mu ade dodow.",
		"Try a brighter, straighter photo — or type your lab values instead.": "Sɔ mfonyin a ɛda hɔ yie na ɛtene hwɛ — anaadɛ twerɛ wo lab akontaahyɛdze no.",
		"Take a clearer photo": "Fa mfonyin a ɛda hɔ yie",
		"Use good lighting, hold your phone steady, and make sure all the text on your lab report is visible. Then upload again.": "Fa kanea pa, sɔ wo phone mu yie, na hwɛ dɛ nsɛm a ɛwɔ wo lab krataa no do nyina da edzi. Ɛno ekyir san to gua bio.",
		"Type your results instead": "Twerɛ wo nsɛm no mmom",
		"On the upload page, paste or type the values from your report — for example: Hemoglobin 7.2 g/dL, WBC 6.2.": "Wɔ upload krataa no do, paste anaa twerɛ akontaahyɛdze a ɛwɔ wo krataa no do — sɛnkyerɛase: Hemoglobin 7.2 g/dL, WBC 6.2.",
		"Use the box on the upload page to paste or type values from your lab report.": "Fa box a ɛwɔ upload krataa no do paste anaa twerɛ akontaahyɛdze a ɛfiri wo lab krataa no mu.",
		"Try a sample report": "Sɔ nhwɛso krataa bi hwɛ",
		"Pick one of our example cases (Malaria, Anemia, Typhoid, or Urinalysis) to see how the analysis works.": "Paw yɛn nhwɛso yarba no mu kor (Malaria, Anemia, Typhoid, anaa Urinalysis) na hwɛ sɛnea nhwehwɛmu no yɛ edwuma.",
		"Choose an example case to preview what your results will look like.": "Paw nhwɛso yarba bi na hwɛ sɛnea wo nsɛm no bɛyɛ.",
		"Upload a clearer photo": "To mfonyin a ɛda hɔ yie gua",
		"Lay the report flat, avoid shadows, and zoom in so the numbers are easy to read.": "Fa krataa no to hɔ tamaa, twe wo ho firi sunsuma ho, na zoom in ma akontaahyɛdze no ayɛ mmerɛw dɛ wɔbɛkenkan.",
		"Each result explained in plain English — no medical jargon.": "Kenyankan biara gu kasa a ɔtease mu — ayaresa kasa a ɔyɛ dzen biara nni mu.",
		"Simple steps based on your results.": "Anamɔn nketewa a wobɛtu afi wo nhwehwɛmu no mu.",
		"Always speak to a qualified doctor about your health.": "Kasa kyerɛ datser pa biara wɔ wo ahoodzen ho daa.",
		"Go to my dashboard": "Kɔ m'akannifo kratafa",
		"View clinical history": "Hwɛ wo yarba abakɔsɛm",
		"Upload more results": "San to nhwehwɛmu fofor gua",
		"Go back and select a Preset Case": "San kɔ akyir na paw Preset yarba kor",
		"Click 'Upload more results' below and select one of the preloaded clinical cases to preview the analysis interface immediately.": "Kanyan 'Upload more results' wɔ ase ha na paw clinical cases a yɛahyehyɛ no kor.",
		"Start the Genetiq Local AI Service": "Sɔ Genetiq Local AI Asoe no",
		"Make sure the Genetiq Local AI Helper application is started on your computer. Once the helper is running, this page will automatically process and read any lab photo you upload.": "Hwɛ dɛ Genetiq Local AI Helper application no asɔ wɔ wo computer do. Sɛ helper no sɔ a, kratafa yi bɛkenkan mfonyin biara a wode bɛto gua.",
		"⚠️ DEMO NOTICE: You uploaded a custom image. In full GPU mode, Google Gemma 4 Multimodal Vision reads this image to extract health data. Because the local Gemma 4 server is currently not running, we cannot analyze custom images.\n\nTo test the interface, please go back and select one of the pre-loaded 'Ghanaian Medical Case Presets' (such as Malaria RDT Strip, CBC Severe Anemia, or Typhoid Report) which work fully offline.": "⚠️ DEMO NOTICE: Wode mfonyin fofor na ɔtooe gua. Sɛ full GPU dwumadzi no ba a, Google Gemma 4 Multimodal Vision bɛkenkan mfonyin yi na wayi yarba ho nsɛm afi mu. Esian dɛ local Gemma 4 server no nnwuma mprempren nti, yɛntum nhwehwɛ mfonyin fofor mu.\n\nSɛ wobɛsɔ interface yi ahwɛ a, yɛsrɛ wo san kɔ akyir na paw 'Ghanaian Medical Case Presets' (tse dɛ Malaria RDT Strip, CBC Severe Anemia, anaa Typhoid Report) a ɔyɛ edwuma offline fully no kor."
	},
};

/**
 * Pattern-based translations for dynamic strings that contain numbers or
 * interpolated context (e.g. "We picked out 3 results…"). `$1` is replaced
 * with the first captured group from the English source string.
 */
const TEMPLATE_TRANSLATIONS: Record<string, Array<[RegExp, string]>> = {
	twi: [
		[
			/^We picked out (\d+) results? from your lab report.*$/i,
			"Yɛyii nsɛmmuae $1 firii wo lab krataa no mu, na yɛakyerɛkyerɛ emu biara mu wɔ kasa a ɛnyɛ den mu.",
		],
		[/^(\d+) results stood out$/i, "Nsɛmmuae $1 da nsow"],
		[
			/^(\d+) tests are outside the usual ranges.*$/i,
			"Nsɔhwɛ $1 nni deɛ ɛtaa yɛ mu wɔ wo krataa no so. Ɛyɛ nsɛnkyerɛnneɛ a wobɛdi akyi — ɛnnyɛ yadeɛ a wɔahunu. Nneɛma ahodoɔ betumi sesa lab akontaahyɛdeɛ. Kɔ dɔkota nkyɛn na fa wo krataa ankasa no kɔ sɛdeɛ ɔbɛhwɛ mu yie.",
		],
		[
			/^Your reading \((.*?)\) is above the usual adult range.*/i,
			"Wo akontaahyɛdeɛ ($1) korɔn sen deɛ ɛtaa yɛ wɔ mpanyimfoɔ mu.",
		],
		[
			/^Total protein is below the usual range \((.*?)\).*/i,
			"Total protein baa fam sen deɛ ɛtaa yɛ ($1).",
		],
		[
			/^(.*?) \((.*?)\) is (higher|lower) than the usual range.*/i,
			"$1 ($2) mfa deɛ ɛtaa yɛ mu.",
		],
	],
	ga: [
		[
			/^We picked out (\d+) results? from your lab report.*$/i,
			"Mijie results $1 kɛjɛ o lab report lɛ mli, ni mitsɔɔ emli fɛɛ shishi yɛ wiemɔ ni yɔɔ mlɛo mli.",
		],
		[/^(\d+) results stood out$/i, "Results $1 je kpo"],
		[
			/^(\d+) tests are outside the usual ranges.*$/i,
			"Tests $1 yɛɛɛ bɔ ni efɔɔ mli yɛ o report lɛ nɔ. Eji okadi ni obaadi sɛɛ — ejeee hela ni ana. Nibii srɔtoi baanyɛ atsake lab numbers. Yaa dɔkita he ni okɛ o krataa diɛŋtsɛ lɛ yaa koni ekwɛ mli jogbaŋŋ.",
		],
		[
			/^Your reading \((.*?)\) is above the usual adult range.*/i,
			"O akontaabuu ($1) yi kɛ nɔ ni efɔɔ baa yɛ gbodoi ahe.",
		],
		[
			/^Total protein is below the usual range \((.*?)\).*/i,
			"Total protein ba shi fe fe ni efɔɔ baa ($1).",
		],
	],
	ewe: [
		[
			/^We picked out (\d+) results? from your lab report.*$/i,
			"Míetia ŋkuɖoɖo $1 tso wò lab agbalẽ la me, eye míeɖe ɖe sia ɖe me le nya bɔbɔewo me.",
		],
		[/^(\d+) results stood out$/i, "Ŋkuɖoɖo $1 ɖe dzesi"],
		[
			/^(\d+) tests are outside the usual ranges.*$/i,
			"Dodokpɔ $1 mele afisi wonɔna le wò agbalẽ la dzi o. Enye dzesi be nàdze eyome — menye dɔléle si wokpɔ o. Nu vovovowo ate ŋu atrɔ lab ƒe xexlẽmewo. Yi dɔkta gbɔ eye nàtsɔ wò agbalẽ ŋutɔŋutɔ la ayi be wòakpɔ eme nyuie.",
		],
		[
			/^Your reading \((.*?)\) is above the usual adult range.*/i,
			"Wò xexlẽme ($1) kɔkɔ wu ale si wònɔna le tsitsiewo me.",
		],
		[
			/^Total protein is below the usual range \((.*?)\).*/i,
			"Total protein ge ɖe anyi wu ale si wònɔna ($1).",
		],
	],
	fante: [
		[
			/^We picked out (\d+) results? from your lab report.*$/i,
			"Yɛyii nsɛmmuae $1 fii wo lab krataa no mu, na yɛakyerɛkyerɛ emu biara mu wɔ kasa a ɔnnyɛ dzen mu.",
		],
		[/^(\d+) results stood out$/i, "Nsɛmmuae $1 da nsow"],
		[
			/^(\d+) tests are outside the usual ranges.*$/i,
			"Nsɔhwɛ $1 nnyi deɛ ɔtaa yɛ mu wɔ wo krataa no do. Ɔyɛ nsɛnkyerɛdze a wobɛdzi ekyir — ɔnnyɛ yarba a wɔahu. Ndzɛmba ahorow botum sesa lab akontaahyɛdze. Kɔ dɔkota nkyɛn na fa wo krataa ankasa no kɔ amba ɔbɔhwɛ mu yie.",
		],
		[
			/^Your reading \((.*?)\) is above the usual adult range.*/i,
			"Wo akontaahyɛdze ($1) korɔn sen dɛ ɔtaa yɛ wɔ mpanyimfo mu.",
		],
		[
			/^Total protein is below the usual range \((.*?)\).*/i,
			"Total protein baa fam sen dɛ ɔtaa yɛ ($1).",
		],
	],
};

/** Localized "N value(s) analyzed" phrase — generated directly instead of translating rendered English. */
export function getAnalyzedCountText(total: number, language: GemmaLanguage): string {
	switch (language) {
		case "twi":
			return `Wɔahwɛ akontaahyɛdeɛ ${total} mu`;
		case "ga":
			return `Aha kwɛ akontaabuu ${total}`;
		case "ewe":
			return `Wodzro xexlẽme ${total} me`;
		case "fante":
			return `Wɔahwɛ akontaahyɛdze ${total} mu`;
		default:
			return `${total} ${total === 1 ? "value" : "values"} analyzed`;
	}
}

/** Localized "N need(s) review" phrase — generated directly instead of translating rendered English. */
export function getReviewCountText(count: number, language: GemmaLanguage): string {
	switch (language) {
		case "twi":
			return `${count} hia nhwehwɛmu foforo`;
		case "ga":
			return `${count} hia kwɛmɔ bio`;
		case "ewe":
			return `${count} hiã ŋkuɖodzi bubu`;
		case "fante":
			return `${count} hia nhwehwɛmu fofor`;
		default:
			return `${count} ${count === 1 ? "needs" : "need"} review`;
	}
}

const PHRASE_TRANSLATIONS: Record<string, Record<string, string>> = {
	twi: {
		"Your lab report indicates": "Wo lab krataa no kyerɛ",
		"a significant finding": "nsɛm titire bi",
		"in your blood": "wɔ wo mogya mu",
		"requires immediate medical follow-up": "hia dɔkota nhwehwɛmu ntɛmpɛ",
		"determine its cause and significance": "hunu ne fapem ne deɛ ɛkyerɛ",
		"consult your doctor without delay": "kɔ wo dɔkota nkyɛn a kyɛre nni mu",
		"for further evaluation and guidance": "ma wafeɛ mu bio na wama wo afotuo",
		"this analysis is AI-assisted": "saa nhwehwɛmu yi yɛ AI mmoa",
		"not a replacement for a qualified medical doctor": "na ɛnnyɛ dɔkota pa ananmu",
		"The most important step is": "Anamɔn a ɛho hia sen biara ne sɛ",
		"as soon as possible": "ntɛmpɛ pa ara",
		"Do not delay this consultation": "Mma kyɛre nni eyi kɔ mu",
		"While awaiting further diagnosis": "Wɔberɛ a woretwɛn nhwehwɛmu foforo no",
		"support your overall health": "boa wo ahoɔden koraa",
		"with a nutritious diet": "de aduane pa",
		"local Ghanaian foods": "Ghana aduane ahodoɔ",
		"rich in vitamins and minerals": "a vitamins ne minerals wɔ mu pii",
		"Ensure you are drinking enough clean water": "Hwɛ sɛ worenom nsuo fiideɛ a ɛdɔɔso",
		"throughout the day": "da mu nyinaa",
		"Staying hydrated is vital": "Nsuo a worenom no ho hia",
		"Manage Stress and Get Rest": "Gye wo ho na home yiye",
		"Receiving an abnormal lab result can be stressful": "Lab nhwehwɛmu a ɛnyɛ papa a wobɛnya no betumi ama woadwen pii",
		"Ensure you are getting adequate sleep": "Hwɛ sɛ wobɛda yiye",
		"Consult Your Doctor Immediately": "Kɔ wo dɔkota nkyɛn ntɛm pa ara",
		"Maintain a Balanced Ghanaian Diet": "Di Ghana aduane pa a ahoɔden wɔ mu daa",
		"Stay Well Hydrated": "Nom nsuo pa pii daa",
	},
	ga: {
		"Your lab report indicates": "O lab report lɛ tsɔɔ",
		"a significant finding": "sane titiri ko",
		"in your blood": "yɛ o la mli",
		"requires immediate medical follow-up": "hiaa akɛ aya dɔkita he ntɛm pa ara",
		"consult your doctor without delay": "yaa o dɔkita he ntɛm pa ara",
		"this analysis is AI-assisted": "sane nɛɛ yɛ AI yelikɛlɔ mli",
		"Consult Your Doctor Immediately": "Yaa o dɔkita he ntɛm pa ara",
		"Maintain a Balanced Ghanaian Diet": "Ye Ghana niyenii kpakpa ni yɔɔ hewalɛ daa",
		"Stay Well Hydrated": "Nu nu pii daa",
		"Manage Stress and Get Rest": "Jɔɔ ohe ni ojɔɔ ohe yiye",
	},
	ewe: {
		"Your lab report indicates": "Wò lab agbalẽ la fia",
		"a significant finding": "nu vevi aɖe",
		"in your blood": "le wò ʋu me",
		"requires immediate medical follow-up": "hiã be nàyi dɔnɔkɔdola gbɔ kaba",
		"consult your doctor without delay": "yi wò dɔnɔkɔdola gbɔ kaba",
		"this analysis is AI-assisted": "numekɔkɔ sia le AI kpeɖeŋutɔ me",
		"Consult Your Doctor Immediately": "Yi wò dɔnɔkɔdola gbɔ kaba",
		"Maintain a Balanced Ghanaian Diet": "Ɖu Ghana nuɖuɖu nyui siwo me lãmesẽ le daa",
		"Stay Well Hydrated": "No tsi geɖe daa",
		"Manage Stress and Get Rest": "Ɖe fu kpo eye nàgbɔ ɖe eme",
	},
	fante: {
		"Your lab report indicates": "Wo lab krataa no kyerɛ",
		"a significant finding": "nsɛm titir bi",
		"in your blood": "wɔ wo mogya mu",
		"requires immediate medical follow-up": "hia datser nhwehwɛmu ntɛmpɛ",
		"consult your doctor without delay": "kɔ wo datser nkyɛn a kyɛre nni mu",
		"this analysis is AI-assisted": "saa nhwehwɛmu yi yɛ AI mmoa",
		"Consult Your Doctor Immediately": "Kɔ wo datser nkyɛn ntɛm pa ara",
		"Maintain a Balanced Ghanaian Diet": "Dzi Ghana aduane pa a ahoɔden wɔ mu daa",
		"Stay Well Hydrated": "Nom nsuo pa pii daa",
		"Manage Stress and Get Rest": "Gye wo ho na home yie",
	},
};

export function getTranslation(text: string, language: GemmaLanguage): string {
	if (!text || language === "english") return text;

	const trimmed = text.trim();
	const exact = OFFLINE_TRANSLATIONS[language]?.[trimmed] || OFFLINE_TRANSLATIONS[language]?.[text];
	if (exact) return exact;

	for (const [pattern, replacement] of TEMPLATE_TRANSLATIONS[language] ?? []) {
		if (pattern.test(trimmed)) return trimmed.replace(pattern, replacement);
	}

	// For multiline text blocks, translate line by line
	if (text.includes("\n")) {
		const lines = text.split("\n");
		const translatedLines = lines.map((line) => getTranslation(line, language));
		return translatedLines.join("\n");
	}

	// For multi-sentence text blocks (separated by ". "), translate sentence by sentence
	if (text.includes(". ")) {
		const sentences = text.split(/(?<=\.\s+)/);
		if (sentences.length > 1) {
			const translated = sentences.map((s) => getTranslation(s.trim(), language));
			return translated.join(" ");
		}
	}

	// Phrase / Keyword Fallback
	let output = text;
	const phrases = PHRASE_TRANSLATIONS[language];
	if (phrases) {
		for (const [eng, loc] of Object.entries(phrases)) {
			if (output.includes(eng)) {
				output = output.replace(new RegExp(eng, "gi"), loc);
			}
		}
	}

	return output;
}

export function translateAnalysisResult(
	result: GemmaAnalysisResult,
	language: GemmaLanguage,
): GemmaAnalysisResult {
	if (!result || language === "english") return result;

	const summary = getTranslation(result.summary, language);

	const summarySections = result.summarySections?.map((sec) => ({
		...sec,
		title: getTranslation(sec.title, language),
		body: getTranslation(sec.body, language),
	}));

	const findings =
		result.findings?.map((f) => ({
			...f,
			name: getTranslation(f.name, language),
			statusLabel: getTranslation(f.statusLabel, language),
			note: getTranslation(f.note, language),
		})) ?? [];

	const recommendations =
		result.recommendations?.map((r) => ({
			...r,
			title: getTranslation(r.title, language),
			body: getTranslation(r.body, language),
		})) ?? [];

	return {
		...result,
		summary,
		summarySections,
		findings,
		recommendations,
		translations: OFFLINE_TRANSLATIONS[language] || result.translations,
	};
}

// ─── Offline Simulator: Lab Analysis ─────────────────────────────────────────

const PRESET_RESULTS: Record<string, GemmaAnalysisResult> = {
	malaria_rdt: {
		healthScore: 42,
		bodySystem: "Hematology",
		summary:
			"Your malaria finger-prick / strip test came back POSITIVE for the dangerous malaria germ that is most common in Ghana. That means malaria bugs are in your blood right now. You need proper malaria tablets (ACT) today — do not wait. Go to a pharmacy, CHPS compound, clinic, or hospital.",
		findings: [
			{
				id: "m1",
				name: "Dangerous malaria type",
				marker: "Also called P. falciparum — the malaria germ most common in Ghana",
				value: "Found in your blood",
				status: "action",
				statusLabel: "Positive — get treatment today",
				note:
					"What this means\n" +
					"The test found the dangerous malaria germ in your blood (doctors call it Plasmodium falciparum, or just falciparum). It is the malaria type that makes people in Ghana sick most often, and it can become serious quickly.\n\n" +
					"In simple words: malaria mosquitoes passed tiny bugs into your blood, and those bugs are multiplying.\n\n" +
					"What you should do now\n" +
					"• Go today to a CHPS compound, clinic, hospital, or trusted pharmacy\n" +
					"• Ask for ACT malaria tablets (the standard full course in Ghana) — herbal drinks alone are not enough\n" +
					"• Rest, drink lots of water or ORS, and sleep under a mosquito net\n\n" +
					"Get emergency help if\n" +
					"You become confused, vomit again and again, have fits/seizures, struggle to breathe, or cannot wake up properly — call 112 / 193 or go straight to hospital.",
			},
			{
				id: "m2",
				name: "Second malaria type",
				marker: "Also called P. vivax — another malaria germ (less common here)",
				value: "Not found",
				status: "normal",
				statusLabel: "Not found ✓",
				note:
					"What this means\n" +
					"The strip also checks for a second malaria germ (doctors call it Plasmodium vivax). That one was not found on this test.\n\n" +
					"In simple words: you do not appear to have this second malaria type on today’s strip. Your positive result is for the dangerous Ghana-common type (falciparum).\n\n" +
					"What you should still watch\n" +
					"If fever continues after treatment, go back for another check. One test is a snapshot — how you feel over the next days still matters.",
			},
			{
				id: "m3",
				name: "Did the test work properly?",
				marker: "Control line — the check mark that proves the strip ran correctly",
				value: "Yes — test worked",
				status: "normal",
				statusLabel: "Test worked ✓",
				note:
					"What this means\n" +
					"Every malaria strip has a “control” line. It is not your malaria result — it only shows the kit worked like it should.\n\n" +
					"In simple words: the machine / strip did its job, so the Positive / Not found lines above can be trusted.\n\n" +
					"If this had failed\n" +
					"You would need to repeat the test with a new kit. A failed control means you should ignore the other lines.",
			},
			{
				id: "m4",
				name: "How serious it looks",
				marker: "Simple estimate from the test — not a full hospital exam",
				value: "Moderate (medium)",
				status: "elevated",
				statusLabel: "Needs care soon",
				note:
					"What this means\n" +
					"“Moderate” means the infection looks medium-level from this rapid test — not mild enough to ignore, and not automatically the most extreme form. Only a health worker who examines you can grade severity for sure.\n\n" +
					"In simple words: you are sick enough that you need treatment now, but many people with this level recover well in about 3–7 days once they take the right malaria medicine.\n\n" +
					"What helps recovery\n" +
					"• Finish every ACT tablet on the schedule given to you\n" +
					"• Drink water, ORS, or coconut water often\n" +
					"• Eat light food (Koko, rice, soft fruit) when you can\n" +
					"• Rest and use a treated mosquito net so you are not bitten again\n\n" +
					"Urgent warning signs\n" +
					"Confusion, very stiff neck, endless vomiting, yellow eyes, chest struggle, or fainting — go to hospital immediately.",
			},
		],
		recommendations: [
			{ icon: "🏥", title: "Get malaria tablets today (ACT)", body: "Go to your nearest CHPS compound, clinic, or hospital TODAY. Ask for ACT — the recommended malaria tablet combination used in Ghana. Do not rely on herbs alone." },
			{ icon: "💧", title: "Drink lots of fluids (ORS + water)", body: "Fever makes you lose water. Sip water, ORS sachets from any pharmacy, coconut water, and light Koko. Small sips often are better than big gulps if you feel nauseous." },
			{ icon: "🌿", title: "Eat simple recovery foods", body: "While on tablets, try light meals: Moringa in soup, oranges or lime (Vitamin C), soft rice, or Tom Brown. Food supports strength; tablets do the curing." },
			{ icon: "🛏️", title: "Rest under a mosquito net", body: "Sleep and rest help your body fight. Use a treated mosquito net every night so mosquitoes cannot bite you again — and so your family stays safer too." },
			{ icon: "🦟", title: "Stop the next malaria attack", body: "After you recover: nets every night, clear standing water around home, close windows at dusk, and use repellent when outdoors." },
		],
	},
	cbc_anemia: {
		healthScore: 35,
		bodySystem: "Hematology",
		summary:
			"Your Complete Blood Count shows severe iron deficiency anemia. Your hemoglobin is critically low at 7.2 g/dL (normal is 12-16 g/dL). This means your blood cannot carry enough oxygen to your body, causing tiredness, weakness, and dizziness. You need to see a doctor urgently — you may need iron supplements or even a blood transfusion.",
		findings: [
			{ id: "a1", name: "Hemoglobin (Hb)", marker: "Hemoglobin", value: "7.2 g/dL", status: "action", statusLabel: "Critically low — see doctor", note: "Your hemoglobin is dangerously low. Hemoglobin carries oxygen in your blood. At 7.2, your body is struggling to get enough oxygen to your organs. Normal range is 12-16 g/dL. Please see a doctor as soon as possible." },
			{ id: "a2", name: "Iron Stores (Ferritin)", marker: "Ferritin", value: "5 µg/L", status: "action", statusLabel: "Critically low", note: "Ferritin measures how much iron your body has stored. Yours is almost empty at 5 (normal is 20-200). This is the main cause of your anemia. Your body needs iron to make healthy red blood cells." },
			{ id: "a3", name: "Red Blood Cells (RBC)", marker: "Red Blood Cell Count", value: "2.8 x10¹²/L", status: "low", statusLabel: "Below normal", note: "You have fewer red blood cells than normal (should be 4.0-5.5). This is because your body doesn't have enough iron to make them properly." },
			{ id: "a4", name: "MCV (Red Cell Size)", marker: "MCV", value: "68 fL", status: "low", statusLabel: "Cells too small", note: "Your red blood cells are smaller than they should be (68 vs normal 80-100). This is a classic sign of iron deficiency — small cells can't carry as much oxygen." },
			{ id: "a5", name: "White Blood Cells", marker: "WBC", value: "6.2 x10⁹/L", status: "normal", statusLabel: "Normal ✓", note: "Your white blood cells (infection fighters) are in the normal range. This is good — it means your immune system is not currently fighting an infection." },
			{ id: "a6", name: "Platelets", marker: "Platelet Count", value: "245 x10⁹/L", status: "normal", statusLabel: "Normal ✓", note: "Your platelets (clotting cells) are normal. Your blood should clot properly if you get a cut." },
		],
		recommendations: [
			{ icon: "🏥", title: "See a doctor urgently", body: "Your hemoglobin is critically low. Visit your nearest hospital or clinic as soon as possible. You may need iron infusions, iron tablets, or in severe cases, a blood transfusion. Do not delay — this level of anemia can affect your heart." },
			{ icon: "🥬", title: "Eat iron-rich Ghanaian foods daily", body: "Add these to every meal: Kontomire (cocoyam leaves) in stew, Moringa powder in soups, dark green vegetables, beans (red kidney beans, black-eyed peas), and lean meat. Always eat with orange, lemon, or lime — Vitamin C helps your body absorb iron." },
			{ icon: "🍊", title: "Pair iron foods with Vitamin C", body: "Squeeze fresh lime or lemon over your Kontomire stew. Drink orange juice with meals. Eat pawpaw (papaya) and pineapple — these all help your body absorb much more iron from food." },
			{ icon: "🚫", title: "Avoid tea and coffee with meals", body: "Tea, coffee, and cocoa drinks block iron absorption. Wait at least 1 hour after eating before drinking these. This is important — they can reduce iron absorption by up to 60%." },
			{ icon: "💊", title: "Take prescribed iron supplements", body: "Your doctor will likely prescribe ferrous sulfate tablets. Take them on an empty stomach with orange juice for best absorption. Side effects like dark stools and mild nausea are normal." },
		],
	},
	typhoid: {
		healthScore: 38,
		bodySystem: "Gastroenterolgy",
		summary:
			"Your Widal test and blood culture confirm active Typhoid fever caused by Salmonella typhi bacteria. This is a serious bacterial infection that needs antibiotic treatment immediately. Typhoid spreads through contaminated food and water — you must also take steps to prevent spreading it to your family.",
		findings: [
			{ id: "t1", name: "Salmonella typhi O", marker: "Widal O Antigen", value: "1:320", status: "action", statusLabel: "Significantly positive", note: "A titre of 1:320 is significantly above the diagnostic threshold. This confirms your body is actively fighting a Salmonella typhi infection. The O antigen indicates a current, active infection." },
			{ id: "t2", name: "Salmonella typhi H", marker: "Widal H Antigen", value: "1:160", status: "elevated", statusLabel: "Positive", note: "The H antigen is also elevated, further confirming typhoid infection. This measures your body's immune response to the bacteria's flagella." },
			{ id: "t3", name: "Blood Culture", marker: "Culture & Sensitivity", value: "S. typhi isolated", status: "action", statusLabel: "Bacteria confirmed", note: "Salmonella typhi bacteria were found growing in your blood sample. This is the gold standard confirmation of typhoid fever." },
			{ id: "t4", name: "White Blood Cells", marker: "WBC", value: "3.8 x10⁹/L", status: "low", statusLabel: "Slightly low", note: "Your white blood cells are slightly below normal. This is actually typical in typhoid — the bacteria suppress your immune cell count. It's called leukopenia." },
			{ id: "t5", name: "ESR (Inflammation)", marker: "ESR", value: "45 mm/hr", status: "elevated", statusLabel: "High — inflammation present", note: "Your ESR is elevated, showing significant inflammation in your body. This is expected with an active bacterial infection like typhoid." },
		],
		recommendations: [
			{ icon: "💊", title: "Start antibiotics immediately", body: "See a doctor TODAY for antibiotic treatment. Common antibiotics for typhoid in Ghana include Ciprofloxacin, Azithromycin, or Ceftriaxone. Complete the FULL course even if you feel better — stopping early can create drug-resistant bacteria." },
			{ icon: "💧", title: "Drink only boiled or treated water", body: "Typhoid spreads through contaminated water. Boil ALL drinking water for at least 1 minute, or use water purification tablets. Avoid ice, raw salads washed in tap water, and street food until fully recovered." },
			{ icon: "🍚", title: "Eat light, easy-to-digest meals", body: "Stick to light Koko (porridge), plain rice, boiled yam, or mashed plantain. Avoid spicy food, fried food, and raw vegetables. Small frequent meals are better than large ones while your gut heals." },
			{ icon: "🧼", title: "Wash hands and isolate if possible", body: "Typhoid is highly contagious. Wash hands thoroughly with soap after using the toilet and before eating. If possible, use a separate bathroom. Do not prepare food for others until your doctor confirms you're no longer infectious." },
			{ icon: "🛏️", title: "Rest and monitor your temperature", body: "Rest as much as possible. Monitor your fever — if it exceeds 40°C or you develop severe abdominal pain, confusion, or bloody stool, go to the hospital emergency immediately." },
		],
	},
	urinalysis: {
		healthScore: 48,
		bodySystem: "Nephrology",
		summary:
			"Your urinalysis shows a urinary tract infection (UTI) combined with significant dehydration. The presence of bacteria, white blood cells, and nitrites in your urine confirms an active bacterial infection in your urinary system. The dark color and high concentration of your urine show you are not drinking enough water.",
		findings: [
			{ id: "u1", name: "Urine Color", marker: "Color", value: "Dark amber", status: "elevated", statusLabel: "Too concentrated", note: "Your urine is much darker than it should be. Healthy urine should be pale yellow like lemonade. Dark amber means you are significantly dehydrated — your body desperately needs more fluids." },
			{ id: "u2", name: "Bacteria", marker: "Bacterial Count", value: "Many seen", status: "action", statusLabel: "Infection present", note: "Many bacteria were found in your urine sample. Combined with the positive nitrite test, this confirms you have a urinary tract infection (UTI). You need antibiotics to clear this infection." },
			{ id: "u3", name: "White Blood Cells", marker: "Leukocytes", value: "3+", status: "action", statusLabel: "High — fighting infection", note: "High levels of white blood cells in your urine mean your body is actively fighting an infection in your urinary tract. This is a strong sign of UTI." },
			{ id: "u4", name: "Protein in Urine", marker: "Protein", value: "2+", status: "elevated", statusLabel: "Abnormal — needs monitoring", note: "Protein should not normally appear in urine. The presence of 2+ protein can be caused by the current infection, but it should be rechecked after treatment. Persistent protein could indicate kidney issues." },
			{ id: "u5", name: "Specific Gravity", marker: "Concentration", value: "1.035", status: "elevated", statusLabel: "Highly concentrated", note: "Your urine is more concentrated than normal (above 1.030), confirming significant dehydration. Your kidneys are working hard to conserve water." },
			{ id: "u6", name: "Glucose", marker: "Glucose", value: "Negative", status: "normal", statusLabel: "Normal ✓", note: "No sugar was found in your urine. This is good — it means diabetes is unlikely to be contributing to your symptoms." },
		],
		recommendations: [
			{ icon: "💊", title: "Get antibiotics for your UTI", body: "Visit your nearest clinic or CHPS compound for antibiotic treatment. Common UTI antibiotics include Nitrofurantoin or Ciprofloxacin. Take the full course — stopping early can cause the infection to come back stronger." },
			{ icon: "💧", title: "Drink 2-3 liters of water daily", body: "You are significantly dehydrated. Drink at least 8-10 glasses of water today. Add ORS (Oral Rehydration Salts) if available. Coconut water and watermelon are also excellent. Your urine should become pale yellow within 24-48 hours." },
			{ icon: "🍈", title: "Eat hydrating Ghanaian foods", body: "Watermelon, cucumber, oranges, pawpaw (papaya), and coconut water are all excellent for rehydration. Light Koko (porridge) with plenty of water is also very hydrating. Avoid very salty or spicy foods which can irritate your bladder." },
			{ icon: "🚽", title: "Don't hold your urine", body: "Urinate whenever you feel the urge — holding it allows bacteria to multiply. Urinate after sexual activity. Wipe from front to back. Wear loose, cotton underwear to keep the area dry." },
			{ icon: "🔄", title: "Retest after treatment", body: "After completing your antibiotics, do another urinalysis to confirm the infection has cleared and check if the protein has resolved. If protein is still present, your doctor may want to check your kidney function." },
		],
	},
	hep_b: {
		healthScore: 70,
		bodySystem: "Liver",
		summary: "Your test shows you have Hepatitis B (HBsAg is Reactive). However, the other markers suggest it is a chronic infection with low viral activity at the moment. You need to see a doctor to monitor your liver.",
		findings: [
			{ id: "h1", name: "Hepatitis B Surface Antigen", marker: "HBsAg", value: "Reactive", status: "action", statusLabel: "Positive", note: "This means the Hepatitis B virus is present in your blood." }
		],
		recommendations: [
			{ icon: "🩺", title: "See a doctor for liver tests", body: "You need a Liver Function Test (LFT) and an ultrasound to check your liver's health." },
			{ icon: "🥗", title: "Eat liver-friendly foods", body: "Avoid alcohol completely. Eat plenty of fruits, vegetables, and complex carbohydrates." }
		]
	},
	fbs_diabetes: {
		healthScore: 60,
		bodySystem: "Endocrine",
		summary: "Your fasting blood sugar and HbA1c are significantly high, which indicates Diabetes. You should visit a doctor to start a management plan.",
		findings: [
			{ id: "d1", name: "Fasting Blood Sugar", marker: "FBS", value: "8.5 mmol/L", status: "action", statusLabel: "High", note: "Your fasting blood sugar is above the normal range, indicating poor glucose control." }
		],
		recommendations: [
			{ icon: "🩺", title: "Consult a doctor", body: "You need to see a doctor to discuss medication and a diabetes management plan." },
			{ icon: "🍲", title: "Adjust your diet", body: "Reduce simple sugars and heavy carbohydrates. Switch to local whole grains and vegetables." }
		]
	},
	sickle_cell: {
		healthScore: 90,
		bodySystem: "Hematology",
		summary: "Your screening shows you have the Sickle Cell Trait (AS), but NOT Sickle Cell Disease. You will not experience the illness, but you can pass the trait to your children.",
		findings: [
			{ id: "s1", name: "Hemoglobin S", marker: "HbS", value: "40%", status: "elevated", statusLabel: "Trait Carrier", note: "You carry one sickle cell gene. This does not cause disease in you." }
		],
		recommendations: [
			{ icon: "👨‍👩‍👧‍👦", title: "Family Planning", body: "If your partner also has the sickle cell trait (AS), your child could have Sickle Cell Disease (SS). Ensure your partner gets tested before having children." }
		]
	},
	cholera: {
		healthScore: 30,
		bodySystem: "Digestive",
		summary: "Your stool analysis strongly suggests a Cholera infection. This is a medical emergency due to rapid dehydration.",
		findings: [
			{ id: "c1", name: "Appearance", marker: "Stool", value: "Rice-water", status: "action", statusLabel: "Critical", note: "This appearance is a classic sign of Cholera." }
		],
		recommendations: [
			{ icon: "🚑", title: "Go to the hospital immediately", body: "Cholera causes dangerous dehydration very quickly. Seek emergency medical care now." },
			{ icon: "💧", title: "Drink ORS constantly", body: "While on your way to the clinic, drink Oral Rehydration Solution (ORS) continuously." }
		]
	}
};

function simulateLabAnalysis(opts: {
	imageBase64?: string;
	imageBase64List?: string[];
	labText?: string;
	presetId?: string;
	language: GemmaLanguage;
}): GemmaAnalysisResult {
	// Custom upload without preset — OCR failed or server unavailable.
	// NEVER fall through to a preset case for a real user upload.
	if (!opts.presetId) {
		if (opts.labText && isUsableLabText(opts.labText)) {
			return {
				healthScore: 0,
				bodySystem: "total",
				summary:
					"We started reading your photo, but couldn't finish the analysis. " +
					"This usually means the photo was unclear, or the AI helper isn't connected yet.",
				findings: [],
				recommendations: [
					{
						icon: "📸",
						title: "Take a clearer photo",
						body: "Use good lighting, hold your phone steady, and make sure all the text on your lab report is visible. Then upload again.",
					},
					{
						icon: "📋",
						title: "Type your results instead",
						body: "On the upload page, paste or type the values from your report — for example: Hemoglobin 7.2 g/dL, WBC 6.2.",
					},
					{
						icon: "🩺",
						title: "Try a sample report",
						body: "Pick one of our example cases (like Malaria, Anemia, Hepatitis B, or Cholera) to see how the analysis works.",
					},
				],
			};
		}

		return {
			healthScore: 0,
			bodySystem: "total",
			summary:
				"We couldn't read enough from your photo. " +
				"Try a brighter, straighter photo — or type your lab values instead.",
			findings: [],
			recommendations: [
				{
					icon: "📸",
					title: "Upload a clearer photo",
					body: "Lay the report flat, avoid shadows, and zoom in so the numbers are easy to read.",
				},
				{
					icon: "📋",
					title: "Type your results instead",
					body: "Use the box on the upload page to paste or type values from your lab report.",
				},
				{
					icon: "🩺",
					title: "Try a sample report",
					body: "Choose an example case to preview what your results will look like.",
				},
			],
		};
	}

	const result = { ...(PRESET_RESULTS[opts.presetId] || PRESET_RESULTS.malaria_rdt) };

	if (opts.language !== "english") {
		result.translations = OFFLINE_TRANSLATIONS[opts.language] || {};
	}

	return result;
}

// ─── Offline Simulator: Chat ─────────────────────────────────────────────────

function simulateChat(opts: {
	message: string;
	language: GemmaLanguage;
}): GemmaChatResult {
	const smallTalk = getSmallTalkResponse(opts.message, opts.language);
	if (smallTalk) return smallTalk;

	const lower = opts.message.toLowerCase();

	// Appetite loss / poor eating
	if (
		/\bappetite\b/.test(lower) ||
		/\b(lost|losing|loss|no|lack|poor|low|reduced)\b.*\b(appetite|eating|eat)\b/.test(lower) ||
		/\b(can'?t|cannot|unable to)\s*eat\b/.test(lower) ||
		/\bnot\s*eating\b/.test(lower)
	) {
		const withFever = lower.includes("fever") || lower.includes("chill");
		const withStomach =
			lower.includes("stomach") ||
			lower.includes("nausea") ||
			lower.includes("vomit") ||
			lower.includes("diarr");
		return {
			message:
				"Loss of appetite can happen for many reasons. In Ghana, common causes include malaria, typhoid, stomach infections, stress, dehydration, or side effects from medication.\n\nTry these steps:\n• Eat small, light meals — plain Koko (porridge), boiled rice, or mashed plantain\n• Sip fluids often: water, ORS, or coconut water even if you don't feel hungry\n• Avoid heavy, oily, or very spicy food for now\n• Rest and monitor for fever, vomiting, or stomach pain\n\nPlease visit your nearest CHPS compound or clinic if:\n• Appetite loss lasts more than 3–5 days\n• You have fever, chills, or night sweats (get a malaria RDT)\n• You are losing weight quickly or cannot keep fluids down\n\n⚠️ Go to hospital urgently if you have severe abdominal pain, yellow eyes/skin (jaundice), confusion, or signs of dehydration.",
			bodySystem: withFever ? "Hematology" : withStomach ? "Gastroenterolgy" : "Gastroenterolgy",
			urgency: withFever ? "Yellow" : "Green",
			condition: withFever ? "Appetite loss with fever — rule out malaria/typhoid" : "Loss of appetite",
			system: withFever ? "Hematology / Blood" : "Gastrointestinal / Digestive",
		};
	}

	// Injury / wound / trauma
	if (
		/\b(injur|wound|fracture|bruise|sprain|accident|fell|fall|broken|lacerat|cut|burn|trauma)\b/.test(lower) ||
		/\b(hurt|injured|pain|swollen|bleed)\b.*\b(leg|arm|knee|ankle|hand|foot|finger|toe|back|head|neck|shoulder|wrist|hip|chest)\b/.test(
			lower,
		) ||
		/\b(leg|arm|knee|ankle|hand|foot|finger|toe|back|head|neck|shoulder|wrist|hip|chest)\b.*\b(hurt|injured|pain|swollen|bleed)\b/.test(
			lower,
		)
	) {
		const severe =
			/\b(severe|bad|heavy|lot of|won'?t stop|deform|numb|can'?t move|open wound)\b/.test(lower) ||
			/\b(head|neck|chest)\b/.test(lower);
		return {
			message:
				"For an injury, the first steps are to stop any bleeding, protect the area, and avoid putting weight on it if walking is painful.\n\nRight now:\n• Press a clean cloth on cuts for 5–10 minutes to slow bleeding\n• Elevate the injured limb if possible\n• Apply a cold compress (wrapped ice) for 15–20 minutes to reduce swelling\n• Take Paracetamol for pain — avoid Aspirin unless a doctor advises it\n• Do not massage or force movement if it causes sharp pain\n\nVisit your nearest clinic or CHPS compound if:\n• The pain is severe or getting worse\n• You cannot move the joint or bear weight\n• The wound is deep, dirty, or from a rusty object (you may need a tetanus shot)\n• Swelling or bruising is spreading quickly\n\n⚠️ Go to hospital urgently if: heavy bleeding that won't stop, bone looks bent or out of place, head injury with vomiting or confusion, chest injury, or numbness/tingling in the limb.",
			bodySystem: "total",
			urgency: severe ? "Red" : "Yellow",
			condition: severe ? "Possible serious injury" : "Injury / wound",
			system: "General / Trauma",
		};
	}

	// Headache / head pain
	if (
		lower.includes("headache") ||
		lower.includes("migraine") ||
		/\bhead\b.*(ach|pain|hurt)/i.test(lower) ||
		/(ach|pain|hurt).*\bhead\b/i.test(lower)
	) {
		const withFever = lower.includes("fever") || lower.includes("chill");
		return {
			message:
				"Head pain can have several causes. In Ghana, always consider malaria if headache comes with fever or chills — get a Rapid Diagnostic Test (RDT) at your nearest pharmacy or CHPS compound today.\n\nFor now:\n• Drink plenty of water — dehydration is a common cause\n• Rest in a cool, quiet place away from bright light\n• Take Paracetamol as directed on the packet (not Aspirin unless a doctor advises it)\n• Avoid long hours in direct sun without a hat\n\n⚠️ Go to hospital immediately if: sudden severe 'worst ever' headache, stiff neck, confusion, repeated vomiting, vision changes, weakness on one side, or headache with high fever that won't come down.",
			bodySystem: withFever ? "Hematology" : "total",
			urgency: withFever ? "Yellow" : "Green",
			condition: withFever ? "Headache with fever — rule out malaria" : "Headache",
			system: withFever ? "Hematology / Blood" : "General",
		};
	}

	// Malaria keywords
	if (lower.includes("malaria") || lower.includes("fever") && (lower.includes("chill") || lower.includes("headache") || lower.includes("shake"))) {
		return {
			message: "Based on your symptoms of fever and chills, malaria is a strong possibility — especially here in Ghana where it is very common. I strongly recommend you get a Rapid Diagnostic Test (RDT) at your nearest CHPS compound or pharmacy. If positive, you'll need ACT medication immediately.\n\nWhile waiting: drink plenty of fluids (ORS, coconut water, or light Koko), rest under a mosquito net, and take Paracetamol for fever (NOT Aspirin). Neem leaf tea can provide some comfort but is NOT a replacement for antimalarial medication.\n\n⚠️ If you experience confusion, severe vomiting, difficulty breathing, or convulsions — go to the hospital emergency immediately. These are signs of severe malaria.",
			bodySystem: "Hematology",
			urgency: "Red",
			condition: "Suspected Malaria",
			system: "Hematology / Blood",
		};
	}

	// Diarrhea / frequent bowel movements
	if (
		/\b(diarr|defecat|bowel|stool|feces|faeces|poop|toilet)\b/.test(lower) ||
		/\b(too much|frequent|often)\b.*\b(bowel|stool|toilet|defecat)/.test(lower)
	) {
		return {
			message:
				"Frequent or loose bowel movements (diarrhea) are often caused by infections, food poisoning, dehydration, or stomach bugs. In Ghana, typhoid, cholera risk during outbreaks, and food-borne illness are important to consider.\n\nTry these steps now:\n• Drink ORS (Oral Rehydration Salts) or coconut water — take small sips often\n• Eat light foods: plain Koko, boiled rice, or mashed plantain\n• Wash hands with soap after using the toilet\n• Avoid street food, raw vegetables, and unboiled water for now\n\nPlease visit your nearest CHPS compound or clinic if:\n• Diarrhea lasts more than 2–3 days\n• You have fever, blood in stool, or severe stomach pain\n• You cannot keep fluids down or feel very weak or dizzy\n\n⚠️ Go to hospital urgently if you see bloody stool, signs of severe dehydration (very dry mouth, little urine, confusion), or cannot stand.",
			bodySystem: "Gastroenterolgy",
			urgency: "Yellow",
			condition: "Frequent bowel movements / Diarrhea",
			system: "Gastrointestinal / Digestive",
		};
	}

	// Stomach / typhoid keywords
	if (lower.includes("stomach") || lower.includes("diarr") || lower.includes("vomit") || lower.includes("nausea") || lower.includes("typhoid")) {
		return {
			message: "Your symptoms suggest a gastrointestinal issue. In Ghana, typhoid fever and food-borne infections are common causes of stomach pain with fever and diarrhea.\n\nImmediate steps:\n• Drink ORS (Oral Rehydration Salts) to prevent dehydration\n• Eat light — try plain Koko (porridge), boiled rice, or mashed plantain\n• Avoid street food, raw vegetables, and unboiled water\n• Take Paracetamol for fever\n\nIf you have persistent fever above 38.5°C for more than 3 days, visit a clinic for a Widal test to check for typhoid. Ginger tea with honey can help with nausea — grate fresh ginger into hot water.\n\n⚠️ Go to hospital immediately if you see blood in your stool, cannot keep any fluids down, or have severe abdominal pain.",
			bodySystem: "Gastroenterolgy",
			urgency: "Yellow",
			condition: "Gastrointestinal Distress",
			system: "Gastrointestinal / Digestive",
		};
	}

	// Respiratory keywords
	if (lower.includes("cough") || lower.includes("breath") || lower.includes("chest") || lower.includes("wheez")) {
		return {
			message: "Your respiratory symptoms need attention. Difficulty breathing or persistent cough can have several causes including respiratory infections, asthma, or in some cases, more serious conditions.\n\nImmediate steps:\n• Rest in a well-ventilated area\n• Try steam inhalation: breathe over a bowl of hot water with a towel over your head\n• Ginger tea with honey and lemon can soothe your throat\n• Stay hydrated with warm fluids\n\nIf you have chest pain, cough up blood, or cannot breathe while lying down — go to the hospital emergency immediately.\n\nFor persistent cough lasting more than 2 weeks, please visit a clinic — they may want to test for tuberculosis (TB) which is important to catch early.",
			bodySystem: "Pulmonology",
			urgency: lower.includes("chest pain") ? "Red" : "Yellow",
			condition: "Respiratory Symptoms",
			system: "Respiratory / Pulmonary",
		};
	}

	// UTI / kidney keywords
	if (lower.includes("urin") || lower.includes("kidney") || lower.includes("bladder") || lower.includes("burn") && lower.includes("pee")) {
		return {
			message: "Your symptoms suggest a possible urinary tract infection (UTI). These are common, especially in women, and usually respond well to antibiotics.\n\nImmediate steps:\n• Drink LOTS of water — at least 8 glasses today\n• Coconut water is excellent for flushing your urinary system\n• Avoid sugary drinks and very spicy food\n• Don't hold your urine — go whenever you feel the urge\n\nVisit your nearest CHPS compound or clinic for a urinalysis test and antibiotic prescription. UTIs are easily treatable but can spread to your kidneys if ignored.\n\n⚠️ See a doctor urgently if you have blood in your urine, severe back/side pain, high fever, or vomiting.",
			bodySystem: "Nephrology",
			urgency: "Yellow",
			condition: "Suspected UTI",
			system: "Renal / Urological",
		};
	}

	// Fatigue / lack of rest / sleep
	if (
		/\b(rest|sleep|exhaust|fatigue|insomnia|drained|burned?\s*out)\b/.test(lower) ||
		/\b(not enough|don't have enough|dont have enough|need more|lack of|haven't had enough)\b.*\b(rest|sleep)\b/.test(
			lower,
		)
	) {
		return {
			message:
				"Feeling like you haven't had enough rest is very common — and it can affect your energy, mood, and immune system.\n\nTry these steps:\n• Aim for 7–8 hours of sleep tonight — put your phone away 30 minutes before bed\n• Take short breaks during the day; even 15 minutes of rest helps\n• Stay hydrated and eat regular light meals — skipping food worsens fatigue\n• Avoid heavy caffeine late in the day\n\nSee a doctor if fatigue lasts more than 2 weeks, or if you also have fever, chest pain, shortness of breath, or sudden severe weakness — these could signal anemia, malaria, or other conditions needing tests.\n\n⚠️ Go to hospital if you feel faint, confused, or cannot stay awake.",
			bodySystem: "total",
			urgency: "Green",
			condition: "Fatigue / Insufficient rest",
			system: "General",
		};
	}

	// Weakness / anemia keywords
	if (lower.includes("weak") || lower.includes("tired") || lower.includes("dizzy") || lower.includes("pale") || lower.includes("anemia") || lower.includes("anaemia")) {
		return {
			message: "Persistent weakness, tiredness, and dizziness can be signs of anemia — a condition where you don't have enough healthy red blood cells. In Ghana, iron deficiency and sickle cell disease are common causes.\n\nImmediate steps:\n• Eat iron-rich foods: Kontomire (cocoyam leaves), Moringa powder in soup, beans, dark green vegetables\n• Always pair iron foods with Vitamin C (lime, lemon, orange) — this dramatically improves absorption\n• Avoid tea and coffee with meals — they block iron absorption\n\nPlease visit a clinic for a Complete Blood Count (CBC) test to check your hemoglobin and iron levels. If your hemoglobin is very low, you may need iron supplements or further investigation.\n\nIf you know you have sickle cell disease and are having a crisis (severe pain, difficulty breathing), go to the hospital immediately.",
			bodySystem: "Hematology",
			urgency: "Yellow",
			condition: "Suspected Anemia",
			system: "Hematology / Blood",
		};
	}

	// Diabetes keywords
	if (lower.includes("thirst") || lower.includes("sugar") || lower.includes("diabet") || lower.includes("frequent urin")) {
		return {
			message: "Excessive thirst, frequent urination, and fatigue are classic signs of diabetes. In Ghana, Type 2 diabetes is increasing rapidly, especially in urban areas.\n\nImmediate steps:\n• Reduce sugar intake — cut sugary drinks, reduce sugar in tea/coffee\n• Choose green plantain over ripe plantain (lower sugar)\n• Eat more vegetables, beans, and whole grains\n• Stay active — walk for at least 30 minutes daily\n\nPlease visit a clinic for a fasting blood glucose test. Early detection of diabetes is crucial for preventing serious complications.\n\nBitter leaf tea is a traditional remedy that may help manage blood sugar, but it should NEVER replace prescribed diabetes medication.",
			bodySystem: "Endocrinology",
			urgency: "Yellow",
			condition: "Suspected Diabetes",
			system: "Endocrine",
		};
	}

	// Default — only when message seems health-related but didn't match a pattern
	if (hasMedicalIntent(lower) || isLikelyHealthMessage(lower)) {
		return {
			message: `Thank you for describing your symptoms. Based on what you've told me, I recommend visiting your nearest CHPS compound or health facility for a proper examination.\n\nIn the meantime:\n• Rest and stay hydrated — drink plenty of water\n• Monitor your temperature\n• Take Paracetamol if you have pain or fever\n• Avoid strenuous activity\n\nIf your symptoms worsen or you develop any emergency signs (difficulty breathing, severe pain, high fever above 39°C, confusion, or bleeding), please go to the nearest hospital immediately or call Ghana Ambulance Service at 112 or 193.\n\nRemember: I am an AI assistant, not a doctor. My advice is for guidance only and does not replace professional medical diagnosis.`,
			bodySystem: "total",
			urgency: "Green",
			condition: "General Health Inquiry",
			system: "General",
		};
	}

	// Last resort — ask for more detail instead of looping the same redirect
	return {
		message:
			"Thank you for reaching out. To give you useful guidance, please describe what you're experiencing — for example where it hurts, when it started, and any other symptoms (fever, nausea, swelling, etc.). You can also tap one of the quick suggestions below.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Awaiting symptoms",
		system: "General",
	};
}

// ─── Ghanaian Remedy Data (for AIAssistant portal) ───────────────────────────

export interface GhanaianRemedy {
	name: string;
	localName: string;
	emoji: string;
	benefits: string;
	usage: string;
	warning: string;
	conditions: string[];
}

export const GHANAIAN_REMEDIES: GhanaianRemedy[] = [
	{ name: "Moringa (Moringa oleifera)", localName: "Moringa / Yevu-ti (Ewe)", emoji: "🌿", benefits: "Extremely rich in iron, protein, Vitamin A, C, and calcium. Excellent for anemia and malnutrition.", usage: "Add dried moringa powder to soups, stews, or Koko. 1-2 teaspoons daily.", warning: "Avoid excessive amounts during pregnancy.", conditions: ["anemia", "malnutrition", "fatigue"] },
	{ name: "Sobolo (Hibiscus sabdariffa)", localName: "Sobolo / Bissap", emoji: "🌺", benefits: "Lowers blood pressure, rich in Vitamin C and antioxidants. Aids hydration.", usage: "Brew dried hibiscus petals in hot water. Drink 2-3 cups daily.", warning: "May interact with blood pressure medications.", conditions: ["hypertension", "dehydration"] },
	{ name: "Kontomire (Cocoyam Leaves)", localName: "Kontomire / Nkontomire", emoji: "🥬", benefits: "Very high in iron, folate, and Vitamin A. Best local food for iron deficiency anemia.", usage: "Cook in palaver sauce or kontomire stew with lime/lemon for iron absorption.", warning: "Cook thoroughly — raw leaves can irritate the throat.", conditions: ["anemia", "iron_deficiency", "pregnancy"] },
	{ name: "Dawadawa (Parkia biglobosa)", localName: "Dawadawa / Netetou", emoji: "🫘", benefits: "Natural probiotic, rich in protein and B vitamins. Supports gut health.", usage: "Add to soups and stews as flavoring.", warning: "Has a very strong smell. Start with small quantities.", conditions: ["digestive_issues", "gut_health"] },
	{ name: "Neem (Azadirachta indica)", localName: "Nim / Digo (Ewe)", emoji: "🌳", benefits: "Traditional antimalarial, antibacterial, and anti-inflammatory properties.", usage: "Boil young neem leaves for tea. Drink once daily during malaria recovery.", warning: "NOT a replacement for ACT medication. Not safe during pregnancy.", conditions: ["malaria", "fever", "infection"] },
	{ name: "Tiger Nut (Cyperus esculentus)", localName: "Atadwe", emoji: "🥜", benefits: "Rich in fiber, magnesium, potassium, and healthy fats. Great energy source.", usage: "Eat raw as snack, blend into milk, or add to smoothies.", warning: "High in fiber — introduce gradually. Not suitable for nut allergies.", conditions: ["fatigue", "energy", "digestive_health"] },
	{ name: "Ginger (Zingiber officinale)", localName: "Akakaduro (Twi) / Dzeta (Ewe)", emoji: "🫚", benefits: "Anti-nausea, anti-inflammatory, aids digestion, helps with cold/flu.", usage: "Grate fresh ginger into hot water with lemon and honey.", warning: "May interact with blood-thinning medications.", conditions: ["nausea", "cold", "flu", "inflammation"] },
];

export const EMERGENCY_CONTACTS = {
	ambulance: "112 or 193",
	fire: "192",
	police: "191 or 18555",
	poisonCenter: "0302 665401",
	chpsInfo:
		"Visit your nearest CHPS (Community-based Health Planning and Services) compound for non-emergency care",
	mentalHealth: "0800 678 678 (Mental Health Authority Helpline)",
} as const;
