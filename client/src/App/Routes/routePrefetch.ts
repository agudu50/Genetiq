import { paths } from "./Paths";

type PrefetchFn = () => Promise<unknown>;

const routePrefetchers: Record<string, PrefetchFn> = {
	[paths.dashboard.root]: () => import("@/Views/Dashboard/Dashboard"),
	[paths.config.goals]: () => import("@/Views/UploadMethod/Goals/Goals"),
	[paths.clinicalHistory]: () => import("@/Views/HealthHistory/HealthHistory"),
	[paths.config.tests]: () => import("@/Views/UploadMethod/Tests/Tests"),
	[paths.config.root]: () => import("@/Views/UploadMethod/UploadMethod"),
	[paths.config.importOrUpload]: () =>
		import("@/Views/UploadMethod/ImportOrUpload/ImportOrUpload"),
	[paths.config.connectApp]: () =>
		import("@/Views/UploadMethod/ConnectAppDevice/ConnectAppDevice"),
	[paths.config.reports]: () => import("@/Views/UploadMethod/Reports/Reports"),
	[paths.config.genomics]: () => import("@/Views/UploadMethod/Genomics/Genomics"),
};

const prefetched = new Set<string>();

export function prefetchRoute(path: string): void {
	if (prefetched.has(path)) return;
	const prefetch = routePrefetchers[path];
	if (!prefetch) return;
	prefetched.add(path);
	void prefetch().catch(() => {
		prefetched.delete(path);
	});
}

export function prefetchMainAppRoutes(): void {
	prefetchRoute(paths.config.goals);
	prefetchRoute(paths.clinicalHistory);
	prefetchRoute(paths.config.tests);
}

// Heavy 3D assets to warm the browser HTTP cache while user is on login screen.
// fetch() only primes the cache — actual Three.js parsing happens later on the
// Dashboard. Using low-priority fetch so it never starves login page requests.
const DASHBOARD_ASSETS = [
	"/assets/models/normal/normal.obj",
	"/assets/models/normal/Body_2_baseColor.jpg",
	"/assets/models/normal/Body_2_metallic.jpg",
	"/assets/models/normal/Body_2_roughness.jpg",
	// normal map (10 MB) — load last, lowest priority
	"/assets/models/normal/Body_2_normal.png",
];

let dashboardPrefetchDone = false;

function warmAssetCache(urls: string[]): void {
	urls.forEach((url) => {
		void fetch(url, { priority: "low" as RequestPriority } as RequestInit).catch(() => {
			// silently ignore — these are best-effort cache primes
		});
	});
}

/**
 * Call this when the Login page mounts.
 * It fires chunk downloads and asset cache-warming inside an idle callback so
 * it never blocks the login page's own paint or interactions.
 */
export function prefetchDashboardOnLogin(): void {
	if (dashboardPrefetchDone) return;
	dashboardPrefetchDone = true;

	const run = () => {
		// 1. Prefetch JS chunks for Dashboard + its lazy sub-chunks
		void import("@/Views/Dashboard/Dashboard");
		void import("@/Features/DigitalTwin/Components/Three/Scene/MainScene");
		void import("@/Features/Dashboard/ConcernsWidget/ConcernsWidget");
		void import("@/Features/Dashboard/ActivityChart/ActivityChart");
		void import("@/Features/Dashboard/HealthHistoryWidget/HealthHistoryWidget");

		// 2. Warm the HTTP cache for the 3D model + body textures
		warmAssetCache(DASHBOARD_ASSETS);
	};

	if (typeof requestIdleCallback !== "undefined") {
		requestIdleCallback(run, { timeout: 3000 });
	} else {
		// Safari fallback
		setTimeout(run, 200);
	}
}

