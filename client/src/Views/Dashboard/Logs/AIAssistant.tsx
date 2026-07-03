import { useState, useRef, useEffect } from "react";
import {
	Bot, Send, Sparkles, ImagePlus, X,
	Phone, Heart, Leaf, AlertTriangle, Shield,
	Wifi, WifiOff, Stethoscope,
	ChevronRight,
} from "lucide-react";
import {
	chatWithGemma,
	analyzeLabResults,
	checkGemmaHealth,
	GHANAIAN_REMEDIES,
	EMERGENCY_CONTACTS,
} from "@/App/Services/GemmaService";
import type { GemmaLanguage, GemmaAnalysisResult } from "@/App/Services/GemmaService";
import styles from "./AIAssistant.module.scss";

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = "chat" | "scanner" | "remedies" | "emergency";

const LANGUAGES: { id: GemmaLanguage; label: string; flag: string; code: string }[] = [
	{ id: "english", label: "English", flag: "🇬🇧", code: "EN" },
	{ id: "twi", label: "Twi", flag: "🇬🇭", code: "TW" },
	{ id: "ga", label: "Ga", flag: "🇬🇭", code: "GA" },
	{ id: "ewe", label: "Ewe", flag: "🇬🇭", code: "EW" },
	{ id: "fante", label: "Fante", flag: "🇬🇭", code: "FT" },
];

