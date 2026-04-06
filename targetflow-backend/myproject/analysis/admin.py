from django.contrib import admin

# Register your models here.
from .models import KPI, Analysis, Segment, Report, CustomerSegment

admin.site.register(KPI)
admin.site.register(Analysis)
admin.site.register(Segment)
admin.site.register(Report)
admin.site.register(CustomerSegment)