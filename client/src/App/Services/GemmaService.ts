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

const GEMMA_BASE_URL = "http://localhost:8000";

// ─── Service State ───────────────────────────────────────────────────────────

let _healthCache: {
	available: boolean;
	modelLoaded: boolean;
	modelId: string;
	device: string;
	supportsVision: boolean;
	checkedAt: number;
} | null = null;
const HEALTH_CHECK_INTERVAL = 30_000; // 30s

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

	try {
		const res = await fetch(`${GEMMA_BASE_URL}/api/gemma/health`, {
			signal: AbortSignal.timeout(15_000),
		});
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
		// Server not running or busy
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
		x.healthScore > 0 &&
		Array.isArray(x.findings) &&
		x.findings.length > 0 &&
		typeof x.summary === "string"
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

	// Text-only models: OCR uploaded photos before sending to the API
	if (!labText && images.length > 0 && !opts.presetId && !health.supportsVision) {
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

	if (health.available && health.modelLoaded) {
		try {
			opts.onProgress?.("ai", "Analysing your results…");
			const res = await fetch(`${GEMMA_BASE_URL}/api/gemma/analyze`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					image_base64: useVision ? images[0] : undefined,
					lab_text: labText || undefined,
					preset_id: opts.presetId,
					patient_age: opts.patientAge,
					patient_gender: opts.patientGender,
					language: opts.language,
				}),
				signal: AbortSignal.timeout(300_000),
			});
			if (res.ok) {
				const data = await res.json();
				if (isValidAnalysisResult(data)) {
					return data as GemmaAnalysisResult;
				}
				console.warn("Gemma returned incomplete analysis, using local parser");
			} else {
				const errBody = await res.json().catch(() => null);
				console.warn("Gemma analyze failed:", res.status, errBody);
			}
		} catch (e) {
			console.warn("Gemma server error, falling back:", e);
		}
	}

	// Local parser fallback — works even when AI server is offline
	if (labText && !opts.presetId) {
		const parsed = parseAndBuildFallback(labText, opts.patientAge, opts.patientGender);
		if (parsed) return parsed;
	}

	return simulateLabAnalysis({ ...opts, labText });
}

// ─── Chat with Gemma ─────────────────────────────────────────────────────────

const MEDICAL_KEYWORDS_RE =
	/fever|pain|painful|aching|aches?|hurts?|hurt|head|headache|migraine|cough|symptom|vomit|diarr|chill|nausea|dizz|weak|tired|breath|chest|stomach|malaria|typhoid|urin|bleed|swell|rash|sick|ill|unwell|sore|cramp|infection|anemia|diabet|pressure|body\s*pain|throat|ear|eye|appetite|weight\s*loss|can'?t\s*eat|not\s*eating|constipat|bloat|fatigue|insomnia|sleep|palpit|swollen|jaundice|dehydrat/i;

