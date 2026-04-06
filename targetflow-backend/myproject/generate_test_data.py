import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

def generate_ecommerce_dataset(num_customers=2000, num_transactions=15000, file_path='data/sample_ecommerce_data.csv'):
    """
    Génère un dataset transactionnel B2C/E-commerce SCIENTIFIQUEMENT RÉALISTE.
    - Distribution de Pareto (80/20) pour les montants (les gros clients payent beaucoup plus).
    - BIAIS RÉGIONAUX : Casablanca/Rabat/Tanger ont un panier moyen plus élevé.
    - SAISONNALITÉ : Ramadan, Aïd al-Fitr, et Été boostent les ventes.
    - Colonne 'city' incluse pour le ciblage géographique.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # ── Villes et Biais Régionaux ─────────────────────────────────────────────
    # Les poids simulent la population urbaine active au Maroc
    MOROCCAN_CITIES = {
        'Casablanca': {'weight': 0.35, 'premium_factor': 1.4},
        'Rabat':      {'weight': 0.15, 'premium_factor': 1.3}, 
        'Tanger':     {'weight': 0.10, 'premium_factor': 1.2},
        'Marrakech':  {'weight': 0.10, 'premium_factor': 1.1},
        'Fes':        {'weight': 0.08, 'premium_factor': 0.9},
        'Agadir':     {'weight': 0.07, 'premium_factor': 1.0},
        'Oujda':      {'weight': 0.05, 'premium_factor': 0.8},
        'Laayoune':   {'weight': 0.05, 'premium_factor': 1.1},
        'Dakhla':     {'weight': 0.05, 'premium_factor': 1.3},
    }
    
    city_list = list(MOROCCAN_CITIES.keys())
    city_weights = [v['weight'] for v in MOROCCAN_CITIES.values()]

    # ── Profils Clients ───────────────────────────────────────────────────────
    customers = []
    # Simulation de la loi de puissance (Pareto) pour les segments de valeur
    for i in range(1, num_customers + 1):
        city = random.choices(city_list, weights=city_weights)[0]
        premium_mod = MOROCCAN_CITIES[city]['premium_factor']
        
        # 20% sont des clients à haute valeur (Pareto principle)
        rand = random.random()
        if rand < 0.20:
            profile = 'High-Value'
            freq_lambda = 15 # Nombre d'achats moyen par an (Poisson)
            amount_scale = 1200 * premium_mod
        else:
            profile = 'Standard'
            freq_lambda = 4 
            amount_scale = 200 * premium_mod
            
        customers.append({
            'customer_id': f'C_MAR_{i:04d}',
            'city': city,
            'freq': max(1, np.random.poisson(freq_lambda)),
            'amount_scale': amount_scale,
            'start_offset': random.randint(0, 180) # Arrivée du client dans l'année
        })
        
    transactions = []
    base_date = datetime.now() - timedelta(days=365)
    
    for c in customers:
        num_orders = c['freq']
        client_start = base_date + timedelta(days=c['start_offset'])
        
        for _ in range(num_orders):
            # Date aléatoire sur l'année restante
            days_left = (datetime.now() - client_start).days
            if days_left <= 0: days_left = 1
            d = client_start + timedelta(days=random.randint(0, days_left))
            
            # Montant : Log-Normal ou Pareto (ici Pareto décalé pour plus de réalisme)
            # Alpha=2.5 donne une queue de distribution réaliste
            amount = (np.random.pareto(2.5) + 0.5) * c['amount_scale']
            
            # ── SAISONNALITÉ MAROCAINE ────────────────────────────────────────
            # Ramadan 2024 (approx Mars/Avril)
            if (d.month == 3) or (d.month == 4 and d.day < 15):
                amount *= 1.4
            # Summer peaks (MRE + Tourism)
            elif d.month in [7, 8]:
                amount *= 1.25
            # End of year / Black Friday
            elif d.month == 11 and d.day > 20:
                amount *= 1.6
                
            transactions.append({
                'customer_id': c['customer_id'],
                'purchase_date': d.strftime('%Y-%m-%d'),
                'amount': round(amount, 2),
                'city': c['city']
            })

    df = pd.DataFrame(transactions)
    # Mélange pour le réalisme de l'import
    df = df.sample(frac=1).reset_index(drop=True)
    
    df.to_csv(file_path, index=False)
    print(f"✅ DATASET RÉALISTE GÉNÉRÉ : {len(df)} transactions.")
    print(f"📍 Biais Régionaux : {', '.join(city_list[:3])} (Top hubs)")
    print(f"💰 Distribution : Pareto (80/20) + Seasonality (Ramadan & Summer)")
    print(f"📁 Localisation : {os.path.abspath(file_path)}")

if __name__ == "__main__":
    generate_ecommerce_dataset()
