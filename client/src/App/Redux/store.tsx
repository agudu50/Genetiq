import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./categorySlice";
import userReducer from "./userSlice";
import triageReducer from "./triageSlice";
import testReducer from "./testSlice";
import goalReducer from "./goalSlice";
import genomicsReducer from "./genomicsSlice";
import uploadHistoryReducer from "./uploadHistorySlice";

const store = configureStore({
	reducer: {
		category: categoryReducer,
		user: userReducer,
		triage: triageReducer,
		tests: testReducer,
		goals: goalReducer,
		genomics: genomicsReducer,
		uploadHistory: uploadHistoryReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
