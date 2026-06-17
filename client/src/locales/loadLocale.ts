import type { Translations } from "./index";
import en from "./en.json";

export const DEFAULT_LANG = "en";
export const EN_LOCALE = en as Translations;

export const LOCALE_CODES = [
	"ar",
	"ca",
	"de",
	"en",
	"es",
	"eu",
	"fr",
	"gl",
	"hi",
	"it",
	"ja",
	"ko",
	"pl",
	"pt",
	"ru",
	"tr",
	"zh",
] as const;

export type LocaleCode = (typeof LOCALE_CODES)[number];

const localeLoaders: Record<string, () => Promise<Translations>> = {
	ar: () => import("./ar.json").then((m) => m.default as Translations),
	ca: () => import("./ca.json").then((m) => m.default as Translations),
	de: () => import("./de.json").then((m) => m.default as Translations),
	en: async () => EN_LOCALE,
	es: () => import("./es.json").then((m) => m.default as Translations),
	eu: () => import("./eu.json").then((m) => m.default as Translations),
	fr: () => import("./fr.json").then((m) => m.default as Translations),
	gl: () => import("./gl.json").then((m) => m.default as Translations),
	hi: () => import("./hi.json").then((m) => m.default as Translations),
	it: () => import("./it.json").then((m) => m.default as Translations),
	ja: () => import("./ja.json").then((m) => m.default as Translations),
	ko: () => import("./ko.json").then((m) => m.default as Translations),
	pl: () => import("./pl.json").then((m) => m.default as Translations),
	pt: () => import("./pt.json").then((m) => m.default as Translations),
	ru: () => import("./ru.json").then((m) => m.default as Translations),
	tr: () => import("./tr.json").then((m) => m.default as Translations),
	zh: () => import("./zh.json").then((m) => m.default as Translations),
};

export function isLocaleCode(code: string): code is LocaleCode {
	return code in localeLoaders;
}

export function loadLocale(code: string): Promise<Translations> {
	const loader = localeLoaders[code] ?? localeLoaders[DEFAULT_LANG];
	return loader();
}