const LOCALIZED_TEXTS: Record<GemmaLanguage, Record<string, string>> = {
	english: {
		welcome_title: "Gemma 4 Health Portal",
		welcome_sub: "Powered by Google Gemma 4 — Built for Ghana 🇬🇭",
		chat_tab: "AI Chat",
		scanner_tab: "Lab Scanner",
		remedies_tab: "Remedy Guide",
		emergency_tab: "Emergency",
		welcome_msg: "Hello! I'm your Gemma 4 Health Assistant, designed for Ghanaian healthcare. Tell me your symptoms or ask any health question — I'll guide you.\n\nYou can ask in English, Twi, Ga, Ewe, or Fante. I understand common conditions like malaria, typhoid, anemia, and more.",
		placeholder: "Describe your symptoms or ask a question...",
		quick_chips_malaria: "🦟 Malaria symptoms",
		quick_chips_typhoid: "🤒 Typhoid fever",
		quick_chips_weak: "🩸 Feeling weak and dizzy",
		quick_chips_breathing: "😮‍💨 Breathing problems",
		quick_chips_dehydration: "💧 Signs of dehydration",
		quick_chips_pregnancy: "🤰 Pregnancy health tips",
		remedy_title: "Ghanaian Remedy & Nutrition Guide",
		remedy_sub: "Local foods and herbs with proven health benefits — backed by traditional knowledge and modern nutrition science.",
		remedy_disclaimer: "These remedies complement, but do not replace, professional medical treatment. Always consult a healthcare provider before using herbal remedies, especially if pregnant, breastfeeding, or on medication.",
		emergency_title: "Ghana Emergency Numbers",
		emergency_sub: "If you or someone is in immediate danger, call the numbers below. For non-emergencies, visit your nearest CHPS compound.",
		chps_title: "CHPS Compounds",
		chps_body: "Visit your nearest CHPS (Community-based Health Planning and Services) compound for non-emergency care",
		chps_sub: "CHPS compounds are community health facilities found across Ghana. They provide basic healthcare services including: malaria testing, immunizations, family planning, antenatal care, and treatment of common illnesses.",
		ambulance: "Ghana Ambulance Service",
		fire: "Fire Service",
		police: "Police",
		poisonCenter: "Poison Control Center",
		mentalHealth: "Mental Health Helpline",
	},
	twi: {
		welcome_title: "Gemma 4 Ahoɔden Dwumabea",
		welcome_sub: "Google Gemma 4 na ɛwɔ mu — Yɛyɛ maa Ghana 🇬🇭",
		chat_tab: "AI Nkɔmmɔbɔ",
		scanner_tab: "Lab Mfoni",
		remedies_tab: "Nnuru Ahorow",
		emergency_tab: "Gye Mpoano",
		welcome_msg: "Mema wo akye! Me ne wo Gemma 4 Ahoɔden Boafo. Kyerɛ me sɛnea wote nka anaa bisa me nsem biara a ɛfa ahoɔden ho — mɛkyerɛ wo kwan.\n\nWobetumi abisa me nsɛm wɔ Borɔfo, Twi, Ga, Ewe, anaa Fante kasa mu. Mete yare ahorow te sɛ malaria, typhoid, ne mogya a ɛtew ho.",
		placeholder: "Kyerɛ wo yare ahoɔden anaa bisa asɛm...",
		quick_chips_malaria: "🦟 Malaria ho sɛnkyerɛnne",
		quick_chips_typhoid: "🤒 Typhoid yareɛ",
		quick_chips_weak: "🩸 Mogya a ɛtew / Ɔbrɛ",
		quick_chips_breathing: "😮‍💨 Ɔhome nteaseɛ",
		quick_chips_dehydration: "💧 Nsuo a ɛhian wo nipadua",
		quick_chips_pregnancy: "🤰 Nyinsɛn mu ahoɔden",
		remedy_title: "Fie Nnuru Ahorow wɔ Ghana",
		remedy_sub: "Aduane pa ne fie nnuru ahorow a wobɛnom de agye wo ho. Hwɛ: Ɛnyɛ dɔkota aduro nsesae.",
		remedy_disclaimer: "Fie nnuru yi hyɛ aduro pa den na mmom ɛnyɛ dɔkota aduro nsesae. Bisa dɔkota biara ansa na woanom fie nnuru, titiriw sɛ woyɛ ɔyarefoɔ, woyem, anaa wonom nnuru afoforo.",
		emergency_title: "Ahoɔden Mpanyimfo Nkrato",
		emergency_sub: "Sɛ wo anaa obi wɔ asiane mu a, frɛ nɔma ahorow a ɛwɔ aseɛ yi. Sɛ ɛnyɛ asiane kɛseɛ a, kɔ CHPS asoeɛ a ɛbɛn wo.",
		chps_title: "CHPS Compounds Asoeɛ",
		chps_body: "Kɔ CHPS (Community-based Health Planning and Services) asoeɛ a ɛbɛn wo kɔhwehwɛ ayaresa.",
		chps_sub: "CHPS asoeɛ yɛ fie ayaresabea nketewa a ɛwɔ Ghana mmeae pii. Wɔma ayaresa basic te sɛ: malaria sɔhwɛ, mpɔmpɔnɔ aduro, afupae dwumadie, ne ayaresa nketewa foforɔ.",
		ambulance: "Ghana Ambulans Asoeɛ",
		fire: "Ogya Asoeɛ",
		police: "Kpolisi",
		poisonCenter: "Aduro Bɔne Asoeɛ",
		mentalHealth: "Adwene mu Yareɛ Boafo",
	},
	ga: {
		welcome_title: "Gemma 4 Hewale He",
		welcome_sub: "Google Gemma 4 hewalɛ mli — Ni afee kɛha Ghana 🇬🇭",
		chat_tab: "AI Sanegbaa",
		scanner_tab: "Lab Tsumaa",
		remedies_tab: "Tsofa He",
		emergency_tab: "Oshara Be",
		welcome_msg: "Minye gbɛi! Mi ji Gemma 4 Hewale Yelikɛlɔ. Kɛɛ mi bo ni nuɔ he aloo bi mi sane ko yɛ hewale he — ma tsɔɔ bo gbɛ.\n\nObaanyɛ obi sane yɛ Blɛfo, Twi, Ga, Ewe, aloo Fante mli. Minuɔ hela ko tamɔ malaria, typhoid, kɛ hewalɛ tsu.",
		placeholder: "Kɛ wo hewale shishi aloo bi sane...",
		quick_chips_malaria: "🦟 Malaria okadii",
		quick_chips_typhoid: "🤒 Typhoid hela",
		quick_chips_weak: "🩸 La ni kpa hewale",
		quick_chips_breathing: "😮‍💨 Muɔ shidaa gbɛ",
		quick_chips_dehydration: "💧 Nu he hiamɔ",
		quick_chips_pregnancy: "🤰 Hɔwiemɔ hewalɛ",
		remedy_title: "Shia Tsofa Yɛ Ghana",
		remedy_sub: "Niyenii kpakpa kɛ shia tsofaji ni baaye abua bo. Kadimɔ: Ekafee datrɛfonyo tsofa.",
		remedy_disclaimer: "Shia tsofaji nɛɛ baaye abua bo, shi ekafee datrɛfonyo tsopa nsesae. Bi datrɛfonyo ko sane ansa ni onom shia tsofa, titriw kɛji ohɔ aloo onom tsopa kroko.",
		emergency_title: "Oshara Gbɛtsɔɔmɔi Kɛha Datrɛ",
		emergency_sub: "Kɛji bo aloo mɔ ko yɛ oshara mli lɛ, frɛ nɔmai ni yɔɔ shishi nɛɛ. Sɛ hela lɛ waaa, yaa CHPS compound ni bɛŋkɛ bo.",
		chps_title: "CHPS Compounds",
		chps_body: "Yaa CHPS (Community-based Health Planning and Services) compound ni bɛŋkɛ bo kɛha yelikɛlɔ.",
		chps_sub: "CHPS compounds ji hewale tsuji nketewa ni yɔɔ Ghana fɛɛ. Amɛhaaa hewale yelikɛlɔ ko tamɔ: malaria tsumaa, tsofa wamɔ, kɛ hewale yelikɛlɔ foforɔ.",
		ambulance: "Ghana Ambulans Asoeɛ",
		fire: "La Asoeɛ",
		police: "Kpolisi",
		poisonCenter: "Tsofa Bɔne He",
		mentalHealth: "Jwɛŋmɔ Hela Yelikɛlɔ",
	},
	ewe: {
		welcome_title: "Gemma 4 Lãmesẽ Dɔwɔƒe",
		welcome_sub: "Google Gemma 4 eƒe dɔwɔnu — Womana kpe ɖe Ghana ŋu 🇬🇭",
		chat_tab: "AI Dzeɖoɖo",
		scanner_tab: "Kɔkɔ Dɔwɔfɛ",
		remedies_tab: "Atike Lãmesẽ",
		emergency_tab: "Kplamatsɛ",
		welcome_msg: "Medo gbe na wò! Nyee nye Gemma 4 Lãmesẽ Kpeɖeŋutɔ. Ƒo nu tso dɔléle si le fu ɖem na wò aloo bia lãmesẽ biabia ɖe sia ɖe — makplɔ wò.\n\nWòate ŋu abia dzeɖoɖo le Eŋlisigbe, Twi, Ga, Ewe, loo Fante me. Melɔ̃a dɔlélewo siwo nye malaria, typhoid, kple lãmesẽ aɖeke o.",
		placeholder: "De wò dɔléle fia alo bia nya aɖe...",
		quick_chips_malaria: "🦟 Malaria dɔléle vovo",
		quick_chips_typhoid: "🤒 Typhoid dɔléle",
		quick_chips_weak: "🩸 Lãme gbɔɖɔgbɔɖɔ",
		quick_chips_breathing: "😮‍💨 Ya gbɔgbɔ gbɔdzɔgbɔdzɔ",
		quick_chips_dehydration: "💧 Tsi aɖeke mele lãme o",
		quick_chips_pregnancy: "🤰 Fu kaba lãmesẽ",
		remedy_title: "Aƒeme Atike le Ghana",
		remedy_sub: "Nuyiwo kple aƒeme atikewo kpe ɖe afɔku gbegblẽnu ŋu. Hekpe: Megaɖe atikeɖola ɖa o.",
		remedy_disclaimer: "Aƒeme atike siawo kpena ɖe lãme ŋu gake womeɖea dɔnɔkɔdola ƒe atikewo ɖa o. Bia dɔnɔkɔdola biara ansa na nàno atike siawo, titriw ne èle fu me alo le atike bubu nom.",
		emergency_title: "Kplamatsɛ Kpekpeɖeŋu Dɔwɔƒe",
		emergency_sub: "Ne wò alo ame aɖe le afɔku me la, yɔ nɔba siwo le afi sia. Ne menye kplamatsɛ o la, de kɔdola si bɛn wò.",
		chps_title: "CHPS Compounds Dɔwɔƒewo",
		chps_body: "De CHPS (Community-based Health Planning and Services) dɔwɔƒe si bɛn wò kaba na lãmesẽ.",
		chps_sub: "CHPS dɔwɔƒewo nye kɔdola nketewa le Ghana duko me. Wona kpekpeɖeŋu kaba na: malaria sɔsɔ, vidzidzi atikewo, kple dɔléle nketewa bubuwo.",
		ambulance: "Ghana Ambulans Dɔwɔƒe",
		fire: "Dzo Dɔwɔƒe",
		police: "Kpɔlisiwo",
		poisonCenter: "Atike Vɔ̃ Dɔwɔƒe",
		mentalHealth: "Tagbɔdɔ Kpekpeɖeŋu",
	},
	fante: {
		welcome_title: "Gemma 4 Ahoodzen Mpɔano",
		welcome_sub: "Google Gemma 4 mu ahoodzen — Wɔyɛɛ maa Ghana 🇬🇭",
		chat_tab: "AI Nkɔmbɔ",
		scanner_tab: "Lab Mfoni",
		remedies_tab: "Fie Nnuru",
		emergency_tab: "Gye Ntɛm",
		welcome_msg: "Mema wo akye! Me ne wo Gemma 4 Ahoodzen Boafo. Kyerɛ me dza wote nka anaa bisa m'asɛm biara wɔ ahoodzen ho — mɛkyerɛ wo kwan.\n\nWobotumu abisa asɛm wɔ Twi, Ga, Ewe, Fante, anaa Borɔfo mu. Mete yarba bi tse dɛ malaria, typhoid, na mogya mu ahoodzen.",
		placeholder: "Kyerɛ wo yarba mu nsɛm anaa bisa asɛm...",
		quick_chips_malaria: "🦟 Malaria ho ndzɛmba",
		quick_chips_typhoid: "🤒 Typhoid yarba",
		quick_chips_weak: "🩸 Mogya mu ahoodzen kɔ fam",
		quick_chips_breathing: "😮‍💨 Home mu ndzɛmba",
		quick_chips_dehydration: "💧 Nsu a ɔhian wo nyimpadua",
		quick_chips_pregnancy: "🤰 Nyinsɛn mu ahoodzen",
		remedy_title: "Fie Nnuru ahorow wɔ Ghana",
		remedy_sub: "Aduan pa ne fie nnuru a ɔbɛboa wo ma woanya ahoodzen. Hwɛ: Ɔnyɛ datser ndur nsesae.",
		remedy_disclaimer: "Fie nnuru yi hyɛ adur pa dzen na mmom ɔnyɛ datser ndur nsesae. Bisa datser biara ansa na woanom fie nnuru, tsitsir sɛ woyɛ ɔyarfo, woyɛm, anaa wonom ndur afoforo.",
		emergency_title: "Gye Ntɛm Ahoodzen Nkrato",
		emergency_sub: "Sɛ wo anaa obi wɔ asiane mu a, frɛ nɔma a ɔwɔ fam yi. Sɛ ɔnyɛ ntɛm ara gyinae a, kɔ CHPS compound a ɔbɛn wo.",
		chps_title: "CHPS Compounds Dwumabea",
		chps_body: "Kɔ CHPS (Community-based Health Planning and Services) compound a ɔbɛn wo hɔ kɔhwehwɛ ayaresa.",
		chps_sub: "CHPS compounds yɛ fie ayaresabea nketewa wɔ Ghana. Wɔyɛ ayaresa tsitsir tse dɛ: malaria sɔhwɛ, mpɔmpɔnɔ adur, ne ndzɛmba nketewa afofor.",
		ambulance: "Ghana Ambulans Dwumabea",
		fire: "Gya Dwumabea",
		police: "Kpolisi",
		poisonCenter: "Adur Bɔne Dwumabea",
		mentalHealth: "Adwen mu Yarba Boafo",
	}
};

