import { useGemmaConnection } from "./useGemmaConnection";

/** @deprecated Prefer useGemmaConnection for AI + network status */
export const useSyncStatus = () => {
	const { isNetworkOnline, mode, statusLabel } = useGemmaConnection();

	const syncStatus =
		mode === "checking"
			? ("Syncing" as const)
			: mode === "live"
				? ("Synced" as const)
				: ("Offline Vault" as const);

	return { isOnline: isNetworkOnline && mode === "live", syncStatus, statusLabel };
};
