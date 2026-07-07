import {
	buildFindingNote,
	buildSummarySectionsCopy,
	friendlyStatusLabel,
	isPlausibleLabValue,
	parseNumericValue,
} from "./labResultCopy";

type FindingStatus = "normal" | "elevated" | "low" | "action";

interface FallbackFinding {
	id: string;
	name: string;
	marker: string;
	value: string;
	status: FindingStatus;
	statusLabel: string;
	note: string;
}

interface FallbackAnalysisResult {
	healthScore: number;
	findings: FallbackFinding[];
	recommendations: { icon: string; title: string; body: string }[];
	summary: string;
	summarySections: Array<{
		id: string;
		title: string;
		body: string;
		tone: "info" | "caution" | "neutral";
	}>;
	bodySystem: string;
}

function formatPatientContext(age: string, gender: string): string {
	const ageTrim = age?.trim();
	const g = gender?.trim().toLowerCase() ?? "";
	const hasGender =
		g &&
		g !== "unknown" &&
		!g.includes("prefer not");

	let genderWord = "";
	if (hasGender) {
		if (g === "male") genderWord = "male";
		else if (g === "female") genderWord = "female";
		else genderWord = gender.trim();
	}

	if (ageTrim && genderWord) return `for a ${ageTrim}-year-old ${genderWord} patient`;
	if (ageTrim) return `for a ${ageTrim}-year-old patient`;
	if (genderWord) return `for a ${genderWord} patient`;
	return "";
}

export interface ParsedLabRow {
	name: string;
	marker: string;
	value: string;
	unit: string;
	status: FindingStatus;
	statusLabel: string;
	refRange?: string;
}

const MARKER_ALIASES: Record<string, string> = {
	"protein total": "Total Protein",
	"total protein": "Total Protein",
	albumin: "Albumin",
	creatinine: "Creatinine",
	"alk.phos": "Alkaline Phosphatase",
	"alk phos": "Alkaline Phosphatase",
	"bilirubin direct": "Bilirubin (Direct)",
	"asat / got": "AST (GOT)",
	"asat/got": "AST (GOT)",
	"alat / gpt": "ALT (GPT)",
	"alat/gpt": "ALT (GPT)",
	"alpha 1 globulin": "Alpha-1 Globulin",
	"alpha 2 globulin": "Alpha-2 Globulin",
	"beta 1 globulin": "Beta-1 Globulin",
	"beta 2 globulin": "Beta-2 Globulin",
	"gamma globulin": "Gamma Globulin",
	"abnormal protein band": "Abnormal Protein Band",
	"m-spike": "M-spike",
};

function normalizeName(raw: string): string {
	const key = raw.toLowerCase().replace(/\s+/g, " ").trim();
	return MARKER_ALIASES[key] || raw.replace(/\s+/g, " ").trim();
}

function classifyValue(
	num: number,
	low?: number,
	high?: number,
	flaggedHigh?: boolean,
	flaggedLow?: boolean,
): FindingStatus {
	if (flaggedHigh || (high !== undefined && num > high)) return num > (high ?? 0) * 1.5 ? "action" : "elevated";
	if (flaggedLow || (low !== undefined && num < low)) return "low";
	if (low !== undefined && high !== undefined && num >= low && num <= high) return "normal";
	return "normal";
}

function statusLabel(status: FindingStatus): string {
	return friendlyStatusLabel(status);
}

function dedupeAndValidateRows(rows: ParsedLabRow[]): ParsedLabRow[] {
	const byMarker = new Map<string, ParsedLabRow>();

	for (const row of rows) {
		const key = row.marker.toLowerCase();
		const num = parseNumericValue(row.value);
		const plausible = num === null || isPlausibleLabValue(row.name, num);

		if (!plausible && num !== null) {
			// Keep row but mark as unreliable — note builder will explain
			row.status = "action";
			row.statusLabel = "Check original report";
		}

		const existing = byMarker.get(key);
		if (!existing) {
			byMarker.set(key, row);
			continue;
		}

		const existingNum = parseNumericValue(existing.value);
		const existingPlausible = existingNum === null || isPlausibleLabValue(existing.name, existingNum);
		if (plausible && !existingPlausible) {
			byMarker.set(key, row);
		} else if (plausible && existingPlausible && row.refRange && !existing.refRange) {
			byMarker.set(key, row);
		}
	}

	return Array.from(byMarker.values());
}

function pushRow(rows: ParsedLabRow[], row: ParsedLabRow) {
	const num = parseNumericValue(row.value);
	if (num !== null && row.unit && !isPlausibleLabValue(row.name, num)) {
		return;
	}
	if (rows.some((r) => r.marker.toLowerCase() === row.marker.toLowerCase())) return;
	rows.push(row);
}

