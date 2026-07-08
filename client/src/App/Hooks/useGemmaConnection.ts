import { useCallback, useEffect, useState } from "react";
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

const POLL_MS = 15_000;

type SharedSnapshot = {
	isNetworkOnline: boolean;
	health: GemmaHealthStatus | null;
	checking: boolean;
};

type Listener = () => void;

let shared: SharedSnapshot = {
	isNetworkOnline: typeof navigator !== "undefined" && navigator.onLine,
	health: null,
	checking: true,
};

const listeners = new Set<Listener>();
let bootstrapped = false;
let checkInFlight: Promise<void> | null = null;

function emit() {
	listeners.forEach((l) => l());
}

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

	if (health?.available && health.modelLoaded) {
		const cpu = health.device === "cpu";
		return {
			mode: "live",
			statusLabel: "Genetiq AI live",
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

	return {
		mode: "offline",
		statusLabel: "Offline mode",
		gemmaOnline: false,
		gemmaAvailable: false,
		cpuFastMode: false,
		supportsVision: false,
	};
}

async function runHealthCheck(force = false): Promise<void> {
	if (checkInFlight) return checkInFlight;

	checkInFlight = (async () => {
		shared = { ...shared, checking: true };
		emit();
		try {
			const result = await checkGemmaHealth(force);
			shared = { ...shared, health: result, checking: false };
		} catch {
			shared = { ...shared, checking: false };
		} finally {
			emit();
			checkInFlight = null;
		}
	})();

	return checkInFlight;
}

function bootstrapListeners() {
	if (bootstrapped) return;
	bootstrapped = true;

	void runHealthCheck(true);

	const onOnline = () => {
		shared = { ...shared, isNetworkOnline: true };
		emit();
		invalidateGemmaHealthCache();
		void runHealthCheck(true);
	};
	const onOffline = () => {
		shared = { ...shared, isNetworkOnline: false };
		emit();
	};
	const onFocus = () => {
		invalidateGemmaHealthCache();
		void runHealthCheck(true);
	};
	const onVisibility = () => {
		if (document.visibilityState === "visible") {
			invalidateGemmaHealthCache();
			void runHealthCheck(true);
		}
	};

	window.addEventListener("online", onOnline);
	window.addEventListener("offline", onOffline);
	window.addEventListener("focus", onFocus);
	document.addEventListener("visibilitychange", onVisibility);

	setInterval(() => void runHealthCheck(false), POLL_MS);
}

export function useGemmaConnection(): GemmaConnectionState {
	const [, tick] = useState(0);

	useEffect(() => {
		bootstrapListeners();
		const listener = () => tick((n) => n + 1);
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}, []);

	const refresh = useCallback(async () => {
		invalidateGemmaHealthCache();
		await runHealthCheck(true);
	}, []);

	const derived = deriveMode(shared.isNetworkOnline, shared.health, shared.checking);

	return {
		isNetworkOnline: shared.isNetworkOnline,
		...derived,
		refresh,
	};
}
