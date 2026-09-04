import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
	id: string;
	name: string;
	description?: string;
	price?: string;
	icon?: string;
}

export interface CartState {
	items: CartItem[];
}

const LOCAL_STORAGE_KEY = "genetiq.cart";

const loadCartFromStorage = (): CartState => {
	if (typeof window !== "undefined") {
		try {
			const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				if (parsed && Array.isArray(parsed.items)) {
					return { items: parsed.items };
				}
			}
		} catch (e) {
			console.error("Error reading cart from storage", e);
		}
	}
	return { items: [] };
};

const saveCartToStorage = (state: CartState) => {
	if (typeof window !== "undefined") {
		try {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
		} catch (e) {
			console.error("Error saving cart to storage", e);
		}
	}
};

const initialState: CartState = loadCartFromStorage();

export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addToCart: (state, action: PayloadAction<CartItem>) => {
			const exists = state.items.some(
				(item) => item.id === action.payload.id || item.name === action.payload.name,
			);
			if (!exists) {
				state.items.push(action.payload);
				saveCartToStorage(state);
			}
		},
		removeFromCart: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter(
				(item) => item.id !== action.payload && item.name !== action.payload,
			);
			saveCartToStorage(state);
		},
		clearCart: (state) => {
			state.items = [];
			saveCartToStorage(state);
		},
	},
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
