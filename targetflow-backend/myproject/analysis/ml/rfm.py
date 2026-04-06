import pandas as pd
import numpy as np
from datetime import datetime

def calculate_rfm(df):
    """
    Calcule les indicateurs RFM et le Customer Lifetime Value (CLV).
    Utilise une approche par QUINTILES (1-5) pour la robustesse statistique.
    """
    # 1. Conversion des dates et calcul de la récence
    df['purchase_date'] = pd.to_datetime(df['purchase_date'])
    snapshot_date = df['purchase_date'].max() + pd.Timedelta(days=1)

    rfm = df.groupby('customer_id').agg({
        'purchase_date': lambda x: (snapshot_date - x.max()).days,
        'customer_id': 'count',
        'amount': 'sum'
    })

    rfm.columns = ['recency', 'frequency', 'monetary']

    # 2. Scoring par Quintiles (Scientifiquement recommandé pour RFM)
    # Récence : Plus c'est bas, mieux c'est (Score 5 pour les plus récents)
    rfm['r_score'] = pd.qcut(rfm['recency'].rank(method='first'), 5, labels=[5, 4, 3, 2, 1]).astype(int)
    
    # Fréquence & Montant : Plus c'est haut, mieux c'est (Score 5 pour les plus élevés)
    rfm['f_score'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5]).astype(int)
    rfm['m_score'] = pd.qcut(rfm['monetary'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5]).astype(int)

    # 3. Calcul du SCORE RFM Global (100% standardisé)
    rfm['rfm_score'] = rfm['r_score'] + rfm['f_score'] + rfm['m_score']

    # 4. Calcul du CLV (Customer Lifetime Value) - Pondération Scientifique
    # On accorde 50% de poids au montant, car le CA est le nerf de la guerre (Chapitre 1)
    # R=20%, F=30%, M=50%
    rfm['clv'] = (rfm['r_score'] * 0.2) + (rfm['f_score'] * 0.3) + (rfm['m_score'] * 0.5)
    
    # Normalisation du CLV pour l'affichage (0-100)
    rfm['clv_score'] = (rfm['clv'] / 5.0) * 100

    return rfm.reset_index()