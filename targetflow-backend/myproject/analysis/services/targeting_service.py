from django.db.models import Avg, Count
import pandas as pd
from .churn_service import predict_churn

def get_targeting_priorities(user):
    """
    Calcule les priorités de ciblage marketing pour chaque segment.
    Basé sur le Score = CLV * Probabilité de Rétention.
    Aligné avec le Chapitre 1 du Rapport de Ciblage.
    """
    from ..models import CustomerSegment, Analysis
    
    latest = Analysis.objects.filter(user=user, type='expert').order_by('-created_at').first()
    if not latest:
        return []

    qs = CustomerSegment.objects.filter(analysis=latest)
    if not qs.exists():
        return []

    df = pd.DataFrame(list(qs.values('segment_name', 'clv', 'rfm_score', 'monetary')))
    
    # Agrégation par segment
    segment_summary = df.groupby('segment_name').agg({
        'clv': 'mean',
        'rfm_score': 'mean',
        'monetary': 'sum',
        'segment_name': 'count'
    }).rename(columns={'segment_name': 'customer_count'}).reset_index()

    # Récupération des probabilités de churn via RandomForest
    churn_data = predict_churn(user)
    churn_probs = {}
    if 'predictions' in churn_data:
        preds_df = pd.DataFrame(churn_data['predictions'])
        if not preds_df.empty:
            # Map segment_name to avg prob
            churn_probs = preds_df.groupby('segment')['prob'].mean().to_dict()

    # Calcul du Targeting Priority Score (TPS)
    def calculate_priority(row):
        avg_churn = churn_probs.get(row['segment_name'], 15.0) # 15% par défaut si pas de churn détecté
        retention_prob = (100 - avg_churn) / 100.0
        return row['clv'] * retention_prob

    segment_summary['priority_score'] = segment_summary.apply(calculate_priority, axis=1)
    segment_summary = segment_summary.sort_values('priority_score', ascending=False)

    # Stratégies basées sur le cadre théorique du Chapitre 1
    priorities = []
    for _, row in segment_summary.iterrows():
        score = row['priority_score']
        if score >= 75:
            level = "P1 : Félidélisation Élite"
            strategy = "Marketing Personnalisé (One-to-One). Ambassadeurs de marque."
        elif score >= 50:
            level = "P2 : Croissance Rentable"
            strategy = "Ciblage Concentré. Cross-selling et Upselling."
        elif score >= 25:
            level = "P3 : Nurturing & Potentiel"
            strategy = "Ciblage Différencié. Promotions ciblées pour augmenter la fréquence."
        else:
            level = "P4 : Réactivation / Masse"
            strategy = "Stratégie Indifférenciée. Campagnes de win-back générales."

        priorities.append({
            'segment': row['segment_name'],
            'priority_score': round(score, 1),
            'level': level,
            'strategy': strategy,
            'customer_count': int(row['customer_count']),
            'avg_clv': round(row['clv'], 1)
        })

    return priorities
