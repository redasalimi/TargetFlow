import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score

def run_kmeans(data, n_clusters=None):
    """
    Applique StandardScaler et calcule le clustering.
    Utilise la méthode de la Silhouette pour K optimal, avec fallback sécurisé.
    """
    n_samples = len(data)
    
    # 1. Protection données insuffisantes
    if n_samples < 3:
        return np.zeros(n_samples, dtype=int)

    # 2. Normalisation obligatoire pour K-Means
    scaler = StandardScaler()
    data_scaled = scaler.fit_transform(data)

    # 3. Détermination de K (Nombre de segments)
    if n_clusters and 2 <= n_clusters <= n_samples:
        best_k = n_clusters
    else:
        # Range étendu pour une segmentation plus fine (3 à 6 clusters)
        max_search_k = min(6, n_samples - 1)
        best_k = 4 # Valeur par défaut robuste selon la théorie RFM
        best_score = -1

        # On cherche K optimal par Silhouette Coefficient
        if n_samples > 15:
            for k in range(3, max_search_k + 1):
                model = KMeans(n_clusters=k, random_state=42, n_init='auto')
                labels = model.fit_predict(data_scaled)
                score = silhouette_score(data_scaled, labels)
                
                # Boost pour K=4 si les scores sont proches (préférence métier)
                if k == 4: score += 0.05 
                
                if score > best_score:
                    best_score = score
                    best_k = k
        else:
            best_k = min(4, n_samples)

    # 4. Entraînement Final
    final_model = KMeans(n_clusters=best_k, random_state=42, n_init='auto')
    clusters = final_model.fit_predict(data_scaled)

    return clusters