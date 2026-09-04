import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CategoryState {
	selectedCategory: string;
}

const LOCAL_STORAGE_KEY = "genetiq.selectedCategory";

const loadCategoryFromStorage = (): string => {
	if (typeof window !== "undefined") {
		try {
			const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (stored) return stored;
		} catch (e) {
			console.error("Error reading category from storage", e);
		}
	}
	return "total";
};

const initialState: CategoryState = {
	selectedCategory: loadCategoryFromStorage(),
};

const categorySlice = createSlice({
	name: "category",
	initialState,
	reducers: {
		setCategory: (state, action: PayloadAction<string>) => {
			state.selectedCategory = action.payload;
			if (typeof window !== "undefined") {
				try {
					localStorage.setItem(LOCAL_STORAGE_KEY, action.payload);
				} catch (e) {
					console.error("Error saving category to storage", e);
				}
			}
		},
	},
});

export const { setCategory } = categorySlice.actions;
export default categorySlice.reducer;
