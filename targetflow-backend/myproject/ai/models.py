from django.db import models
from django.contrib.auth.models import User

class AIAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_analyses')
    business_type = models.CharField(max_length=255)
    target_city = models.CharField(max_length=100)
    response_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.business_type} ({self.user.username})"
