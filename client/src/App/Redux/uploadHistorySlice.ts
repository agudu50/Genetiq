import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FindingStatus = "normal" | "elevated" | "low" | "action";

export interface LabFinding {
	id: string;
	name: string;          // e.g. "Blood Sugar (Glucose)"
	marker: string;        // e.g. "Glucose"
	value: string;         // e.g. "5.2 mmol/L"
	status: FindingStatus;
	statusLabel: string;   // e.g. "Normal ✓", "A little high"
	note: string;          // Plain-English explanation
}

export interface Recommendation {
	icon: string;
	title: string;
	body: string;
}

export interface UploadRecord {
	id: string;            // UUID
	uploadedAt: string;    // ISO date string
	fileName: string;      // Original file name(s)
	healthScore: number;   // 0–100
	findings: LabFinding[];
	recommendations: Recommendation[];
	// Personal info captured at time of upload
	firstName: string;
	lastName: string;
	age: string;
	gender: string;
	bloodType: string;
}

export const DEFAULT_MARCUS_LAB_RECORD: UploadRecord = {
	id: "lab-rec-marcus-apob-101",
	uploadedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
	fileName: "90-Day ApoB & Comprehensive Lipid Subfraction",
	healthScore: 68,
	firstName: "Marcus",
	lastName: "Vance",
	age: "52",
	gender: "Male",
	bloodType: "O+",
	findings: [
		{
			id: "f-apob",
			name: "Apolipoprotein B (ApoB)",
			marker: "ApoB",
			value: "128 mg/dL",
			status: "elevated",
			statusLabel: "High (Ref: < 90 mg/dL)",
			note: "Direct particle concentration is elevated, indicating heightened atherogenic particle burden and arterial plaque deposition risk.",
		},
		{
			id: "f-ldl",
			name: "LDL Cholesterol",
			marker: "LDL-C",
			value: "142 mg/dL",
			status: "elevated",
			statusLabel: "High (Ref: < 100 mg/dL)",
			note: "Low-density lipoprotein cholesterol is above target range. Primary driver for coronary atheroma buildup.",
		},
		{
			id: "f-hscrp",
			name: "hs-CRP (Inflammation)",
			marker: "hs-CRP",
			value: "3.4 mg/L",
			status: "elevated",
			statusLabel: "High (Ref: < 1.0 mg/L)",
			note: "High-sensitivity C-reactive protein indicates persistent systemic vascular inflammation.",
		},
		{
			id: "f-egfr",
			name: "eGFR (Kidney)",
			marker: "eGFR",
			value: "78 mL/min",
			status: "low",
			statusLabel: "Low (Ref: > 90 mL/min)",
			note: "Mildly reduced glomerular filtration rate consistent with Stage 2 renal filtration strain.",
		},
		{
			id: "f-glucose",
			name: "Fasting Blood Glucose",
			marker: "Glucose",
			value: "104 mg/dL",
			status: "elevated",
			statusLabel: "High (Ref: 70 - 99 mg/dL)",
			note: "Mildly elevated fasting blood sugar indicating borderline glycemic resistance.",
		},
	],
	recommendations: [
		{
			icon: "pill",
			title: "Atorvastatin 40mg + Ezetimibe 10mg",
			body: "Cardiologist-recommended dual-action lipid lowering therapy targeting ApoB reduction below 70 mg/dL.",
		},
		{
			icon: "heart",
			title: "Cardiovascular Risk Follow-Up",
			body: "Schedule repeat lipid subfraction and inflammatory marker re-test in 90 days.",
		},
		{
			icon: "droplet",
			title: "Renal Function Hydration Support",
			body: "Maintain adequate daily hydration and monitor blood pressure to support glomerular filtration.",
		},
	],
};

const LOCAL_STORAGE_KEY = "genetiq.uploadHistory";

const loadRecordsFromStorage = (): UploadRecord[] => {
	if (typeof window !== "undefined") {
		try {
			const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed) && parsed.length > 0) {
					// Check if Marcus's 90-Day ApoB record is already in the list
					const hasApoB = parsed.some(
						(r: UploadRecord) =>
							r.fileName?.includes("ApoB") ||
							r.findings?.some((f) => f.marker === "ApoB" || f.name.includes("ApoB")),
					);
					if (hasApoB) {
						return parsed;
					}
					return [DEFAULT_MARCUS_LAB_RECORD, ...parsed];
				}
			}
		} catch (e) {
			console.error("Error loading upload history", e);
		}
	}
	return [DEFAULT_MARCUS_LAB_RECORD];
};

export interface UploadHistoryState {
	records: UploadRecord[];
}

const initialState: UploadHistoryState = {
	records: loadRecordsFromStorage(),
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const uploadHistorySlice = createSlice({
	name: "uploadHistory",
	initialState,
	reducers: {
		addUploadRecord: (state, action: PayloadAction<UploadRecord>) => {
			// Newest first
			state.records.unshift(action.payload);
			if (typeof window !== "undefined") {
				try {
					localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.records));
				} catch (e) {
					console.error("Error saving upload history", e);
				}
			}
		},
		clearUploadHistory: (state) => {
			state.records = [];
			if (typeof window !== "undefined") {
				try {
					localStorage.removeItem(LOCAL_STORAGE_KEY);
				} catch (e) {
					console.error("Error clearing upload history", e);
				}
			}
		},
	},
});

export const { addUploadRecord, clearUploadHistory } = uploadHistorySlice.actions;
export default uploadHistorySlice.reducer;
