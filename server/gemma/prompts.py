# ─── Curated System Prompts for Gemma 4 Health Analysis ───────────────────────
# Designed for Ghanaian healthcare context

LAB_ANALYSIS_SYSTEM_PROMPT = """You are Genetiq AI, a medical laboratory result analyzer built for Ghanaian healthcare.
You receive images of lab results (blood panels, rapid diagnostic tests, urinalysis, etc.) and patient context.

Your job:
1. Extract every biomarker/value from the lab result image
2. Classify each as: "normal", "elevated", "low", or "action" (requires urgent medical attention)
3. Explain each finding in plain English that a non-medical person can understand
4. Generate a health score from 0-100 based on the overall results
5. Provide 3-5 actionable recommendations using LOCAL GHANAIAN foods, herbs, and remedies where appropriate

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
      "statusLabel": "<plain English status>",
      "note": "<2-3 sentence plain English explanation>"
    }
  ],
  "recommendations": [
    {
      "icon": "<emoji>",
      "title": "<short action title>",
      "body": "<detailed recommendation with Ghanaian food/remedy suggestions>"
    }
  ],
  "summary": "<2-3 sentence overall summary in plain English>",
  "bodySystem": "<primary body system: Hematology|Gastroenterolgy|Pulmonology|Nephrology|Endocrinology|CardioLoad|total>"
}"""

LAB_TEXT_ANALYSIS_SYSTEM_PROMPT = """You are Genetiq AI, a medical laboratory result analyzer built for Ghanaian healthcare.
You receive OCR-extracted text from lab result photos or reports (blood panels, RDT strips, urinalysis, etc.) and patient context.
The text may contain OCR errors — infer the intended values when obvious.

Your job:
1. Parse every biomarker/value from the lab text
2. Classify each as: "normal", "elevated", "low", or "action" (requires urgent medical attention)
3. Explain each finding in plain English that a non-medical person can understand
4. Generate a health score from 0-100 based on the overall results
5. Provide 3-5 actionable recommendations using LOCAL GHANAIAN foods, herbs, and remedies where appropriate

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
      "statusLabel": "<plain English status>",
      "note": "<2-3 sentence plain English explanation>"
    }
  ],
  "recommendations": [
    {
      "icon": "<emoji>",
      "title": "<short action title>",
      "body": "<detailed recommendation with Ghanaian food/remedy suggestions>"
    }
  ],
  "summary": "<2-3 sentence overall summary in plain English>",
  "bodySystem": "<primary body system: Hematology|Gastroenterolgy|Pulmonology|Nephrology|Endocrinology|CardioLoad|total>"
}"""

CHAT_SYSTEM_PROMPT = """You are Genetiq AI, a compassionate health assistant designed for people in Ghana.
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

Always respond warmly and simply. Many users may not speak English as a first language.
Include the body system in your response for 3D visualization.

Respond in JSON:
{
  "message": "<your response to the user>",
  "bodySystem": "<matched body system for 3D twin>",
  "urgency": "<Green|Yellow|Red>",
  "condition": "<suspected condition name>",
  "system": "<medical system name>"
}"""

ACTION_PLAN_SYSTEM_PROMPT = """You are Genetiq AI, a personalized health action planner for patients in Ghana.
You receive the patient's lab results, health profile, symptoms, and lifestyle data.

Your job:
1. Create a personalized action plan with concrete, achievable next steps
2. Organize every action into exactly one of these categories:
   - "Follow-up Care" — tests, monitoring, doctor visits, screenings
   - "Supplements" — vitamins, minerals, herbal supplements (include dosage when known)
   - "Lifestyle" — diet, exercise, sleep, stress, smoking/alcohol, daily habits
3. Base every recommendation on the patient's actual data — do NOT invent lab values
4. Prefer local Ghanaian foods and remedies where appropriate (Kontomire, Sobolo, Moringa, etc.)
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
}"""

