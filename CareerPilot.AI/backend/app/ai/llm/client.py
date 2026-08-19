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


class LLMClient:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.provider = settings.ai_provider.lower()

    def generate_json(self, prompt: str, timeout_seconds: int = 10) -> Optional[Dict[str, Any]]:
        """
        Queries Gemini API and extracts parsed JSON. Returns None if LLM is unavailable or fails.
        """
        if not self.api_key or self.provider == "offline":
            return None

        # 1. Try Gemini Official SDK
        if HAS_GEMINI_SDK:
            try:
                client = genai.Client(api_key=self.api_key)
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text.replace("```json", "", 1).rsplit("```", 1)[0].strip()
                elif text.startswith("```"):
                    text = text.replace("```", "", 1).rsplit("```", 1)[0].strip()
                return json.loads(text)
            except Exception as e:
                logger.warning("Gemini SDK call in LLMClient failed: %s. Attempting REST fallback.", e)

        # 2. Try REST API fallback
        if HAS_REQUESTS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.api_key}"
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
                    return json.loads(raw_text)
            except Exception as e:
                logger.warning("Gemini REST call in LLMClient failed: %s", e)

        return None


llm_client = LLMClient()
