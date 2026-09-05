import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Medication {
	name: string;
	dosage: string;
	frequency: string;
}

export interface DoctorProfile {
	doctorName: string;
	hospitalName: string;
	department: string;
	licenseNumber?: string;
	title?: string;
}

export interface UserState {
	accountType: "patient" | "doctor";
	doctorProfile?: DoctorProfile;
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

const LOCAL_STORAGE_KEY = "genetiq.user";

const defaultUserState: UserState = {
	accountType: "patient",
	doctorProfile: {
		doctorName: "Dr. Sarah Jenkins, MD",
		hospitalName: "Genetiq",
		department: "Cardiology & Internal Medicine",
		title: "Attending Physician",
	},
	firstName: "Marcus",
	lastName: "Vance",
	age: "52",
	gender: "Male",
	height: "178",
	weight: "88",
	medicalConditions: [
		"Atrial Fibrillation",
		"Elevated ApoB & Dyslipidemia",
		"Stage 2 Renal Filtration Strain",
	],
	medicalOther: "",
	medications: [
		{ name: "Atorvastatin", dosage: "40mg", frequency: "Daily (Evening)" },
		{ name: "Ezetimibe", dosage: "10mg", frequency: "Daily (Morning)" },
		{ name: "Metoprolol Succinate", dosage: "50mg", frequency: "Twice Daily" },
	],
	symptoms: [
		"Palpitations",
		"Exertional Fatigue",
		"Mild Shortness of Breath",
	],
	symptomsOther: "",
	lifestyle: {
		smoking: "Non-smoker",
		alcohol: "Occasional (1-2 drinks/week)",
		exercise: "Moderate (3x/week)",
		diet: "Mediterranean-focused",
	},
	isProfileComplete: true,
	isPremium: true,
	walletAddress: "",
	isWalletConnected: false,
	biologicalAge: "54.2",
	uploadStatus: "idle",
	bloodType: "O+",
	allergies: ["Penicillin (Mild Rash)"],
	clinicalHistory: "52yo male with history of paroxysmal atrial fibrillation, elevated ApoB particles, and early metabolic strain under cardiology follow-up.",
};

const loadUserFromStorage = (): UserState => {
	if (typeof window !== "undefined") {
		try {
			const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				return {
					...defaultUserState,
					...parsed,
					lifestyle: {
						...defaultUserState.lifestyle,
						...(parsed.lifestyle || {}),
					},
					medications:
						Array.isArray(parsed.medications) && parsed.medications.length > 0
							? parsed.medications
							: defaultUserState.medications,
					medicalConditions: Array.isArray(parsed.medicalConditions)
						? parsed.medicalConditions
						: defaultUserState.medicalConditions,
					symptoms: Array.isArray(parsed.symptoms)
						? parsed.symptoms
						: defaultUserState.symptoms,
					allergies: Array.isArray(parsed.allergies)
						? parsed.allergies
						: defaultUserState.allergies,
				};
			}
		} catch (e) {
			console.error("Error reading user from storage", e);
		}
	}
	return defaultUserState;
};

const saveUserToStorage = (state: UserState) => {
	if (typeof window !== "undefined") {
		try {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
		} catch (e) {
			console.error("Error saving user to storage", e);
		}
	}
};

const initialState: UserState = loadUserFromStorage();

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		updateUserInfo: (state, action: PayloadAction<Partial<UserState>>) => {
			const nextState = { ...state, ...action.payload };
			saveUserToStorage(nextState);
			return nextState;
		},
		setAccountType: (state, action: PayloadAction<"patient" | "doctor">) => {
			state.accountType = action.payload;
			saveUserToStorage(state);
		},
		setDoctorProfile: (state, action: PayloadAction<Partial<DoctorProfile>>) => {
			state.doctorProfile = {
				...(state.doctorProfile || defaultUserState.doctorProfile!),
				...action.payload,
			};
			saveUserToStorage(state);
		},
		updateLifestyle: (
			state,
			action: PayloadAction<Partial<UserState["lifestyle"]>>,
		) => {
			state.lifestyle = { ...state.lifestyle, ...action.payload };
			saveUserToStorage(state);
		},
		setProfileComplete: (state, action: PayloadAction<boolean>) => {
			state.isProfileComplete = action.payload;
			saveUserToStorage(state);
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
			saveUserToStorage(state);
		},
		resetUser: () => {
			if (typeof window !== "undefined") {
				try {
					localStorage.removeItem(LOCAL_STORAGE_KEY);
				} catch (e) {
					console.error("Error clearing user storage", e);
				}
			}
			return defaultUserState;
		},
	},
});

export const {
	updateUserInfo,
	setAccountType,
	setDoctorProfile,
	updateLifestyle,
	setProfileComplete,
	setWalletInfo,
	resetUser,
} = userSlice.actions;

export default userSlice.reducer;
