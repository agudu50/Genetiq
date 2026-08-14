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

const LOCAL_STORAGE_KEY = "genetiq.uploadHistory";

const loadRecordsFromStorage = (): UploadRecord[] => {
	if (typeof window !== "undefined") {
		try {
			const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (Array.isArray(parsed)) {
					return parsed.filter(
						(r: UploadRecord) =>
							r.id !== "default-seed-record" &&
							!r.id.startsWith("seed") &&
							r.fileName !== "blood_panel_report.pdf",
					);
				}
			}
		} catch (e) {
			console.error("Error loading upload history", e);
		}
	}
	return [];
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
