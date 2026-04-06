import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth.models import User

for u in User.objects.all():
    print(f'ID: {u.id}, Username: "{u.username}", Active: {u.is_active}, HasUsablePassword: {u.has_usable_password()}')
