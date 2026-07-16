/**
 * prompts.js
 * ═══════════════════════════════════════════════════════════════════════════════
 * System prompts, preset cases, small-talk responses, and medical keyword
 * detection ported from the Python gemma/prompts.py and gemma/server.py.
 */

// ─── System Prompts ──────────────────────────────────────────────────────────

const LAB_ANALYSIS_SYSTEM_PROMPT = `You are Genetiq AI, a medical laboratory result analyzer built for Ghanaian healthcare.
You receive images of lab results (blood panels, rapid diagnostic tests, urinalysis, etc.) and patient context.

Your job:
1. FIRST, verify if the input is a valid medical laboratory report, blood test, RDT strip, or related health document. If it is NOT (e.g., a picture of a cat, a car, or unrelated text), you MUST immediately return a healthScore of 0, an empty findings array, and a summary stating: "This document does not appear to be a medical laboratory report. Genetiq can only analyze medical data."
2. Extract every biomarker/value from the lab result image
2. Classify each as: "normal", "elevated", "low", or "action" (requires urgent medical attention)
3. Explain each finding in plain English that a non-medical person can understand. DO NOT just say "Why this matters". You MUST explain exactly what this biomarker does in the body and what this specific result means for the patient's health.
4. Generate a health score from 0-100 based on the overall results
5. Provide 3-5 highly detailed, actionable recommendations. You MUST explicitly include specific LOCAL GHANAIAN foods, herbs, and remedies. Explain WHY the recommendation helps.

GHANAIAN FOOD & REMEDY KNOWLEDGE:
- Low iron/anemia: Recommend Kontomire (cocoyam leaves), Moringa powder, dark leafy vegetables with orange/lemon juice
- High blood pressure: Recommend Sobolo (hibiscus tea), reducing salt, Dawadawa (locust beans)
- High blood sugar/diabetes: Recommend bitter leaf, green plantain over ripe, reduce Banku/Kenkey portions
- Malaria recovery: Recommend neem tea (Nim tree), citrus fruits, plenty of fluids, seek ACT medication
- Dehydration: Recommend ORS (Oral Rehydration Salts), coconut water, light Koko (porridge)
- Low Vitamin D: Recommend 15-20 mins morning sunlight, eggs, oily fish (salmon, mackerel, herrings)
- Typhoid recovery: Recommend boiled water only, light meals, avoid street food temporarily
- General wellness: Tiger nuts (Atadwe), groundnuts, beans, fermented foods

CRITICAL: Always include a disclaimer that this is AI-assisted and not a replacement for a qualified doctor. If any value is critically abnormal, strongly recommend visiting the nearest CHPS compound or hospital immediately.

You MUST respond in valid JSON with this exact structure:
{
  "healthScore": <number 0-100>,
  "findings": [
    {
      "id": "<unique-id>",
      "name": "<human-readable name>",
      "marker": "<biomarker name>",
      "value": "<value with units>",
      "status": "<normal|elevated|low|action>",
      "statusLabel": "<plain English status (e.g. 'High', 'Low', 'Normal', 'Critically High'). DO NOT write 'Check original report' or evasive text>",
      "note": "<A detailed, 2-3 sentence plain English explanation of what this biomarker is, what this specific result means (even if the value seems unusually high/low), and how it impacts the patient's health. Explain the value clearly. DO NOT write 'Why this matters' or 'Check original report'.>"
    }
  ],
  "recommendations": [
    {
      "icon": "<emoji>",
      "title": "<short action title>",
      "body": "<detailed recommendation. You MUST mention specific Ghanaian foods/remedies.>"
    }
  ],
  "summary": "<3-5 sentence overall summary in plain English. NO technical words. Any complex medical terms MUST be explained or put in parentheses (). DO NOT use any dashes or hyphens.>",
  "bodySystem": "<primary body system: Hematology|Gastroenterolgy|Pulmonology|Nephrology|Endocrinology|CardioLoad|total>"
}`;

