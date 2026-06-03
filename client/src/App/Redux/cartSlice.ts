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

const initialState: CartState = {
	items: [],
};

export const cartSlice = createSlice({
	name: "cart",
	initialState,
	reducers: {
		addToCart: (state, action: PayloadAction<CartItem>) => {
			const exists = state.items.some((item) => item.id === action.payload.id || item.name === action.payload.name);
			if (!exists) {
				state.items.push(action.payload);
			}
		},
		removeFromCart: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((item) => item.id !== action.payload && item.name !== action.payload);
		},
		clearCart: (state) => {
			state.items = [];
		},
	},
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
