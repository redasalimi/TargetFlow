import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

username = 'testuser123'
password = 'testpassword'

User.objects.filter(username=username).delete()

u = User.objects.create_user(username=username, password=password)
print(f'User created: {u.username}, password hash: {u.password}')

auth_u = authenticate(username=username, password=password)
print(f'Authenticated: {auth_u is not None}')
