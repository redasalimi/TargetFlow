"""
Service de prédiction de churn SCIENTIFIQUE.
Utilise Random Forest avec des seuils de récence individualisés.
"""
import numpy as np
import pandas as pd
from django.db.models import Avg

def predict_churn(user):
    """
    Prédit le risque de churn en utilisant les comportements passés,
    les biais régionaux et la valeur vie client (CLV).
    """
    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import StandardScaler, LabelEncoder
    except ImportError:
        raise ImportError("scikit-learn requis")

    from analysis.models import CustomerSegment

    qs = CustomerSegment.objects.filter(user=user)
    if qs.count() < 15:
        return {"error": "Données insuffisantes pour un modèle prédictif (min 15)."}

    data_df = pd.DataFrame(list(qs.values(
        'customer_id', 'recency', 'frequency', 'monetary', 'segment_name', 'city'
    )))

    # 1. Étiquetage Individualisé (Science Data)
    # Un client est considéré en "Churn Probable" si sa récence dépasse 
    # 2.5 fois son intervalle d'achat moyen habituel.
    MAX_DAYS = 365
    def check_churn(row):
        avg_inter = MAX_DAYS / max(1, row['frequency'])
        # Seuil adaptatif : minimum 45 jours d'inactivité
        return 1 if (row['recency'] > (2.5 * avg_inter) and row['recency'] > 45) else 0

    data_df['churn_label'] = data_df.apply(check_churn, axis=1)

    # 2. Encodage des caractéristiques
    # On ajoute la Ville et le Segment comme variables prédictives (Biais régionaux)
    le_city = LabelEncoder()
    data_df['city_enc'] = le_city.fit_transform(data_df['city'].fillna('Inconnu'))
    
    le_seg = LabelEncoder()
    data_df['seg_enc'] = le_seg.fit_transform(data_df['segment_name'])

    X = data_df[['recency', 'frequency', 'monetary', 'city_enc', 'seg_enc']].values
    y = data_df['churn_label'].values

    # Vérification équilibre des classes
    if len(np.unique(y)) < 2:
        return {"error": "Comportement trop homogène pour prédire le churn.", "predictions": []}

    # 3. Entraînement Random Forest
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42, class_weight='balanced')
    model.fit(X_scaled, y)

    # 4. Prédiction de probabilité pour les clients ACTIFS
    active_df = data_df[data_df['churn_label'] == 0].copy()
    if active_df.empty:
        return {"error": "Tous les clients sont déjà considérés comme perdus."}

    X_active = active_df[['recency', 'frequency', 'monetary', 'city_enc', 'seg_enc']].values
    X_active_scaled = scaler.transform(X_active)
    
    probs = model.predict_proba(X_active_scaled)[:, 1]
    active_df['churn_prob'] = probs

    predictions = []
    for _, row in active_df.iterrows():
        prob = float(row['churn_prob'])
        if prob < 0.25: continue # On n'affiche que les risques notables

        level = 'Critique' if prob >= 0.8 else 'Élevé' if prob >= 0.6 else 'Modéré'
        predictions.append({
            'customer_id': row['customer_id'],
            'city': row['city'],
            'segment': row['segment_name'],
            'prob': round(prob * 100, 1),
            'level': level,
            'recency': row['recency']
        })

    predictions.sort(key=lambda x: x['prob'], reverse=True)

    # 5. Importance des variables (Scientific feedback)
    feat_importances = pd.Series(model.feature_importances_, index=['Récence', 'Fréquence', 'Montant', 'Ville', 'Segment'])
    importance_list = [
        {'feature': k, 'importance': round(v * 100, 1)} 
        for k, v in feat_importances.sort_values(ascending=False).items()
    ]

    return {
        "predictions": predictions[:50],
        "feature_importance": importance_list,
        "summary": f"{len(predictions)} clients actifs présentent un risque de churn notable."
    }
