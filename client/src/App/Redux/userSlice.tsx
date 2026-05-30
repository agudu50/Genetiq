import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Medication {
	name: string;
	dosage: string;
	frequency: string;
}

export interface UserState {
	firstName: string;
	lastName: string;
	age: string;
	gender: string;
	height: string;
	weight: string;
	medicalConditions: string[];
	medicalOther: string;
	medications: Medication[];
	symptoms: string[];
	symptomsOther: string;
	lifestyle: {
		smoking: string;
		alcohol: string;
		exercise: string;
		diet: string;
	};
	isProfileComplete: boolean;
	isPremium: boolean;
	walletAddress: string;
	isWalletConnected: boolean;
	biologicalAge: string;
	uploadStatus: "idle" | "uploading" | "processing" | "completed";
	bloodType: string;
	allergies: string[];
	clinicalHistory: string;
}

const initialState: UserState = {
	firstName: "",
	lastName: "",
	age: "",
	gender: "",
	height: "",
	weight: "",
	medicalConditions: [],
	medicalOther: "",
	medications: [{ name: "", dosage: "", frequency: "" }],
	symptoms: [],
	symptomsOther: "",
	lifestyle: {
		smoking: "",
		alcohol: "",
		exercise: "",
		diet: "",
	},
	isProfileComplete: false,
	isPremium: false,
	walletAddress: "",
	isWalletConnected: false,
	biologicalAge: "",
	uploadStatus: "idle",
	bloodType: "",
	allergies: [],
	clinicalHistory: "",
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		updateUserInfo: (state, action: PayloadAction<Partial<UserState>>) => {
			return { ...state, ...action.payload };
		},
		updateLifestyle: (
			state,
			action: PayloadAction<Partial<UserState["lifestyle"]>>,
		) => {
			state.lifestyle = { ...state.lifestyle, ...action.payload };
		},
		setProfileComplete: (state, action: PayloadAction<boolean>) => {
			state.isProfileComplete = action.payload;
		},
		setWalletInfo: (
			state,
			action: PayloadAction<{
				walletAddress: string;
				isWalletConnected: boolean;
			}>,
		) => {
			state.walletAddress = action.payload.walletAddress;
			state.isWalletConnected = action.payload.isWalletConnected;
		},
		resetUser: () => initialState,
	},
});

export const {
	updateUserInfo,
	updateLifestyle,
	setProfileComplete,
	setWalletInfo,
	resetUser,
} = userSlice.actions;

export default userSlice.reducer;
