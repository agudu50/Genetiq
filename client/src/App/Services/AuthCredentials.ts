import { LocalVault } from "./LocalVault";

export const AUTH_KEYS = {
	SESSION: "genetiq_session",
	EMAIL: "genetiq_remembered_email",
	REMEMBER: "genetiq_remember_me",
	CREDENTIALS: "genetiq_credentials",
} as const;

export type StoredCredentials = {
	email: string;
	passwordHash: string;
	updatedAt: string;
};

const PASSWORD_SALT = "genetiq-local-v1";

async function hashPassword(password: string): Promise<string> {
	const data = new TextEncoder().encode(`${PASSWORD_SALT}:${password}`);
	const buffer = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buffer))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export const AuthCredentials = {
	async get(): Promise<StoredCredentials | null> {
		return LocalVault.get<StoredCredentials>(AUTH_KEYS.CREDENTIALS);
	},

	async hasPassword(): Promise<boolean> {
		const stored = await this.get();
		return Boolean(stored?.passwordHash);
	},

	async save(email: string, password: string): Promise<boolean> {
		const passwordHash = await hashPassword(password);
		return LocalVault.save(AUTH_KEYS.CREDENTIALS, {
			email: normalizeEmail(email),
			passwordHash,
			updatedAt: new Date().toISOString(),
		});
	},

	async verify(email: string, password: string): Promise<boolean> {
		const stored = await this.get();
		if (!stored?.passwordHash) return false;

		const passwordHash = await hashPassword(password);
		return (
			stored.email === normalizeEmail(email) &&
			stored.passwordHash === passwordHash
		);
	},

	async updatePassword(
		currentPassword: string,
		newPassword: string,
	): Promise<{ ok: true } | { ok: false; error: string }> {
		const stored = await this.get();
		if (!stored) {
			return { ok: false, error: "No account found. Please sign in again." };
		}

		const currentValid = await this.verify(stored.email, currentPassword);
		if (!currentValid) {
			return { ok: false, error: "Current password is incorrect." };
		}

		const saved = await this.save(stored.email, newPassword);
		if (!saved) {
			return { ok: false, error: "Could not save your new password." };
		}

		return { ok: true };
	},

	async createPassword(
		email: string,
		newPassword: string,
	): Promise<{ ok: true } | { ok: false; error: string }> {
		if (!email.trim()) {
			return { ok: false, error: "Email is required to set a password." };
		}

		const saved = await this.save(email, newPassword);
		if (!saved) {
			return { ok: false, error: "Could not save your password." };
		}

		return { ok: true };
	},
};
