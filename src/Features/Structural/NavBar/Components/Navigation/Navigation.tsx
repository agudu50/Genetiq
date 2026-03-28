import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { paths } from "@/App/Routes/Paths";
import styles from "./Navigation.module.scss";
import { useLanguage } from "@/App/i18n/LanguageContext";

// Importing SVGs as React Components
import DashboardIcon from "@assets/Navbar/Icons/Dashboard.svg?react";

interface NavigationProps {
	onClick?: (selected: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onClick }) => {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const location = useLocation();

	// Map paths to keys for active state
	const pathToKey: Record<string, string> = {
		[paths.dashboard.root]: "dashboard_nav",
	};

	const selected = useMemo(() => {
		const currentPath = location.pathname;
		return pathToKey[currentPath] || "dashboard_nav";
	}, [location.pathname]);

	const keyToPath: Record<string, string> = {
		dashboard_nav: paths.dashboard.root,
	};

	const handleClick = (key: string) => {
		const path = keyToPath[key];
		if (path) {
			navigate(path);
		}
		if (onClick) {
			onClick(key);
		}
	};

	// Buttons array with correct icons
	const buttons = [{ key: "dashboard_nav", icon: <DashboardIcon /> }];

	return (
		<div className={styles["navigation-container"]}>
			{buttons.map((button) => (
				<button
					key={button.key}
					className={`${selected === button.key ? styles["selected"] : ""}`}
					onClick={() => handleClick(button.key)}
				>
					<span className={styles.icon}>{button.icon}</span>

					{t(button.key)}
				</button>
			))}
		</div>
	);
};

export default Navigation;
