import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
	theme: ThemeMode;
	setTheme: (mode: ThemeMode) => void;
	toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme-mode";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<ThemeMode>(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved === "light" || saved === "dark") return saved;
		} catch {
			// ignore storage failures
		}
		return "dark";
	});

	// Apply to document for CSS hooks
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// ignore storage failures
		}
	}, [theme]);

	const setTheme = (mode: ThemeMode) => setThemeState(mode);
	const toggleTheme = () =>
		setThemeState((m) => (m === "light" ? "dark" : "light"));

	const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
	return ctx;
}

export default ThemeContext;
