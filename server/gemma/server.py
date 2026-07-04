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
import time
import traceback
from contextlib import asynccontextmanager
from io import BytesIO
from typing import Optional

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

model = None
processor = None
MODEL_ID = "google/gemma-4-12B-it"


# ==============================================================================
# 🧠 GEMMA 4 MODEL INITIALIZATION ENGINE
# ==============================================================================
# Authenticated & loaded locally via Hugging Face Hub (Gated access)
# Supports both Multimodal (vision/lab sheets) and CausalLM (chat/triage text)
# ==============================================================================

def load_model(model_id: str):
    """
    Load Google Gemma model weights dynamically using Hugging Face Transformers.
    
    Tries AutoModelForMultimodalLM (multimodal vision) first.
    Falls back to AutoModelForCausalLM (text-only chat) if config class doesn't support visual inputs.
    """
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

        # ─── MULTIMODAL VISION MODEL LOADING ───
        # Used for vision OCR, RDT strips scanning, and multimodal medical images
        from transformers import AutoModelForMultimodalLM, AutoProcessor
        logger.info("🤖 Loading model weights under AutoModelForMultimodalLM...")
        processor = AutoProcessor.from_pretrained(model_id)
        if device == "cuda":
            model = AutoModelForMultimodalLM.from_pretrained(
                model_id,
                dtype="auto",
                device_map="auto",
            )
        else:
            # bfloat16 halves memory vs float32 — critical to avoid swapping on low-RAM machines
            model = AutoModelForMultimodalLM.from_pretrained(
                model_id,
                torch_dtype=torch.bfloat16,
            )
        logger.info(f"✅ Multimodal Model loaded successfully: {model_id}")
        logger.info(f"   Device: {next(model.parameters()).device}")
    except Exception as e:
        logger.warning(f"Failed to load as Multimodal model ({e}). Retrying as CausalLM (text-only)...")
        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer
            processor = AutoTokenizer.from_pretrained(model_id)
            if device == "cuda":
                model = AutoModelForCausalLM.from_pretrained(
                    model_id,
                    dtype="auto",
                    device_map="auto",
                )
            else:
                logger.info("Loading CausalLM on CPU in bfloat16...")
                model = AutoModelForCausalLM.from_pretrained(
                    model_id,
                    torch_dtype=torch.bfloat16,
                )
            logger.info(f"✅ Text-only CausalLM Model loaded successfully: {model_id}")
            logger.info(f"   Device: {next(model.parameters()).device}")
        except Exception as e2:
            logger.error(f"❌ Failed to load as CausalLM either: {e2}")
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

