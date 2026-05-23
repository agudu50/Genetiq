import { Outlet } from "react-router-dom";
import NavBar from "@/Features/Structural/NavBar/Navbar";
import { BackgroundBlobs } from "@/Features/Structural/Background/BackgroundBlobs";
import styles from "./MainLayout.module.scss";

const MainLayout = () => {
	return (
		<div className={styles["main-layout"]}>
			<BackgroundBlobs />
			<NavBar />
			<main className={styles["content-wrapper"]}>
				<Outlet />
			</main>
		</div>
	);
};

export default MainLayout;
