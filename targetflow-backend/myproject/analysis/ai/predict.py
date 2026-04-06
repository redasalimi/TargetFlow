import numpy as np

def predict_campaign_outcome(segment_data, campaign):
    """
    Advanced prediction engine based on RFM data and Marketing heuristics.
    Heuristics:
    - WhatsApp: 95% open rate, +15% conversion multiplier vs baseline.
    - Social Ads: 2% CTR, +5% conversion multiplier.
    - Email: 20% open rate, base conversion.
    - SMS: 90% open rate, +10% conversion multiplier.
    """
    # Base parameters
    base_conv = 0.05 
    
    # 1. Segment Data influence
    avg_monetary = segment_data['monetary'].mean() if not segment_data.empty else 100
    avg_frequency = segment_data['frequency'].mean() if not segment_data.empty else 1
    
    # VIPs/Champions have naturally higher trust/conversion (+5%)
    if avg_monetary > 5000 or avg_frequency > 10:
        base_conv += 0.05

    # 2. Channel Heuristics
    channel = str(campaign.get('channel', 'Email')).lower()
    channel_multiplier = 1.0
    
    if 'whatsapp' in channel:
        channel_multiplier = 1.25 # Best performer in Morocco
    elif 'sms' in channel:
        channel_multiplier = 1.15
    elif 'social' in channel or 'ads' in channel:
        channel_multiplier = 0.85 # Higher reach, lower intent
    else: # Email
        channel_multiplier = 0.95

    # 3. Offer Impact
    offer = str(campaign.get('offer_type', campaign.get('offer', ''))).lower()
    offer_bonus = 0.0
    if '30%' in offer or '50%' in offer: offer_bonus = 0.10
    elif '20%' in offer: offer_bonus = 0.07
    elif '10%' in offer or 'cadeau' in offer: offer_bonus = 0.04

    # Final logic: Base * Channel + Offer
    conv_rate = (base_conv * channel_multiplier) + offer_bonus
    
    # Random variance (Normal distribution center at result)
    conv_rate = max(0.01, min(0.40, np.random.normal(conv_rate, 0.01)))

    # Financial Estimates
    target_count = len(segment_data)
    budget = float(campaign.get('budget', 500))
    
    expected_conversions = target_count * conv_rate
    # Average Order Value assumption based on historical monetary mean
    aov = avg_monetary * 0.2 # Assume incremental revenue is 20% of their historical average
    
    revenue_brut = expected_conversions * aov
    
    # ROI = (Revenue - Budget) / Budget * 100
    roi = ((revenue_brut - budget) / budget) * 100 if budget > 0 else 0
    
    # Score (0-100) combining High ROI, Low Budget, High Conversion
    score = (conv_rate * 200) + (min(roi, 100) * 0.5)
    
    return {
        'conversion_rate': round(conv_rate * 100, 1),
        'roi_estimate': round(roi, 1),
        'revenue_brut': round(revenue_brut, 0),
        'score': round(max(5, min(95, score)), 0)
    }
