import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./categorySlice";
import userReducer from "./userSlice";
import triageReducer from "./triageSlice";
import testReducer from "./testSlice";
import goalReducer from "./goalSlice";
import genomicsReducer from "./genomicsSlice";
import uploadHistoryReducer from "./uploadHistorySlice";
import cartReducer from "./cartSlice";

const store = configureStore({
	reducer: {
		category: categoryReducer,
		user: userReducer,
		triage: triageReducer,
		tests: testReducer,
		goals: goalReducer,
		genomics: genomicsReducer,
		uploadHistory: uploadHistoryReducer,
		cart: cartReducer,
	},
});

// Auto-sync store states to localStorage on any dispatch
if (typeof window !== "undefined") {
	store.subscribe(() => {
		try {
			const state = store.getState();
			localStorage.setItem("genetiq.user", JSON.stringify(state.user));
			localStorage.setItem("genetiq.goals", JSON.stringify(state.goals));
			localStorage.setItem("genetiq.tests", JSON.stringify(state.tests));
			localStorage.setItem(
				"genetiq.triage",
				JSON.stringify({
					symptomsInput: state.triage.symptomsInput,
					activeAlerts: state.triage.activeAlerts,
					messages: state.triage.messages,
					selectedLanguage: state.triage.selectedLanguage,
				}),
			);
			localStorage.setItem("genetiq.genomics", JSON.stringify(state.genomics));
			localStorage.setItem("genetiq.cart", JSON.stringify(state.cart));
			localStorage.setItem("genetiq.selectedCategory", state.category.selectedCategory);
			localStorage.setItem("genetiq.uploadHistory", JSON.stringify(state.uploadHistory.records));
		} catch (e) {
			console.error("Error syncing store to localStorage", e);
		}
	});
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
