import { LangCode } from "./LanguageContext";

export type LanguageMeta = { code: LangCode; name: string };

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
	{ code: "en", name: "English" },
	{ code: "es", name: "Español" },
	{ code: "fr", name: "Français" },
	{ code: "de", name: "Deutsch" },
	{ code: "ar", name: "العربية" },
	{ code: "zh", name: "中文" },
	{ code: "hi", name: "हिन्दी" },
	{ code: "pt", name: "Português" },
	{ code: "ru", name: "Русский" },
	{ code: "it", name: "Italiano" },
	{ code: "ja", name: "日本語" },
	{ code: "ko", name: "한국어" },
	{ code: "tr", name: "Türkçe" },
	{ code: "pl", name: "Polski" },
	{ code: "gl", name: "Galego" },
	{ code: "eu", name: "Euskara" },
	{ code: "ca", name: "Català" },
];
