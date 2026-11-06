"""
WSGI config for Cyber Attack Detection System.
Used by Gunicorn on Render production.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_wsgi_application()

