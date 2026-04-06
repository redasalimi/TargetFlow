import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.http import HttpResponse

from .ml.rfm import calculate_rfm
from .ml.clustering import run_kmeans
from .ml.labeling import assign_labels
from .models import CustomerSegment, Notification, Analysis
from .services.kpi import get_kpis
from .services.ai_insights import generate_insights
from .services.persona_service import generate_personas_for_segments
from .services.campaigns import campaign_for_segment
from .services.export_service import export_csv, export_pdf
from .services.churn_service import predict_churn
from .services.campaigns_service import campaign_send_view
from .services.targeting_service import get_targeting_priorities

from .ai.segmentation import perform_segmentation
from .ai.insights import generate_structured_insights
from .ai.predict import predict_campaign_outcome
from .ai.campaigns import compare_campaign_options

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:20]
        data = [{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "type": n.type,
            "created_at": n.created_at.isoformat()
        } for n in notifs]
        return Response(data)

class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk=None):
        if pk:
            Notification.objects.filter(id=pk, user=request.user).update(is_read=True)
        else:
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"status": "ok"})


class UploadCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = getattr(request.user, 'profile', None)
        plan = profile.plan if profile else 'starter'

        if "file" not in request.FILES:
            return Response({"error": "Champ 'file' manquant"}, status=400)
        file = request.FILES["file"]
        if not file.name.endswith('.csv'):
            return Response({"error": "Seuls les fichiers .csv sont acceptés"}, status=400)
        try:
            df = pd.read_csv(file)
        except Exception as e:
            return Response({"error": f"Impossible de lire le CSV : {str(e)}"}, status=400)

        required_cols = {'customer_id', 'purchase_date', 'amount'}
        # 'city' is now highly recommended for the Morocco Map
        if 'city' not in df.columns:
            df['city'] = 'Non spécifié'
        
        missing = required_cols - set(df.columns)
        if missing:
            return Response({"error": f"Colonnes manquantes : {', '.join(missing)}"}, status=400)
        if len(df) < 4:
            return Response({"error": "Minimum 4 lignes requises"}, status=400)
            
        # if plan == 'starter' and len(df) > 500:
        #     return Response({"error": "Le plan Starter est limité à 500 clients maximum."}, status=403)

        try:
            # 1. Calculate RFM & Clusters
            rfm = calculate_rfm(df)
            
            n_clusters = request.data.get('n_clusters')
            if n_clusters:
                try:
                    n_clusters = int(n_clusters)
                except ValueError:
                    n_clusters = None
            
            clusters = run_kmeans(rfm[['recency', 'frequency', 'monetary']], n_clusters=n_clusters)
            rfm["segment"] = clusters
            rfm = assign_labels(rfm)

            # 2. Optional Persona Generation
            generate_personas = request.data.get('generate_personas') == 'true'
            personas = []
            if generate_personas:
                unique_segments = rfm['segment_name'].unique().tolist()
                personas = generate_personas_for_segments(unique_segments)
            
            # 3. Create Analysis record
            analysis = Analysis.objects.create(
                user=request.user,
                type='expert',
                status='completed',
                result_data={"personas": personas} if personas else {}
            )

            # 4. Bulk Create Segments linked to this analysis
            # Récupérer les villes du DF original
            city_map = df.groupby('customer_id')['city'].first().to_dict() if 'city' in df.columns else {}

            CustomerSegment.objects.bulk_create([
                CustomerSegment(
                    user=request.user,
                    analysis=analysis,
                    customer_id=row["customer_id"],
                    recency=row["recency"],
                    frequency=row["frequency"],
                    monetary=row["monetary"],
                    clv=row.get("clv"),
                    rfm_score=row.get("rfm_score"),
                    segment=int(row["segment"]),
                    segment_name=row["segment_name"],
                    city=city_map.get(row["customer_id"], "Maroc"),
                ) for _, row in rfm.iterrows()
            ])

            Notification.objects.create(
                user=request.user,
                title="Analyse CSV terminée",
                message=f"{len(rfm)} clients ont été analysés avec succès. Découvrez vos nouveaux segments.",
                type="success"
            )

            return Response({
                "message": f"{len(rfm)} clients analysés avec succès",
                "total": len(rfm),
                "analysis_id": str(analysis.id),
                "segments": rfm.to_dict(orient="records"),
                "personas": personas
            })
        except Exception as e:
            return Response({"error": f"Erreur analyse : {str(e)}"}, status=500)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        kpis = get_kpis(request.user)
        kpis["priorities"] = get_targeting_priorities(request.user)
        return Response(kpis)


class InsightsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        latest = Analysis.objects.filter(user=request.user).order_by('-created_at').first()
        if not latest:
            return Response({"insights": [], "campaigns": [], "personas": []})

        segments_qs = CustomerSegment.objects.filter(analysis=latest)
        if not segments_qs.exists():
            return Response({"insights": [], "campaigns": [], "personas": []})
            
        df = pd.DataFrame(list(segments_qs.values("recency", "frequency", "monetary", "segment_name")))
        
        # New Structured AI Insights
        structured_insights = generate_structured_insights(df)
        
        # Campaign recommendations (structured)
        unique_segments = df['segment_name'].unique()
        campaigns = []
        for seg in unique_segments:
            seg_df = df[df['segment_name'] == seg]
            # Default recommendation
            base_camp = campaign_for_segment(seg) or {"title": f"Campagne {seg}", "channel": "Email", "incentive": "Offre personnalisée", "strategy": "Optimisation du segment."}
            campaigns.append({
                "segment": seg,
                "campaign": base_camp,
                "prediction": predict_campaign_outcome(seg_df, base_camp)
            })
            
        personas = latest.result_data.get('personas', []) if latest.result_data else []
            
        return Response({
            "insights": [{**i, "description": i.get("message", "")} for i in structured_insights], 
            "campaigns": campaigns,
            "personas": personas,
            "analysis_id": str(latest.id),
            "date": latest.created_at.isoformat()
        })


class HistoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        from django.db.models import Count, Avg, Max, Min
        # Global stats across all history
        qs = CustomerSegment.objects.filter(user=request.user)
        if not qs.exists():
            return Response({"total_clients": 0, "last_analysis": None, "segments_summary": [], "avg_monetary": None})

        # Summary of the current state (latest analysis)
        latest = Analysis.objects.filter(user=request.user).order_by('-created_at').first()
        current_qs = CustomerSegment.objects.filter(analysis=latest)

        segments_summary = list(current_qs.values("segment_name").annotate(
            total=Count("id"), avg_recency=Avg("recency"),
            avg_frequency=Avg("frequency"), avg_monetary=Avg("monetary"),
        ).order_by("-total"))

        agg = current_qs.aggregate(last=Max("created_at"), first=Min("created_at"),
                            avg_m=Avg("monetary"), avg_r=Avg("recency"), avg_f=Avg("frequency"))

        return Response({
            "total_clients":    qs.count(),
            "last_analysis":    agg["last"],
            "first_analysis":   agg["first"],
            "segments_summary": segments_summary,
            "avg_monetary":     round(agg["avg_m"], 2) if agg["avg_m"] else None,
            "avg_recency":      round(agg["avg_r"], 1) if agg["avg_r"] else None,
            "avg_frequency":    round(agg["avg_f"], 1) if agg["avg_f"] else None,
        })


class ResetDataView(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request):
        deleted_seg, _ = CustomerSegment.objects.filter(user=request.user).delete()
        deleted_ana, _ = Analysis.objects.filter(user=request.user).delete()
        return Response({
            "message": f"Données réinitialisées : {deleted_seg} segments et {deleted_ana} analyses supprimées.",
            "deleted_segments": deleted_seg,
            "deleted_analyses": deleted_ana
        })


class ExportCSVView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        if not CustomerSegment.objects.filter(user=request.user).exists():
            return Response({"error": "Aucune donnée à exporter"}, status=404)
        csv_bytes = export_csv(request.user)
        response = HttpResponse(csv_bytes, content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="targetflow_{request.user.username}.csv"'
        return response


class ExportPDFView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        profile = getattr(request.user, 'profile', None)
        plan = profile.plan if profile else 'starter'
        is_admin = request.user.is_staff or (profile and profile.role == 'admin')
        
        if plan == 'starter' and not is_admin:
            return Response({"error": "L'export PDF nécessite le plan Expert Pro ou Business."}, status=403)

        if not CustomerSegment.objects.filter(user=request.user).exists():
            return Response({"error": "Aucune donnée à exporter"}, status=404)
        try:
            pdf_bytes = export_pdf(request.user)
            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="targetflow_{request.user.username}.pdf"'
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ChurnPredictionView(APIView):
    """Prédiction de churn via RandomForest."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            result = predict_churn(request.user)
            
            # Count at risk
            if isinstance(result, list):
                at_risk = sum(1 for c in result if c.get('risk_level') in ['Elevé', 'Très Elevé'])
                if at_risk > 0:
                    Notification.objects.create(
                        user=request.user,
                        title="Prédiction Churn",
                        message=f"{at_risk} clients présentent un risque élevé d'attrition.",
                        type="warning"
                    )

            return Response(result)
        except ImportError as e:
            return Response({"error": str(e)}, status=500)
        except Exception as e:
            return Response({"error": f"Erreur prédiction : {str(e)}"}, status=500)


class CampaignSendView(APIView):
    """Envoie une campagne via Mailchimp ou WhatsApp."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = getattr(request.user, 'profile', None)
        plan = profile.plan if profile else 'starter'
        if plan == 'starter':
            return Response({"error": "Les campagnes nécessitent le plan Expert Pro ou Business."}, status=403)

        try:
            result = campaign_send_view(request.data, request.user)
            
            Notification.objects.create(
                user=request.user,
                title="Campagne envoyée",
                message=f"Votre campagne a été programmée/envoyée avec succès.",
                type="success"
            )

            return Response(result)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class TargetingView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        priorities = get_targeting_priorities(request.user)
        return Response({"priorities": priorities})

class CampaignPredictView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        campaign = request.data.get('campaign')
        segment_name = request.data.get('segment')
        
        latest = Analysis.objects.filter(user=request.user, status='completed').order_by('-created_at').first()
        if not latest or not segment_name:
            return Response({"error": "Data or segment missing"}, status=400)
            
        seg_data = CustomerSegment.objects.filter(analysis=latest, segment_name=segment_name)
        df = pd.DataFrame(list(seg_data.values("recency", "frequency", "monetary")))
        
        prediction = predict_campaign_outcome(df, campaign)
        return Response(prediction)

class CampaignCompareView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        campaigns = request.data.get('campaigns', [])
        segment_name = request.data.get('segment')
        
        latest = Analysis.objects.filter(user=request.user, status='completed').order_by('-created_at').first()
        if not latest or not segment_name or not campaigns:
            return Response({"error": "Missing parameters"}, status=400)
            
        seg_data = CustomerSegment.objects.filter(analysis=latest, segment_name=segment_name)
        df = pd.DataFrame(list(seg_data.values("recency", "frequency", "monetary")))
        
        comparison = compare_campaign_options(df, campaigns)
        return Response(comparison)
