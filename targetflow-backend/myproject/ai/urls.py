from django.urls import path
from .views import startup_ai, generate_persona_photo, startup_history

urlpatterns = [
    path("startup/",        startup_ai),
    path("startup/history/",startup_history),
    path("persona/photo/",  generate_persona_photo),
]
