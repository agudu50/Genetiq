"""
Genetiq — Gemma 4 Multimodal Health Analysis Server
====================================================
FastAPI server that loads Gemma 4 12B-it for multimodal lab result analysis,
symptom triage, and Ghanaian language translation.

Usage:
    pip install -r requirements.txt
    python server.py              # Starts on port 8000
    python server.py --port 8080  # Custom port
    python server.py --model google/gemma-4-4B-it  # Smaller model for low-VRAM GPUs
"""

import argparse
import asyncio
import base64
import json
import logging
import os
import re
import sys
import tempfile
import traceback
from contextlib import asynccontextmanager
from io import BytesIO
from typing import Any, Optional

_GEMMA_DIR = os.path.dirname(os.path.abspath(__file__))
if _GEMMA_DIR not in sys.path:
    sys.path.insert(0, _GEMMA_DIR)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("genetiq-gemma")

# ─── Globals ──────────────────────────────────────────────────────────────────

model: Any = None
processor: Any = None
MODEL_ID = "google/gemma-4-12B-it"


# ==============================================================================
# 🧠 GEMMA 4 MODEL INITIALIZATION ENGINE
# ==============================================================================
# Authenticated & loaded locally via Hugging Face Hub (Gated access)
# Supports both Multimodal (vision/lab sheets) and CausalLM (chat/triage text)
# ==============================================================================

def load_model(model_id: str):
    """Load Gemma weights with AutoProcessor + AutoModelForCausalLM (multimodal-capable)."""
    global model, processor

    logger.info(f"🚀 Initializing Gemma Model Load: {model_id}")
    logger.info("⏳ Downloading weights from Hugging Face Repository...")

    try:
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Detected hardware device: {device}")

        if device == "cpu":
            # Use all physical cores for CPU inference
            torch.set_num_threads(max(1, os.cpu_count() or 1))

        # ─── UNIFIED MULTIMODAL MODEL LOADING (Gemma 4) ───
        # Gemma 4 is encoder-free, meaning it uses AutoModelForCausalLM for everything
        # (text, vision, audio) but requires AutoProcessor to process multimodal inputs.
        from transformers import AutoProcessor, AutoModelForCausalLM
        logger.info("🤖 Loading model weights under AutoModelForCausalLM with AutoProcessor...")
        
        # Load the processor (handles images, audio, and text)
        processor = AutoProcessor.from_pretrained(model_id)
        
        if device == "cuda":
            model = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=torch.bfloat16,
                device_map="auto",
            )
        else:
            # bfloat16 halves memory vs float32 — critical to avoid swapping on low-RAM machines
            model = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=torch.bfloat16,
            )
        logger.info(f"✅ Unified Multimodal Model loaded successfully: {model_id}")
        logger.info(f"   Device: {next(model.parameters()).device}")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        logger.error(traceback.format_exc())
        logger.warning("Server will start in FALLBACK mode (no model loaded)")


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    import threading
    logger.info("Starting Gemma model download/load in a background thread...")
    # Load the model in a background thread to avoid blocking the FastAPI event loop during startup.
    # This allows the server to immediately bind to port 8000 and respond to health check calls with model_loaded=False.
    threading.Thread(target=load_model, args=(MODEL_ID,), daemon=True).start()
    yield
    logger.info("Shutting down Gemma server...")


# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Genetiq Gemma 4 Health API",
    description="Multimodal health analysis powered by Gemma 4",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Imports from prompts ─────────────────────────────────────────────────────

from inference import Message, run_gemma_inference
from prompts import (
    ACTION_PLAN_SYSTEM_PROMPT,
    CHAT_SYSTEM_PROMPT,
    CHAT_SYSTEM_PROMPT_SHORT,
    GREETING_RESPONSES,
    LAB_ANALYSIS_SYSTEM_PROMPT,
    LAB_TEXT_ANALYSIS_SYSTEM_PROMPT,
    PRESET_CASES,
    REDIRECT_RESPONSES,
    TRANSLATION_PROMPT,
    TRANSLATIONS,
    WELLBEING_QUESTION_RESPONSES,
    WELLBEING_REPLY_RESPONSES,
)

