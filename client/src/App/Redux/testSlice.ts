import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LabTest {
	id: string;
	title: string;
	description: string;
	type: "Blood" | "DNA" | "Imaging" | "Neuro" | "CGM";
	status:
		| "Pending"
		| "Completed"
		| "Flagged"
		| "Available to Order"
		| "Shipped";
	date?: string;
	order_date?: string;
	price?: string;
	tracking?: string;
	suiHash?: string;
	system: string; // The system to highlight on the Digital Twin
}

interface TestState {
	items: LabTest[];
	filter: "All" | "Pending" | "Completed" | "Flagged";
}

const initialState: TestState = {
	items: [
		{
			id: "test-1",
			title: "Advanced Hormone Panel",
			description: "Full thyroid, adrenal, and reproductive hormone screening.",
			type: "Blood",
			status: "Pending",
			order_date: "2024-03-12",
			system: "Endocrinology",
		},
		{
			id: "test-2",
			title: "Cognitive Performance Test",
			description: "Neural efficiency and memory recall baseline assessment.",
			type: "Neuro",
			status: "Completed",
			date: "2024-02-28",
			system: "StressManagement",
		},
		{
			id: "test-3",
			title: "Metabolic Shield 2.0",
			description: "Real-time glucose and insulin response tracking.",
			type: "CGM",
			status: "Flagged",
			date: "2024-03-15",
			system: "Gastroenterolgy",
		},
	],
	filter: "All",
};

const testSlice = createSlice({
	name: "tests",
	initialState,
	reducers: {
		setFilter: (state, action: PayloadAction<TestState["filter"]>) => {
			state.filter = action.payload;
		},
		addTest: (state, action: PayloadAction<LabTest>) => {
			state.items.push(action.payload);
		},
		updateTest: (
			state,
			action: PayloadAction<Partial<LabTest> & { id: string }>,
		) => {
			const index = state.items.findIndex((t) => t.id === action.payload.id);
			if (index !== -1) {
				state.items[index] = { ...state.items[index], ...action.payload };
			}
		},
	},
});

export const { setFilter, addTest, updateTest } = testSlice.actions;
export default testSlice.reducer;
