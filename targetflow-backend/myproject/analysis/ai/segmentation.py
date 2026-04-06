import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

def perform_segmentation(df, n_clusters=4):
    """
    Perform K-Means clustering on RFM (Recency, Frequency, Monetary) data.
    """
    if df.empty:
        return df

    # Features: recency, frequency, monetary
    features = ['recency', 'frequency', 'monetary']
    
    # Handle missing values
    df[features] = df[features].fillna(0)
    
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df[features])
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_transform(scaled_data).argmin(axis=1) # Simplified mapping
    
    # Map clusters to meaningful names based on monetary means
    cluster_means = df.groupby('cluster')['monetary'].mean().sort_values(ascending=False)
    mapping = {}
    names = ['Champions (VIP)', 'Fidèles Potentiels', 'À Risque / Inactifs', 'Nouveaux Clients']
    
    for i, cluster_id in enumerate(cluster_means.index):
        mapping[cluster_id] = names[i] if i < len(names) else f'Segment {cluster_id}'
        
    df['segment_name'] = df['cluster'].map(mapping)
    return df
