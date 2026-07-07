import type { ParsedLabRow } from "./parseLabOcrText";

/** Typical adult reference bands — used to catch OCR misreads (e.g. 913 g/dL protein). */
const PLAUSIBLE_NUMERIC: Record<string, { min: number; max: number }> = {
	"Total Protein": { min: 4, max: 12 },
	Albumin: { min: 2, max: 6 },
	"Alpha-1 Globulin": { min: 0.1, max: 0.6 },
	"Alpha-2 Globulin": { min: 0.3, max: 1.2 },
	"Beta-1 Globulin": { min: 0.2, max: 0.9 },
	"Beta-2 Globulin": { min: 0.1, max: 0.8 },
	"Gamma Globulin": { min: 0.5, max: 2.5 },
	Creatinine: { min: 0.3, max: 15 },
	"Bilirubin (Direct)": { min: 0, max: 2 },
	"AST (GOT)": { min: 5, max: 500 },
	"ALT (GPT)": { min: 5, max: 500 },
	"Alkaline Phosphatase": { min: 20, max: 400 },
};

export function parseNumericValue(value: string): number | null {
	const m = value.match(/([\d.]+)/);
	if (!m) return null;
	const n = parseFloat(m[1]);
	return Number.isNaN(n) ? null : n;
}

export function isPlausibleLabValue(name: string, num: number): boolean {
	const band = PLAUSIBLE_NUMERIC[name];
	if (!band) return num > 0 && num < 50_000;
	return num >= band.min && num <= band.max;
}

export function friendlyStatusLabel(status: ParsedLabRow["status"]): string {
	switch (status) {
		case "action":
			return "Worth a doctor visit";
		case "elevated":
			return "Higher than usual";
		case "low":
			return "Lower than usual";
		default:
			return "Looks typical";
	}
}

export function buildFindingNote(row: ParsedLabRow): string {
	const num = parseNumericValue(row.value);
	const unreliable =
		num !== null && !isPlausibleLabValue(row.name, num) && row.unit !== "";

	if (unreliable) {
		return `We had trouble reading this number clearly from the photo — "${row.value}" may be incorrect. Please look at your paper report or ask the lab to confirm your ${row.name.toLowerCase()} result.`;
	}

	if (row.status === "normal") {
		return `${plainName(row.name)} looks within the usual range for adults${row.refRange ? ` (${row.refRange})` : ""}. No action needed based on this result alone.`;
	}

	if (/m-spike/i.test(row.name)) {
		return (
			"Your report flags an M-spike — an unusual protein band on a blood protein test (SPEP). " +
			"That means the lab saw a protein pattern worth a closer look. It does not mean you are definitely seriously ill — " +
			"infections and other conditions can sometimes look similar. " +
			"See your doctor soon; they may order a follow-up test called immunofixation to learn more."
		);
	}

	if (/total protein/i.test(row.name)) {
		const high = row.status === "elevated" || row.status === "action";
		return high
			? "Total protein measures the combined amount of albumin and globulin in your blood — it reflects hydration, nutrition, and immune activity. " +
					`Your reading (${row.value}) is above the usual adult range${row.refRange ? ` (${row.refRange})` : ""}. ` +
					"Common reasons include dehydration, chronic inflammation, or infection. Bring your original report to your clinic so your doctor can confirm the number and decide if more tests are needed."
			: `Total protein is below the usual range (${row.value}${row.refRange ? `; typical ${row.refRange}` : ""}). ` +
					"That can be linked to liver disease, kidney problems, or not eating enough protein. Your doctor should review this alongside how you feel day to day.";
	}

	if (/albumin/i.test(row.name)) {
		return row.status === "low"
			? `Albumin is a main blood protein made by the liver. Yours (${row.value}) is lower than usual, which can happen with liver disease, kidney loss of protein, or poor nutrition. Eat regular balanced meals and see your doctor for confirmation.`
			: `Albumin (${row.value}) is higher than the usual range. Your doctor can explain whether this fits your overall health picture.`;
	}

	if (/globulin/i.test(row.name)) {
		return `${plainName(row.name)} (${row.value}) is outside the usual range. Globulins are infection-fighting proteins — changes can reflect inflammation, liver conditions, or immune activity. A clinician should interpret this with your full report.`;
	}

	if (/creatinine/i.test(row.name)) {
		return `Creatinine (${row.value}) reflects how well your kidneys are filtering waste. ${row.status === "elevated" || row.status === "action" ? "A raised level can mean the kidneys need attention — drink water, avoid herbal tonics unless prescribed, and see a doctor." : "Your level is below the usual range; your doctor can say if that matters for you."}`;
	}

	if (/alt|ast|bilirubin|alk/i.test(row.name)) {
		return `${plainName(row.name)} (${row.value}) is outside the usual range for liver-related tests. That can happen with fatty liver, hepatitis, alcohol use, or some medicines. Avoid alcohol until a doctor reviews this, and share any symptoms like yellow eyes or dark urine.`;
	}

	// Generic fallback — still plain language
	const direction =
		row.status === "low"
			? "lower"
			: row.status === "elevated" || row.status === "action"
				? "higher"
				: "different";
	return (
		`${plainName(row.name)} (${row.value}) is ${direction} than the usual range${row.refRange ? ` (${row.refRange})` : ""}. ` +
		"Lab results always need context — how you feel, your medicines, and past tests. Share this with your doctor or visit your nearest CHPS compound."
	);
}

