from django.contrib import admin

from .models import SystemPolicy


@admin.register(SystemPolicy)
class SystemPolicyAdmin(admin.ModelAdmin):
    list_display = ("pk_policy", "face_match_threshold", "require_liveness", "retention_days", "updated_at")