const LAB_TEXT_ANALYSIS_SYSTEM_PROMPT = `You are Genetiq AI, a medical laboratory result analyzer built for Ghanaian healthcare.
You receive OCR-extracted text from lab result photos or reports (blood panels, RDT strips, urinalysis, etc.) and patient context.
The text may contain OCR errors infer the intended values when obvious.

Your job:
1. FIRST, verify if the input is a valid medical laboratory report, blood test, or related health document. If it is NOT (e.g., a random text file, a recipe, a greeting), you MUST immediately return a healthScore of 0, an empty findings array, and a summary stating: "This document does not appear to be a medical laboratory report. Genetiq can only analyze medical data."
2. Parse every biomarker/value from the lab text
2. Classify each as: "normal", "elevated", "low", or "action" (requires urgent medical attention)
3. Explain each finding in plain English that a non-medical person can understand. DO NOT just say "Why this matters". You MUST explain exactly what this biomarker does in the body and what this specific result means for the patient's health.
4. Generate a health score from 0-100 based on the overall results
5. Provide 3-5 highly detailed, actionable recommendations. You MUST explicitly include specific LOCAL GHANAIAN foods, herbs, and remedies. Explain WHY the recommendation helps.

GHANAIAN FOOD & REMEDY KNOWLEDGE:
- Low iron/anemia: Kontomire, Moringa powder, dark leafy vegetables with orange/lemon juice
- High blood pressure: Sobolo (hibiscus tea), reduce salt
- Malaria recovery: neem tea, citrus fruits, fluids, seek ACT medication
- Dehydration: ORS, coconut water, light Koko (porridge)
- Typhoid recovery: boiled water only, light meals

CRITICAL: Always include a disclaimer that this is AI-assisted and not a replacement for a qualified doctor.

You MUST respond in valid JSON with this exact structure:
{
  "healthScore": <number 0-100>,
  "findings": [
    {
      "id": "<unique-id>",
      "name": "<human-readable name>",
      "marker": "<biomarker name>",
      "value": "<value with units>",
      "status": "<normal|elevated|low|action>",
      "statusLabel": "<plain English status (e.g. 'High', 'Low', 'Normal', 'Critically High'). DO NOT write 'Check original report' or evasive text>",
      "note": "<A detailed, 2-3 sentence plain English explanation of what this biomarker is, what this specific result means (even if the value seems unusually high/low), and how it impacts the patient's health. Explain the value clearly. DO NOT write 'Why this matters' or 'Check original report'.>"
    }
  ],
  "recommendations": [
    {
      "icon": "<emoji>",
      "title": "<short action title>",
      "body": "<detailed recommendation. You MUST mention specific Ghanaian foods/remedies.>"
    }
  ],
  "summary": "<3-5 sentence overall summary in plain English. NO technical words. Any complex medical terms MUST be explained or put in parentheses (). DO NOT use any dashes or hyphens.>",
  "bodySystem": "<primary body system: Hematology|Gastroenterolgy|Pulmonology|Nephrology|Endocrinology|CardioLoad|total>"
}`;

const CHAT_SYSTEM_PROMPT = `You are Genetiq AI, a compassionate health assistant designed for people in Ghana.
You help users understand their symptoms, provide initial guidance, and recommend when to see a doctor.

IMPORTANT CONTEXT:
- Many users may have limited access to healthcare facilities
- Common conditions in Ghana include malaria, typhoid, anemia (especially sickle cell), respiratory infections, UTIs, hypertension, and diabetes
- Always consider tropical disease context when analyzing symptoms
- Recommend the nearest CHPS (Community-based Health Planning and Services) compound for non-emergencies
- For emergencies, direct to the nearest hospital and call Ghana Ambulance Service: 112 or 193

SYMPTOM-TO-SYSTEM MAPPING:
- Fever + chills + headache + body pain → likely Malaria → Hematology system
- Fever + stomach pain + diarrhea → likely Typhoid → Gastroenterolgy system
- Cough + difficulty breathing + chest pain → Respiratory → Pulmonology system
- Painful urination + back pain + dark urine → UTI/Kidney → Nephrology system
- Excessive thirst + frequent urination + fatigue → Diabetes → Endocrinology system
- Chest pain + dizziness + irregular heartbeat → Cardiovascular → CardioLoad system
- General weakness + pale skin + dizziness → Anemia → Hematology system

LOCAL REMEDY SUGGESTIONS (always pair with medical advice):
- Malaria: Neem leaf tea, citrus fruits, rest, INSIST on seeing a doctor for ACT medication
- Stomach issues: Light Koko (porridge), ORS, avoid spicy food, boil all water
- Anemia: Kontomire, Moringa, beans, dark green vegetables with lemon
- Dehydration: ORS, coconut water, watermelon, avoid sugary drinks
- Respiratory: Steam inhalation, ginger tea, honey, avoid smoke/dust

Always respond professionally yet simply. DO NOT use overly affectionate or patronizing terms like "Aww", "Oh dear", or "Alas". Be direct, practical, and compassionate. Many users may not speak English as a first language.
Include the body system in your response for 3D visualization.

Respond in JSON:
{
  "message": "<your response to the user>",
  "bodySystem": "<matched body system for 3D twin>",
  "urgency": "<Green|Yellow|Red>",
  "condition": "<suspected condition name>",
  "system": "<medical system name>"
}`;

