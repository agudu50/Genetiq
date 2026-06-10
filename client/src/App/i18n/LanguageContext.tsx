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
	t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
	undefined,
);

const STORAGE_KEY = "app.lang";
const DEFAULT_LANG = "en";
const RTL_LANGS = new Set(["ar", "fa", "he", "ur"]);

function interpolate(
	template: string,
	params?: Record<string, string | number>,
): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (_, token: string) =>
		params[token] !== undefined ? String(params[token]) : `{${token}}`,
	);
}

function resolveBrowserLang(): LangCode {
	if (typeof navigator === "undefined") return DEFAULT_LANG;

	const supported = new Set(
		Object.keys(import.meta.glob("../../locales/*.json")).map((path) =>
			path.split("/").pop()!.replace(".json", ""),
		),
	);

	const candidates = [
		...(navigator.languages ?? []),
		navigator.language,
	].filter(Boolean) as string[];

	for (const raw of candidates) {
		const code = raw.toLowerCase().split("-")[0];
		if (supported.has(code)) return code;
	}

	return DEFAULT_LANG;
}

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
		const saved = localStorage.getItem(STORAGE_KEY);
		const initial =
			typeof saved === "string" && saved.length > 0
				? saved
				: resolveBrowserLang();
		setLangState(initial);
		if (!saved) localStorage.setItem(STORAGE_KEY, initial);

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
		return (key: string, params?: Record<string, string | number>) => {
			const template =
				key in dict
					? dict[key]
					: key in fallbackDict
						? fallbackDict[key]
						: key;
			return interpolate(template, params);
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
