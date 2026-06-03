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

const SEED_FINDINGS: LabFinding[] = [
	{ id: "1", name: "Blood Sugar (Glucose)", marker: "Blood Sugar (Glucose)", value: "5.2 mmol/L", status: "normal", statusLabel: "Normal ✓", note: "Your blood sugar is at a healthy level. This means your body is managing energy well. Keep eating balanced meals and staying active." },
	{ id: "2", name: "Bad Cholesterol (LDL)", marker: "Bad Cholesterol (LDL)", value: "3.8 mmol/L", status: "elevated", statusLabel: "A little high", note: "LDL is the type of cholesterol that can build up in your arteries over time. Yours is slightly above the ideal range. Try eating less fried food, butter, and red meat — and add more fish, nuts, and oats to your diet." },
	{ id: "3", name: "Red Blood Cells (Haemoglobin)", marker: "Red Blood Cells (Haemoglobin)", value: "14.2 g/dL", status: "normal", statusLabel: "Normal ✓", note: "Your red blood cells are healthy. They carry oxygen around your body, and yours are doing a great job. No signs of anaemia." },
	{ id: "4", name: "Vitamin D", marker: "Vitamin D", value: "38 nmol/L", status: "low", statusLabel: "Lower than ideal", note: "Most people don't get enough Vitamin D, especially in winter. It helps your bones, mood, and immune system. Try 15 minutes of sunlight daily and consider a Vitamin D supplement (1000–2000 IU)." },
	{ id: "5", name: "Thyroid (TSH)", marker: "Thyroid", value: "2.1 mIU/L", status: "normal", statusLabel: "Normal ✓", note: "Your thyroid gland — which controls your energy and metabolism — is working exactly as it should. Nothing to worry about here." },
	{ id: "6", name: "Iron Stores (Ferritin)", marker: "Iron Stores (Ferritin)", value: "8 µg/L", status: "action", statusLabel: "Low — see a doctor", note: "Ferritin measures how much iron your body has stored. Yours is very low, which can cause tiredness, weakness, and difficulty concentrating. Please speak to your doctor soon — you may need an iron supplement." },
];

const SEED_RECS: Recommendation[] = [
	{ icon: "🥗", title: "Eat more iron-rich foods", body: "Add spinach, lentils, kidney beans, and lean red meat to your meals. Pair them with Vitamin C (like orange juice) to help your body absorb iron better." },
	{ icon: "☀️", title: "Get more Vitamin D", body: "Spend 15–20 minutes outside in sunlight each day. If that's hard, a daily Vitamin D3 supplement (1000–2000 IU) is a simple fix." },
	{ icon: "🐟", title: "Help your cholesterol", body: "Swap butter for olive oil, eat more oily fish (like salmon or mackerel) twice a week, and snack on nuts instead of crisps." },
	{ icon: "🩺", title: "Book a doctor's appointment", body: "Your iron level needs medical attention. Your GP can confirm the cause and recommend the right treatment — this is the most important step right now." },
];

const loadRecordsFromStorage = (): UploadRecord[] => {
	if (typeof window !== "undefined") {
		try {
			const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (e) {
			console.error("Error loading upload history", e);
		}
	}
	return [
		{
			id: "default-seed-record",
			uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
			fileName: "blood_panel_report.pdf",
			healthScore: 75,
			findings: SEED_FINDINGS,
			recommendations: SEED_RECS,
			firstName: "James",
			lastName: "Smith",
			age: "47",
			gender: "Male",
			bloodType: "O+",
		}
	];
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
