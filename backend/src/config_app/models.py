from django.db import models


class SystemPolicy(models.Model):
    pk_policy = models.AutoField(primary_key=True, db_column="pk_policy")
    face_match_threshold = models.FloatField(default=75.0)
    require_liveness = models.BooleanField(default=True)
    retention_days = models.PositiveIntegerField(default=90)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "system_policy"

    @classmethod
    def load(cls):
        policy = cls.objects.order_by("pk_policy").first()
        if policy:
            return policy

        return cls.objects.create(
            face_match_threshold=75.0,
            require_liveness=True,
            retention_days=90,
        )

    def as_dict(self):
        return {
            "face_match_threshold": float(self.face_match_threshold or 75.0),
            "threshold": float(self.face_match_threshold or 75.0),
            "require_liveness": bool(self.require_liveness),
            "retention_days": int(self.retention_days or 90),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
