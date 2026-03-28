import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

export type LangCode = string; // ISO code, e.g., 'en', 'es', 'fr', 'de', 'ar', 'zh', etc.

type Translations = Record<string, string>;

export type LanguageContextValue = {
	lang: LangCode;
	setLang: (lang: LangCode) => void;
	t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
	undefined,
);

const STORAGE_KEY = "app.lang";
const DEFAULT_LANG = "en";
const RTL_LANGS = new Set(["ar", "fa", "he", "ur"]); // basic RTL list

// Vite: index locale JSONs; we'll lazy-load on demand
const localeModules = import.meta.glob("../../locales/*.json");

async function loadLocale(lang: string): Promise<Translations | null> {
	const match = Object.entries(localeModules).find(([path]) =>
		path.endsWith(`/${lang}.json`),
	);
	if (!match) return null;
	const mod: unknown = await match[1]();

	// Type-guard to detect modules that export a `default` (ES module) vs plain JSON
	const isModuleWithDefault = (m: unknown): m is { default: Translations } =>
		typeof m === "object" &&
		m !== null &&
		"default" in (m as Record<string, unknown>) &&
		typeof (m as Record<string, unknown>).default === "object";

	if (isModuleWithDefault(mod)) return mod.default;
	if (typeof mod === "object" && mod !== null) return mod as Translations;
	return null;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
	const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);
	const [dict, setDict] = useState<Translations>({});
	const [fallbackDict, setFallbackDict] = useState<Translations>({});

	// Load initial language + English fallback
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
		const initial = typeof saved === "string" ? saved : DEFAULT_LANG;
		setLangState(initial);

		(async () => {
			const [primary, fallback] = await Promise.all([
				loadLocale(initial),
				loadLocale(DEFAULT_LANG),
			]);
			setDict(primary || {});
			setFallbackDict(fallback || {});
			// update document attributes
			document.documentElement.setAttribute(
				"dir",
				RTL_LANGS.has(initial) ? "rtl" : "ltr",
			);
			document.documentElement.setAttribute("lang", initial);
		})();
	}, []);

	const setLang = (next: LangCode) => {
		if (next === lang) return;
		setLangState(next);
		localStorage.setItem(STORAGE_KEY, next);
		(async () => {
			const primary = await loadLocale(next);
			setDict(primary || {});
			// refresh fallback as well (helps in dev)
			const fallback = await loadLocale(DEFAULT_LANG);
			setFallbackDict(fallback || {});
			document.documentElement.setAttribute(
				"dir",
				RTL_LANGS.has(next) ? "rtl" : "ltr",
			);
			document.documentElement.setAttribute("lang", next);
		})();
	};

	const t = useMemo(() => {
		return (key: string) => {
			if (key in dict) return dict[key];
			if (key in fallbackDict) return fallbackDict[key];
			return key;
		};
	}, [dict, fallbackDict]);

	const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

	return (
		<LanguageContext.Provider value={value}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const ctx = useContext(LanguageContext);
	if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
	return ctx;
}
