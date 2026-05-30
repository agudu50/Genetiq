import { lazy, ComponentType } from "react";

const RELOAD_KEY = "genetiq:chunk-reload";

export function isChunkLoadError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;

	const message = error.message.toLowerCase();
	return (
		message.includes("failed to fetch dynamically imported module") ||
		message.includes("importing a module script failed") ||
		message.includes("loading chunk") ||
		message.includes("unable to preload css") ||
		message.includes("dynamically imported module")
	);
}

export function reloadForStaleAssets(): void {
	if (sessionStorage.getItem(RELOAD_KEY)) return;
	sessionStorage.setItem(RELOAD_KEY, "1");
	window.location.reload();
}

export function lazyWithRetry(
	importFn: () => Promise<{ default: ComponentType }>,
) {
	return lazy(async () => {
		try {
			const module = await importFn();
			sessionStorage.removeItem(RELOAD_KEY);
			return module;
		} catch (error) {
			if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_KEY)) {
				reloadForStaleAssets();
				return new Promise<{ default: ComponentType }>(() => {});
			}

			sessionStorage.removeItem(RELOAD_KEY);
			throw error;
		}
	});
}
