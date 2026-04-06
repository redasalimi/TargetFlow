import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from analysis.models import Analysis, CustomerSegment

for user in User.objects.all():
    print(f"User: {user.username}")
    analyses = Analysis.objects.filter(user=user)
    print(f"  Analyses: {analyses.count()}")
    for a in analyses:
        segments = CustomerSegment.objects.filter(analysis=a).count()
        print(f"    - Analysis {a.id} ({a.type}): {segments} segments")
