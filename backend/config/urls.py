"""
Main URL Configuration for Cyber Attack Detection System.
"""
from django.urls import path, include
from django.http import JsonResponse

def root_status_view(request):
    return JsonResponse({
        "service": "Cyber Attack Detection & Prevention System API",
        "status": "online",
        "version": "2.0.0",
        "architecture": "Database-Free & PySpark MLlib Inference",
        "endpoints": {
            "health": "/api/health/",
            "dashboard": "/api/dashboard/",
            "predict_manual": "/api/predict/manual/",
            "predict_csv": "/api/predict/csv/",
            "predictions_history": "/api/predictions/",
            "model_info": "/api/model/info/",
            "model_metrics": "/api/model/metrics/",
            "streaming_status": "/api/streaming/status/"
        }
    })

urlpatterns = [
    path('', root_status_view, name='root-status'),
    path('api/', include('api.urls')),
]