# Shorter prompt for brief messages — reduces CPU prefill time significantly
CHAT_SYSTEM_PROMPT_SHORT = """You are Genetiq AI, a Ghana health assistant. Give warm, simple advice.
Common conditions: malaria, typhoid, anemia, UTI. Emergency: call 112 or 193.
Respond ONLY in valid JSON:
{"message":"<reply>","bodySystem":"<Hematology|Gastroenterolgy|Pulmonology|Nephrology|Endocrinology|CardioLoad|total>","urgency":"<Green|Yellow|Red>","condition":"<name>","system":"<name>"}"""

# Instant responses for greetings — avoids 2-3 min CPU inference for "hi"
GREETING_RESPONSES = {
    "english": {
        "message": "Hello! I'm your Genetiq Health Assistant. Describe your symptoms or tap a quick suggestion below — that helps me give you a faster, more useful answer.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "General greeting",
        "system": "General",
    },
    "twi": {
        "message": "Maakye/Maaha/Maadi! Me ne wo Gemma Ahoɔden Boafo. Kyerɛ me wo yare anaa kɔfa nhwɛsoɔ a ɛwɔ ase ha — ɛbɛma me ama wo ntɛm.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "General greeting",
        "system": "General",
    },
    "ga": {
        "message": "Ojekoo! Mi ji Gemma Hewale Yelikɛlɔ. Kɛɛ mi bo ni hewale shishi aloo fĩi nhwɛsoɔ ko wɔ shishi nɛɛ.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "General greeting",
        "system": "General",
    },
    "ewe": {
        "message": "Woezɔ! Nye nye Gemma Lãmesẽ Boafo. Kpɔ wò lãmesẽ ŋu alo tia nɔnɔme bubu le ete.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "General greeting",
        "system": "General",
    },
    "fante": {
        "message": "Maakye/Maaha! Me ne wo Gemma Ahoɔden Boafo. Kyerɛ me wo yare anaa paw nhwɛsoɔ bi wɔ ase ha.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "General greeting",
        "system": "General",
    },
}

