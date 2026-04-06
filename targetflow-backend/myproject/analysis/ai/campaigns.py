from .predict import predict_campaign_outcome

def compare_campaign_options(segment_data, campaigns):
    """
    Compare multiple campaign scenarios for a segment and recommend the best one.
    """
    results = []
    for camp in campaigns:
        prediction = predict_campaign_outcome(segment_data, camp)
        results.append({
            'campaign': camp,
            'prediction': prediction
        })
    
    # Simple recommendation based on ROI
    if not results:
        return []
        
    best_roi = max(results, key=lambda x: x['prediction']['roi'])
    
    return {
        'comparisons': results,
        'recommendation': {
            'best_offer': best_roi['campaign'].get('offer_type', 'N/A'),
            'roi_gain': round(best_roi['prediction']['roi'], 1)
        }
    }
