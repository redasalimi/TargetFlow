from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLES = [
        ('admin',   'Administrateur'),
        ('manager', 'Manager'),
        ('viewer',  'Lecteur'),
    ]
    PLANS = [
        ('starter',  'Starter'),
        ('expert',   'Expert Pro'),
        ('business', 'Business'),
    ]

    user    = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role    = models.CharField(max_length=10, choices=ROLES, default='viewer')
    plan    = models.CharField(max_length=10, choices=PLANS, default='starter')
    company = models.CharField(max_length=100, blank=True, default='')
    phone   = models.CharField(max_length=20, blank=True, default='')
    bio     = models.TextField(blank=True, default='')
    avatar  = models.URLField(blank=True, default='', max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role} - {self.plan}"