# Replies when user shares how they are / asks "yourself?"
WELLBEING_REPLY_RESPONSES = {
    "english": {
        "message": "That's great to hear! I'm doing well too — thanks for asking. Whenever you're ready, tell me how you're feeling or what's bothering you (fever, headache, stomach pain, etc.), or tap a quick suggestion below.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
    "twi": {
        "message": "Ɛyɛ anigyeɛ sɛ wote yie! Me nso mete yie — meda wo ase. Sɛ wobɛyɛ a, kyerɛ me sɛnea wote anaa deɛ ɛhaw wo, anaa paw nhwɛsoɔ bi wɔ ase ha.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
    "ga": {
        "message": "Ehi kpakpa! Mi nɔ yɛɛ ehi tamɔ — akpe. Kɛji wobɛyɛ a, kɛɛ mi bo ni hewale shishi aloo fĩi nhwɛsoɔ ko.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
    "ewe": {
        "message": "Enyo ŋutɔ! Nye hã le dɔwɔwɔ me. Ne èdi be yee la, kpɔ wò lãmesẽ ŋu alo tia nɔnɔme bubu le ete.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
    "fante": {
        "message": "Ɛyɛ anigye sɛ wote yie! Me nso mete yie. Sɛ wobɛyɛ a, kyerɛ me sɛnea wote anaa paw nhwɛsoɔ bi wɔ ase ha.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
}

# When user asks how the bot is doing
WELLBEING_QUESTION_RESPONSES = {
    "english": {
        "message": "I'm here and ready to help! How are you feeling health-wise today? Any symptoms like fever, cough, or body pain I can help with?",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
    "twi": {
        "message": "Mewɔ ha na mɛboa wo! Ɛte sɛn nnɛ wɔ wo ahoɔden ho? Wo wɔ yare bi a metumi aboa wo — te sɛ ayerɛ, honam yare anaa mogya mu yare?",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
    "ga": {
        "message": "Mi wɔ he ni mɛbaaye abua bo! Ɛte sɛn wɔ wo hewale he nnɛ? Wò wɔ hela shishi a míte ŋu aboa wo?",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
    "ewe": {
        "message": "Nye le afi be nàte ŋu! Aleke nèlãmesẽ le egbe? Èle asrã alo lãmesẽ bubu a míate ŋu aboa wò?",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
    "fante": {
        "message": "Mewɔ ha na mɛboa wo! Ɛte sɛn nnɛ wɔ wo ahoɔden ho? Wo wɔ yare bi a metumi aboa wo?",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Casual conversation",
        "system": "General",
    },
}

# Non-medical messages with no clear symptoms — guide user instead of generic triage
REDIRECT_RESPONSES = {
    "english": {
        "message": "I'm here for health questions! Tell me what's bothering you — for example fever, headache, stomach pain, or cough — or tap one of the quick suggestions for a faster answer.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Awaiting symptoms",
        "system": "General",
    },
    "twi": {
        "message": "Mewɔ ha ma ahoɔden ho asɛm! Kyerɛ me deɛ ɛhaw wo — te sɛ ayerɛ, ti yare, yafunu mu yare anaa honam yare — anaa paw nhwɛsoɔ bi wɔ ase ha.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Awaiting symptoms",
        "system": "General",
    },
    "ga": {
        "message": "Mi wɔ he ma hewale asɛm! Kɛɛ mi bo ni ɛhaw wo — tamɔ fever, headache, stomach pain — aloo fĩi nhwɛsoɔ ko.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Awaiting symptoms",
        "system": "General",
    },
    "ewe": {
        "message": "Nye le afi ma lãmesẽ ŋutɔ! Kpɔ nusi ɖe wò ŋu — abe fiever, tsi yome, alo honam yome — alo tia nɔnɔme bubu le ete.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Awaiting symptoms",
        "system": "General",
    },
    "fante": {
        "message": "Mewɔ ha ma ahoɔden ho asɛm! Kyerɛ me deɛ ɛhaw wo, anaa paw nhwɛsoɔ bi wɔ ase ha.",
        "bodySystem": "total",
        "urgency": "Green",
        "condition": "Awaiting symptoms",
        "system": "General",
    },
}

TRANSLATION_PROMPT = """Translate the following health information into {language}.
Keep medical terms in English but explain them in {language}.
Use simple, everyday language that anyone can understand.
The languages supported are:
- Twi (Akan)
- Ga
- Ewe  
- Fante

Text to translate:
{text}

Respond with just the translation, nothing else."""


# ─── Ghanaian Medical Case Presets ────────────────────────────────────────────
# These are used when a user clicks a preset instead of uploading a file

PRESET_CASES = {
    "malaria_rdt": {
        "title": "Malaria RDT Strip",
        "description": "Rapid Diagnostic Test positive for P. falciparum malaria",
        "emoji": "🦟",
        "prompt": """Analyze this Malaria Rapid Diagnostic Test (RDT) result:
- Test Type: SD Bioline Malaria Ag P.f/P.v
- Control Line (C): Present (valid test)
- P.f Line: POSITIVE (band visible)
- P.v Line: Negative
- Patient: {age} year old {gender}
- Location: Ghana

The test is POSITIVE for Plasmodium falciparum malaria.
Please provide a complete analysis with findings, health score, and recommendations using local Ghanaian remedies alongside medical treatment."""
    },
    "cbc_anemia": {
        "title": "CBC Panel — Severe Anemia",
        "description": "Complete Blood Count showing critically low hemoglobin",
        "emoji": "🩸",
        "prompt": """Analyze this Complete Blood Count (CBC) laboratory result:
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

This indicates severe iron deficiency anemia. Please provide analysis with local Ghanaian dietary recommendations."""
    },
    "typhoid": {
        "title": "Typhoid Lab Result",
        "description": "Widal test showing Salmonella typhi positive",
        "emoji": "📝",
        "prompt": """Analyze this Typhoid laboratory result:
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

This confirms active Typhoid fever infection. Provide analysis with Ghanaian dietary guidance for recovery."""
    },
    "urinalysis": {
        "title": "Urinalysis Report",
        "description": "Urine analysis indicating dehydration and urinary stress",
        "emoji": "🧪",
        "prompt": """Analyze this Urinalysis laboratory result:
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

This suggests a urinary tract infection with significant dehydration. Provide analysis with Ghanaian remedies and hydration guidance."""
    }
}


# ─── Ghanaian Language Translation Dictionaries ───────────────────────────────
# Key medical phrases pre-translated for offline use

TRANSLATIONS = {
    "twi": {
        "Your results are ready": "Wo ntoboa no awie",
        "Normal": "Ɛyɛ papa",
        "A little high": "Ɛkɔ soro kakra",
        "Lower than ideal": "Ɛyɛ ketewa sene deɛ ɛsɛ",
        "Low — see a doctor": "Ɛyɛ ketewa — kɔ dɔkota nkyɛn",
        "Health Score": "Ahoɔden Bɔ",
        "What we found": "Deɛ yɛhuu",
        "What to do next": "Deɛ ɛsɛ sɛ woyɛ",
        "Eat more iron-rich foods": "Di nnuane a iron wɔ mu pii",
        "Get more Vitamin D": "Nya Vitamin D pii",
        "Book a doctor's appointment": "Hyɛ dɔkota adesua da",
        "Please see a doctor immediately": "Yɛsrɛ wo, kɔ dɔkota nkyɛn ntɛm",
        "Drink plenty of water": "Nom nsuo pii",
        "This is not a medical diagnosis": "Eyi nyɛ dɔkota asɛm",
        "Malaria detected": "Malaria aba",
        "Take your medication as prescribed": "Fa wo aduro sɛnea dɔkota kaeɛ",
        "Visit your nearest CHPS compound": "Kɔ CHPS a ɛbɛn wo nkyɛn",
        "Emergency": "Asɛmhia",
        "Call ambulance": "Frɛ ambulance",
    },
    "ga": {
        "Your results are ready": "Wo results lɛ esɛɛ",
        "Normal": "Enyɛ bɔɔlɛ",
        "A little high": "Eji ko pipi",
        "Lower than ideal": "Ekɛ tsɔɔ",
        "Low — see a doctor": "Ekɛ tsɔɔ — yaa dɔkita he",
        "Health Score": "Hewale Score",
        "What we found": "Nii míhùù",
        "What to do next": "Nii mɛɛhe eyɛ",
        "Please see a doctor immediately": "Mitsɛɔ bo, yaa dɔkita he ntɛɛ",
        "Drink plenty of water": "Nu nù puputu",
        "Malaria detected": "Malaria bɛ ba",
        "Visit your nearest CHPS compound": "Yaa CHPS ni enuu ko bo he",
        "Emergency": "Kɛjɛɛmɔ",
    },
    "ewe": {
        "Your results are ready": "Wò ŋkuɖoɖo siwo sɔ",
        "Normal": "Edzɔ le eŋu",
        "A little high": "Ede ɖe dzi viɖe",
        "Lower than ideal": "Ege ɖe anyi wu alesi enyo",
        "Low — see a doctor": "Ege ɖe anyi — yi dɔkta gbɔ",
        "Health Score": "Lãmesẽ Xexlẽme",
        "What we found": "Nusi míkpɔ",
        "What to do next": "Nusi nàwɔ eyome",
        "Please see a doctor immediately": "Meɖe kuku, yi dɔkta gbɔ kaba",
        "Drink plenty of water": "No tsi gbɔ̃ vitɔ",
        "Malaria detected": "Asrã va",
        "Visit your nearest CHPS compound": "Yi CHPS si le ŋugɔ̃ wo gbɔ",
        "Emergency": "Nuwɔwɔ kaba",
    },
    "fante": {
        "Your results are ready": "Wo results no awie",
        "Normal": "Ɛyɛ papa",
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
        "Emergency": "Asɛmhia",
    },
}


# ─── Ghanaian Remedy Encyclopedia ─────────────────────────────────────────────

GHANAIAN_REMEDIES = [
    {
        "name": "Moringa (Moringa oleifera)",
        "localName": "Moringa / Yevu-ti (Ewe)",
        "emoji": "🌿",
        "benefits": "Extremely rich in iron, protein, Vitamin A, Vitamin C, and calcium. Excellent for treating anemia and malnutrition.",
        "usage": "Add dried moringa powder to soups, stews, or Koko (porridge). 1-2 teaspoons daily.",
        "warning": "Avoid excessive amounts during pregnancy. Consult a doctor if on blood-thinning medication.",
        "conditions": ["anemia", "malnutrition", "low_iron", "fatigue"]
    },
    {
        "name": "Sobolo (Hibiscus sabdariffa)",
        "localName": "Sobolo / Bissap",
        "emoji": "🌺",
        "benefits": "Lowers blood pressure, rich in Vitamin C and antioxidants. Helps with hydration.",
        "usage": "Brew dried hibiscus petals in hot water. Drink 2-3 cups daily. Avoid adding too much sugar.",
        "warning": "May interact with blood pressure medications. If on BP meds, consult your doctor first.",
        "conditions": ["hypertension", "high_blood_pressure", "dehydration", "vitamin_c"]
    },
    {
        "name": "Kontomire (Cocoyam Leaves)",
        "localName": "Kontomire / Nkontomire",
        "emoji": "🥬",
        "benefits": "Very high in iron, folate, and Vitamin A. One of the best local foods for treating iron deficiency anemia.",
        "usage": "Cook in palaver sauce or kontomire stew with tomatoes, onions, and a squeeze of lemon/lime for iron absorption.",
        "warning": "Cook thoroughly — raw cocoyam leaves contain calcium oxalate which can irritate the throat.",
        "conditions": ["anemia", "low_iron", "pregnancy", "folate_deficiency"]
    },
    {
        "name": "Dawadawa (Parkia biglobosa)",
        "localName": "Dawadawa / Netetou",
        "emoji": "🫘",
        "benefits": "Natural probiotic, rich in protein and B vitamins. Supports gut health and digestion.",
        "usage": "Add to soups and stews as a flavoring. Small amounts go a long way.",
        "warning": "Has a very strong smell. Start with small quantities if not accustomed.",
        "conditions": ["digestive_issues", "gut_health", "protein_deficiency"]
    },
    {
        "name": "Neem (Azadirachta indica)",
        "localName": "Nim / Digo (Ewe)",
        "emoji": "🌳",
        "benefits": "Traditional antimalarial properties, antibacterial, and anti-inflammatory.",
        "usage": "Boil young neem leaves for tea. Drink once daily during malaria recovery. NOT a replacement for ACT medication.",
        "warning": "Do NOT use as sole malaria treatment — always take prescribed antimalarial drugs. Not safe during pregnancy.",
        "conditions": ["malaria", "fever", "infection", "skin_conditions"]
    },
    {
        "name": "Tiger Nut (Cyperus esculentus)",
        "localName": "Atadwe",
        "emoji": "🥜",
        "benefits": "Rich in fiber, magnesium, potassium, and healthy fats. Good source of energy.",
        "usage": "Eat raw as a snack, blend into milk (Atadwe milk), or add to smoothies.",
        "warning": "High in fiber — introduce gradually to avoid bloating. Not suitable for those with nut allergies.",
        "conditions": ["fatigue", "energy", "magnesium_deficiency", "digestive_health"]
    },
    {
        "name": "Ginger (Zingiber officinale)",
        "localName": "Akakaduro (Twi) / Dzeta (Ewe)",
        "emoji": "🫚",
        "benefits": "Anti-nausea, anti-inflammatory, aids digestion, and helps with cold/flu symptoms.",
        "usage": "Grate fresh ginger into hot water with lemon and honey. Drink 2-3 times daily when nauseous.",
        "warning": "May interact with blood-thinning medications. Avoid large amounts if you have gallstones.",
        "conditions": ["nausea", "cold", "flu", "digestive_issues", "inflammation"]
    },
]

EMERGENCY_CONTACTS = {
    "ambulance": "112 or 193",
    "fire": "192",
    "police": "191 or 18555",
    "poison_center": "0302 665401",
    "chps_info": "Visit your nearest CHPS (Community-based Health Planning and Services) compound for non-emergency care",
    "mental_health": "0800 678 678 (Mental Health Authority Helpline)",
}
