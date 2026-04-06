from django.db import models
from django.contrib.auth.models import User
import uuid

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    type = models.CharField(max_length=50, default='info')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class Analysis(models.Model):
    ANALYSIS_TYPE = (
        ('expert', 'Expert'),
        ('startup', 'Startup'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analyses')
    type = models.CharField(max_length=10, choices=ANALYSIS_TYPE, db_index=True)
    status = models.CharField(max_length=20, default='processing', db_index=True)
    result_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.type} - {self.user.username}"

class Segment(models.Model):
    analysis = models.ForeignKey(Analysis, on_delete=models.CASCADE, related_name='segments')
    label = models.CharField(max_length=100)
    color = models.CharField(max_length=7)
    count = models.IntegerField()
    rfm_r = models.FloatField()
    rfm_f = models.FloatField()
    rfm_m = models.FloatField()
    clv = models.FloatField()
    description = models.TextField()

    def __str__(self):
        return self.label
    
class KPI(models.Model):
    analysis = models.OneToOneField(Analysis, on_delete=models.CASCADE, related_name='kpis')
    avg_clv = models.FloatField()
    churn_rate = models.FloatField()
    roi_potential = models.FloatField()
    top_city = models.CharField(max_length=100)
    data_json = models.JSONField()
    
class Report(models.Model):
    analysis = models.OneToOneField(Analysis, on_delete=models.CASCADE, related_name='report')
    file_path = models.CharField(max_length=255)
    generated_at = models.DateTimeField(auto_now_add=True)

class CustomerSegment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    analysis = models.ForeignKey(Analysis, on_delete=models.CASCADE, related_name='customer_segments', null=True, blank=True)
    customer_id = models.IntegerField(db_index=True)
    recency = models.FloatField()
    frequency = models.FloatField()
    monetary = models.FloatField()
    segment = models.IntegerField()
    segment_name = models.CharField(max_length=50, db_index=True)
    city = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    clv = models.FloatField(null=True, blank=True)
    rfm_score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)