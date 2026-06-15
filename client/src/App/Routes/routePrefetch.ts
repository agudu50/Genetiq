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
