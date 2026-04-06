from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import AIAnalysis
from analysis.models import Notification
import json

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def startup_ai(request):
    from analysis.services.gemini_service import call_gemini, parse_json

    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    if not api_key:
        return Response({"error": "Cle GEMINI_API_KEY manquante"}, status=500)

    business_type   = request.data.get("business_type", "")
    sector          = request.data.get("sector", "")
    business_goal   = request.data.get("business_goal", "")
    target_audience = request.data.get("target_audience", "")
    price           = request.data.get("product_price", "")
    city            = request.data.get("target_city", "")
    budget          = request.data.get("marketing_budget", "")

    profile = getattr(request.user, 'profile', None)
    plan = profile.plan if profile else 'starter'
    if plan == 'starter':
        count = AIAnalysis.objects.filter(user=request.user).count()
        if count >= 3:
            return Response({"error": "Plan Starter limité à 3 analyses Startup."}, status=403)

    prompt = f"""
    You are a strategic marketing consultant specialized in the Moroccan market.
    Analyze this project:
    - Business Name/Type: {business_type}
    - Industry Sector: {sector}
    - Primary Business Goal: {business_goal}
    - Defined Target: {target_audience}
    - Product Average Price: {price} MAD
    - Target Cities: {city}
    - Monthly Marketing Budget: {budget} MAD

    Return ONLY a professional JSON object (no backticks):
    {{
      "segments": ["Professional names for 4 segments"],
      "personas": [
        {{ "name": "Moroccan First Name", "age": 25, "city": "City from {city}", "interest": "Specific Interest", "bio": "Short professional bio matching the target" }}
      ],
      "strategies": ["5 actionable, detailed marketing strategies specific to the Moroccan context and the defined budget"]
    }}
    """

    try:
        # Integrated Gemini 2.0 Flash Call via central service
        text = call_gemini(prompt, model_name="gemini-2.0-flash")
        data = parse_json(text)
        if not data: raise ValueError("AI response parse failed")
    except Exception as api_err:
        # Fallback to high-quality simulated strategic analysis if API fails (credits/network)
        data = {
            "segments": [
                "Innovateurs Urbains (18-25 ans)",
                "Professionnels à Haut Revenu",
                "Chercheurs de Bons Plans",
                "Consommateurs Éco-responsables"
            ],
            "personas": [
                {
                    "name": "Amine", "age": 28, "city": city or "Casablanca",
                    "interest": "Tech & Lifestyle", "bio": "Adepte du digital, cherche des solutions rapides et premium."
                },
                {
                    "name": "Sara", "age": 34, "city": city or "Marrakech",
                    "interest": "Qualité & Service", "bio": "Responsable marketing, valorise le service client et l'exclusivité."
                }
            ],
            "strategies": [
                "Lancer une campagne de micro-influence sur Instagram et TikTok.",
                "Mettre en place un programme de parrainage 'Early Bird'.",
                "Optimiser le SEO local pour la ville de " + (city or "Casablanca") + ".",
                "Offrir un service de livraison express pour les 100 premières commandes.",
                "Créer une newsletter hebdomadaire avec des insights exclusifs."
            ],
            "is_simulated": True
        }

    try:
        AIAnalysis.objects.create(
            user=request.user,
            business_type=business_type,
            target_city=city,
            response_json=data
        )

        Notification.objects.create(
            user=request.user,
            title="Analyse Startup générée" + (" (Simulée)" if data.get('is_simulated') else ""),
            message=f"L'intelligence artificielle a généré vos personas pour: {business_type}. " + 
                    ("Note: Mode simulation activé pour démonstration." if data.get('is_simulated') else ""),
            type="info"
        )

        return Response(data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_persona_photo(request):
    import urllib.parse
    import random
    try:
        persona = request.data.get('persona', {})
        name = persona.get('name', 'Moroccan Client')
        age = persona.get('age', 30)
        interest = persona.get('interest', 'shopping')
        
        prompt = f"Professional studio portrait photography of {name}, {age} year old Moroccan person, focused, modern, highly detailed, interested in {interest}"
        safe_prompt = urllib.parse.quote(prompt)
        seed = random.randint(1, 100000)
        image_url = f"https://image.pollinations.ai/prompt/{safe_prompt}?width=400&height=400&nologo=true&seed={seed}"
        
        return Response({"image_url": image_url})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def startup_history(request):
    analyses = AIAnalysis.objects.filter(user=request.user).order_by('-created_at')
    data = [{
        "id": a.id,
        "business_type": a.business_type,
        "target_city": a.target_city,
        "date": a.created_at.strftime('%Y-%m-%d %H:%M'),
        "response": a.response_json
    } for a in analyses]
    return Response(data)