"""
Service d'intégration campagnes :
- Mailchimp : envoi d'emails marketing
- WhatsApp Business API (Meta) : messages WhatsApp
"""
import os
import json
import requests
from django.conf import settings


# ── Mailchimp ─────────────────────────────────────────────────────────────────

def send_mailchimp_campaign(segment_name, campaign_text, emails):
    """
    Crée et envoie une campagne Mailchimp pour un segment.
    Nécessite MAILCHIMP_API_KEY et MAILCHIMP_LIST_ID dans .env
    """
    api_key  = getattr(settings, 'MAILCHIMP_API_KEY', '')
    list_id  = getattr(settings, 'MAILCHIMP_LIST_ID', '')
    server   = api_key.split('-')[-1] if '-' in api_key else 'us1'

    if not api_key or not list_id:
        return {
            "success": False,
            "error": "MAILCHIMP_API_KEY et MAILCHIMP_LIST_ID requis dans .env",
            "setup_url": "https://mailchimp.com/developer/marketing/api/campaigns/",
        }

    headers = {
        'Authorization': f'apikey {api_key}',
        'Content-Type':  'application/json',
    }
    base_url = f'https://{server}.api.mailchimp.com/3.0'

    # 1. Créer la campagne
    campaign_payload = {
        "type": "regular",
        "recipients": {"list_id": list_id},
        "settings": {
            "subject_line": f"Message spécial pour nos {segment_name}",
            "from_name":    "TargetFlow",
            "reply_to":     getattr(settings, 'FROM_EMAIL', 'noreply@targetflow.com'),
        },
    }

    try:
        r = requests.post(f'{base_url}/campaigns', json=campaign_payload, headers=headers, timeout=10)
        r.raise_for_status()
        campaign_id = r.json()['id']

        # 2. Ajouter le contenu
        content_payload = {
            "html": f"""
            <html><body style="font-family: Arial; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #00E5C4;">Message spécial pour vous</h2>
            <p>{campaign_text}</p>
            <br><p style="color: #999; font-size: 12px;">TargetFlow Marketing Intelligence</p>
            </body></html>
            """
        }
        requests.put(f'{base_url}/campaigns/{campaign_id}/content', json=content_payload, headers=headers, timeout=10)

        # 3. Envoyer
        requests.post(f'{base_url}/campaigns/{campaign_id}/actions/send', headers=headers, timeout=10)

        return {
            "success":     True,
            "campaign_id": campaign_id,
            "segment":     segment_name,
            "message":     f"Campagne envoyée à la liste Mailchimp ({list_id})",
        }

    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}


# ── WhatsApp Business API (Meta) ──────────────────────────────────────────────

def send_whatsapp_message(phone_number, message, template_name="hello_world"):
    """
    Envoie un message WhatsApp via l'API Meta Business.
    Nécessite WHATSAPP_TOKEN et WHATSAPP_PHONE_ID dans .env
    Format phone: +212XXXXXXXXX
    """
    token    = getattr(settings, 'WHATSAPP_TOKEN', '')
    phone_id = getattr(settings, 'WHATSAPP_PHONE_ID', '')

    if not token or not phone_id:
        return {
            "success": False,
            "error": "WHATSAPP_TOKEN et WHATSAPP_PHONE_ID requis dans .env",
            "setup_url": "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
        }

    url = f"https://graph.facebook.com/v18.0/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type":  "application/json",
    }

    # Utiliser un template approuvé par Meta
    payload = {
        "messaging_product": "whatsapp",
        "to": phone_number.replace('+', '').replace(' ', ''),
        "type": "template",
        "template": {
            "name":     template_name,
            "language": {"code": "fr"},
            "components": [{
                "type": "body",
                "parameters": [{"type": "text", "text": message[:1000]}]
            }]
        }
    }

    try:
        r = requests.post(url, json=payload, headers=headers, timeout=10)
        r.raise_for_status()
        return {
            "success":    True,
            "message_id": r.json().get('messages', [{}])[0].get('id'),
            "to":         phone_number,
        }
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}


def send_whatsapp_bulk(phones, message, template_name="hello_world"):
    """Envoie un message WhatsApp à une liste de numéros."""
    results = []
    for phone in phones[:50]:  # Limite 50 par batch
        result = send_whatsapp_message(phone, message, template_name)
        results.append({**result, "phone": phone})
    return {
        "total":   len(phones),
        "sent":    len([r for r in results if r.get('success')]),
        "failed":  len([r for r in results if not r.get('success')]),
        "results": results,
    }


# ── Vue Django ────────────────────────────────────────────────────────────────

def campaign_send_view(request_data, user):
    """
    Point d'entrée principal pour envoyer une campagne.
    channel: 'mailchimp' | 'whatsapp' | 'both'
    """
    channel      = request_data.get('channel', 'mailchimp')
    segment_name = request_data.get('segment', '')
    message      = request_data.get('message', '')
    phones       = request_data.get('phones', [])
    emails       = request_data.get('emails', [])

    if not segment_name or not message:
        return {"error": "segment et message sont requis"}

    results = {}

    if channel in ('mailchimp', 'both'):
        results['mailchimp'] = send_mailchimp_campaign(segment_name, message, emails)

    if channel in ('whatsapp', 'both') and phones:
        results['whatsapp'] = send_whatsapp_bulk(phones, message)

    return results
