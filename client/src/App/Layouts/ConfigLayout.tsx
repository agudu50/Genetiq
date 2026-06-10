import { Outlet, useNavigate } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import ThemeSwitcher from "@/Features/Structural/ThemeSwitcher/ThemeSwitcher";
import LanguageSwitcher from "@/Features/Structural/LanguageSwitcher/LanguageSwitcher";
import styles from "./ConfigLayout.module.scss";

export const ConfigLayout = () => {
	const navigate = useNavigate();

	return (
		<div className={styles.container}>
			{/* ── Navbar ── */}
			<nav className={styles.nav}>
				{/* Brand */}
				<button className={styles.brand} onClick={() => navigate(paths.config.root)}>
					<img src="/assets/genetiq_logo_v2.png" alt="Genetiq" className={styles.logo} />
					<span className={styles.brandName}>Genetiq</span>
				</button>

				<div className={styles.navActions}>
					<div className={styles.navLang}>
						<LanguageSwitcher variant="compact" />
					</div>
					<ThemeSwitcher />
				</div>
			</nav>

			{/* ── Page content ── */}
			<main className={styles.main}>
				<Outlet />
			</main>
		</div>
	);
};
