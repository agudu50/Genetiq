import React from "react";
import { useTheme } from "@/App/theme/ThemeContext";
import { Sun, Moon } from "lucide-react";
import styles from "./ThemeSwitcher.module.scss";

const ThemeSwitcher: React.FC = () => {
	const { theme, toggleTheme } = useTheme();

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			toggleTheme();
		}
	};

	return (
		<div 
			className={`${styles.switcherContainer} ${styles[theme]}`} 
			onClick={toggleTheme}
			onKeyDown={handleKeyDown}
			role="switch"
			aria-checked={theme === "dark"}
			tabIndex={0}
			aria-label="Toggle theme"
			title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
		>
			<div className={styles.indicator} />
			<div className={`${styles.iconWrapper} ${theme === "light" ? styles.active : ""}`}>
				<Sun size={14} strokeWidth={2.5} className={styles.sunIcon} />
			</div>
			<div className={`${styles.iconWrapper} ${theme === "dark" ? styles.active : ""}`}>
				<Moon size={14} strokeWidth={2.5} className={styles.moonIcon} />
			</div>
		</div>
	);
};

export default ThemeSwitcher;

