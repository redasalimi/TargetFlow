def campaign_for_segment(segment):
    """
    Returns an actionable campaign object for a given segment.
    """
    campaigns_data = {
        "Champions": {
            "title": "💎 Programme Elite Ambassadeurs",
            "strategy": "Offrez un accès anticipé exclusif aux nouvelles collections et un statut 'VIP Platinum'.",
            "channel": "WhatsApp Direct / Email Privé",
            "incentive": "Cadeau d'anniversaire & Points x2",
            "status": "Haute Priorité"
        },
        "Clients Fidèles": {
            "title": "💙 Campagne 'Merci de votre Loyauté'",
            "strategy": "Récompensez la régularité avec des coupons progressifs basés sur la fréquence d'achat.",
            "channel": "Email Marketing",
            "incentive": "Remise de 15% sur la prochaine commande",
            "status": "Moyenne Priorité"
        },
        "Clients Hibernants / Risque": {
            "title": "⚠️ Opération 'On vous regrette'",
            "strategy": "Campagne de réactivation agressive pour les clients n'ayant pas acheté depuis +6 mois.",
            "channel": "SMS / Retargeting Ad",
            "incentive": "Bon de réduction de 25% valable 48h",
            "status": "Critique"
        },
        "Nouveaux / Potentiels": {
            "title": "✨ Accueil & Conversion",
            "strategy": "Guide d'utilisation du produit et témoignages clients pour rassurer et déclencher le 2ème achat.",
            "channel": "Séquence Automatisée (Nurturing)",
            "incentive": "Livraison gratuite sur le prochain panier",
            "status": "Opportunité"
        }
    }
    
    # Exact match
    if segment in campaigns_data:
        return campaigns_data[segment]
    
    # Partial match
    for key in campaigns_data:
        if key in segment or segment in key:
            return campaigns_data[key]
            
    return {
        "title": "🎯 Campagne Personnalisée",
        "strategy": "Analyse approfondie requise pour ce micro-segment.",
        "channel": "Omnicanal",
        "incentive": "À définir selon profil",
        "status": "En attente"
    }