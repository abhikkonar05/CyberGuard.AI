from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """
        Preload the Machine Learning Inference Engine once at startup.
        Avoids initializing models or JVM on every API request.
        """
        try:
            from services.inference_engine import get_inference_engine
            engine = get_inference_engine()
            logger.info(f"Inference engine successfully preloaded: {engine.model_name}")
        except Exception as e:
            logger.warning(f"Could not preload inference engine at startup: {e}")

