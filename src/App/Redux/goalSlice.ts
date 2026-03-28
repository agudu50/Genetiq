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
	suiMilestoneHash?: string;
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
			current_value: "2100",
			unit: "ml",
			progress: 70,
			status: "In Progress",
			trend: "improving",
			streak: 14,
			completed: false,
		},
		{
			id: "goal-2",
			category: "Activity",
			title: "Zone 2 Training",
			description: "45 min of low-intensity cardio.",
			target_value: "45",
			current_value: "45",
			unit: "min",
			progress: 100,
			status: "Completed",
			trend: "stable",
			streak: 8,
			completed: true,
			suiMilestoneHash: "0x7a2...8f3c",
		},
		{
			id: "goal-3",
			category: "Sleep",
			title: "Deep Sleep Window",
			description: "Aim for 2 hours of deep sleep.",
			target_value: "120",
			current_value: "95",
			unit: "min",
			progress: 79,
			status: "In Progress",
			trend: "stable",
			streak: 3,
			completed: false,
		},
		{
			id: "goal-4",
			category: "Mind",
			title: "Meditation Burst",
			description: "10 mins of mindfulness.",
			target_value: "10",
			current_value: "10",
			unit: "min",
			progress: 100,
			status: "Completed",
			trend: "improving",
			streak: 21,
			completed: true,
		},
	],
	streakCount: 12,
	totalHealthScore: 88,
};

const goalSlice = createSlice({
	name: "goals",
	initialState,
	reducers: {
		toggleGoal: (state, action: PayloadAction<string>) => {
			const goal = state.items.find((g) => g.id === action.payload);
			if (goal) {
				goal.completed = !goal.completed;
				if (goal.completed) {
					goal.streak += 1;
					goal.progress = 100;
					goal.status = "Completed";
				} else {
					goal.streak = Math.max(0, goal.streak - 1);
					goal.progress = 0;
					goal.status = "In Progress";
				}
			}
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
		},
		addGoal: (state, action: PayloadAction<HealthGoal>) => {
			state.items.push(action.payload);
		},
		mintMilestone: (
			state,
			action: PayloadAction<{ id: string; hash: string }>,
		) => {
			const goal = state.items.find((g) => g.id === action.payload.id);
			if (goal) {
				goal.suiMilestoneHash = action.payload.hash;
			}
		},
	},
});

export const { toggleGoal, updateGoalProgress, addGoal, mintMilestone } =
	goalSlice.actions;
export default goalSlice.reducer;