/** Extract structured lab rows from noisy OCR text. */
export function parseLabOcrText(text: string): ParsedLabRow[] {
	const rows: ParsedLabRow[] = [];
	const cleaned = text.replace(/\r/g, "\n");

	// Pattern: Name  value  refLow - refHigh  unit  (table-style)
	const tableRe =
		/([A-Za-z][A-Za-z0-9\s\/\.\-\(\)]{2,40}?)\s+([\d.<>]+)\s+([\d.]+)\s*-\s*([\d.]+)\s+(g\s*\/?\s*dL|mg\s*\/?\s*dL|U\s*\/?\s*L)/gi;
	for (const m of cleaned.matchAll(tableRe)) {
		const name = normalizeName(m[1]);
		const num = parseFloat(m[2].replace(/[<>]/g, ""));
		const low = parseFloat(m[3]);
		const high = parseFloat(m[4]);
		const unit = m[5].replace(/\s/g, "");
		if (Number.isNaN(num)) continue;
		const status = classifyValue(num, low, high);
		pushRow(rows, {
			name,
			marker: name,
			value: `${m[2]} ${unit}`,
			unit,
			status,
			statusLabel: statusLabel(status),
			refRange: `${low}–${high} ${unit}`,
		});
	}

	// Pattern: Name value > H (ref) unit
	const highFlagRe =
		/([A-Za-z][A-Za-z0-9\s\/\.\-]{2,35}?)\s+([\d.]+)\s*>\s*H\s*\(([\d.]+)\)\s*(g\s*\/?\s*dL|mg\s*\/?\s*dL|U\s*\/?\s*L)?/gi;
	for (const m of cleaned.matchAll(highFlagRe)) {
		const name = normalizeName(m[1]);
		const num = parseFloat(m[2]);
		const refHigh = parseFloat(m[3]);
		const unit = (m[4] || "").replace(/\s/g, "") || "";
		if (Number.isNaN(num)) continue;
		const status = classifyValue(num, undefined, refHigh, true);
		pushRow(rows, {
			name,
			marker: name,
			value: unit ? `${m[2]} ${unit}` : m[2],
			unit,
			status,
			statusLabel: statusLabel(status),
			refRange: refHigh ? `≤ ${refHigh}${unit ? ` ${unit}` : ""}` : undefined,
		});
	}

	// Pattern: PROTEIN, TOTAL  7.6  6.1 - 8.1  g/dL
	const commaNameRe =
		/([A-Z][A-Z0-9,\s\/\-\.]{3,40})\s+([\d.<>]+)\s+([\d.]+)\s*-\s*([\d.]+)\s+(g\s*\/?\s*dL|mg\s*\/?\s*dL|U\s*\/?\s*L)/gi;
	for (const m of cleaned.matchAll(commaNameRe)) {
		const name = normalizeName(m[1].replace(/,/g, " "));
		const num = parseFloat(m[2].replace(/[<>]/g, ""));
		const low = parseFloat(m[3]);
		const high = parseFloat(m[4]);
		const unit = m[5].replace(/\s/g, "");
		if (Number.isNaN(num)) continue;
		const status = classifyValue(num, low, high);
		pushRow(rows, {
			name,
			marker: name,
			value: `${m[2]} ${unit}`,
			unit,
			status,
			statusLabel: statusLabel(status),
			refRange: `${low}–${high} ${unit}`,
		});
	}

	if (/m-spike|immunofixation|restricted band|monoclonal/i.test(cleaned)) {
		pushRow(rows, {
			name: "M-spike (protein band)",
			marker: "SPEP M-spike",
			value: "Seen on report",
			unit: "",
			status: "action",
			statusLabel: "Ask about a specialist follow-up",
		});
	}

	// Keyword proximity pass for noisy OCR
	const rules: Array<{
		pattern: RegExp;
		name: string;
		unit: string;
		low?: number;
		high?: number;
	}> = [
		{ pattern: /protein[\s,]*total|total[\s,]*protein/i, name: "Total Protein", unit: "g/dL", low: 6.1, high: 8.1 },
		{ pattern: /\balbumin\b/i, name: "Albumin", unit: "g/dL", low: 3.8, high: 4.8 },
		{ pattern: /alpha\s*1\s*globulin/i, name: "Alpha-1 Globulin", unit: "g/dL", low: 0.2, high: 0.3 },
		{ pattern: /alpha\s*2\s*globulin/i, name: "Alpha-2 Globulin", unit: "g/dL", low: 0.5, high: 0.9 },
		{ pattern: /beta\s*1\s*globulin/i, name: "Beta-1 Globulin", unit: "g/dL", low: 0.4, high: 0.6 },
		{ pattern: /beta\s*2\s*globulin/i, name: "Beta-2 Globulin", unit: "g/dL", low: 0.2, high: 0.5 },
		{ pattern: /gamma\s*globulin/i, name: "Gamma Globulin", unit: "g/dL", low: 0.8, high: 1.7 },
		{ pattern: /\bcreatinine\b/i, name: "Creatinine", unit: "mg/dL", high: 1.1 },
		{ pattern: /bilirubin\s*direct/i, name: "Bilirubin (Direct)", unit: "mg/dL", high: 0.2 },
		{ pattern: /asat|got\b/i, name: "AST (GOT)", unit: "U/L", high: 40 },
		{ pattern: /alat|gpt\b/i, name: "ALT (GPT)", unit: "U/L", high: 42 },
		{ pattern: /alk[\s.]*phos/i, name: "Alkaline Phosphatase", unit: "U/L", low: 40, high: 130 },
	];

	for (const rule of rules) {
		const match = rule.pattern.exec(cleaned);
		if (!match) continue;
		const start = Math.max(0, match.index - 10);
		const window = cleaned.slice(start, match.index + 80);
		const numMatch = window.match(/([\d.]+)\s*(?:>\s*H)?/);
		if (!numMatch) continue;
		const num = parseFloat(numMatch[1]);
		if (Number.isNaN(num)) continue;
		const flaggedHigh = />\s*H/i.test(window);
		const status = classifyValue(num, rule.low, rule.high, flaggedHigh);
		pushRow(rows, {
			name: rule.name,
			marker: rule.name,
			value: `${numMatch[1]} ${rule.unit}`,
			unit: rule.unit,
			status,
			statusLabel: statusLabel(status),
			refRange:
				rule.low && rule.high
					? `${rule.low}–${rule.high} ${rule.unit}`
					: rule.high
						? `≤ ${rule.high} ${rule.unit}`
						: undefined,
		});
	}

	return dedupeAndValidateRows(rows);
}