const translateRemedy = (remedyName: string, field: "benefits" | "usage" | "warning", lang: GemmaLanguage, fallback: string): string => {
	const dict: Record<string, Record<string, Record<string, string>>> = {
		twi: {
			"Moringa (Moringa oleifera)": {
				benefits: "Ɛwɔ iron, protein, Vitamin A, C, ne calcium pii. Ɛye paa ma mogya a ɛtew ne aduane pa a yɛnnya.",
				usage: "Fa moringa powder gu suupu, stuu, anaa Koko mu. Supuni 1-2 da biara.",
				warning: "Yi wo ani fi fa pii ho wɔ nyinsɛn mu."
			},
			"Sobolo (Hibiscus sabdariffa)": {
				benefits: "Ɛtew mogya mmorosoɔ gu fam, ɛwɔ Vitamin C ne antioxidants pii. Ɛboa ma nsuo kɔ nipadua mu.",
				usage: "Noa sobolo nkranteɛ wɔ nsuo hyeɛ mu. Nom kuruwa 2-3 da biara.",
				warning: "Ebetumi ne mogya mmorosoɔ nnuru abɔ mu."
			},
			"Kontomire (Cocoyam Leaves)": {
				benefits: "Ɛwɔ iron, folate, ne Vitamin A pii. Ɛye aduane pa paa ma mogya a ɛtew wɔ Ghana.",
				usage: "Noa no wɔ kontomire stuu mu ne lemon anaa ankaa asuo na ɛbue kwan ma nipadua no fa iron pii.",
				warning: "Noa no yie paa — ne nkranteɛ foforo betumi ahyɛ wo mene."
			},
			"Dawadawa (Parkia biglobosa)": {
				benefits: "Afuo ne stuu mu aduane a ɛhyɛ nipadua den. Ɛboa yafunu mu yiedie.",
				usage: "Fa gu suupu ne stuu mu sɛnea ɛbɛma yɛn aduane ayɛ dɛ.",
				warning: "Ɛwɔ hwa a ɛyɛ den. Fa kakra na hyɛ aseɛ."
			},
			"Neem (Azadirachta indica)": {
				benefits: "Fie nnuru a ɛko yareɛ te sɛ malaria ne oyarefoɔ a ɔho yɛ den.",
				usage: "Noa ne nkranteɛ foforo na fa yɛ ti. Nom kuruwa baako da biara wɔ malaria mu.",
				warning: "Ɛnyɛ ACT aduro nsesae. Ɛnyɛ yie mma wɔn a wɔyem."
			},
			"Tiger Nut (Cyperus esculentus)": {
				benefits: "Ɛwɔ fiber, magnesium, ne potassium pii. Ɛma ahoɔden pii.",
				usage: "We no foforo, fa yɛ atadwe nsuo, anaa smoothies.",
				warning: "Ɛwɔ fiber pii we no nkakra nkakra."
			},
			"Ginger (Zingiber officinale)": {
				benefits: "Ɛko yafunu yaw, oyareɛ, ne yafunu adwuma pa. Ɛboa awɔw yareɛ.",
				usage: "Fa ginger foforo gu nsuo hyeɛ mu ne lemon ne ɛwoɔ.",
				warning: "Ebetumi ne mogya a ɛtew nnuru abɔ mu."
			}
		},
		ga: {
			"Moringa (Moringa oleifera)": {
				benefits: "Hewalɛ babaoo kɛha la krɔkrɔ, nuyinilɔi hewalɛ, Vitamin A, C, kɛ calcium.",
				usage: "Kɛ moringa mulu wo suupoo mli, wonu mli, aloo Koko mli. 1-2 supoon daa daa.",
				warning: "Kaaye pii yɛ hɔwiemɔ mli."
			},
			"Sobolo (Hibiscus sabdariffa)": {
				benefits: "Eshãa la okadii gu fam, ehi kɛha hewalɛ kpakpa kɛ he tsofa.",
				usage: "Noa sobolo baa yɛ nu he mli. Nom kɔɔpoo 2-3 daa daa.",
				warning: "Ebaanyɛ ekuɔ tsopa ni eshãa la gu fam."
			},
			"Kontomire (Cocoyam Leaves)": {
				benefits: "Ewɔ iron, folate, kɛ Vitamin A pii. Niyenii kpakpa yɛ Ghana kɛha la krɔkrɔ.",
				usage: "Noa kɛ lemon aloo ankaa nu ni ebaaye abua nipadua ni efa iron pii.",
				warning: "Noa yie kpakpa — baa foforo baanyɛ eshãa wo mene."
			},
			"Dawadawa (Parkia biglobosa)": {
				benefits: "Niyenii kpakpa kɛha musu yiedie kɛ hewalɛ tsu.",
				usage: "Kɛ wo suopoo aloo wonu mli kɛha niyenii dɛ̃.",
				warning: "Ewɔ fu ni hewalɛ wa. Kɛ tsɔɔ kakra pɛ kɛtsɛ̃."
			},
			"Neem (Azadirachta indica)": {
				benefits: "Tsofa kpakpa kɛha malaria he kɛ hela aŋutɛ.",
				usage: "Boil neem baaji kɛha tea. Nom baako daa mli kɛha malaria hela.",
				warning: "Ekafee ACT tsopa nsesae. Ehiii kɛha hɔwielɔi."
			},
			"Tiger Nut (Cyperus esculentus)": {
				benefits: "Ewɔ fiber, magnesium, kɛ potassium pii. Ehaaa hewalɛ kpakpa.",
				usage: "Eat foforo, blend kɛha atadwe nu aloo smoothies.",
				warning: "Ewɔ fiber pii — eat nkakra nkakra."
			},
			"Ginger (Zingiber officinale)": {
				benefits: "Ehi kɛha musu hela, awɔw hela, kɛ muɔ gbɔmɔ tso.",
				usage: "Grate ginger wo nu he mli kɛ lemon kɛ ɛwoɔ.",
				warning: "Ebaanyɛ ekuɔ tsopa ni eshãa la foforo."
			}
		},
		ewe: {
			"Moringa (Moringa oleifera)": {
				benefits: "Iron, protein, Vitamin A, C, kple calcium geɖe le eme. Enyo na mogya gbɔdzɔgbɔdzɔ.",
				usage: "Tsɔ moringa powder de soup alo stuu me. Supuni 1-2 gbesiagbe.",
				warning: "Mēgawɔ dɔ geɖe le fu me o."
			},
			"Sobolo (Hibiscus sabdariffa)": {
				benefits: "Eɖea mogya lolo ɖe afɔ, Vitamin C geɖe le eme.",
				usage: "De sobolo fufu ɖe tsi dzodzo me. No kɔpo 2-3 gbesiagbe.",
				warning: "Ate ŋu agblẽ dɔ na mogya atikewo."
			},
			"Kontomire (Cocoyam Leaves)": {
				benefits: "Iron, folate, kple Vitamin A geɖe le eme. Nuyi nyuitɔ na mogya atike le Ghana.",
				usage: "Dzra ɖo le stuu me kple ankaa alo lemon kpe ɖe iron ŋu.",
				warning: "Dzra yie nyuie — atike foforo ate ŋu agblẽ dɔ na wò ve."
			},
			"Dawadawa (Parkia biglobosa)": {
				benefits: "Enyo na dɔwɔƒe nyuie kple lãme gbegblẽnu.",
				usage: "De soup alo stuu me be wòanya ɖuɖu.",
				warning: "Eƒe ʋeʋe sesẽ ŋutɔ. Tsɔ vie kaba adze egɔme."
			},
			"Neem (Azadirachta indica)": {
				benefits: "Enyo na malaria dɔléle kple lãme sesẽ.",
				usage: "Boil neem bawo na tea. No kɔpo ɖeka gbesiagbe le malaria me.",
				warning: "Menye ACT atike teƒenɔla o. Mēnyo na fu nɔlawo o."
			},
			"Tiger Nut (Cyperus esculentus)": {
				benefits: "Fiber, magnesium, kple potassium geɖe le eme. Enaa lãmesẽ.",
				usage: "Ɖu foforo, blend atadwe tsi alo smoothies.",
				warning: "Fiber geɖe le eme — ɖu nkakra nkakra."
			},
			"Ginger (Zingiber officinale)": {
				benefits: "Enyo na veyiyi, dɔlele, kple dɔme yiyi. Enyo na vuvɔ dɔ.",
				usage: "Grate ginger de tsi dzodzo me kple lemon kple anyitsi.",
				warning: "Ate ŋu agblẽ dɔ na atike bubuwo."
			}
		},
		fante: {
			"Moringa (Moringa oleifera)": {
				benefits: "Ɔwɔ iron, protein, Vitamin A, C, ne calcium pii. Oye paa ma mogya mu ahoodzen.",
				usage: "Fa moringa powder gu stuu anaa Koko mu. Supuni 1-2 da biara.",
				warning: "Yi w'ani fi fa pii ho wɔ nyinsɛn mu."
			},
			"Sobolo (Hibiscus sabdariffa)": {
				benefits: "Ɔtsew mogya mmoroso gu fam, ɔwɔ Vitamin C ne antioxidants pii.",
				usage: "Noa sobolo gu nsu hye mu. Nom kuruwa 2-3 da biara.",
				warning: "Obotum ne mogya mu ndur no abɔ mu."
			},
			"Kontomire (Cocoyam Leaves)": {
				benefits: "Ɔwɔ iron, folate, ne Vitamin A pii. Oye aduan pa paa ma mogya a ɔtsew wɔ Ghana.",
				usage: "Noa wɔ kontomire stuu mu ne ankaa na nipadua no fa iron pii.",
				warning: "Noa no yie paa — ne nkrante foforo botum ahyɛ wo mene."
			},
			"Dawadawa (Parkia biglobosa)": {
				benefits: "Aduan pa a ɔhyɛ yafunu den. Ɔboa yafunu mu yiedzi.",
				usage: "Fa gu supu na stuu mu ma ɔyɛ dɛ.",
				warning: "Ɔwɔ hwa a ɔyɛ dzen. Fa kakra na hyɛ ase."
			},
			"Neem (Azadirachta indica)": {
				benefits: "Fie nnuru a ɔko malaria ne ahoɔden den.",
				usage: "Noa ne nkrante foforo na fa yɛ ti. Nom kuruwa baako da biara wɔ malaria mu.",
				warning: "Ɔnyɛ ACT ndur nsesae. Ɔnyɛ yie mma wɔn a wɔyɛm."
			},
			"Tiger Nut (Cyperus esculentus)": {
				benefits: "Ɔwɔ fiber, magnesium, ne potassium pii. Ɔma ahoodzen pii.",
				usage: "We foforo, fa yɛ atadwe nsu, anaa smoothies.",
				warning: "Ɔwɔ fiber pii — we no nkakra nkakra."
			},
			"Ginger (Zingiber officinale)": {
				benefits: "Ɔko yafunu yaw, oyare, ne yafunu edwuma pa. Ɔboa awɔw yarba.",
				usage: "Fa ginger foforo gu nsu hye mu ne ankaa ne ɛwo.",
				warning: "Obotum ne mogya mu ndur afoforo abɔ mu."
			}
		}
	};
	if (lang === "english") return fallback;
	return (dict as any)[lang]?.[remedyName]?.[field] || fallback;
};

