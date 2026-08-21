import json
import logging
from typing import Optional, Dict, Any

from app.config import settings

logger = logging.getLogger("career_platform")

try:
    from google import genai
    HAS_GEMINI_SDK = True
except ImportError:
    HAS_GEMINI_SDK = False

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


import time
import hashlib

PROMPT_VERSION = "v1.0"
CACHE_TTL_SECONDS = 86400  # 24 hours

_LLM_CACHE: Dict[str, Dict[str, Any]] = {}


def _get_cache_key(prompt: str) -> str:
    prompt_hash = hashlib.sha256(prompt.encode("utf-8")).hexdigest()
    return f"{PROMPT_VERSION}:{prompt_hash}"


class LLMClient:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.provider = settings.ai_provider.lower()
        self.models_to_try = ["gemini-2.0-flash", "gemini-1.5-flash"]

    def generate_json(self, prompt: str, timeout_seconds: int = 8) -> Optional[Dict[str, Any]]:
        """
        Queries Gemini API and extracts parsed JSON with 24h TTL caching and fast model fallbacks.
        Returns None if LLM is unavailable or fails.
        """
        if not self.api_key or self.provider == "offline":
            return None

        # Check TTL cache first
        cache_key = _get_cache_key(prompt)
        cached_entry = _LLM_CACHE.get(cache_key)
        if cached_entry:
            if time.time() - cached_entry["timestamp"] < CACHE_TTL_SECONDS:
                logger.debug("Serving AI response from memory cache (%s)", cache_key[:12])
                return cached_entry["data"]
            else:
                _LLM_CACHE.pop(cache_key, None)

        for model_name in self.models_to_try:
            # 1. Try Gemini Official SDK
            if HAS_GEMINI_SDK:
                try:
                    client = genai.Client(api_key=self.api_key)
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    text = response.text.strip()
                    if text.startswith("```json"):
                        text = text.replace("```json", "", 1).rsplit("```", 1)[0].strip()
                    elif text.startswith("```"):
                        text = text.replace("```", "", 1).rsplit("```", 1)[0].strip()
                    parsed = json.loads(text)
                    _LLM_CACHE[cache_key] = {"timestamp": time.time(), "data": parsed}
                    return parsed
                except Exception as e:
                    logger.warning("Gemini SDK (%s) failed: %s. Trying fallback.", model_name, e)

            # 2. Try REST API fallback
            if HAS_REQUESTS:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                    payload = {
                        "contents": [{"parts": [{"text": prompt}]}]
                    }
                    resp = requests.post(url, json=payload, timeout=timeout_seconds)
                    if resp.status_code == 200:
                        data = resp.json()
                        raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                        if raw_text.startswith("```json"):
                            raw_text = raw_text.replace("```json", "", 1).rsplit("```", 1)[0].strip()
                        elif raw_text.startswith("```"):
                            raw_text = raw_text.replace("```", "", 1).rsplit("```", 1)[0].strip()
                        parsed = json.loads(raw_text)
                        _LLM_CACHE[cache_key] = {"timestamp": time.time(), "data": parsed}
                        return parsed
                except Exception as e:
                    logger.warning("Gemini REST API (%s) failed: %s", model_name, e)

        return None


llm_client = LLMClient()
