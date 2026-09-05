import { lazy, ComponentType } from "react";

const RELOAD_KEY = "genetiq:chunk-reload";

export function isChunkLoadError(error: unknown): boolean {
	if (!error) return false;
	const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
	return (
		message.includes("failed to fetch dynamically imported module") ||
		message.includes("importing a module script failed") ||
		message.includes("loading chunk") ||
		message.includes("unable to preload css") ||
		message.includes("dynamically imported module") ||
		message.includes("failed to fetch") ||
		message.includes("networkerror")
	);
}

export function reloadForStaleAssets(): void {
	if (sessionStorage.getItem(RELOAD_KEY)) {
		sessionStorage.removeItem(RELOAD_KEY);
		window.location.href = "/dashboard";
		return;
	}
	sessionStorage.setItem(RELOAD_KEY, "1");
	window.location.reload();
}

async function retryImport<T>(
	importFn: () => Promise<T>,
	retries = 3,
	delay = 150,
): Promise<T> {
	try {
		return await importFn();
	} catch (err) {
		if (retries <= 1) throw err;
		await new Promise((resolve) => setTimeout(resolve, delay));
		return retryImport(importFn, retries - 1, delay * 2);
	}
}

export function lazyWithRetry(
	importFn: () => Promise<{ default: ComponentType<any> }>,
) {
	return lazy(async () => {
		try {
			const module = await retryImport(importFn);
			sessionStorage.removeItem(RELOAD_KEY);
			return module;
		} catch (error) {
			if (isChunkLoadError(error)) {
				reloadForStaleAssets();
				return new Promise<{ default: ComponentType<any> }>(() => {});
			}
			throw error;
		}
	});
}

