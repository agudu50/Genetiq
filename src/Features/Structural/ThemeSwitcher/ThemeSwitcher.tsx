import React from "react";
import { useTheme } from "@/App/theme/ThemeContext";
import styles from "./ThemeSwitcher.module.scss";

const ThemeSwitcher: React.FC = () => {
	const { theme, toggleTheme } = useTheme();
	return (
		<button
			type='button'
			aria-label='Toggle theme'
			className={styles.switcher}
			onClick={toggleTheme}
			title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
		>
			{theme === "light" ? "🌞" : "🌙"}
		</button>
	);
};

export default ThemeSwitcher;