interface ChatMsg {
	id: string;
	role: "user" | "bot";
	text: string;
	urgency?: "Green" | "Yellow" | "Red";
	bodySystem?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIAssistant() {
	const [activeTab, setActiveTab] = useState<Tab>("chat");
	const [language, setLanguage] = useState<GemmaLanguage>("english");
	const [gemmaOnline, setGemmaOnline] = useState(false);

	useEffect(() => {
		checkGemmaHealth().then((h) => setGemmaOnline(h.available && h.modelLoaded));
	}, []);

	return (
		<div className={styles.page}>
			{/* ── Page Header ── */}
			<div className={styles.pageHeader}>
				<div className={styles.headerLeft}>
					<div className={styles.headerIcon}>
						<Bot size={22} />
						<div className={styles.headerDot} />
					</div>
					<div>
						<h1 className={styles.pageTitle}>{LOCALIZED_TEXTS[language].welcome_title}</h1>
						<p className={styles.pageSub}>
							<span className={styles.gemmaChip}>
								{gemmaOnline ? (
									<><Wifi size={10} /> Gemma 4 Local</>
								) : (
									<><WifiOff size={10} /> Offline Mode</>
								)}
							</span>
							{LOCALIZED_TEXTS[language].welcome_sub}
						</p>
					</div>
				</div>
				<div className={styles.langRow}>
					{LANGUAGES.map((l) => (
						<button
							key={l.id}
							className={`${styles.langPill} ${l.id === language ? styles.langPillActive : ""}`}
							onClick={() => setLanguage(l.id)}
						>
							<span>{l.flag}</span>
							<span>{l.code}</span>
						</button>
					))}
				</div>
			</div>

			{/* ── Tabs ── */}
			<div className={styles.tabBar}>
				{[
					{ id: "chat" as Tab, label: LOCALIZED_TEXTS[language].chat_tab, icon: <Bot size={15} /> },
					{ id: "scanner" as Tab, label: LOCALIZED_TEXTS[language].scanner_tab, icon: <ImagePlus size={15} /> },
					{ id: "remedies" as Tab, label: LOCALIZED_TEXTS[language].remedies_tab, icon: <Leaf size={15} /> },
					{ id: "emergency" as Tab, label: LOCALIZED_TEXTS[language].emergency_tab, icon: <Phone size={15} /> },
				].map((tab) => (
					<button
						key={tab.id}
						className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.icon}
						<span>{tab.label}</span>
					</button>
				))}
			</div>

			{/* ── Content ── */}
			<div className={styles.content}>
				{activeTab === "chat" && <ChatSection language={language} gemmaOnline={gemmaOnline} />}
				{activeTab === "scanner" && <ScannerSection language={language} gemmaOnline={gemmaOnline} />}
				{activeTab === "remedies" && <RemedySection language={language} />}
				{activeTab === "emergency" && <EmergencySection language={language} />}
			</div>
		</div>
	);
}

