import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { LOCALES, LOCALE_CODES, type Translations } from "../../locales";

export type LangCode = string;

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

	const supported = new Set(LOCALE_CODES);
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

function getStoredLang(): LangCode {
	if (typeof localStorage === "undefined") return resolveBrowserLang();

	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved && saved in LOCALES) return saved;

	const detected = resolveBrowserLang();
	localStorage.setItem(STORAGE_KEY, detected);
	return detected;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
	const [lang, setLangState] = useState<LangCode>(getStoredLang);
	const [dict, setDict] = useState<Translations>(
		() => LOCALES[getStoredLang()] ?? LOCALES[DEFAULT_LANG],
	);
	const fallbackDict = LOCALES[DEFAULT_LANG];

	useEffect(() => {
		document.documentElement.setAttribute(
			"dir",
			RTL_LANGS.has(lang) ? "rtl" : "ltr",
		);
		document.documentElement.setAttribute("lang", lang);
	}, [lang]);

	const setLang = (next: LangCode) => {
		if (next === lang || !(next in LOCALES)) return;
		setLangState(next);
		localStorage.setItem(STORAGE_KEY, next);
		setDict(LOCALES[next]);
		document.documentElement.setAttribute(
			"dir",
			RTL_LANGS.has(next) ? "rtl" : "ltr",
		);
		document.documentElement.setAttribute("lang", next);
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
