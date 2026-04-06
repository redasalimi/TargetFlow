"""
Service de generation de photos personas via Gemini Imagen ou Fallback Pollinations.
Partie de la refonte v3.1.9 pour stabilite totale.
"""
from analysis.services.gemini_service import generate_image

def generate_persona_photo(persona):
    """
    Genere une photo de persona. 
    Utilise le service unifie qui choisit entre Imagen 3 (si dispo) 
    ou Pollinations.ai (fallback garanti).
    """
    age   = persona.get('age', 30)
    city  = persona.get('city', 'Casablanca')
    interest = persona.get('interest', 'marketing')
    name  = persona.get('name', 'Persona')

    # Determiner le genre selon le prenom (heuristique simple)
    female_endings = ['a', 'e', 'ia', 'ine', 'ie']
    name_lower = name.lower()
    is_female = any(name_lower.endswith(end) for end in female_endings)
    gender = 'woman' if is_female else 'man'

    prompt = (
        f"Professional portrait photo of a {age}-year-old {gender} "
        f"from {city}, Morocco. "
        f"Interested in {interest}. "
        f"Business casual attire, confident smile, "
        f"photorealistic high quality headshot."
    )
    
    # On utilise maintenant le service unifie qui retourne une URL stable
    return generate_image(prompt, persona_context=persona)

def generate_all_personas_photos(personas):
    """
    Genere les photos pour tous les personas.
    """
    result = []
    for persona in personas:
        photo = generate_persona_photo(persona)
        result.append({
            **persona,
            'photo': photo
        })
    return result
