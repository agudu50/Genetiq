import localforage from "localforage";

// Configure the main Genetiq vault
localforage.config({
	driver: localforage.INDEXEDDB, // Force WebSQL
	name: "Genetiq",
	version: 1.0,
	storeName: "health_vault", // Should be alphanumeric, with underscores
	description: "Offline storage for Genetiq Health Data",
});

export const LocalVault = {
	// Save specific health profile data
	saveProfile: async (data: Record<string, unknown>) => {
		try {
			await localforage.setItem("profileData", data);
			return true;
		} catch (err) {
			console.error("LocalVault: Error saving profile", err);
			return false;
		}
	},

	// Retrieve saved profile data
	getProfile: async () => {
		try {
			const value = await localforage.getItem("profileData");
			return value;
		} catch (err) {
			console.error("LocalVault: Error getting profile", err);
			return null;
		}
	},

	// Save Triage History
	saveTriageHistory: async (history: Record<string, unknown>[]) => {
		try {
			await localforage.setItem("triageHistory", history);
			return true;
		} catch (err) {
			console.error("LocalVault: Error saving triage history", err);
			return false;
		}
	},

	// Retrieve Triage History
	getTriageHistory: async () => {
		try {
			const history = await localforage.getItem("triageHistory");
			return history || [];
		} catch (err) {
			console.error("LocalVault: Error getting triage history", err);
			return [];
		}
	},
	// Generic save
	save: async <T>(key: string, data: T) => {
		try {
			await localforage.setItem(key, data);
			return true;
		} catch (err) {
			console.error(`LocalVault: Error saving ${key}`, err);
			return false;
		}
	},

	// Generic get
	get: async <T>(key: string): Promise<T | null> => {
		try {
			const value = await localforage.getItem<T>(key);
			return value ?? null;
		} catch (err) {
			console.error(`LocalVault: Error getting ${key}`, err);
			return null;
		}
	},
};
