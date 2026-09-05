/**
 * labBodyMapping.ts
 *
 * Maps uploaded lab findings to body system regions on the 3D Digital Twin.
 * Each lab marker is associated with a body system category (matching the
 * keys used in Model.tsx's systemFeatures and SceneConstants ZOOM_CONFIGS).
 *
 * Severity → Color:
 *   normal   → green glow
 *   elevated → amber glow
 *   low      → orange glow
 *   action   → red glow (pulsing)
 */

import * as THREE from "three";
import type { LabFinding, FindingStatus } from "@/App/Redux/uploadHistorySlice";

// ─── Severity ordering (higher = worse) ───────────────────────────────────────
const SEVERITY_RANK: Record<FindingStatus, number> = {
	normal: 0,
	elevated: 1,
	low: 2,
	action: 3,
};

// ─── Severity → glow colors [core, mid, outer] ───────────────────────────────
const STATUS_COLORS: Record<FindingStatus, [number, number, number]> = {
	normal: [0x10b981, 0x059669, 0x064e3b],     // green
	elevated: [0xfbbf24, 0xf59e0b, 0x92400e],   // amber
	low: [0xfb923c, 0xf97316, 0x9a3412],         // orange
	action: [0xef4444, 0xdc2626, 0x7f1d1d],      // red
};

// ─── Lab marker name → body system category key ──────────────────────────────
// These category keys match what Model.tsx's `systemFeatures` uses, plus a
// new "Hematology" key for blood-cell markers that highlight the full body.
const MARKER_TO_SYSTEM: Record<string, string> = {
	// Blood sugar / metabolic → Endocrine (pancreas, thyroid region)
	"Blood Sugar (Glucose)": "Endocrinology",
	"Fasting Blood Glucose": "Endocrinology",
	"Glucose": "Endocrinology",
	"HbA1c": "Endocrinology",

	// Cholesterol & Cardiovascular → Cardiovascular (heart/chest)
	"Bad Cholesterol (LDL)": "cardiovascular",
	"LDL Cholesterol": "cardiovascular",
	"LDL": "cardiovascular",
	"LDL-C": "cardiovascular",
	"HDL": "cardiovascular",
	"HDL-C": "cardiovascular",
	"Cholesterol": "cardiovascular",
	"Total Cholesterol": "cardiovascular",
	"Triglycerides": "cardiovascular",
	"Apolipoprotein B (ApoB)": "cardiovascular",
	"Apolipoprotein B": "cardiovascular",
	"ApoB": "cardiovascular",
	"hs-CRP (Inflammation)": "cardiovascular",
	"hs-CRP": "cardiovascular",
	"hsCRP": "cardiovascular",
	"Palpitations": "cardiovascular",
	"Atrial Fibrillation": "cardiovascular",

	// Thyroid → Endocrine (neck)
	"Thyroid (TSH)": "Endocrinology",
	"Thyroid": "Endocrinology",
	"TSH": "Endocrinology",
	"T3": "Endocrinology",
	"T4": "Endocrinology",

	// Blood cells → Hematology (full body)
	"Red Blood Cells (Haemoglobin)": "Hematology",
	"Haemoglobin": "Hematology",
	"Hemoglobin": "Hematology",
	"White Blood Cells": "Hematology",
	"WBC": "Hematology",
	"Basophils %": "Hematology",
	"Basophils": "Hematology",
	"Neutrophils": "Hematology",
	"Lymphocytes": "Hematology",
	"Packed Cell Volume (PCV)": "Hematology",
	"PCV": "Hematology",
	"Platelets": "Hematology",
	"RBC": "Hematology",
	"MCV": "Hematology",
	"MCH": "Hematology",
	"MCHC": "Hematology",

	// Iron → Hematology (full body)
	"Iron Stores (Ferritin)": "Hematology",
	"Ferritin": "Hematology",
	"Iron": "Hematology",

	// Vitamins → Musculoskeletal (bones)
	"Vitamin D": "UlnaRadiusAlt",
	"Vitamin B12": "StressManagement",
	"Calcium": "UlnaRadiusAlt",

	// Kidney → Renal (lower back)
	"Creatinine": "Pulmonology1",
	"Urea": "Pulmonology1",
	"eGFR": "Pulmonology1",
	"BUN": "Pulmonology1",

	// Liver → Digestive (abdomen)
	"ALT": "Gastroenterolgy",
	"AST": "Gastroenterolgy",
	"Bilirubin": "Gastroenterolgy",
	"GGT": "Gastroenterolgy",
	"ALP": "Gastroenterolgy",
	"Albumin": "Gastroenterolgy",

	// Lung / respiratory
	"Oxygen Saturation": "Pulmonology",
	"SpO2": "Pulmonology",

	// Urological
	"Uric Acid": "Urology",
};

export interface LabBodyHighlight {
	systemKey: string;
	status: FindingStatus;
	coreColor: THREE.Color;
	midColor: THREE.Color;
	outerColor: THREE.Color;
	findings: LabFinding[];   // all findings that contributed to this highlight
}

/**
 * Resolves a finding's marker/name to a body system key.
 * Tries exact match first, then partial/substring match.
 */
function resolveSystem(finding: LabFinding): string | null {
	// Exact match on marker
	if (MARKER_TO_SYSTEM[finding.marker]) return MARKER_TO_SYSTEM[finding.marker];
	// Exact match on name
	if (MARKER_TO_SYSTEM[finding.name]) return MARKER_TO_SYSTEM[finding.name];
	// Partial match — check if any key is contained in the finding name/marker
	for (const [key, system] of Object.entries(MARKER_TO_SYSTEM)) {
		const lower = key.toLowerCase();
		if (
			finding.name.toLowerCase().includes(lower) ||
			finding.marker.toLowerCase().includes(lower)
		) {
			return system;
		}
	}
	return null;
}

/**
 * Given an array of lab findings (from the latest upload record),
 * returns a Map of body system keys → highlight info with severity colors.
 *
 * If multiple findings map to the same system, the worst severity wins.
 * Only abnormal findings (elevated, low, action) generate highlights.
 */
export function mapLabFindingsToBodyHighlights(
	findings: LabFinding[],
): Map<string, LabBodyHighlight> {
	const highlights = new Map<string, LabBodyHighlight>();

	for (const finding of findings) {
		// Skip normal findings — only highlight issues
		if (finding.status === "normal") continue;

		const systemKey = resolveSystem(finding);
		if (!systemKey) continue;

		const existing = highlights.get(systemKey);
		if (existing) {
			// Merge: keep worst severity
			existing.findings.push(finding);
			if (SEVERITY_RANK[finding.status] > SEVERITY_RANK[existing.status]) {
				existing.status = finding.status;
				const colors = STATUS_COLORS[finding.status];
				existing.coreColor = new THREE.Color(colors[0]);
				existing.midColor = new THREE.Color(colors[1]);
				existing.outerColor = new THREE.Color(colors[2]);
			}
		} else {
			const colors = STATUS_COLORS[finding.status];
			highlights.set(systemKey, {
				systemKey,
				status: finding.status,
				coreColor: new THREE.Color(colors[0]),
				midColor: new THREE.Color(colors[1]),
				outerColor: new THREE.Color(colors[2]),
				findings: [finding],
			});
		}
	}

	return highlights;
}