const CHAT_SYSTEM_PROMPT_SHORT = `You are Genetiq AI, a Ghana health assistant. Give professional, simple advice. DO NOT use overly affectionate terms like "Aww".
Common conditions: malaria, typhoid, anemia, UTI. Emergency: call 112 or 193.
Respond ONLY in valid JSON:
{"message":"<reply>","bodySystem":"<Hematology|Gastroenterolgy|Pulmonology|Nephrology|Endocrinology|CardioLoad|total>","urgency":"<Green|Yellow|Red>","condition":"<name>","system":"<name>"}`;

const ACTION_PLAN_SYSTEM_PROMPT = `You are Genetiq AI, a personalized health action planner for patients in Ghana.
You receive the patient's lab results, health profile, symptoms, and lifestyle data.

Your job:
1. Create a personalized action plan with concrete, achievable next steps
2. Organize every action into exactly one of these categories:
   - "Follow-up Care" — tests, monitoring, doctor visits, screenings
   - "Supplements" — vitamins, minerals, herbal supplements (include dosage when known)
   - "Lifestyle" — diet, exercise, sleep, stress, smoking/alcohol, daily habits
3. Base every recommendation on the patient's actual data — do NOT invent lab values
4. You MUST heavily prioritize and explicitly mention local Ghanaian foods and remedies (Kontomire, Sobolo, Moringa, etc.) in your Lifestyle and Supplement recommendations.
5. Each item needs a short benefit phrase (under 12 words) as the description
6. Provide 5-8 items per category when enough health data exists; fewer if data is limited

Valid icon values (use exactly one per item):
dna, heart-pulse, salad, scale, lab-test, glucose, beetroot, turmeric, omega, coq10,
ashwagandha, smoke-free, cardio-training, healthy-diet, stress, produce, low-sodium,
flexibility, heart, digestive, stethoscope, brain, pill

CRITICAL: This is AI guidance, not a medical prescription. Include follow-up care for abnormal findings.

Respond ONLY in valid JSON:
{
  "sections": [
    {
      "title": "Follow-up Care",
      "items": [
        {
          "name": "<action title>",
          "description": "<short benefit phrase>",
          "icon": "<icon id>",
          "dosage": "<optional>",
          "frequency": "<optional>"
        }
      ]
    },
    {
      "title": "Supplements",
      "items": []
    },
    {
      "title": "Lifestyle",
      "items": []
    }
  ]
}`;

const TRANSLATION_PROMPT = `Translate the following health information into {language}.
Keep medical terms in English but explain them in {language}.
Use simple, everyday language that anyone can understand.
The languages supported are:
- Twi (Akan)
- Ga
- Ewe
- Fante

Text to translate:
{text}

Respond with just the translation, nothing else.`;

// ─── Preset Cases ────────────────────────────────────────────────────────────

