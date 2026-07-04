import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { GemmaLanguage } from "@/App/Services/GemmaService";

export type TriageUrgency = "Green" | "Yellow" | "Red" | null;

export interface TriageAlert {
	id: string;
	system: string; // e.g., 'Respiratory', 'Cardiovascular'
	condition: string;
	description: string;
	urgency: TriageUrgency;
	requiresAction: boolean;
}

export interface ChatMessage {
	id: string;
	role: "user" | "bot";
	text: string;
}

interface TriageState {
	symptomsInput: string;
	activeAlerts: TriageAlert[];
	messages: ChatMessage[];
	isAnalyzing: boolean;
	selectedLanguage: GemmaLanguage;
}

const initialState: TriageState = {
	symptomsInput: "",
	activeAlerts: [
		{
			id: "alert-1",
			system: "Respiratory",
			condition: "Mild Wheezing Detected",
			description:
				"AI detected a potential respiratory restriction based on uploaded sound data.",
			urgency: "Yellow",
			requiresAction: true,
		},
	],
	messages: [
		{
			id: "msg-initial",
			role: "bot",
			text: "Hello! I'm your Genetiq Health Assistant. Describe your symptoms or tap a quick suggestion below — I'll guide you right away.",
		},
	],
	isAnalyzing: false,
	selectedLanguage: "english" as GemmaLanguage,
};

const triageSlice = createSlice({
	name: "triage",
	initialState,
	reducers: {
		setSymptomsInput: (state, action: PayloadAction<string>) => {
			state.symptomsInput = action.payload;
		},
		appendSymptom: (state, action: PayloadAction<string>) => {
			const current = state.symptomsInput.trim();
			if (current.length > 0) {
				if (!current.toLowerCase().includes(action.payload.toLowerCase())) {
					state.symptomsInput = `${current}, ${action.payload}`;
				}
			} else {
				state.symptomsInput = action.payload;
			}
		},
		addAlert: (state, action: PayloadAction<TriageAlert>) => {
			state.activeAlerts.push(action.payload);
		},
		addMessage: (state, action: PayloadAction<ChatMessage>) => {
			state.messages.push(action.payload);
		},
		clearAlerts: (state) => {
			state.activeAlerts = [];
		},
		clearMessages: (state) => {
			state.messages = [
				{
					id: "msg-initial",
					role: "bot",
					text: "Hello! I'm your Genetiq Health Assistant. Describe your symptoms or tap a quick suggestion below — I'll guide you right away.",
				},
			];
		},
		setAnalyzing: (state, action: PayloadAction<boolean>) => {
			state.isAnalyzing = action.payload;
		},
		setLanguage: (state, action: PayloadAction<GemmaLanguage>) => {
			state.selectedLanguage = action.payload;
		},
	},
});

export const {
	setSymptomsInput,
	appendSymptom,
	addAlert,
	addMessage,
	clearAlerts,
	clearMessages,
	setAnalyzing,
	setLanguage,
} = triageSlice.actions;

export default triageSlice.reducer;
