import { useCallback, useEffect, useRef, useState } from "react";
import {
	checkGemmaHealth,
	invalidateGemmaHealthCache,
	type GemmaHealthStatus,
} from "@/App/Services/GemmaService";

export type AiConnectionMode = "checking" | "live" | "starting" | "offline";

export type GemmaConnectionState = {
	isNetworkOnline: boolean;
	gemmaOnline: boolean;
	gemmaAvailable: boolean;
	cpuFastMode: boolean;
	supportsVision: boolean;
	mode: AiConnectionMode;
	statusLabel: string;
	refresh: () => Promise<void>;
};

const POLL_MS = 20_000;

function deriveMode(
	networkOnline: boolean,
	health: GemmaHealthStatus | null,
	checking: boolean,
): Pick<GemmaConnectionState, "mode" | "statusLabel" | "gemmaOnline" | "gemmaAvailable" | "cpuFastMode" | "supportsVision"> {
	if (checking && !health) {
		return {
			mode: "checking",
			statusLabel: "Checking AI…",
			gemmaOnline: false,
			gemmaAvailable: false,
			cpuFastMode: false,
			supportsVision: false,
		};
	}

	if (!networkOnline && !health?.available) {
		return {
			mode: "offline",
			statusLabel: "No connection",
			gemmaOnline: false,
			gemmaAvailable: false,
			cpuFastMode: false,
			supportsVision: false,
		};
	}

	if (health?.modelLoaded) {
		const cpu = health.device === "cpu";
		return {
			mode: "live",
			statusLabel: cpu ? "Gemma AI live (CPU)" : "Gemma AI live",
			gemmaOnline: true,
			gemmaAvailable: true,
			cpuFastMode: cpu,
			supportsVision: health.supportsVision,
		};
	}

	if (health?.available) {
		return {
			mode: "starting",
			statusLabel: "AI starting up…",
			gemmaOnline: false,
			gemmaAvailable: true,
			cpuFastMode: false,
			supportsVision: health.supportsVision,
		};
	}

	return {
		mode: "offline",
		statusLabel: "Offline mode",
		gemmaOnline: false,
		gemmaAvailable: false,
		cpuFastMode: false,
		supportsVision: false,
	};
}

export function useGemmaConnection(): GemmaConnectionState {
	const [isNetworkOnline, setIsNetworkOnline] = useState(
		() => typeof navigator !== "undefined" && navigator.onLine,
	);
	const [health, setHealth] = useState<GemmaHealthStatus | null>(null);
	const [checking, setChecking] = useState(true);
	const mountedRef = useRef(true);

	const refresh = useCallback(async (force = true) => {
		if (force) invalidateGemmaHealthCache();
		setChecking(true);
		try {
			const result = await checkGemmaHealth(force);
			if (mountedRef.current) setHealth(result);
		} catch {
			if (mountedRef.current) {
				setHealth({
					available: false,
					modelLoaded: false,
					modelId: "",
					device: "none",
					supportsVision: false,
				});
			}
		} finally {
			if (mountedRef.current) setChecking(false);
		}
	}, []);

	useEffect(() => {
		mountedRef.current = true;
		void refresh(true);

		const onOnline = () => {
			setIsNetworkOnline(true);
			void refresh(true);
		};
		const onOffline = () => setIsNetworkOnline(false);
		const onFocus = () => void refresh(true);
		const onVisibility = () => {
			if (document.visibilityState === "visible") void refresh(true);
		};

		window.addEventListener("online", onOnline);
		window.addEventListener("offline", onOffline);
		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVisibility);

		const pollId = window.setInterval(() => void refresh(true), POLL_MS);

		return () => {
			mountedRef.current = false;
			window.removeEventListener("online", onOnline);
			window.removeEventListener("offline", onOffline);
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVisibility);
			clearInterval(pollId);
		};
	}, [refresh]);

	const derived = deriveMode(isNetworkOnline, health, checking);

	return {
		isNetworkOnline,
		...derived,
		refresh: () => refresh(true),
	};
}