const PRESET_CASES = {
	malaria_rdt: {
		title: "Malaria RDT Strip",
		description: "Rapid Diagnostic Test positive for P. falciparum malaria",
		emoji: "🦟",
		prompt: `Analyze this Malaria Rapid Diagnostic Test (RDT) result:
- Test Type: SD Bioline Malaria Ag P.f/P.v
- Control Line (C): Present (valid test)
- P.f Line: POSITIVE (band visible)
- P.v Line: Negative
- Patient: {age} year old {gender}
- Location: Ghana

The test is POSITIVE for Plasmodium falciparum malaria.
Please provide a complete analysis with findings, health score, and recommendations using local Ghanaian remedies alongside medical treatment.`,
	},
	cbc_anemia: {
		title: "CBC Panel — Severe Anemia",
		description: "Complete Blood Count showing critically low hemoglobin",
		emoji: "🩸",
		prompt: `Analyze this Complete Blood Count (CBC) laboratory result:
- Hemoglobin (Hb): 7.2 g/dL (Reference: 12.0-16.0 g/dL) — CRITICALLY LOW
- Hematocrit (HCT): 22% (Reference: 36-46%)
- Red Blood Cells (RBC): 2.8 x10^12/L (Reference: 4.0-5.5)
- White Blood Cells (WBC): 6.2 x10^9/L (Reference: 4.0-11.0) — Normal
- Platelets: 245 x10^9/L (Reference: 150-400) — Normal
- MCV: 68 fL (Reference: 80-100) — LOW (microcytic)
- MCH: 24 pg (Reference: 27-33) — LOW
- Ferritin: 5 µg/L (Reference: 20-200) — CRITICALLY LOW
- Serum Iron: 25 µg/dL (Reference: 60-170) — LOW
- Patient: {age} year old {gender}
- Location: Ghana

This indicates severe iron deficiency anemia. Please provide analysis with local Ghanaian dietary recommendations.`,
	},
	typhoid: {
		title: "Typhoid Lab Result",
		description: "Widal test showing Salmonella typhi positive",
		emoji: "📝",
		prompt: `Analyze this Typhoid laboratory result:
- Widal Test:
  - Salmonella typhi O: 1:320 (Significant — POSITIVE)
  - Salmonella typhi H: 1:160 (Significant — POSITIVE)
  - Salmonella paratyphi AO: 1:20 (Not significant)
  - Salmonella paratyphi BO: 1:20 (Not significant)
- Blood Culture: Salmonella typhi isolated
- WBC: 3.8 x10^9/L (Reference: 4.0-11.0) — Slightly low (leukopenia)
- ESR: 45 mm/hr (Reference: 0-20) — ELEVATED
- Temperature at time of test: 39.2°C
- Patient: {age} year old {gender}
- Location: Ghana

This confirms active Typhoid fever infection. Provide analysis with Ghanaian dietary guidance for recovery.`,
	},
	urinalysis: {
		title: "Urinalysis Report",
		description: "Urine analysis indicating dehydration and urinary stress",
		emoji: "🧪",
		prompt: `Analyze this Urinalysis laboratory result:
- Color: Dark amber (Reference: Pale to dark yellow)
- Specific Gravity: 1.035 (Reference: 1.005-1.030) — HIGH (concentrated)
- pH: 5.0 (Reference: 4.5-8.0) — Acidic
- Protein: 2+ (Reference: Negative) — ABNORMAL
- Glucose: Negative — Normal
- Ketones: 1+ (Reference: Negative) — Present
- Blood: 1+ (Reference: Negative) — ABNORMAL
- WBC (Leukocytes): 3+ (Reference: Negative) — HIGH
- Nitrites: Positive (Reference: Negative) — Suggests bacterial infection
- Bacteria: Many seen on microscopy
- RBC: 5-10 per HPF (Reference: 0-2) — ELEVATED
- Patient: {age} year old {gender}
- Location: Ghana

This suggests a urinary tract infection with significant dehydration. Provide analysis with Ghanaian remedies and hydration guidance.`,
	},
	hep_b: {
		title: "Hepatitis B Profile",
		description: "Reactive HBsAg screening",
		emoji: "🧬",
		prompt: `Analyze this Hepatitis B profile:
- HBsAg (Hepatitis B surface antigen): REACTIVE
- HBsAb (Hepatitis B surface antibody): Non-Reactive
- HBcAb (Total Hepatitis B core antibody): REACTIVE
- HBeAg (Hepatitis B e antigen): Non-Reactive
- HBeAb (Hepatitis B e antibody): REACTIVE
- Patient: {age} year old {gender}
- Location: Ghana

This suggests a chronic Hepatitis B infection with low viral replication. Provide analysis and highlight the importance of medical follow-up, along with general liver-friendly Ghanaian dietary advice.`,
	},
	fbs_diabetes: {
		title: "Fasting Blood Sugar",
		description: "Elevated glucose levels (Diabetes)",
		emoji: "🍬",
		prompt: `Analyze this Fasting Blood Sugar (FBS) result:
- Fasting Blood Sugar: 8.5 mmol/L (Reference: 3.9 - 5.5 mmol/L) — HIGH
- HbA1c: 7.2% (Reference: < 5.7%) — HIGH
- Patient: {age} year old {gender}
- Location: Ghana

This indicates diabetes mellitus. Provide analysis and highlight Ghanaian dietary changes (like reducing heavy carbohydrates, switching to complex local carbs) and medical consultation.`,
	},
	sickle_cell: {
		title: "Sickle Cell Screening",
		description: "Hb electrophoresis (Sickle Trait)",
		emoji: "🔬",
		prompt: `Analyze this Sickle Cell screening (Hemoglobin Electrophoresis) result:
- Hemoglobin A (HbA): 58%
- Hemoglobin S (HbS): 40%
- Hemoglobin F (HbF): 1.5%
- Hemoglobin A2 (HbA2): 0.5%
- Conclusion: Sickle Cell Trait (HbAS)
- Patient: {age} year old {gender}
- Location: Ghana

This indicates the patient is a carrier of the sickle cell trait but does not have sickle cell disease. Provide a clear explanation of what this means for their health and future family planning.`,
	},
	cholera: {
		title: "Stool Analysis",
		description: "Suspicion of acute watery diarrhea",
		emoji: "💧",
		prompt: `Analyze this Stool Routine Examination:
- Macroscopy: Watery, "rice-water" appearance
- Microscopy: 
  - Pus cells: Numerous
  - RBCs: Occasional
  - Ova/Parasites: None seen
- Hanging Drop Preparation: Darting motility observed (vibrio suspected)
- Patient: {age} year old {gender}
- Location: Ghana

This strongly suggests a Vibrio cholerae infection. Provide analysis stressing extreme urgency for rehydration (ORS) and immediate medical attention.`,
	},
};