/** Detect symptom descriptions even when phrasing is informal ("my head is aching"). */
function hasMedicalIntent(text: string): boolean {
	const lower = text.toLowerCase();
	if (MEDICAL_KEYWORDS_RE.test(lower)) return true;
	if (
		/\b(head|stomach|chest|back|throat|ear|eyes?|neck|joint|muscle)\b/.test(lower) &&
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
		/\b(i have|i've|i am|im experiencing|suffering from|what might|what could|why do i|feel(ing)?)\b/.test(
			lower,
		) &&
		/\b(pain|fever|ache|symptom|problem|issue|wrong|sick|unwell|tired|weak|dizzy|nausea|vomit|cough|head|stomach|appetite|weight|sleep|breath|swell|rash|infection|eating|eat)\b/.test(
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
	if (hasMedicalIntent(text)) return null;

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
		/\b(i'?m|i am)\s+(good|fine|well|ok|okay|great)\b/i.test(lower) ||
		/\bdoing\s+well\b/i.test(lower) ||
		/(yourself|and\s*you|what\s*about\s*you)/i.test(lower) ||
		/^good\s*(thanks|thank\s*you)?[\s!?.]*$/i.test(lower)
	) {
		return toResult(copy.wellbeingReply);
	}

	if (text.length < 120) {
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
	const onGpu = /cuda/i.test(health.device);

	// Without a GPU, Gemma takes minutes. Use instant triage for any symptom message.
	if (!opts.imageBase64 && hasMedicalIntent(opts.message) && !onGpu) {
		return finalizeChatResult(simulateChat(opts));
	}

	if (health.available && health.modelLoaded) {
		try {
			const res = await fetch(`${GEMMA_BASE_URL}/api/gemma/chat`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: opts.message,
					language: opts.language,
					image_base64: opts.imageBase64,
				}),
				signal: AbortSignal.timeout(300_000), // 5min on CPU
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
		"Your results are ready": "Wo ntoboa no awie",
		"Normal": "Ɛyɛ papa",
		"A little high": "Ɛkɔ soro kakra",
		"Lower than ideal": "Ɛyɛ ketewa sene deɛ ɛsɛ",
		"Low — see a doctor": "Ɛyɛ ketewa — kɔ dɔkota nkyɛn",
		"Health Score": "Ahoɔden Bɔ",
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
		"Your results are ready": "Wo results lɛ esɛɛ",
		"Normal": "Enyɛ bɔɔlɛ",
		"A little high": "Eji ko pipi",
		"Lower than ideal": "Ekɛ tsɔɔ",
		"Low — see a doctor": "Ekɛ tsɔɔ — yaa dɔkita he",
		"Health Score": "Hewale Score",
		"What we found": "Nii míhùù",
		"What to do next": "Nii mɛɛhe eyɛ",
		"Please see a doctor immediately": "Mitsɛɔ bo, yaa dɔkita he ntɛɛ",
		"Drink plenty of water": "Nu nù puputu",
		"Malaria detected": "Malaria bɛ ba",
		"Needs attention": "Hia yelikɛlɔ",
		"Room to improve": "Ebaanyɛ ehi",
		"Good": "Ehi",
		"Excellent": "Ehi kpakpa",
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
		"Your results are ready": "Wò ŋkuɖoɖo siwo sɔ",
		"Normal": "Edzɔ le eŋu",
		"A little high": "Ede ɖe dzi viɖe",
		"Lower than ideal": "Ege ɖe anyi wu alesi enyo",
		"Low — see a doctor": "Ege ɖe anyi — yi dɔkta gbɔ",
		"Health Score": "Lãmesẽ Xexlẽme",
		"What we found": "Nusi míkpɔ",
		"What to do next": "Nusi nàwɔ eyome",
		"Please see a doctor immediately": "Meɖe kuku, yi dɔkta gbɔ kaba",
		"Drink plenty of water": "No tsi gbɔ̃ vitɔ",
		"Malaria detected": "Asrã va",
		"Needs attention": "Hiã lãmesẽ",
		"Room to improve": "Ate ŋu anyo wu",
		"Good": "Edzɔ",
		"Excellent": "Enyo ŋutɔ",
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
		"Your results are ready": "Wo results no awie",
		"Normal": "Ɛyɛ papa",
		"A little high": "Ɛkɔ soro kakra",
		"Lower than ideal": "Ɛyɛ ketewa sen deɛ ɛsɛ",
		"Low — see a doctor": "Ɛyɛ ketewa — kɔ dɔkota nkyɛn",
		"Health Score": "Ahoɔden Bɔ",
		"What we found": "Deɛ yɛhuu",
		"What to do next": "Deɛ ɛsɛ sɛ woyɛ",
		"Please see a doctor immediately": "Mesrɛ wo, kɔ dɔkota nkyɛn ntɛm",
		"Malaria detected": "Malaria aba",
		"Needs attention": "Hian nhwehwɛmu",
		"Room to improve": "Obotum ayɛ yie",
		"Good": "Ɔyɛ papa",
		"Excellent": "Ɔyɛ kyɛn so",
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

export function getTranslation(text: string, language: GemmaLanguage): string {
	if (language === "english") return text;
	return OFFLINE_TRANSLATIONS[language]?.[text] || text;
}

// ─── Offline Simulator: Lab Analysis ─────────────────────────────────────────

const PRESET_RESULTS: Record<string, GemmaAnalysisResult> = {
	malaria_rdt: {
		healthScore: 42,
		bodySystem: "Hematology",
		summary:
			"Your Malaria Rapid Diagnostic Test came back POSITIVE for Plasmodium falciparum — the most common and serious type of malaria in Ghana. This requires immediate medical treatment with ACT (Artemisinin-based Combination Therapy). Do not delay — visit your nearest health facility today.",
		findings: [
			{ id: "m1", name: "Malaria Parasite (P. falciparum)", marker: "P. falciparum Antigen", value: "Positive", status: "action", statusLabel: "Positive — seek treatment now", note: "The test detected Plasmodium falciparum, the most dangerous malaria parasite. This means the parasite is actively in your blood. You need antimalarial medication (ACT) as soon as possible — do not wait." },
			{ id: "m2", name: "P. vivax", marker: "P. vivax Antigen", value: "Negative", status: "normal", statusLabel: "Not detected ✓", note: "The other common malaria type was not found. Your infection is specifically P. falciparum." },
			{ id: "m3", name: "Test Validity", marker: "Control Line", value: "Valid", status: "normal", statusLabel: "Test valid ✓", note: "The control line appeared correctly, confirming this test result is reliable." },
			{ id: "m4", name: "Estimated Severity", marker: "Clinical Assessment", value: "Moderate", status: "elevated", statusLabel: "Moderate infection", note: "Based on symptoms and positive RDT, this appears to be a moderate malaria infection. With prompt treatment, most people recover fully within 3-7 days." },
		],
		recommendations: [
			{ icon: "🏥", title: "Get ACT medication immediately", body: "Go to your nearest CHPS compound, clinic, or hospital TODAY. You need Artemisinin-based Combination Therapy (ACT) — this is the standard malaria treatment in Ghana. Do not rely on herbal remedies alone." },
			{ icon: "💧", title: "Stay hydrated — drink ORS and fluids", body: "Malaria causes dehydration through fever and sweating. Drink plenty of water, ORS (Oral Rehydration Salts available at any pharmacy), coconut water, and light Koko (porridge). Avoid very cold drinks." },
			{ icon: "🌿", title: "Support recovery with local foods", body: "While taking your medication, boost your body with Moringa powder in soup (rich in iron), citrus fruits like oranges and limes (Vitamin C helps fight infection), and light meals like rice water or Tom Brown." },
			{ icon: "🛏️", title: "Rest under a treated mosquito net", body: "Rest is essential for recovery. Sleep under an insecticide-treated net (ITN) to prevent re-infection and protect your family. Keep windows closed at dusk when mosquitoes are most active." },
			{ icon: "🦟", title: "Prevent future malaria", body: "After recovery: use mosquito nets every night, apply mosquito repellent, clear standing water around your home, and consider indoor residual spraying (IRS) if available in your area." },
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
};

function simulateLabAnalysis(opts: {
	imageBase64?: string;
	labText?: string;
	presetId?: string;
	language: GemmaLanguage;
}): GemmaAnalysisResult {
	// Custom upload without preset — OCR failed or server unavailable
	if ((opts.imageBase64 || opts.labText) && !opts.presetId) {
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
						body: "Pick one of our example cases (Malaria, Anemia, Typhoid, or Urinalysis) to see how the analysis works.",
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

	const presetId = opts.presetId || "malaria_rdt";
	const result = { ...PRESET_RESULTS[presetId] || PRESET_RESULTS.malaria_rdt };

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
	if (hasMedicalIntent(lower)) {
		return {
			message: `Thank you for describing your symptoms. Based on what you've told me, I recommend visiting your nearest CHPS compound or health facility for a proper examination.\n\nIn the meantime:\n• Rest and stay hydrated — drink plenty of water\n• Monitor your temperature\n• Take Paracetamol if you have pain or fever\n• Avoid strenuous activity\n\nIf your symptoms worsen or you develop any emergency signs (difficulty breathing, severe pain, high fever above 39°C, confusion, or bleeding), please go to the nearest hospital immediately or call Ghana Ambulance Service at 112 or 193.\n\nRemember: I am an AI assistant, not a doctor. My advice is for guidance only and does not replace professional medical diagnosis.`,
			bodySystem: "total",
			urgency: "Green",
			condition: "General Health Inquiry",
			system: "General",
		};
	}

	return (
		getSmallTalkResponse(opts.message, opts.language) ?? {
			message: SMALL_TALK_RESPONSES[opts.language]?.redirect ?? SMALL_TALK_RESPONSES.english.redirect,
			bodySystem: "total",
			urgency: "Green",
			condition: "Awaiting symptoms",
			system: "General",
		}
	);
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
	chpsInfo: "Visit your nearest CHPS (Community-based Health Planning and Services) compound for non-emergency care",
	mentalHealth: "0800 678 678 (Mental Health Authority Helpline)",
};
