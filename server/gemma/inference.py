"""Gemma chat-template formatting and model.generate() inference helpers."""

from __future__ import annotations

import logging
import os
import time
from typing import Any

Message = dict[str, Any]


def merge_system_messages(messages: list[Message]) -> list[Message]:
    """Prepend system prompts onto the next user turn for chat templates without a system role."""
    messages_to_use: list[Message] = []
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
    return messages_to_use


def flatten_text_messages(messages: list[Message]) -> list[Message]:
    """Convert multimodal content lists into plain strings for text-only tokenizers."""
    final_messages: list[Message] = []
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")
        if isinstance(content, list):
            text_content = "".join(
                part.get("text", "") for part in content if part.get("type") == "text"
            )
            final_messages.append({"role": role, "content": text_content})
        else:
            final_messages.append(msg)
    return final_messages


def collect_message_images(messages: list[Message]) -> list[Any]:
    """Load PIL images referenced in multimodal message content."""
    from PIL import Image as PILImage

    images: list[Any] = []
    for msg in messages:
        content = msg.get("content")
        if not isinstance(content, list):
            continue
        for part in content:
            if part.get("type") != "image":
                continue
            url = part.get("url", "")
            if os.path.exists(url):
                images.append(PILImage.open(url).convert("RGB"))
    return images


def build_processor_inputs(
    processor: Any,
    messages_to_use: list[Message],
    is_tokenizer: bool,
) -> Any:
    """Apply the chat template and tokenize inputs for model.generate()."""
    template_kwargs: dict[str, Any] = {
        "tokenize": False,
        "add_generation_prompt": True,
    }
    if not is_tokenizer:
        template_kwargs["enable_thinking"] = False

    images = [] if is_tokenizer else collect_message_images(messages_to_use)

    try:
        prompt_text = processor.apply_chat_template(messages_to_use, **template_kwargs)
        if not is_tokenizer and images:
            return processor(text=prompt_text, images=images, return_tensors="pt")
        return processor(text=prompt_text, return_tensors="pt")
    except Exception:
        token_ids = processor.apply_chat_template(
            messages_to_use,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
        )
        return {"input_ids": token_ids}


def move_inputs_to_device(model: Any, inputs: Any) -> tuple[Any, int]:
    """Move token tensors to the model device and return input length."""
    if hasattr(inputs, "items"):
        inputs = dict(inputs)

    if isinstance(inputs, dict):
        device_inputs = {
            k: v.to(model.device) if hasattr(v, "to") else v
            for k, v in inputs.items()
        }
        input_len = device_inputs["input_ids"].shape[-1]
        return device_inputs, input_len

    device_inputs = inputs.to(model.device)
    return device_inputs, device_inputs.shape[-1]


def run_gemma_inference(
    model: Any,
    processor: Any,
    logger: logging.Logger,
    messages: list[Message],
    max_tokens: int = 2048,
) -> str:
    """Run local Gemma inference: format messages, generate tokens, decode response."""
    import torch
    from transformers import PreTrainedTokenizerBase

    start_time = time.time()
    on_cpu = not torch.cuda.is_available()
    if on_cpu:
        max_tokens = min(max_tokens, 320)

    is_tokenizer = isinstance(processor, PreTrainedTokenizerBase)
    messages_to_use = merge_system_messages(messages)
    if is_tokenizer:
        messages_to_use = flatten_text_messages(messages_to_use)

    inputs = build_processor_inputs(processor, messages_to_use, is_tokenizer)
    device_inputs, input_len = move_inputs_to_device(model, inputs)

    gen_kwargs: dict[str, Any] = {"max_new_tokens": max_tokens}
    if on_cpu:
        gen_kwargs["do_sample"] = False
    else:
        gen_kwargs.update(
            temperature=1.0,
            top_p=0.95,
            top_k=64,
            do_sample=True,
        )

    with torch.no_grad():
        if isinstance(device_inputs, dict):
            outputs = model.generate(**device_inputs, **gen_kwargs)
        else:
            outputs = model.generate(device_inputs, **gen_kwargs)

    new_tokens = outputs[0][input_len:]
    response = processor.decode(new_tokens, skip_special_tokens=True)

    elapsed = time.time() - start_time
    logger.info(
        f"⚡ Generated {len(new_tokens)} tokens in {elapsed:.1f}s "
        f"({len(new_tokens) / max(elapsed, 0.001):.1f} tok/s)"
    )

    if hasattr(processor, "parse_response"):
        try:
            parsed = processor.parse_response(response)
            return parsed if isinstance(parsed, str) else str(parsed)
        except Exception:
            pass

    return response