// ─── Small-Talk Responses ────────────────────────────────────────────────────

const GREETING_RESPONSES = {
	english: {
		message:
			"Hello! I'm your Genetiq Health Assistant. Describe your symptoms or tap a quick suggestion below — that helps me give you a faster, more useful answer.",
		bodySystem: "total",
		urgency: "Green",
		condition: "General greeting",
		system: "General",
	},
	twi: {
		message:
			"Maakye/Maaha/Maadi! Me ne wo Gemma Ahoɔden Boafo. Kyerɛ me wo yare anaa kɔfa nhwɛsoɔ a ɛwɔ ase ha — ɛbɛma me ama wo ntɛm.",
		bodySystem: "total",
		urgency: "Green",
		condition: "General greeting",
		system: "General",
	},
	ga: {
		message:
			"Ojekoo! Mi ji Gemma Hewale Yelikɛlɔ. Kɛɛ mi bo ni hewale shishi aloo fĩi nhwɛsoɔ ko wɔ shishi nɛɛ.",
		bodySystem: "total",
		urgency: "Green",
		condition: "General greeting",
		system: "General",
	},
	ewe: {
		message:
			"Woezɔ! Nye nye Gemma Lãmesẽ Boafo. Kpɔ wò lãmesẽ ŋu alo tia nɔnɔme bubu le ete.",
		bodySystem: "total",
		urgency: "Green",
		condition: "General greeting",
		system: "General",
	},
	fante: {
		message:
			"Maakye/Maaha! Me ne wo Gemma Ahoɔden Boafo. Kyerɛ me wo yare anaa paw nhwɛsoɔ bi wɔ ase ha.",
		bodySystem: "total",
		urgency: "Green",
		condition: "General greeting",
		system: "General",
	},
};

