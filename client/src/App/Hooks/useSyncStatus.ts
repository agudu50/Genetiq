import { useState, useEffect } from "react";

export const useSyncStatus = () => {
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [syncStatus, setSyncStatus] = useState<
		"Synced" | "Offline Vault" | "Syncing"
	>("Synced");

	useEffect(() => {
		const handleOnline = () => {
			setIsOnline(true);
			setSyncStatus("Syncing");
			// Simulate sync delay
			setTimeout(() => setSyncStatus("Synced"), 1500);
		};

		const handleOffline = () => {
			setIsOnline(false);
			setSyncStatus("Offline Vault");
		};

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		// Initial check
		if (!navigator.onLine) {
			setSyncStatus("Offline Vault");
		}

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	return { isOnline, syncStatus };
};
