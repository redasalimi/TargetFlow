import json
from django.conf import settings
from .gemini_service import call_gemini, parse_json

def generate_personas_for_segments(segments_list, city_context="Maroc"):
    """
    Generates detailed AI personas for a list of segment names.
    Used in Expert Mode when 'generate_personas' is toggled.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    if not api_key:
        return _fallback_personas(segments_list, city_context)

    prompt = f"""
    You are a professional marketing consultant.
    Generate a detailed persona for each of these segments in the Moroccan market:
    Segments: {', '.join(segments_list)}
    Context: {city_context}
    
    Return ONLY a JSON list of objects:
    [
      {{ 
        "segment": "Segment Name",
        "name": "Full Name",
        "age": 30,
        "city": "City",
        "interest": "Main Interest",
        "bio": "A detailed professional biography (2-3 sentences) describing their behavior, needs and relationship with the brand."
      }}
    ]
    """

    try:
        text = call_gemini(prompt, model_name="gemini-2.0-flash")
        data = parse_json(text)
        if data: return data
    except Exception:
        pass
    return _fallback_personas(segments_list, city_context)

def _fallback_personas(segments_list, city_context):
    return [
        {
            "segment": s,
            "name": f"Client Type {i+1}",
            "age": 35,
            "city": city_context,
            "interest": "Produits & Services",
            "bio": f"Représente le segment {s}. Utilisateur régulier valorisant la qualité et la proximité."
        }
        for i, s in enumerate(segments_list[:4])
    ]