const WELLBEING_REPLY_RESPONSES = {
	english: {
		message:
			"That's great to hear! I'm doing well too — thanks for asking. Whenever you're ready, tell me how you're feeling or what's bothering you (fever, headache, stomach pain, etc.), or tap a quick suggestion below.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
	twi: {
		message:
			"Ɛyɛ anigyeɛ sɛ wote yie! Me nso mete yie — meda wo ase. Sɛ wobɛyɛ a, kyerɛ me sɛnea wote anaa deɛ ɛhaw wo, anaa paw nhwɛsoɔ bi wɔ ase ha.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
	ga: {
		message:
			"Ehi kpakpa! Mi nɔ yɛɛ ehi tamɔ — akpe. Kɛji wobɛyɛ a, kɛɛ mi bo ni hewale shishi aloo fĩi nhwɛsoɔ ko.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
	ewe: {
		message:
			"Enyo ŋutɔ! Nye hã le dɔwɔwɔ me. Ne èdi be yee la, kpɔ wò lãmesẽ ŋu alo tia nɔnɔme bubu le ete.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
	fante: {
		message:
			"Ɛyɛ anigye sɛ wote yie! Me nso mete yie. Sɛ wobɛyɛ a, kyerɛ me sɛnea wote anaa paw nhwɛsoɔ bi wɔ ase ha.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
};

const WELLBEING_QUESTION_RESPONSES = {
	english: {
		message:
			"I'm here and ready to help! How are you feeling health-wise today? Any symptoms like fever, cough, or body pain I can help with?",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
	twi: {
		message:
			"Mewɔ ha na mɛboa wo! Ɛte sɛn nnɛ wɔ wo ahoɔden ho? Wo wɔ yare bi a metumi aboa wo — te sɛ ayerɛ, honam yare anaa mogya mu yare?",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
	ga: {
		message:
			"Mi wɔ he ni mɛbaaye abua bo! Ɛte sɛn wɔ wo hewale he nnɛ? Wò wɔ hela shishi a míte ŋu aboa wo?",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
	ewe: {
		message:
			"Nye le afi be nàte ŋu! Aleke nèlãmesẽ le egbe? Èle asrã alo lãmesẽ bubu a míate ŋu aboa wò?",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
	fante: {
		message:
			"Mewɔ ha na mɛboa wo! Ɛte sɛn nnɛ wɔ wo ahoɔden ho? Wo wɔ yare bi a metumi aboa wo?",
		bodySystem: "total",
		urgency: "Green",
		condition: "Casual conversation",
		system: "General",
	},
};

const REDIRECT_RESPONSES = {
	english: {
		message:
			"I'm here for health questions! Tell me what's bothering you — for example fever, headache, stomach pain, or cough — or tap one of the quick suggestions for a faster answer.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Awaiting symptoms",
		system: "General",
	},
	twi: {
		message:
			"Mewɔ ha ma ahoɔden ho asɛm! Kyerɛ me deɛ ɛhaw wo — te sɛ ayerɛ, ti yare, yafunu mu yare anaa honam yare — anaa paw nhwɛsoɔ bi wɔ ase ha.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Awaiting symptoms",
		system: "General",
	},
	ga: {
		message:
			"Mi wɔ he ma hewale asɛm! Kɛɛ mi bo ni ɛhaw wo — tamɔ fever, headache, stomach pain — aloo fĩi nhwɛsoɔ ko.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Awaiting symptoms",
		system: "General",
	},
	ewe: {
		message:
			"Nye le afi ma lãmesẽ ŋutɔ! Kpɔ nusi ɖe wò ŋu — abe fiever, tsi yome, alo honam yome — alo tia nɔnɔme bubu le ete.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Awaiting symptoms",
		system: "General",
	},
	fante: {
		message:
			"Mewɔ ha ma ahoɔden ho asɛm! Kyerɛ me deɛ ɛhaw wo, anaa paw nhwɛsoɔ bi wɔ ase ha.",
		bodySystem: "total",
		urgency: "Green",
		condition: "Awaiting symptoms",
		system: "General",
	},
};

// ─── Translations ────────────────────────────────────────────────────────────

const TRANSLATIONS = {
	twi: {
		"Your results are ready": "Wo ntoboa no awie",
		Normal: "Ɛyɛ papa",
		"A little high": "Ɛkɔ soro kakra",
		"Lower than ideal": "Ɛyɛ ketewa sene deɛ ɛsɛ",
		"Low — see a doctor": "Ɛyɛ ketewa kɔ dɔkota nkyɛn",
		"Health Score": "Ahoɔden Bɔ",
		"What we found": "Deɛ yɛhuu",
		"What to do next": "Deɛ ɛsɛ sɛ woyɛ",
		"Please see a doctor immediately": "Yɛsrɛ wo, kɔ dɔkota nkyɛn ntɛm",
		"Drink plenty of water": "Nom nsuo pii",
		"Malaria detected": "Malaria aba",
		"Visit your nearest CHPS compound": "Kɔ CHPS a ɛbɛn wo nkyɛn",
		Emergency: "Asɛmhia",
	},
	ga: {
		"Your results are ready": "Wo results lɛ esɛɛ",
		Normal: "Enyɛ bɔɔlɛ",
		"A little high": "Eji ko pipi",
		"Lower than ideal": "Ekɛ tsɔɔ",
		"Low — see a doctor": "Ekɛ tsɔɔ yaa dɔkita he",
		"Health Score": "Hewale Score",
		"What we found": "Nii míhùù",
		"What to do next": "Nii mɛɛhe eyɛ",
		"Please see a doctor immediately": "Mitsɛɔ bo, yaa dɔkita he ntɛɛ",
		"Drink plenty of water": "Nu nù puputu",
		"Malaria detected": "Malaria bɛ ba",
		"Visit your nearest CHPS compound": "Yaa CHPS ni enuu ko bo he",
		Emergency: "Kɛjɛɛmɔ",
	},
	ewe: {
		"Your results are ready": "Wò ŋkuɖoɖo siwo sɔ",
		Normal: "Edzɔ le eŋu",
		"A little high": "Ede ɖe dzi viɖe",
		"Lower than ideal": "Ege ɖe anyi wu alesi enyo",
		"Low — see a doctor": "Ege ɖe anyi yi dɔkta gbɔ",
		"Health Score": "Lãmesẽ Xexlẽme",
		"What we found": "Nusi míkpɔ",
		"What to do next": "Nusi nàwɔ eyome",
		"Please see a doctor immediately": "Meɖe kuku, yi dɔkta gbɔ kaba",
		"Drink plenty of water": "No tsi gbɔ̃ vitɔ",
		"Malaria detected": "Asrã va",
		"Visit your nearest CHPS compound": "Yi CHPS si le ŋugɔ̃ wo gbɔ",
		Emergency: "Nuwɔwɔ kaba",
	},
	fante: {
		"Your results are ready": "Wo results no awie",
		Normal: "Ɛyɛ papa",
		"A little high": "Ɛkɔ soro kakra",
		"Lower than ideal": "Ɛyɛ ketewa sen deɛ ɛsɛ",
		"Low — see a doctor": "Ɛyɛ ketewa — kɔ dɔkota nkyɛn",
		"Health Score": "Ahoɔden Bɔ",
		"What we found": "Deɛ yɛhuu",
		"What to do next": "Deɛ ɛsɛ sɛ woyɛ",
		"Please see a doctor immediately": "Mesrɛ wo, kɔ dɔkota nkyɛn ntɛm",
		"Drink plenty of water": "Nom nsuo pii",
		"Malaria detected": "Malaria aba",
		"Visit your nearest CHPS compound": "Kɔ CHPS a ɛbɛn wo nkyɛn",
		Emergency: "Asɛmhia",
	},
};

// ─── Medical Keyword Detection ───────────────────────────────────────────────

const GREETING_RE =
	/^(hi|hello|hey|hola|greetings|good\s*(morning|afternoon|evening)|howdy|sup|yo)[\s!?.，]*$/i;

const MEDICAL_KEYWORDS_RE =
	/fever|pain|painful|aching|aches?|hurts?|hurt|injur|wound|fracture|bruise|cut|burn|sprain|accident|fell|fall|broken|lacerat|bleed|head|headache|migraine|cough|symptom|vomit|diarr|chill|nausea|dizz|weak|tired|breath|chest|stomach|malaria|typhoid|urin|swell|rash|sick|ill|unwell|sore|cramp|infection|anemia|diabet|pressure|body\s*pain|throat|ear|eye|appetite|weight\s*loss|can'?t\s*eat|not\s*eating|constipat|bloat|fatigue|insomnia|sleep|palpit|swollen|jaundice|dehydrat|defecat|bowel|stool|feces|faeces|poop|toilet|lavatory|loose\s*stool|ankle|knee|leg|arm|hand|foot|finger|toe|back|neck|shoulder|wrist|hip|bite|sting|allerg/i;

const BODY_PART_RE =
	/\b(head|stomach|chest|back|throat|ear|eyes?|neck|joint|muscle|leg|arm|knee|ankle|hand|foot|finger|toe|shoulder|wrist|hip)\b/i;
const DISCOMFORT_RE =
	/\b(ach|pain|hurt|sore|swell|bleed|stiff|numb|tingl)/i;
const LOSS_SYMPTOM_RE =
	/\b(lost|losing|loss|no|lack|poor|low|reduced|decreased)\b/i;
const SYMPTOM_NOUN_RE =
	/\b(appetite|weight|energy|sleep|hair|hearing|vision)\b/i;
const HEALTH_QUESTION_RE =
	/\b(i have|i've|i am|i'?m|im experiencing|suffering from|what might|what could|why do i|feel(ing)?)\b/i;
const HEALTH_TOPIC_RE =
	/\b(pain|fever|ache|symptom|problem|issues?|wrong|sick|unwell|well|tired|weak|dizzy|nausea|vomit|cough|head|stomach|appetite|weight|sleep|breath|swell|rash|infection|eating|eat|bowel|stool|diarr|injur|hurt|wound|bleed|off|bad|terrible|awful)\b/i;

function hasMedicalKeywords(text) {
	const lower = text.toLowerCase();
	if (MEDICAL_KEYWORDS_RE.test(lower)) return true;
	if (BODY_PART_RE.test(lower) && DISCOMFORT_RE.test(lower)) return true;
	if (LOSS_SYMPTOM_RE.test(lower) && SYMPTOM_NOUN_RE.test(lower)) return true;
	if (HEALTH_QUESTION_RE.test(lower) && HEALTH_TOPIC_RE.test(lower))
		return true;
	return false;
}

function isLikelyHealthMessage(text) {
	if (hasMedicalKeywords(text)) return true;
	const lower = text.toLowerCase();
	if (
		/\b(health|injur|wound|hurt|accident|fell|fall|broken|bleed|doctor|hospital|clinic|bother|wrong|sick|symptom|problem|help|advice|unwell|ache|aching|discomfort|concern|worried|worry)\b/.test(
			lower
		)
	)
		return true;
	if (
		/\b(feel(ing)?|not\s+well|under\s+the\s+weather|something\s+wrong|going\s+on)\b/.test(
			lower
		)
	)
		return true;
	const trimmed = text.trim();
	if (
		trimmed.length >= 8 &&
		/[a-z]{3,}/i.test(trimmed) &&
		!/^(hi|hello|hey|thanks|thank\s*you|ok|okay|yes|no|maybe)\b/i.test(trimmed)
	)
		return true;
	return false;
}

/**
 * Get an instant small-talk response if the message is a greeting/casual chat.
 * Returns null if the message should go to the AI model instead.
 */
function getSmallTalkResponse(message, language) {
	const text = message.trim();
	const lower = text.toLowerCase();
	const lang = GREETING_RESPONSES[language] ? language : "english";

	if (isLikelyHealthMessage(text)) return null;

	if (GREETING_RE.test(text)) return { ...GREETING_RESPONSES[lang] };

	if (/how\s*(are|r)\s*you|how\s*you\s*doing|how'?s\s*it\s*going/i.test(lower))
		return { ...WELLBEING_QUESTION_RESPONSES[lang] };

	if (
		/(i'?m|i am|im)\s*(good|fine|well|ok|okay|great)/i.test(lower) &&
		!/\b(not|don'?t|dont|never)\b/i.test(lower)
	)
		return { ...WELLBEING_REPLY_RESPONSES[lang] };
	if (/\bdoing\s+well\b/i.test(lower) && !/\bnot\b/i.test(lower))
		return { ...WELLBEING_REPLY_RESPONSES[lang] };
	if (/(yourself|and\s*you|what\s*about\s*you|u\?|you\?)/i.test(lower))
		return { ...WELLBEING_REPLY_RESPONSES[lang] };
	if (/^good\s*(thanks|thank\s*you)?[\s!?.]*$/i.test(lower))
		return { ...WELLBEING_REPLY_RESPONSES[lang] };

	if (/^(thanks|thank\s*you|thx|cheers)[\s!?.，]*$/i.test(lower))
		return { ...WELLBEING_REPLY_RESPONSES[lang] };

	// Only redirect very short, clearly non-medical replies
	if (
		text.length <= 12 &&
		!isLikelyHealthMessage(text) &&
		/^(ok|okay|k|yes|no|maybe|sure|cool|nice|hm+|m+)\s*[!?.]*$/i.test(lower)
	)
		return { ...REDIRECT_RESPONSES[lang] };

	return null;
}

module.exports = {
	LAB_ANALYSIS_SYSTEM_PROMPT,
	LAB_TEXT_ANALYSIS_SYSTEM_PROMPT,
	CHAT_SYSTEM_PROMPT,
	CHAT_SYSTEM_PROMPT_SHORT,
	ACTION_PLAN_SYSTEM_PROMPT,
	TRANSLATION_PROMPT,
	PRESET_CASES,
	GREETING_RESPONSES,
	WELLBEING_REPLY_RESPONSES,
	WELLBEING_QUESTION_RESPONSES,
	REDIRECT_RESPONSES,
	TRANSLATIONS,
	getSmallTalkResponse,
	isLikelyHealthMessage,
};
