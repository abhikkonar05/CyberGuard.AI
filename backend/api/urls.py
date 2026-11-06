from django.urls import path
from api.views import (
    HealthCheckView,
    DashboardView,
    PredictManualView,
    PredictCsvView,
    PredictionsHistoryView,
    ModelInfoView,
    ModelMetricsView,
    StreamingStatusView
)

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='api-health'),
    path('dashboard/', DashboardView.as_view(), name='api-dashboard'),
    path('predict/manual/', PredictManualView.as_view(), name='api-predict-manual'),
    path('predict/csv/', PredictCsvView.as_view(), name='api-predict-csv'),
    path('predictions/', PredictionsHistoryView.as_view(), name='api-predictions-history'),
    path('model/info/', ModelInfoView.as_view(), name='api-model-info'),
    path('model/metrics/', ModelMetricsView.as_view(), name='api-model-metrics'),
    path('streaming/status/', StreamingStatusView.as_view(), name='api-streaming-status'),
]

