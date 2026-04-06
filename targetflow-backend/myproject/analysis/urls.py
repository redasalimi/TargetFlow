from django.urls import path
from .views import (
    UploadCSVView, DashboardView, InsightsView,
    HistoryView, ResetDataView,
    ExportCSVView, ExportPDFView,
    ChurnPredictionView, CampaignSendView,
    CampaignPredictView, CampaignCompareView,
    NotificationListView, NotificationMarkReadView,
    TargetingView,
)

urlpatterns = [
    path('upload/',          UploadCSVView.as_view()),
    path('dashboard/',       DashboardView.as_view()),
    path('insights/',        InsightsView.as_view()),
    path('history/',         HistoryView.as_view()),
    path('reset/',           ResetDataView.as_view()),
    path('export/csv/',      ExportCSVView.as_view()),
    path('export/pdf/',      ExportPDFView.as_view()),
    path('churn/',           ChurnPredictionView.as_view()),
    path('campaigns/send/',  CampaignSendView.as_view()),
    path('simulate/',        CampaignPredictView.as_view()),
    path('campaigns/predict/', CampaignPredictView.as_view()),
    path('campaigns/compare/', CampaignCompareView.as_view()),
    path('notifications/',   NotificationListView.as_view()),
    path('targeting/',       TargetingView.as_view()),
    path('notifications/read/', NotificationMarkReadView.as_view()),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view()),
]
