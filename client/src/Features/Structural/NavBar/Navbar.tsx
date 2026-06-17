import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Settings, Lock, LogOut } from "lucide-react";
import { RootState } from "@/App/Redux/store";
import { resetUser } from "@/App/Redux/userSlice";
import { AuthCredentials } from "@/App/Services/AuthCredentials";
import { paths } from "@/App/Routes/Paths";
import { prefetchRoute } from "@/App/Routes/routePrefetch";
import styles from "./Navbar.module.scss";
import NotificationHub from "./Components/NotificationsHub/NotificationsHub";
import LanguageSwitcher from "@/Features/Structural/LanguageSwitcher/LanguageSwitcher";
import ThemeSwitcher from "@/Features/Structural/ThemeSwitcher/ThemeSwitcher";
import { useLanguage } from "@/App/i18n/LanguageContext";
import DashboardIcon from "@assets/Navbar/Icons/Dashboard.svg?react";
import HistoryIcon from "@assets/Navbar/Icons/History.svg?react";
import GoalsIcon from "@assets/Navbar/Icons/Goals.svg?react";
import TestIcon from "@assets/Navbar/Icons/Test.svg?react";
import { HealthProfileWidget } from "@/Features/Dashboard/HealthProfileWidget/HealthProfileWidget";
import { AccountSettingsModal } from "./Components/AccountSettingsModal/AccountSettingsModal";
import { PasswordSecurityModal } from "./Components/PasswordSecurityModal/PasswordSecurityModal";

const Navbar = () => {
	const dispatch = useDispatch();
	const { t } = useLanguage();
	const navigate = useNavigate();
	const location = useLocation();
	const [isMobile, setIsMobile] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
	const [isPasswordSecurityOpen, setIsPasswordSecurityOpen] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const user = useSelector((state: RootState) => state.user);
	const handleLogout = () => {
		setIsProfileOpen(false);
		AuthCredentials.logout();
		dispatch(resetUser());
		toast.success("You've been signed out.");
		navigate(paths.auth.login, { replace: true });
	};

	const userInitials = useMemo(() => {
		if (user.firstName && user.lastName)
			return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
		if (user.firstName) return user.firstName[0].toUpperCase();
		return "?";
	}, [user.firstName, user.lastName]);
	// Map paths to keys for active state
	const pathToKey: Record<string, string> = {
		[paths.dashboard.root]: "dashboard_nav",
		[paths.config.goals]: "goals_nav",
		[paths.clinicalHistory]: "history_nav",
		[paths.config.tests]: "tests_nav",
	};

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

	const goTo = (path: string) => {
		prefetchRoute(path);
		navigate(path);
	};

	const prefetchOnIntent = (path: string) => () => prefetchRoute(path);

	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth <= 768);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

	// Close dropdowns on outside click
	useEffect(() => {
		const handleClick = (e: MouseEvent) => {
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
					onClick={() => goTo(paths.dashboard.root)}
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
							onClick={() => goTo(paths.dashboard.root)}
							onMouseEnter={prefetchOnIntent(paths.dashboard.root)}
							onFocus={prefetchOnIntent(paths.dashboard.root)}
						>
							{t("dashboard_nav") || "Dashboard"}
						</button>
						<button
							className={`${styles["nav-item"]} ${activeTab === "goals_nav" ? styles["nav-active"] : ""}`}
							onClick={() => goTo(paths.config.goals)}
							onMouseEnter={prefetchOnIntent(paths.config.goals)}
							onFocus={prefetchOnIntent(paths.config.goals)}
						>
							{t("goals_nav") || "Goals"}
						</button>
						<button
							className={`${styles["nav-item"]} ${activeTab === "history_nav" ? styles["nav-active"] : ""}`}
							onClick={() => goTo(paths.clinicalHistory)}
							onMouseEnter={prefetchOnIntent(paths.clinicalHistory)}
							onFocus={prefetchOnIntent(paths.clinicalHistory)}
						>
							{t("history_nav") || "History"}
						</button>
						<button
							className={`${styles["nav-item"]} ${activeTab === "tests_nav" ? styles["nav-active"] : ""}`}
							onClick={() => goTo(paths.config.tests)}
							onMouseEnter={prefetchOnIntent(paths.config.tests)}
							onFocus={prefetchOnIntent(paths.config.tests)}
						>
							{t("tests_nav") || "Tests"}
						</button>
					</nav>
				)}


				{/* Secondary actions (only visible on main dashboard/goals/history views or if mobile) */}
				{(!isConfigFlow || isMobile) && (
					<div className={styles["actions-container"]}>
						{!isMobile && <LanguageSwitcher variant="compact" />}
						<ThemeSwitcher />



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
										<span className={styles["footer-section-label"]}>
											{t("account_section")}
										</span>
										<LanguageSwitcher />
										<button
											type="button"
											className={styles["footer-btn"]}
											onClick={() => {
												setIsProfileOpen(false);
												setIsAccountSettingsOpen(true);
											}}
										>
											<Settings size={18} strokeWidth={2} />
											Account Settings
										</button>
										<button
											type="button"
											className={styles["footer-btn"]}
											onClick={() => {
												setIsProfileOpen(false);
												setIsPasswordSecurityOpen(true);
											}}
										>
											<Lock size={18} strokeWidth={2} />
											Password &amp; Security
										</button>
										<button
											type="button"
											className={`${styles["footer-btn"]} ${styles["logout-btn"]}`}
											onClick={handleLogout}
										>
											<LogOut size={18} strokeWidth={2} />
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
					paths.clinicalHistory,
					paths.config.tests,
				].includes(location.pathname) && (
					<nav className={styles["bottom-tabs"]}>
						<button
							className={`${styles["tab-item"]} ${activeTab === "dashboard_nav" ? styles["tab-active"] : ""}`}
							onClick={() => goTo(paths.dashboard.root)}
							onTouchStart={prefetchOnIntent(paths.dashboard.root)}
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
							onClick={() => goTo(paths.config.goals)}
							onTouchStart={prefetchOnIntent(paths.config.goals)}
						>
							<span className={styles["tab-icon"]}>
								<GoalsIcon />
							</span>
							<span className={styles["tab-label"]}>
								{t("goals_nav") || "Goals"}
							</span>
						</button>
						<button
							className={`${styles["tab-item"]} ${activeTab === "history_nav" ? styles["tab-active"] : ""}`}
							onClick={() => goTo(paths.clinicalHistory)}
							onTouchStart={prefetchOnIntent(paths.clinicalHistory)}
						>
							<span className={styles["tab-icon"]}>
								<HistoryIcon />
							</span>
							<span className={styles["tab-label"]}>
								{t("history_nav") || "History"}
							</span>
						</button>
						<button
							className={`${styles["tab-item"]} ${activeTab === "tests_nav" ? styles["tab-active"] : ""}`}
							onClick={() => goTo(paths.config.tests)}
							onTouchStart={prefetchOnIntent(paths.config.tests)}
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
			<AccountSettingsModal
				isOpen={isAccountSettingsOpen}
				onClose={() => setIsAccountSettingsOpen(false)}
			/>
			<PasswordSecurityModal
				isOpen={isPasswordSecurityOpen}
				onClose={() => setIsPasswordSecurityOpen(false)}
			/>
		</>
	);
};

export default Navbar;