export function buildFallbackLabAnalysis(
	rows: ParsedLabRow[],
	patientAge: string,
	patientGender: string,
): FallbackAnalysisResult | null {
	if (rows.length === 0) return null;

	const abnormal = rows.filter((r) => r.status !== "normal");
	const actionCount = rows.filter((r) => r.status === "action").length;
	const healthScore = Math.max(25, Math.min(92, 88 - abnormal.length * 8 - actionCount * 12));

	const hasLiver =
		rows.some((r) => /alt|ast|bilirubin|alk/i.test(r.marker)) &&
		abnormal.some((r) => /alt|ast|bilirubin|alk/i.test(r.marker));
	const hasSpep =
		rows.some((r) => /globulin|albumin|protein|m-spike/i.test(r.marker)) &&
		abnormal.some((r) => /globulin|protein|m-spike/i.test(r.marker));

	let bodySystem = "total";
	if (hasSpep) bodySystem = "Hematology";
	else if (hasLiver) bodySystem = "Gastroenterolgy";

	const findings: FallbackFinding[] = rows.map((r, i) => ({
		id: `ocr-${i + 1}`,
		name: r.name,
		marker: r.marker,
		value: r.value,
		status: r.status,
		statusLabel: r.statusLabel,
		note: buildFindingNote(r),
	}));

	const hasUnreliableOcr = rows.some((r) => {
		const num = parseNumericValue(r.value);
		return num !== null && r.unit && !isPlausibleLabValue(r.name, num);
	});

	const patientCtx = formatPatientContext(patientAge, patientGender);

	const summarySections = buildSummarySectionsCopy({
		total: rows.length,
		abnormalCount: abnormal.length,
		patientCtx,
		hasSpep,
		hasLiver,
		hasUnreliableOcr,
	});

	const summary = summarySections.map((s) => s.body).join(" ");

	const recommendations = [
		{
			icon: "🏥",
			title: "Share these results with your doctor",
			body: "Take this summary and your original lab report to your clinic or hospital so they can confirm the findings and plan next steps.",
		},
	];
	if (hasSpep || actionCount > 0) {
		recommendations.push({
			icon: "🔬",
			title: "Ask about follow-up tests",
			body: "If your report mentions an M-spike or unusual protein band, ask your doctor whether you need immunofixation or a referral to a blood specialist.",
		});
	}
	if (hasLiver) {
		recommendations.push({
			icon: "💧",
			title: "Support your liver while you wait",
			body: "Avoid alcohol, stay hydrated, eat balanced meals, and avoid unnecessary herbal mixes unless your doctor approves them.",
		});
	}
	recommendations.push({
		icon: "📋",
		title: "Keep a copy of your report",
		body: "Save the photo and this summary so you can compare with future tests.",
	});

	return {
		healthScore,
		bodySystem,
		summary,
		summarySections,
		findings,
		recommendations,
	};
}

export function parseAndBuildFallback(
	text: string,
	patientAge: string,
	patientGender: string,
): FallbackAnalysisResult | null {
	return buildFallbackLabAnalysis(parseLabOcrText(text), patientAge, patientGender);
}
