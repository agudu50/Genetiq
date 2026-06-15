import { Outlet, useNavigation } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "@/Features/Structural/NavBar/Navbar";
import { BackgroundBlobs } from "@/Features/Structural/Background/BackgroundBlobs";
import { RouteLoadingFallback } from "@/App/Components/RouteLoadingFallback/RouteLoadingFallback";
import { prefetchMainAppRoutes } from "@/App/Routes/routePrefetch";
import styles from "./MainLayout.module.scss";

const MainLayout = () => {
	const navigation = useNavigation();
	const isNavigating = navigation.state === "loading";

	useEffect(() => {
		const prefetch = () => prefetchMainAppRoutes();

		if (typeof window.requestIdleCallback === "function") {
			const id = window.requestIdleCallback(prefetch, { timeout: 2500 });
			return () => window.cancelIdleCallback(id);
		}

		const timeout = window.setTimeout(prefetch, 1200);
		return () => window.clearTimeout(timeout);
	}, []);

	return (
		<div className={styles["main-layout"]}>
			<BackgroundBlobs />
			<NavBar />
			<main className={styles["content-wrapper"]}>
				{isNavigating && <RouteLoadingFallback overlay />}
				<Outlet />
			</main>
		</div>
	);
};

export default MainLayout;