function plainName(name: string): string {
	return name.replace(/\s*\(.*\)/, "").trim();
}

export function buildSummarySectionsCopy(opts: {
	total: number;
	abnormalCount: number;
	patientCtx: string;
	hasSpep: boolean;
	hasLiver: boolean;
	hasUnreliableOcr?: boolean;
}): Array<{ id: string; title: string; body: string; tone: "info" | "caution" | "neutral" }> {
	const { total, abnormalCount, patientCtx, hasSpep, hasLiver, hasUnreliableOcr } = opts;

	const sections: Array<{ id: string; title: string; body: string; tone: "info" | "caution" | "neutral" }> = [
		{
			id: "analyzed",
			title: "What we looked at",
			body: patientCtx
				? `We picked out ${total} result${total !== 1 ? "s" : ""} from your lab report ${patientCtx} and explained each one in everyday language.`
				: `We picked out ${total} result${total !== 1 ? "s" : ""} from your lab report and explained each in everyday language.`,
			tone: "info",
		},
	];

	if (hasUnreliableOcr) {
		sections.push({
			id: "ocr-warning",
			title: "Double-check the numbers",
			body:
				"At least one value may have been misread from the photo. Compare this summary with your paper report or lab printout — if a number looks wrong, trust the original document and ask the lab to confirm.",
			tone: "caution",
		});
	}

	if (abnormalCount === 0) {
		sections.push({
			id: "results",
			title: "Good news at a glance",
			body: "Every value we could read looks within the normal ranges printed on your report. Keep your healthy habits and routine check-ups.",
			tone: "info",
		});
	} else {
		sections.push({
			id: "results",
			title:
				abnormalCount === 1
					? "One result stood out"
					: `${abnormalCount} results stood out`,
			body:
				abnormalCount === 1
					? "One test is outside the usual range on your report. That is a signal to follow up — not a diagnosis. Dehydration, a recent infection, or even a blurry photo can affect results. A doctor who knows you is the best person to say what it means."
					: `${abnormalCount} tests are outside the usual ranges on your report. That is a signal to follow up — not a diagnosis. Several everyday factors can shift lab numbers. Book a visit and bring your original report so your doctor can put these in context.`,
			tone: "caution",
		});
	}

	if (hasSpep) {
		sections.push({
			id: "protein",
			title: "About the protein tests",
			body:
				"Your report includes blood protein tests (such as total protein or an M-spike on SPEP). These show the mix of proteins in your blood. Unusual patterns are a common reason for follow-up blood work — they are not usually an emergency on their own. Visit your clinic or hospital, bring the original lab slip, and ask whether you need a test called immunofixation.",
			tone: "caution",
		});
	}

	if (hasLiver) {
		sections.push({
			id: "liver",
			title: "About the liver-related tests",
			body:
				"Some liver markers on your report are outside the usual range. That can reflect diet, alcohol, medicines, or infection. Avoid alcohol until your doctor reviews the results, stay hydrated, and mention any stomach pain, yellow skin, or dark urine.",
			tone: "caution",
		});
	}

	sections.push({
		id: "disclaimer",
		title: "Important",
		body:
			"This summary is meant to help you understand your report — it is not medical advice or a final diagnosis. Only a qualified clinician can confirm your results and tell you what to do next.",
		tone: "neutral",
	});

	return sections;
}