GREETING_RE = re.compile(
    r"^(hi|hello|hey|hola|greetings|good\s*(morning|afternoon|evening)|"
    r"howdy|sup|yo)[\s!?.，]*$",
    re.IGNORECASE,
)

MEDICAL_KEYWORDS_RE = re.compile(
    r"fever|pain|painful|aching|aches?|hurts?|hurt|head|headache|migraine|cough|symptom|"
    r"vomit|diarr|chill|nausea|dizz|weak|tired|breath|chest|stomach|malaria|typhoid|urin|"
    r"bleed|swell|rash|sick|ill|unwell|sore|cramp|infection|anemia|diabet|pressure|"
    r"body\s*pain|throat|ear|eye|appetite|weight\s*loss|can'?t\s*eat|not\s*eating|"
    r"constipat|bloat|fatigue|insomnia|sleep|palpit|swollen|jaundice|dehydrat",
    re.IGNORECASE,
)

LOSS_SYMPTOM_RE = re.compile(
    r"\b(lost|losing|loss|no|lack|poor|low|reduced|decreased)\b", re.IGNORECASE
)
SYMPTOM_NOUN_RE = re.compile(
    r"\b(appetite|weight|energy|sleep|hair|hearing|vision)\b", re.IGNORECASE
)
HEALTH_QUESTION_RE = re.compile(
    r"\b(i have|i've|i am|im experiencing|suffering from|what might|what could|why do i|feel(ing)?)\b",
    re.IGNORECASE,
)
HEALTH_TOPIC_RE = re.compile(
    r"\b(pain|fever|ache|symptom|problem|issue|wrong|sick|unwell|tired|weak|dizzy|"
    r"nausea|vomit|cough|head|stomach|appetite|weight|sleep|breath|swell|rash|"
    r"infection|eating|eat)\b",
    re.IGNORECASE,
)

BODY_PART_RE = re.compile(
    r"\b(head|stomach|chest|back|throat|ear|eyes?|neck|joint|muscle)\b", re.IGNORECASE
)
DISCOMFORT_RE = re.compile(
    r"\b(ach|pain|hurt|sore|swell|bleed|stiff|numb|tingl)", re.IGNORECASE
)


def has_medical_keywords(text: str) -> bool:
    lower = text.lower()
    if MEDICAL_KEYWORDS_RE.search(lower):
        return True
    if BODY_PART_RE.search(lower) and DISCOMFORT_RE.search(lower):
        return True
    if LOSS_SYMPTOM_RE.search(lower) and SYMPTOM_NOUN_RE.search(lower):
        return True
    if HEALTH_QUESTION_RE.search(lower) and HEALTH_TOPIC_RE.search(lower):
        return True
    return False


def get_small_talk_response(message: str, language: str) -> dict | None:
    """Instant replies for greetings and casual chat — skip slow CPU inference."""
    text = message.strip()
    lower = text.lower()
    lang = language if language in GREETING_RESPONSES else "english"

    if has_medical_keywords(text):
        return None

    if GREETING_RE.match(text):
        return dict(GREETING_RESPONSES[lang])

    if re.search(r"how\s*(are|r)\s*you|how\s*you\s*doing|how'?s\s*it\s*going", lower):
        return dict(WELLBEING_QUESTION_RESPONSES[lang])

    if (
        re.search(r"(i'?m|i am|im)\s*(good|fine|well|ok|okay|great|doing\s*well)", lower)
        or re.search(r"(yourself|and\s*you|what\s*about\s*you|u\?|you\?)", lower)
        or re.match(r"^good\s*(thanks|thank\s*you)?[\s!?.]*$", lower)
    ):
        return dict(WELLBEING_REPLY_RESPONSES[lang])

    if re.match(r"^(thanks|thank\s*you|thx|cheers)[\s!?.，]*$", lower):
        return dict(WELLBEING_REPLY_RESPONSES[lang])

    # Short non-medical message — guide user instead of running triage
    if len(text) < 120 and not has_medical_keywords(lower):
        return dict(REDIRECT_RESPONSES[lang])

    return None


