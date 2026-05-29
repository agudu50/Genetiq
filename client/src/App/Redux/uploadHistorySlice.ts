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

export interface UploadHistoryState {
	records: UploadRecord[];
}

const initialState: UploadHistoryState = {
	records: [],
};

// ─── Slice ────────────────────────────────────────────────────────────────────

export const uploadHistorySlice = createSlice({
	name: "uploadHistory",
	initialState,
	reducers: {
		addUploadRecord: (state, action: PayloadAction<UploadRecord>) => {
			// Newest first
			state.records.unshift(action.payload);
		},
		clearUploadHistory: () => initialState,
	},
});

export const { addUploadRecord, clearUploadHistory } = uploadHistorySlice.actions;
export default uploadHistorySlice.reducer;
