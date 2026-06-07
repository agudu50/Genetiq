import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface HealthGoal {
	id: string;
	category:
		| "Nutrition"
		| "Activity"
		| "Sleep"
		| "Mind"
		| "Metabolic"
		| "Neuro"
		| "Fitness";
	title: string;
	description: string;
	target_value: string;
	current_value: string;
	unit: string;
	progress: number;
	status: "In Progress" | "Completed" | "Suggested";
	trend: "improving" | "stable" | "declining";
	streak: number;
	completed: boolean;
	vaultSealHash?: string;
	session?: "Morning" | "Afternoon" | "Evening";
}

interface GoalState {
	items: HealthGoal[];
	streakCount: number;
	totalHealthScore: number;
}

const initialState: GoalState = {
	items: [
		{
			id: "goal-1",
			category: "Nutrition",
			title: "Hydration Target",
			description: "Drink 3L of water daily.",
			target_value: "3000",
			current_value: "0",
			unit: "ml",
			progress: 0,
			status: "In Progress",
			trend: "improving",
			streak: 0,
			completed: false,
			session: "Morning",
		},
		{
			id: "goal-2",
			category: "Activity",
			title: "Zone 2 Training",
			description: "45 min of low-intensity cardio.",
			target_value: "45",
			current_value: "0",
			unit: "min",
			progress: 0,
			status: "In Progress",
			trend: "stable",
			streak: 0,
			completed: false,
			session: "Afternoon",
		},
		{
			id: "goal-3",
			category: "Sleep",
			title: "Deep Sleep Window",
			description: "Aim for 2 hours of deep sleep.",
			target_value: "120",
			current_value: "0",
			unit: "min",
			progress: 0,
			status: "In Progress",
			trend: "stable",
			streak: 0,
			completed: false,
			session: "Evening",
		},
		{
			id: "goal-4",
			category: "Mind",
			title: "Meditation Burst",
			description: "10 mins of mindfulness.",
			target_value: "10",
			current_value: "0",
			unit: "min",
			progress: 0,
			status: "In Progress",
			trend: "improving",
			streak: 0,
			completed: false,
			session: "Evening",
		},
	],
	streakCount: 0,
	totalHealthScore: 0,
};

const goalSlice = createSlice({
	name: "goals",
	initialState,
	reducers: {
		setGoals: (state, action: PayloadAction<HealthGoal[]>) => {
			state.items = action.payload;
			// Recalculate streak and health score based on completed items
			const completedCount = action.payload.filter((g) => g.completed).length;
			state.streakCount = completedCount > 0 ? 5 : 0; // simple mock streak
			state.totalHealthScore = Math.round((completedCount / action.payload.length) * 100) || 0;
		},
		toggleGoal: (state, action: PayloadAction<string>) => {
			const goal = state.items.find((g) => g.id === action.payload);
			if (goal) {
				goal.completed = !goal.completed;
				if (goal.completed) {
					goal.streak += 1;
					goal.progress = 100;
					goal.status = "Completed";
					goal.current_value = goal.target_value;
				} else {
					goal.streak = Math.max(0, goal.streak - 1);
					goal.progress = 0;
					goal.status = "In Progress";
					goal.current_value = "0";
				}
			}
			// Update dynamic health score
			const completedCount = state.items.filter((g) => g.completed).length;
			state.totalHealthScore = Math.round((completedCount / state.items.length) * 100) || 0;
			state.streakCount = completedCount > 0 ? 5 : 0;
		},
		updateGoalProgress: (
			state,
			action: PayloadAction<{ id: string; current: string; progress: number }>,
		) => {
			const goal = state.items.find((g) => g.id === action.payload.id);
			if (goal) {
				goal.current_value = action.payload.current;
				goal.progress = action.payload.progress;
			}
			// Update dynamic health score
			const completedCount = state.items.filter((g) => g.completed).length;
			state.totalHealthScore = Math.round((completedCount / state.items.length) * 100) || 0;
		},
		addGoal: (state, action: PayloadAction<HealthGoal>) => {
			state.items.push(action.payload);
			// Update dynamic health score
			const completedCount = state.items.filter((g) => g.completed).length;
			state.totalHealthScore = Math.round((completedCount / state.items.length) * 100) || 0;
		},
		sealMilestone: (
			state,
			action: PayloadAction<{ id: string; hash: string }>,
		) => {
			const goal = state.items.find((g) => g.id === action.payload.id);
			if (goal) {
				goal.vaultSealHash = action.payload.hash;
			}
		},
	},
});

export const { setGoals, toggleGoal, updateGoalProgress, addGoal, sealMilestone } =
	goalSlice.actions;
export default goalSlice.reducer;
