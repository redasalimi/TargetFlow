import pandas as pd
import numpy as np

def assign_labels(rfm):
    """
    Assigne des labels métiers en fonction de la valeur CLV et RFM.
    Approche K-AGNOSTIQUE (Fonctionne avec n'importe quel nombre de clusters).
    """
    if len(rfm) == 0 or 'segment' not in rfm.columns:
        return rfm

    # 1. Calculer les centroïdes sur le score global (RFM ou CLV)
    # On utilise le 'clv' car il est déjà pondéré scientifiquement
    cluster_stats = rfm.groupby('segment').agg({
        'clv': 'mean',
        'rfm_score': 'mean',
        'monetary': 'mean',
        'recency': 'mean'
    }).reset_index()

    # 2. Trier les clusters par CLV décroissant (Le meilleur en premier)
    cluster_stats = cluster_stats.sort_values('clv', ascending=False).reset_index(drop=True)
    
    k = len(cluster_stats)
    labels = {}

    # 3. Stratégie de nommage dynamique
    for i, row in cluster_stats.iterrows():
        seg_id = row['segment']
        if i == 0:
            labels[seg_id] = "Champions (VIP)"
        elif i == k - 1:
            # Le cluster avec le CLV le plus bas
            labels[seg_id] = "Hibernants / À Risque"
        elif i == 1:
            labels[seg_id] = "Clients Fidèles"
        elif i == 2:
            labels[seg_id] = "Potentiels à Développer"
        else:
            labels[seg_id] = f"Segment Actif {i}"

    rfm['segment_name'] = rfm['segment'].map(labels)
    # Sécurité pour les nouveaux records non mappés
    rfm['segment_name'] = rfm['segment_name'].fillna("Nouveaux / Divers")

    return rfm