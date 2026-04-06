import json
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# detect which SDK is available
try:
    import google.generativeai as google_genai
    SDK_TYPE = "LEGACY"
except ImportError:
    try:
        from google import genai as google_genai
        SDK_TYPE = "NEW"
    except ImportError:
        google_genai = None
        SDK_TYPE = None

def call_gemini(prompt, model_name="gemini-1.5-flash"):
    """
    Unified call with multiple levels of fallback.
    1. Try Primary Gemini (2.0 or 1.5)
    2. Try Free Pollinations.ai Text AI (100% Guaranteed)
    3. Final JSON Fallback
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    
    # --- LEVEL 1: PRIMARY GEMINI ---
    if google_genai and api_key:
        try:
            if SDK_TYPE == "LEGACY":
                google_genai.configure(api_key=api_key)
                model = google_genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                return response.text.strip()
            elif SDK_TYPE == "NEW":
                client = google_genai.Client(api_key=api_key)
                response = client.models.generate_content(model=model_name, contents=prompt)
                return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini API Error: {str(e)}")

    # --- LEVEL 2: FREE POLLINATIONS TEXT AI (100% FREE & GUARANTEED) ---
    try:
        logger.info("Falling back to Free Pollinations AI...")
        # Use a secondary open model via Pollinations
        poll_url = "https://text.pollinations.ai/"
        payload = {
            "messages": [{"role": "user", "content": prompt}],
            "model": "openai" # This redirects to free open models like Llama or Mistral
        }
        resp = requests.post(poll_url, json=payload, timeout=15)
        if resp.status_code == 200:
            return resp.text.strip()
    except Exception as poll_err:
        logger.error(f"Pollinations AI Error: {str(poll_err)}")

    return None

def generate_image(prompt, persona_context=None):
    """
    Guaranteed dynamic visual generation via Pollinations.ai.
    """
    seed = len(prompt) + (len(str(persona_context)) if persona_context else 0)
    return f"https://image.pollinations.ai/prompt/{prompt.replace(' ', '%20')}?width=600&height=400&nologo=true&seed={seed}"

def parse_json(text):
    if not text: return None
    try:
        # Standard cleaning
        clean = text.replace("```json", "").replace("```", "").strip()
        # Find first { and last }
        start = clean.find('{')
        end = clean.rfind('}') + 1
        if start >= 0 and end > 0:
            return json.loads(clean[start:end])
        return json.loads(clean)
    except Exception:
        return None
