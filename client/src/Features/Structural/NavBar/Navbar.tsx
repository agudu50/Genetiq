import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import styles from "./Navbar.module.scss";
import NotificationHub from "./Components/NotificationsHub/NotificationsHub";
import LanguageSwitcher from "@/Features/Structural/LanguageSwitcher/LanguageSwitcher";
import ThemeSwitcher from "@/Features/Structural/ThemeSwitcher/ThemeSwitcher";
import { useLanguage } from "@/App/i18n/LanguageContext";
import DashboardIcon from "@assets/Navbar/Icons/Dashboard.svg?react";
import ReportsIcon from "@assets/Navbar/Icons/Reports.svg?react";
import GoalsIcon from "@assets/Navbar/Icons/Goals.svg?react";
import TestIcon from "@assets/Navbar/Icons/Test.svg?react";
import { HealthProfileWidget } from "@/Features/Dashboard/HealthProfileWidget/HealthProfileWidget";

const Navbar = () => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const location = useLocation();
	const [isMobile, setIsMobile] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const moreRef = useRef<HTMLDivElement>(null);
	const profileRef = useRef<HTMLDivElement>(null);
	const userName = "John Doe";
	const userInitials = userName
		.split(" ")
		.map((n) => n[0])
		.join("");
	// Map paths to keys for active state
	const pathToKey: Record<string, string> = {
		[paths.dashboard.root]: "dashboard_nav",
		[paths.config.goals]: "goals_nav",
		[paths.config.reports]: "reports_nav",
		[paths.config.tests]: "tests_nav",
	};

	const isDashboardRoot = useMemo(() => {
		return location.pathname === paths.dashboard.root;
	}, [location.pathname]);

	const isConfigFlow = useMemo(() => {
		return [
			paths.config.root,
			paths.config.importOrUpload,
			paths.config.connectApp,
		].includes(location.pathname);
	}, [location.pathname]);

	const activeTab = useMemo(() => {
		const currentPath = location.pathname;
		return pathToKey[currentPath] || "dashboard_nav";
	}, [location.pathname]);

	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth <= 768);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

	// Close dropdowns on outside click
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
			if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
				setMoreOpen(false);
			}
			if (
				profileRef.current &&
				!profileRef.current.contains(e.target as Node)
			) {
				setIsProfileOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	return (
		<>
			<div className={styles["navbar-container"]}>
				<div
					className={styles["logo-wrapper"]}
					onClick={() => navigate(paths.dashboard.root)}
				>
					<img
						src='/assets/genetiq_logo_v2.png'
						alt='Genetiq Logo'
						className={styles.logoImage}
					/>
					<span className={styles.logoText}>Genetiq</span>
				</div>

				{/* Desktop Navigation */}
				{!isMobile && !isConfigFlow && (
					<nav className={styles["desktop-nav"]}>
						<button
							className={`${styles["nav-item"]} ${activeTab === "dashboard_nav" ? styles["nav-active"] : ""}`}
							onClick={() => navigate(paths.dashboard.root)}
						>
							{t("dashboard_nav") || "Dashboard"}
						</button>
						<button
							className={`${styles["nav-item"]} ${activeTab === "goals_nav" ? styles["nav-active"] : ""}`}
							onClick={() => navigate(paths.config.goals)}
						>
							{t("goals_nav") || "Goals"}
						</button>
						<button
							className={`${styles["nav-item"]} ${activeTab === "reports_nav" ? styles["nav-active"] : ""}`}
							onClick={() => navigate(paths.config.reports)}
						>
							{t("reports_nav") || "Reports"}
						</button>
						<button
							className={`${styles["nav-item"]} ${activeTab === "tests_nav" ? styles["nav-active"] : ""}`}
							onClick={() => navigate(paths.config.tests)}
						>
							{t("tests_nav") || "Tests"}
						</button>
					</nav>
				)}

	


				{/* Secondary actions (only visible on Dashboard or if mobile) */}
				{(isDashboardRoot || isMobile) && (
					<div className={styles["actions-container"]}>
						{/* Desktop: show inline | Mobile: hide behind "more" */}
						{!isMobile && (
							<ThemeSwitcher />
						)}

						{/* Mobile "more" menu for secondary actions */}
						{isMobile && (
							<div className={styles["more-wrapper"]} ref={moreRef}>
								<button
									className={styles["more-btn"]}
									onClick={() => setMoreOpen((v) => !v)}
									aria-label='More options'
								>
									<svg
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2.5'
										strokeLinecap='round'
										strokeLinejoin='round'
									>
										<line x1='12' y1='5' x2='12' y2='19' />
										<line x1='5' y1='12' x2='19' y2='12' />
									</svg>
								</button>
								{moreOpen && (
									<div className={styles["more-dropdown"]}>
										<div className={styles["dropdown-section"]}>
											<h4 className={styles["section-title"]}>
												{t("quick_actions") || "Quick Actions"}
											</h4>
											<div className={styles["quick-actions-grid"]}>
												<button
													className={styles["menu-item"]}
													onClick={() => {
														navigate(paths.log.vitals);
														setMoreOpen(false);
													}}
												>
													<span className={styles["item-icon"]}>❤️</span>
													<span className={styles["item-label"]}>
														{t("log_vitals") || "Log Vitals"}
													</span>
												</button>
												<button
													className={styles["menu-item"]}
													onClick={() => {
														navigate(paths.log.meal);
														setMoreOpen(false);
													}}
												>
													<span className={styles["item-icon"]}>🥗</span>
													<span className={styles["item-label"]}>
														{t("track_meal") || "Track Meal"}
													</span>
												</button>
												<button
													className={styles["menu-item"]}
													onClick={() => {
														navigate(paths.log.exercise);
														setMoreOpen(false);
													}}
												>
													<span className={styles["item-icon"]}>🏃</span>
													<span className={styles["item-label"]}>
														{t("log_exercise") || "Log Exercise"}
													</span>
												</button>
												<button
													className={styles["menu-item"]}
													onClick={() => {
														navigate(paths.aiAssistant);
														setMoreOpen(false);
													}}
												>
													<span className={styles["item-icon"]}>🤖</span>
													<span className={styles["item-label"]}>
														{t("ai_assistant") || "AI Assistant"}
													</span>
												</button>
											</div>
										</div>
										<div className={styles["dropdown-divider"]} />
										<div className={styles["more-item"]}>
											<ThemeSwitcher />
										</div>
									</div>
								)}
							</div>
						)}

						<NotificationHub IsBadge={true} />
						{/* Enhanced Profile Button with Dropdown */}
						<div className={styles["profile-wrapper"]} ref={profileRef}>
							<button
								className={`${styles["profile-btn"]} ${isProfileOpen ? styles["active"] : ""}`}
								onClick={() => setIsProfileOpen(!isProfileOpen)}
								aria-label="User Profile"
							>
								<div className={styles["avatar"]}>{userInitials}</div>
							</button>

							{/* Profile Dropdown Hub */}
							{isProfileOpen && (
								<div className={styles["profile-dropdown"]}>
									<div className={styles["profile-dropdown-content"]}>
										<HealthProfileWidget />
									</div>

									<div className={styles["profile-dropdown-divider"]} />

									<div className={styles["profile-dropdown-footer"]}>
										<LanguageSwitcher />
										<button className={styles["footer-btn"]}>
											<svg
												width='18'
												height='18'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z' />
												<circle cx='12' cy='12' r='3' />
											</svg>
											Account Settings
										</button>
										<button
											className={`${styles["footer-btn"]} ${styles["logout-btn"]}`}
										>
											<svg
												width='18'
												height='18'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
												<polyline points='16 17 21 12 16 7' />
												<line x1='21' y1='12' x2='9' y2='12' />
											</svg>
											Log Out
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Mobile bottom tab bar - visible on Dashboard, Goals, Reports, and Tests */}
			{isMobile &&
				[
					paths.dashboard.root,
					paths.config.goals,
					paths.config.reports,
					paths.config.tests,
				].includes(location.pathname) && (
					<nav className={styles["bottom-tabs"]}>
						<button
							className={`${styles["tab-item"]} ${activeTab === "dashboard_nav" ? styles["tab-active"] : ""}`}
							onClick={() => navigate(paths.dashboard.root)}
						>
							<span className={styles["tab-icon"]}>
								<DashboardIcon />
							</span>
							<span className={styles["tab-label"]}>
								{t("dashboard_nav") || "Dashboard"}
							</span>
						</button>
						<button
							className={`${styles["tab-item"]} ${activeTab === "goals_nav" ? styles["tab-active"] : ""}`}
							onClick={() => navigate(paths.config.goals)}
						>
							<span className={styles["tab-icon"]}>
								<GoalsIcon />
							</span>
							<span className={styles["tab-label"]}>
								{t("goals_nav") || "Goals"}
							</span>
						</button>
						<button
							className={`${styles["tab-item"]} ${activeTab === "reports_nav" ? styles["tab-active"] : ""}`}
							onClick={() => navigate(paths.config.reports)}
						>
							<span className={styles["tab-icon"]}>
								<ReportsIcon />
							</span>
							<span className={styles["tab-label"]}>
								{t("reports_nav") || "Reports"}
							</span>
						</button>
						<button
							className={`${styles["tab-item"]} ${activeTab === "tests_nav" ? styles["tab-active"] : ""}`}
							onClick={() => navigate(paths.config.tests)}
						>
							<span className={styles["tab-icon"]}>
								<TestIcon />
							</span>
							<span className={styles["tab-label"]}>
								{t("tests_nav") || "Tests"}
							</span>
						</button>
					</nav>
				)}
		</>
	);
};

export default Navbar;