def estimate_chat_max_tokens(message: str) -> int:
    """Scale generation budget to message size — keeps CPU replies under ~2 min."""
    length = len(message.strip())
    if length < 40:
        return 96
    if length < 120:
        return 160
    if length < 300:
        return 240
    return 320


# ─── Request/Response Models ─────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    image_base64: Optional[str] = None  # base64 encoded image
    image_url: Optional[str] = None  # OR a URL to an image
    lab_text: Optional[str] = None  # OCR or pasted lab report text
    preset_id: Optional[str] = None  # OR a preset case ID
    patient_age: str = ""
    patient_gender: str = ""
    language: str = "english"  # english, twi, ga, ewe, fante


def processor_supports_vision() -> bool:
    """True when the loaded processor can handle image inputs."""
    if processor is None:
        return False
    from transformers import PreTrainedTokenizerBase

    return not isinstance(processor, PreTrainedTokenizerBase)


class ChatRequest(BaseModel):
    message: str
    language: str = "english"
    image_base64: Optional[str] = None  # Optional image for multimodal chat


class TranslateRequest(BaseModel):
    text: str
    language: str  # twi, ga, ewe, fante


class ActionPlanRequest(BaseModel):
    patient_age: str = ""
    patient_gender: str = ""
    health_score: int = 0
    summary: str = ""
    findings: list[dict] = []
    recommendations: list[dict] = []
    symptoms: list[str] = []
    medical_conditions: list[str] = []
    medications: list[dict] = []
    lifestyle: dict = {}
    bmi: Optional[float] = None
    language: str = "english"


# ─── Helper: Generate with Gemma ─────────────────────────────────────────────


def generate_response(messages: list[Message], max_tokens: int = 2048) -> str:
    """Run local Gemma inference via the shared inference module."""
    if model is None or processor is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Server is in fallback mode.",
        )
    return run_gemma_inference(model, processor, logger, messages, max_tokens)


async def generate_response_async(messages: list[Message], max_tokens: int = 2048) -> str:
    """Run blocking model inference in a worker thread so the event loop
    (health checks, other requests) stays responsive during generation."""
    return await asyncio.to_thread(generate_response, messages, max_tokens)


def parse_json_response(text: str) -> dict:
    """Extract JSON from model response text."""
    # Try to find JSON block in the response
    json_match = re.search(r"\{[\s\S]*\}", text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # If no valid JSON found, return error structure
    return {"error": "Could not parse model response", "raw": text}


# ─── Endpoints ────────────────────────────────────────────────────────────────


@app.get("/api/gemma/health")
async def health_check():
    """Check if the Gemma server and model are available."""
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_id": MODEL_ID,
        "device": str(next(model.parameters()).device) if model else "none",
        "supports_vision": processor_supports_vision(),
    }


