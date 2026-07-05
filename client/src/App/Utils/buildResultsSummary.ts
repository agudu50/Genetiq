import type { GemmaAnalysisResult } from "@/App/Services/GemmaService";

export type SummaryTone = "info" | "caution" | "neutral";

export interface SummarySection {
	id: string;
	title: string;
	body: string;
	tone: SummaryTone;
}

function formatPatientContext(age?: string, gender?: string): string {
	const ageTrim = age?.trim();
	const g = gender?.trim().toLowerCase() ?? "";
	const hasGender =
		g &&
		g !== "unknown" &&
		!g.includes("prefer not");

	let genderWord = "";
	if (hasGender && gender) {
		if (g === "male") genderWord = "male";
		else if (g === "female") genderWord = "female";
		else genderWord = gender.trim();
	}

	if (ageTrim && genderWord) return `for a ${ageTrim}-year-old ${genderWord} patient`;
	if (ageTrim) return `for a ${ageTrim}-year-old patient`;
	if (genderWord) return `for a ${genderWord} patient`;
	return "";
}

function hasSpepFinding(result: GemmaAnalysisResult): boolean {
	return result.findings.some((f) =>
		/globulin|albumin|protein|m-spike|spep/i.test(`${f.name} ${f.marker}`),
	);
}

function hasLiverFinding(result: GemmaAnalysisResult): boolean {
	return result.findings.some((f) =>
		/alt|ast|bilirubin|alk/i.test(`${f.name} ${f.marker}`),
	);
}

export function buildResultsSummarySections(
	result: GemmaAnalysisResult,
	patientAge?: string,
	patientGender?: string,
): SummarySection[] {
	if (result.summarySections?.length) {
		return result.summarySections.map((s) => ({
			...s,
			tone: s.tone ?? "neutral",
		}));
	}

	const total = result.findings.length;
	const abnormal = result.findings.filter((f) => f.status !== "normal");
	const patientCtx = formatPatientContext(patientAge, patientGender);
	const spep = hasSpepFinding(result);
	const liver = hasLiverFinding(result);

	if (total > 0) {
		const sections: SummarySection[] = [
			{
				id: "analyzed",
				title: "What we analyzed",
				body: patientCtx
					? `We read ${total} lab value${total !== 1 ? "s" : ""} from your report ${patientCtx}.`
					: `We read ${total} lab value${total !== 1 ? "s" : ""} from your lab report.`,
				tone: "info",
			},
			{
				id: "disclaimer",
				title: "Please remember",
				body:
					"This is a computer-generated summary, not a diagnosis. Your doctor should review the original report and confirm every result before you take any action.",
				tone: "neutral",
			},
		];

		if (abnormal.length === 0) {
			sections.push({
				id: "results",
				title: "Your results at a glance",
				body: "All values we detected appear within normal limits based on the reference ranges on your report.",
				tone: "info",
			});
		} else {
			sections.push({
				id: "results",
				title:
					abnormal.length === 1
						? "1 result needs a closer look"
						: `${abnormal.length} results need a closer look`,
				body:
					abnormal.length === 1
						? "One value is outside the expected range. This does not always mean something is wrong — only your doctor can interpret it in context."
						: `${abnormal.length} values are outside the expected range. This does not always mean something is wrong — only your doctor can interpret them in context.`,
				tone: "caution",
			});
		}

		if (spep) {
			sections.push({
				id: "protein",
				title: "About your protein result",
				body:
					"An abnormal protein band or M-spike can have several causes. Your doctor may order follow-up tests such as immunofixation or refer you to a specialist to find out more.",
				tone: "caution",
			});
		}

		if (liver) {
			sections.push({
				id: "liver",
				title: "About your liver markers",
				body:
					"Some liver-related values look elevated. A clinician should review these alongside your symptoms, medications, and full medical history.",
				tone: "caution",
			});
		}

		return sections;
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
		title: i === 0 ? "Summary" : i === sentences.length - 1 ? "Please remember" : "What this means",
		body,
		tone: (i === 0 ? "info" : body.toLowerCase().includes("doctor") ? "neutral" : "caution") as SummaryTone,
	}));
}
