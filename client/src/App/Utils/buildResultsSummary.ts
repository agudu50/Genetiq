import type { GemmaAnalysisResult } from "@/App/Services/GemmaService";
import {
	buildFindingNote,
	buildSummarySectionsCopy,
	isPlausibleLabValue,
	parseNumericValue,
} from "./labResultCopy";
import type { ParsedLabRow } from "./parseLabOcrText";

export type SummaryTone = "info" | "caution" | "neutral";

export interface SummarySection {
	id: string;
	title: string;
	body: string;
	tone: SummaryTone;
}

function formatPatientContext(_age?: string, _gender?: string): string {
	// Privacy requirement: do not state age, gender, or patient identity categories in generated text summaries
	return "";
}

function hasSpepFinding(result: GemmaAnalysisResult): boolean {
	return result.findings.some((f) =>
		f.status !== "normal" && /globulin|albumin|protein|m-spike|spep/i.test(`${f.name} ${f.marker}`),
	);
}

function hasLiverFinding(result: GemmaAnalysisResult): boolean {
	return result.findings.some((f) =>
		f.status !== "normal" && /alt|ast|bilirubin|alk/i.test(`${f.name} ${f.marker}`),
	);
}

function findingToRow(f: GemmaAnalysisResult["findings"][0]): ParsedLabRow {
	return {
		name: f.name,
		marker: f.marker,
		value: f.value,
		unit: "",
		status: f.status,
		statusLabel: f.statusLabel,
	};
}

/** Rebuild plain-language notes when the existing note is missing or too generic. */
export function enrichFindingsWithPlainNotes(result: GemmaAnalysisResult): GemmaAnalysisResult {
	return {
		...result,
		findings: result.findings.map((f) => {
			const existing = (f.note || "").trim();
			const looksGeneric =
				!existing ||
				/higher than the usual range|lower than the usual range|looks within the usual range/i.test(existing);

			if (!looksGeneric) return f;

			return {
				...f,
				note: buildFindingNote(findingToRow(f)),
			};
		}),
	};
}

export function buildResultsSummarySections(
	result: GemmaAnalysisResult,
	patientAge?: string,
	patientGender?: string,
): SummarySection[] {
	const total = result.findings.length;
	const abnormal = result.findings.filter((f) => f.status !== "normal");
	const patientCtx = formatPatientContext(patientAge, patientGender);
	const spep = hasSpepFinding(result);
	const liver = hasLiverFinding(result);
	const parsedAge = parseInt(patientAge || "", 10);
	const isPediatric = !isNaN(parsedAge) && parsedAge < 18;

	const hasUnreliableOcr = result.findings.some((f) => {
		const num = parseNumericValue(f.value);
		return num !== null && !isPlausibleLabValue(f.name, num);
	});

	if (total > 0) {
		return buildSummarySectionsCopy({
			total,
			abnormalCount: abnormal.length,
			patientCtx,
			hasSpep: spep,
			hasLiver: liver,
			hasUnreliableOcr,
			abnormalFindings: abnormal.map((f) => ({ name: f.name, value: f.value, status: f.status })),
			isPediatric,
		});
	}

	// No structured findings — break legacy paragraph summary into readable chunks
	const sentences = result.summary
		.split(/(?<=[.!?])\s+/)
		.map((s) => s.trim())
		.filter(Boolean);

	if (sentences.length <= 1) {
		return [
			{
				id: "summary",
				title: "Summary",
				body: result.summary,
				tone: "neutral",
			},
		];
	}

	return sentences.map((body, i) => ({
		id: `part-${i}`,
		title: i === 0 ? "Summary" : i === sentences.length - 1 ? "Important" : "What this means",
		body,
		tone: (i === 0 ? "info" : body.toLowerCase().includes("doctor") ? "neutral" : "caution") as SummaryTone,
	}));
}