from prompts import (
    CHAT_SYSTEM_PROMPT,
    CHAT_SYSTEM_PROMPT_SHORT,
    GREETING_RESPONSES,
    LAB_ANALYSIS_SYSTEM_PROMPT,
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
    preset_id: Optional[str] = None  # OR a preset case ID
    patient_age: str = ""
    patient_gender: str = ""
    language: str = "english"  # english, twi, ga, ewe, fante


class ChatRequest(BaseModel):
    message: str
    language: str = "english"
    image_base64: Optional[str] = None  # Optional image for multimodal chat


class TranslateRequest(BaseModel):
    text: str
    language: str  # twi, ga, ewe, fante


# ─── Helper: Generate with Gemma ─────────────────────────────────────────────

# ─── Helper: Generate with Gemma ─────────────────────────────────────────────
# This core function processes the conversation prompt, formats it according
# to the Gemma chat template, performs model inference with parameters requested,
# and extracts the raw response tokens.
# ─────────────────────────────────────────────────────────────────────────────

def generate_response(messages: list, max_tokens: int = 2048) -> str:
    start_time = time.time()
    """
    Main inference loop for local Gemma.
    
    1. Prepares user and system messages using Hugging Face's tokenizer/processor templates.
    2. Dynamically flattens contents if using a text-only model.
    3. Handles tensor device mapping (automatically maps input tensors to GPU/CUDA).
    4. Executes model.generate() with custom temperature, top_p, and top_k parameters.
    5. Decodes and cleans the output tokens to extract the dynamic text response.
    """
    if model is None or processor is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Server is in fallback mode.",
        )

    import torch
    from transformers import PreTrainedTokenizerBase

    on_cpu = not torch.cuda.is_available()
    # On CPU, cap generation length so responses come back in a reasonable time
    if on_cpu:
        max_tokens = min(max_tokens, 320)

    # Check if the loaded processor is a text-only tokenizer or a multimodal visual processor
    is_tokenizer = isinstance(processor, PreTrainedTokenizerBase)

    # Flatten system role if not supported by the template.
    # Prepend any system message to the next user message, or convert it to a user message.
    messages_to_use = []
    system_prompt = ""
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")
        if role == "system":
            if isinstance(content, list):
                text_parts = [p.get("text", "") for p in content if p.get("type") == "text"]
                system_prompt += "\n\n" + "".join(text_parts)
            else:
                system_prompt += "\n\n" + str(content)
            continue
        
        if role == "user" and system_prompt.strip():
            if isinstance(content, list):
                new_content = [{"type": "text", "text": system_prompt.strip() + "\n\n"}] + content
            else:
                new_content = system_prompt.strip() + "\n\n" + str(content)
            system_prompt = ""
            messages_to_use.append({"role": "user", "content": new_content})
        else:
            messages_to_use.append(msg)
            
    if system_prompt.strip():
        messages_to_use.append({"role": "user", "content": system_prompt.strip()})

    # Flatten content structure if this is a text-only tokenizer.
    # Text tokenizers expect a simple string 'content', whereas multimodal processors 
    # expect a list containing text chunks and image URLs.
    if is_tokenizer:
        final_messages = []
        for msg in messages_to_use:
            role = msg.get("role")
            content = msg.get("content")
            if isinstance(content, list):
                text_content = ""
                for part in content:
                    if part.get("type") == "text":
                        text_content += part.get("text", "")
                final_messages.append({"role": role, "content": text_content})
            else:
                final_messages.append(msg)
        messages_to_use = final_messages

    # Build template options for apply_chat_template.
    # Gemma requires specific delimiters (e.g. <start_of_turn>, <end_of_turn>) 
    # to maintain prompt alignment during multiturn conversation.
    template_kwargs = {
        "tokenize": True,
        "return_dict": True,
        "return_tensors": "pt",
        "add_generation_prompt": True,
    }
    # Multimodal processors for Gemma 4 support disabling the thinking tokens if required
    if not is_tokenizer:
        template_kwargs["enable_thinking"] = False

    try:
        inputs = processor.apply_chat_template(
            messages_to_use,
            **template_kwargs
        )
    except Exception:
        # Fallback if return_dict is not supported by older tokenizer models
        token_ids = processor.apply_chat_template(
            messages_to_use,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt"
        )
        inputs = {"input_ids": token_ids}

    # Move input tensors to the target execution device (e.g., CUDA GPU)
    if hasattr(inputs, "items"):
        inputs = dict(inputs)

    device_inputs = {}
    if isinstance(inputs, dict):
        for k, v in inputs.items():
            device_inputs[k] = v.to(model.device) if hasattr(v, "to") else v
        input_len = device_inputs["input_ids"].shape[-1]
    else:
        device_inputs = inputs.to(model.device)
        input_len = device_inputs.shape[-1]

    # Greedy decoding on CPU is ~2x faster than sampling for structured JSON replies
    gen_kwargs: dict = {"max_new_tokens": max_tokens}
    if on_cpu:
        gen_kwargs["do_sample"] = False
    else:
        gen_kwargs.update(
            temperature=1.0,
            top_p=0.95,
            top_k=64,
            do_sample=True,
        )

    # Run PyTorch inference without tracking gradients for maximum speed/efficiency
    with torch.no_grad():
        if isinstance(device_inputs, dict):
            outputs = model.generate(**device_inputs, **gen_kwargs)
        else:
            outputs = model.generate(device_inputs, **gen_kwargs)

    # Decode target tokens only, skipping the input prompt token length
    new_tokens = outputs[0][input_len:]
    response = processor.decode(new_tokens, skip_special_tokens=True)

    elapsed = time.time() - start_time
    logger.info(
        f"⚡ Generated {len(new_tokens)} tokens in {elapsed:.1f}s "
        f"({len(new_tokens) / max(elapsed, 0.001):.1f} tok/s)"
    )

    
    # If the multimodal processor has custom parse_response, apply it (common in PaliGemma).
    # Plain tokenizers expose this method but raise if no response_schema is defined.
    if hasattr(processor, "parse_response"):
        try:
            parsed = processor.parse_response(response)
            return parsed if isinstance(parsed, str) else str(parsed)
        except Exception:
            pass

    return response


async def generate_response_async(messages: list, max_tokens: int = 2048) -> str:
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
    }


@app.post("/api/gemma/analyze")
async def analyze_lab_results(req: AnalyzeRequest):
    """Analyze lab results using Gemma 4 vision or preset prompts."""

    # ── Guard: text-only model cannot process images ──────────────────────
    # If the user uploaded a custom image (not a preset), and the loaded model
    # is a text-only CausalLM (not multimodal), reject immediately so the
    # frontend falls back to the offline simulator instead of hanging.
    from transformers import PreTrainedTokenizerBase
    is_text_only = isinstance(processor, PreTrainedTokenizerBase) if processor else True
    if is_text_only and (req.image_base64 or req.image_url) and not req.preset_id:
        raise HTTPException(
            status_code=422,
            detail="Current model is text-only and cannot analyze images. Use a preset case or upgrade to a multimodal model.",
        )

    # Build the content array for the user message
    content = []

    if req.preset_id and req.preset_id in PRESET_CASES:
        # Use a preset case (text-only prompt simulating lab data)
        preset = PRESET_CASES[req.preset_id]
        prompt_text = preset["prompt"].format(
            age=req.patient_age or "35",
            gender=req.patient_gender or "unknown",
        )
        content.append({"type": "text", "text": prompt_text})

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
            detail="Provide either preset_id, image_base64, or image_url",
        )

    messages = [
        {"role": "system", "content": LAB_ANALYSIS_SYSTEM_PROMPT},
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

    uvicorn.run(app, host="0.0.0.0", port=args.port, log_level="info")
