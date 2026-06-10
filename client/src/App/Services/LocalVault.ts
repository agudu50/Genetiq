// Configure the main Genetiq vault using standard localStorage

const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isBlockedKey(key: string): boolean {
	return BLOCKED_KEYS.has(key);
}

export const LocalVault = {
	// Save specific health profile data
	saveProfile: async (data: Record<string, unknown>) => {
		try {
			localStorage.setItem("profileData", JSON.stringify(data));
			return true;
		} catch (err) {
			console.error("LocalVault: Error saving profile", err);
			return false;
		}
	},

	// Retrieve saved profile data
	getProfile: async () => {
		try {
			const value = localStorage.getItem("profileData");
			return value ? JSON.parse(value) : null;
		} catch (err) {
			console.error("LocalVault: Error getting profile", err);
			return null;
		}
	},

	// Save Triage History
	saveTriageHistory: async (history: Record<string, unknown>[]) => {
		try {
			localStorage.setItem("triageHistory", JSON.stringify(history));
			return true;
		} catch (err) {
			console.error("LocalVault: Error saving triage history", err);
			return false;
		}
	},

	// Retrieve Triage History
	getTriageHistory: async () => {
		try {
			const history = localStorage.getItem("triageHistory");
			return history ? JSON.parse(history) : [];
		} catch (err) {
			console.error("LocalVault: Error getting triage history", err);
			return [];
		}
	},

	// Generic save
	save: async <T>(key: string, data: T) => {
		if (isBlockedKey(key)) {
			return false;
		}
		try {
			localStorage.setItem(key, JSON.stringify(data));
			return true;
		} catch (err) {
			console.error(`LocalVault: Error saving ${key}`, err);
			return false;
		}
	},

	// Generic get
	get: async <T>(key: string): Promise<T | null> => {
		if (isBlockedKey(key)) {
			return null;
		}
		try {
			const value = localStorage.getItem(key);
			return value ? (JSON.parse(value) as T) : null;
		} catch (err) {
			console.error(`LocalVault: Error getting ${key}`, err);
			return null;
		}
	},

	// Generic remove
	remove: async (key: string) => {
		if (isBlockedKey(key)) {
			return false;
		}
		try {
			localStorage.removeItem(key);
			return true;
		} catch (err) {
			console.error(`LocalVault: Error removing ${key}`, err);
			return false;
		}
	},
};
