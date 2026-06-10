import ar from "./ar.json";
import ca from "./ca.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import eu from "./eu.json";
import fr from "./fr.json";
import gl from "./gl.json";
import hi from "./hi.json";
import it from "./it.json";
import ja from "./ja.json";
import ko from "./ko.json";
import pl from "./pl.json";
import pt from "./pt.json";
import ru from "./ru.json";
import tr from "./tr.json";
import zh from "./zh.json";

export type Translations = Record<string, string>;

export const LOCALES: Record<string, Translations> = {
	ar: ar as Translations,
	ca: ca as Translations,
	de: de as Translations,
	en: en as Translations,
	es: es as Translations,
	eu: eu as Translations,
	fr: fr as Translations,
	gl: gl as Translations,
	hi: hi as Translations,
	it: it as Translations,
	ja: ja as Translations,
	ko: ko as Translations,
	pl: pl as Translations,
	pt: pt as Translations,
	ru: ru as Translations,
	tr: tr as Translations,
	zh: zh as Translations,
};

export const LOCALE_CODES = Object.keys(LOCALES);