@app.post("/api/gemma/analyze")
async def analyze_lab_results(req: AnalyzeRequest):
    """Analyze lab results using Gemma 4 vision or preset prompts."""

    is_text_only = not processor_supports_vision()
    if (
        is_text_only
        and (req.image_base64 or req.image_url)
        and not req.preset_id
        and not req.lab_text
    ):
        raise HTTPException(
            status_code=422,
            detail="Current model is text-only. Send lab_text (OCR or pasted report text) or use a preset case.",
        )

    # Build the content array for the user message
    content = []
    system_prompt = LAB_ANALYSIS_SYSTEM_PROMPT

    if req.preset_id and req.preset_id in PRESET_CASES:
        # Use a preset case (text-only prompt simulating lab data)
        preset = PRESET_CASES[req.preset_id]
        prompt_text = preset["prompt"].format(
            age=req.patient_age or "35",
            gender=req.patient_gender or "unknown",
        )
        content.append({"type": "text", "text": prompt_text})

    elif req.lab_text and req.lab_text.strip():
        system_prompt = LAB_TEXT_ANALYSIS_SYSTEM_PROMPT
        age = req.patient_age or "35"
        gender = req.patient_gender or "unknown"
        content.append({
            "type": "text",
            "text": (
                f"Analyze this lab result text for a {age} year old {gender} patient in Ghana.\n"
                f"The text was extracted from a photo (OCR) and may contain minor errors.\n\n"
                f"--- LAB REPORT TEXT ---\n{req.lab_text.strip()}\n--- END ---"
            ),
        })

    elif req.image_base64:
        # Decode base64 image and send as multimodal input
        try:
            image_bytes = base64.b64decode(req.image_base64)
            from PIL import Image as PILImage

            img = PILImage.open(BytesIO(image_bytes))
            # Save temporarily for the processor (cross-platform temp dir)
            tmp_path = os.path.join(tempfile.gettempdir(), "genetiq_lab_image.png")
            img.save(tmp_path)
            content.append({"type": "image", "url": tmp_path})
        except Exception as e:
            logger.error(f"Image decode error: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

        content.append({
            "type": "text",
            "text": f"Analyze this lab result image for a {req.patient_age} year old {req.patient_gender} patient in Ghana.",
        })

    elif req.image_url:
        content.append({"type": "image", "url": req.image_url})
        content.append({
            "type": "text",
            "text": f"Analyze this lab result image for a {req.patient_age} year old {req.patient_gender} patient in Ghana.",
        })

    else:
        raise HTTPException(
            status_code=400,
            detail="Provide preset_id, lab_text, image_base64, or image_url",
        )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": content},
    ]

    try:
        raw_response = await generate_response_async(messages, max_tokens=2048)
        result = parse_json_response(raw_response)

        # Add language translations if requested
        if req.language != "english" and req.language in TRANSLATIONS:
            result["translations"] = TRANSLATIONS[req.language]

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/gemma/action-plan")
async def generate_action_plan(req: ActionPlanRequest):
    """Generate a personalized action plan from patient health context."""

    findings_text = ""
    if req.findings:
        lines = []
        for f in req.findings[:12]:
            marker = f.get("marker") or f.get("name") or "Unknown"
            value = f.get("value") or ""
            status = f.get("status") or ""
            note = f.get("note") or ""
            lines.append(f"- {marker}: {value} ({status}) — {note}")
        findings_text = "\n".join(lines)

    recs_text = ""
    if req.recommendations:
        lines = []
        for r in req.recommendations[:8]:
            title = r.get("title") or ""
            body = r.get("body") or ""
            lines.append(f"- {title}: {body}")
        recs_text = "\n".join(lines)

    lifestyle = req.lifestyle or {}
    prompt_parts = [
        f"Create a personalized action plan for this patient in Ghana.",
        f"Age: {req.patient_age or 'unknown'} | Gender: {req.patient_gender or 'unknown'}",
    ]
    if req.health_score:
        prompt_parts.append(f"Health score: {req.health_score}/100")
    if req.bmi:
        prompt_parts.append(f"BMI: {req.bmi:.1f}")
    if req.summary:
        prompt_parts.append(f"\nLab summary:\n{req.summary}")
    if findings_text:
        prompt_parts.append(f"\nLab findings:\n{findings_text}")
    if recs_text:
        prompt_parts.append(f"\nExisting recommendations:\n{recs_text}")
    if req.symptoms:
        prompt_parts.append(f"\nReported symptoms: {', '.join(req.symptoms)}")
    if req.medical_conditions:
        prompt_parts.append(
            f"\nMedical conditions: {', '.join(req.medical_conditions)}"
        )
    if req.medications:
        med_lines = [
            f"- {m.get('name', '')} ({m.get('dosage', '')}, {m.get('frequency', '')})"
            for m in req.medications
            if m.get("name")
        ]
        if med_lines:
            prompt_parts.append(f"\nCurrent medications:\n" + "\n".join(med_lines))
    if lifestyle:
        prompt_parts.append(
            f"\nLifestyle: smoking={lifestyle.get('smoking', 'unknown')}, "
            f"alcohol={lifestyle.get('alcohol', 'unknown')}, "
            f"exercise={lifestyle.get('exercise', 'unknown')}, "
            f"diet={lifestyle.get('diet', 'unknown')}"
        )

    messages = [
        {"role": "system", "content": ACTION_PLAN_SYSTEM_PROMPT},
        {"role": "user", "content": "\n".join(prompt_parts)},
    ]

    try:
        raw_response = await generate_response_async(messages, max_tokens=2048)
        result = parse_json_response(raw_response)

        if req.language != "english" and req.language in TRANSLATIONS:
            result["translations"] = TRANSLATIONS[req.language]

        result["source"] = "gemma"
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Action plan error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/gemma/chat")
async def chat_with_gemma(req: ChatRequest):
    """Health chat with Gemma 4, with optional image input."""

    # Small talk returns instantly — no need to run slow CPU inference
    if not req.image_base64:
        small_talk = get_small_talk_response(req.message, req.language)
        if small_talk:
            result = dict(small_talk)
            if req.language != "english" and req.language in TRANSLATIONS:
                result["translations"] = TRANSLATIONS[req.language]
            logger.info(f"⚡ Small-talk fast-path: {req.message!r}")
            return result

    content = []

    if req.image_base64:
        try:
            image_bytes = base64.b64decode(req.image_base64)
            from PIL import Image as PILImage

            img = PILImage.open(BytesIO(image_bytes))
            tmp_path = os.path.join(tempfile.gettempdir(), "genetiq_chat_image.png")
            img.save(tmp_path)
            content.append({"type": "image", "url": tmp_path})
        except Exception as e:
            logger.error(f"Chat image decode error: {e}")

    content.append({"type": "text", "text": req.message})

    # Shorter system prompt for brief symptom descriptions — faster CPU prefill
    use_short_prompt = len(req.message.strip()) < 150 and not req.image_base64
    system_prompt = CHAT_SYSTEM_PROMPT_SHORT if use_short_prompt else CHAT_SYSTEM_PROMPT
    max_tokens = estimate_chat_max_tokens(req.message)

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": content if len(content) > 1 else req.message},
    ]

    try:
        raw_response = await generate_response_async(messages, max_tokens=max_tokens)
        result = parse_json_response(raw_response)

        # Add translation if needed
        if req.language != "english" and req.language in TRANSLATIONS:
            result["translations"] = TRANSLATIONS[req.language]

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/gemma/translate")
async def translate_text(req: TranslateRequest):
    """Translate health text into a Ghanaian language using Gemma."""

    # First check offline dictionary
    if req.language in TRANSLATIONS:
        offline = TRANSLATIONS[req.language]
        if req.text in offline:
            return {"translation": offline[req.text], "source": "offline"}

    # Use Gemma for full translation
    prompt = TRANSLATION_PROMPT.format(language=req.language, text=req.text)
    messages = [{"role": "user", "content": prompt}]

    try:
        translation = await generate_response_async(messages, max_tokens=512)
        return {"translation": translation, "source": "gemma"}
    except HTTPException:
        raise
    except Exception as e:
        return {"translation": req.text, "source": "fallback", "error": str(e)}


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import socket
    import uvicorn

    parser = argparse.ArgumentParser(description="Genetiq Gemma 4 Health API")
    parser.add_argument("--port", type=int, default=8000, help="Server port")
    parser.add_argument(
        "--model",
        type=str,
        default="google/gemma-4-12B-it",
        help="Model ID (e.g. google/gemma-4-4B-it for smaller GPUs)",
    )
    args = parser.parse_args()

    MODEL_ID = args.model

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        if probe.connect_ex(("127.0.0.1", args.port)) == 0:
            logger.error(
                "Port %s is already in use — another Gemma server is probably still running.",
                args.port,
            )
            logger.error("Windows: netstat -ano | findstr :%s", args.port)
            logger.error("Then stop it: taskkill /PID <pid> /F")
            logger.error("Or start on another port: python server.py --port 8001")
            raise SystemExit(1)

    uvicorn.run(app, host="0.0.0.0", port=args.port, log_level="info")