// ─── Tab 1: Chat ──────────────────────────────────────────────────────────────

function ChatSection({ language }: { language: GemmaLanguage; gemmaOnline: boolean }) {
	const [messages, setMessages] = useState<ChatMsg[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const chatEnd = useRef<HTMLDivElement>(null);

	// Dynamically translate welcome message on language change or on mount
	useEffect(() => {
		setMessages((prev) => {
			const hasWelcome = prev.some((m) => m.id === "welcome");
			const welcomeMsg = {
				id: "welcome",
				role: "bot" as const,
				text: LOCALIZED_TEXTS[language].welcome_msg,
			};
			if (hasWelcome) {
				return prev.map((m) => (m.id === "welcome" ? welcomeMsg : m));
			} else {
				return [welcomeMsg, ...prev];
			}
		});
	}, [language]);

	useEffect(() => {
		chatEnd.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, loading]);

	const quickChips = [
		LOCALIZED_TEXTS[language].quick_chips_malaria,
		LOCALIZED_TEXTS[language].quick_chips_typhoid,
		LOCALIZED_TEXTS[language].quick_chips_weak,
		LOCALIZED_TEXTS[language].quick_chips_breathing,
		LOCALIZED_TEXTS[language].quick_chips_dehydration,
		LOCALIZED_TEXTS[language].quick_chips_pregnancy,
	];

	const send = async (text?: string) => {
		const msg = text || input.trim();
		if (!msg) return;
		setInput("");

		const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: "user", text: msg };
		setMessages((prev) => [...prev, userMsg]);
		setLoading(true);

		try {
			const result = await chatWithGemma({ message: msg, language });
			setMessages((prev) => [
				...prev,
				{
					id: `b-${Date.now()}`,
					role: "bot",
					text: result.message,
					urgency: result.urgency,
					bodySystem: result.bodySystem,
				},
			]);
		} catch {
			setMessages((prev) => [
				...prev,
				{
					id: `b-err-${Date.now()}`,
					role: "bot",
					text: "I'm sorry, I encountered an error. Please try again.",
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.chatSection}>
			<div className={styles.chatMessages}>
				{messages.map((m) => (
					<div
						key={m.id}
						className={`${styles.chatMsg} ${m.role === "user" ? styles.chatUser : styles.chatBot}`}
					>
						{m.role === "bot" && <Bot size={16} className={styles.chatBotIcon} />}
						<div className={styles.chatBubble}>
							{m.urgency && m.urgency !== "Green" && (
								<span className={`${styles.urgencyBadge} ${styles[`urgency${m.urgency}`]}`}>
									{m.urgency === "Red" ? "⚠️ Urgent" : "⚡ Moderate"}
								</span>
							)}
							<p>{m.text}</p>
							{m.bodySystem && m.bodySystem !== "total" && (
								<span className={styles.systemTag}>
									<Stethoscope size={10} /> {m.bodySystem}
								</span>
							)}
						</div>
					</div>
				))}
				{loading && (
					<div className={`${styles.chatMsg} ${styles.chatBot}`}>
						<Bot size={16} className={styles.chatBotIcon} />
						<div className={styles.chatBubble}>
							<div className={styles.typingDots}>
								<span /><span /><span />
							</div>
						</div>
					</div>
				)}
				<div ref={chatEnd} />
			</div>

			<div className={styles.chatChips}>
				{quickChips.map((chip) => (
					<button key={chip} className={styles.chip} onClick={() => send(chip)}>
						{chip}
					</button>
				))}
			</div>

			<div className={styles.chatInputBar}>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && send()}
					placeholder={LOCALIZED_TEXTS[language].placeholder}
					disabled={loading}
				/>
				<button onClick={() => send()} disabled={loading || !input.trim()}>
					{loading ? <div className={styles.miniSpinner} /> : <Send size={16} />}
				</button>
			</div>
		</div>
	);
}

// ─── Tab 2: Scanner ───────────────────────────────────────────────────────────

function ScannerSection({ language, gemmaOnline }: { language: GemmaLanguage; gemmaOnline: boolean }) {
	const [image, setImage] = useState<string | null>(null);
	const [result, setResult] = useState<GemmaAnalysisResult | null>(null);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFile = (file: File) => {
		if (!file.type.startsWith("image/")) return;
		const reader = new FileReader();
		reader.onload = () => setImage(reader.result as string);
		reader.readAsDataURL(file);
		setResult(null);
	};

	const analyze = async () => {
		if (!image) return;
		setLoading(true);
		try {
			const base64 = image.split(",")[1];
			const res = await analyzeLabResults({
				imageBase64: base64,
				patientAge: "35",
				patientGender: "unknown",
				language,
			});
			setResult(res);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	const clear = () => {
		setImage(null);
		setResult(null);
	};

	return (
		<div className={styles.scannerSection}>
			{!image ? (
				<div
					className={styles.scanDropZone}
					onClick={() => inputRef.current?.click()}
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						e.preventDefault();
						const f = e.dataTransfer.files[0];
						if (f) handleFile(f);
					}}
				>
					<input
						ref={inputRef}
						type="file"
						accept="image/*"
						style={{ display: "none" }}
						onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
					/>
					<ImagePlus size={40} className={styles.scanIcon} />
					<h3>Drop or click to upload a lab result image</h3>
					<p>JPG, PNG — Photos of lab sheets, RDT strips, prescriptions</p>
				</div>
			) : (
				<div className={styles.scanPreview}>
					<div className={styles.scanImgWrapper}>
						<img src={image} alt="Lab result" className={styles.scanImg} />
						<button className={styles.scanClearBtn} onClick={clear}>
							<X size={14} /> Remove
						</button>
					</div>
					{!result && (
						<button className={styles.scanAnalyzeBtn} onClick={analyze} disabled={loading}>
							{loading ? (
								<><div className={styles.miniSpinner} /> Analyzing with {gemmaOnline ? "Gemma 4" : "AI"}...</>
							) : (
								<><Sparkles size={16} /> Analyze with {gemmaOnline ? "Gemma 4" : "AI"}</>
							)}
						</button>
					)}
					{result && (
						<div className={styles.scanResults}>
							<div className={styles.scanScoreRow}>
								<div className={styles.scanScore}>
									<span className={styles.scanScoreNum}>{result.healthScore}</span>
									<span className={styles.scanScoreLabel}>Health Score</span>
								</div>
								<p className={styles.scanSummary}>{result.summary}</p>
							</div>

							{result.findings.map((f) => (
								<div key={f.id} className={`${styles.scanFinding} ${styles[`sf-${f.status}`]}`}>
									<div className={styles.sfTop}>
										<span className={styles.sfName}>{f.name}</span>
										<span className={`${styles.sfBadge} ${styles[`sfb-${f.status}`]}`}>{f.statusLabel}</span>
									</div>
									<span className={styles.sfValue}>{f.value}</span>
									<p className={styles.sfNote}>{f.note}</p>
								</div>
							))}

							<h4 className={styles.scanRecsTitle}>Recommendations</h4>
							{result.recommendations.map((r) => (
								<div key={r.title} className={styles.scanRec}>
									<span className={styles.scanRecIcon}>{r.icon}</span>
									<div>
										<strong>{r.title}</strong>
										<p>{r.body}</p>
									</div>
								</div>
							))}

							<button className={styles.scanResetBtn} onClick={clear}>
								<ImagePlus size={14} /> Scan another result
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// ─── Tab 3: Remedy Guide ─────────────────────────────────────────────────────

function RemedySection({ language }: { language: GemmaLanguage }) {
	const [expanded, setExpanded] = useState<string | null>(null);

	return (
		<div className={styles.remedySection}>
			<div className={styles.remedyHeader}>
				<Leaf size={20} className={styles.remedyLeaf} />
				<div>
					<h2>{LOCALIZED_TEXTS[language].remedy_title}</h2>
					<p>{LOCALIZED_TEXTS[language].remedy_sub}</p>
				</div>
			</div>

			<div className={styles.remedyGrid}>
				{GHANAIAN_REMEDIES.map((remedy) => (
					<div
						key={remedy.name}
						className={`${styles.remedyCard} ${expanded === remedy.name ? styles.remedyCardExpanded : ""}`}
						onClick={() => setExpanded(expanded === remedy.name ? null : remedy.name)}
					>
						<div className={styles.remedyTop}>
							<span className={styles.remedyEmoji}>{remedy.emoji}</span>
							<div className={styles.remedyInfo}>
								<h3>{remedy.name}</h3>
								<span className={styles.remedyLocal}>{remedy.localName}</span>
							</div>
							<ChevronRight
								size={16}
								className={`${styles.remedyChevron} ${expanded === remedy.name ? styles.remedyChevronOpen : ""}`}
							/>
						</div>

						{expanded === remedy.name && (
							<div className={styles.remedyDetails}>
								<div className={styles.remedyDetail}>
									<Heart size={13} />
									<div>
										<strong>Benefits</strong>
										<p>{translateRemedy(remedy.name, "benefits", language, remedy.benefits)}</p>
									</div>
								</div>
								<div className={styles.remedyDetail}>
									<Sparkles size={13} />
									<div>
										<strong>How to use</strong>
										<p>{translateRemedy(remedy.name, "usage", language, remedy.usage)}</p>
									</div>
								</div>
								<div className={`${styles.remedyDetail} ${styles.remedyWarning}`}>
									<AlertTriangle size={13} />
									<div>
										<strong>Caution</strong>
										<p>{translateRemedy(remedy.name, "warning", language, remedy.warning)}</p>
									</div>
								</div>
								<div className={styles.remedyConditions}>
									{remedy.conditions.map((c) => (
										<span key={c} className={styles.conditionTag}>{c}</span>
									))}
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			<div className={styles.remedyDisclaimer}>
				<Shield size={14} />
				<span>{LOCALIZED_TEXTS[language].remedy_disclaimer}</span>
			</div>
		</div>
	);
}

// ─── Tab 4: Emergency ─────────────────────────────────────────────────────────

function EmergencySection({ language }: { language: GemmaLanguage }) {
	const contacts = [
		{ icon: "🚑", label: LOCALIZED_TEXTS[language].ambulance, number: EMERGENCY_CONTACTS.ambulance, color: "#ef4444" },
		{ icon: "🔥", label: LOCALIZED_TEXTS[language].fire, number: EMERGENCY_CONTACTS.fire, color: "#f97316" },
		{ icon: "👮", label: LOCALIZED_TEXTS[language].police, number: EMERGENCY_CONTACTS.police, color: "#3b82f6" },
		{ icon: "☠️", label: LOCALIZED_TEXTS[language].poisonCenter, number: EMERGENCY_CONTACTS.poisonCenter, color: "#a855f7" },
		{ icon: "🧠", label: LOCALIZED_TEXTS[language].mentalHealth, number: EMERGENCY_CONTACTS.mentalHealth, color: "#06b6d4" },
	];

	return (
		<div className={styles.emergencySection}>
			<div className={styles.emergencyBanner}>
				<AlertTriangle size={24} />
				<div>
					<h2>{LOCALIZED_TEXTS[language].emergency_title}</h2>
					<p>{LOCALIZED_TEXTS[language].emergency_sub}</p>
				</div>
			</div>

			<div className={styles.emergencyGrid}>
				{contacts.map((c) => (
					<div key={c.label} className={styles.emergencyCard} style={{ borderColor: `${c.color}30` }}>
						<span className={styles.emergencyIcon}>{c.icon}</span>
						<div className={styles.emergencyInfo}>
							<h3>{c.label}</h3>
							<span className={styles.emergencyNumber} style={{ color: c.color }}>{c.number}</span>
						</div>
					</div>
				))}
			</div>

			<div className={styles.chpsCard}>
				<Stethoscope size={20} />
				<div>
					<h3>{LOCALIZED_TEXTS[language].chps_title}</h3>
					<p>{LOCALIZED_TEXTS[language].chps_body}</p>
					<p className={styles.chpsSub}>
						{LOCALIZED_TEXTS[language].chps_sub}
					</p>
				</div>
			</div>
		</div>
	);
}
