from django.db import models

class Materials(models.Model):
    title               = models.CharField(max_length=256)
    edition             = models.IntegerField()

    def __str__(self):
        return f"{self.id} - {self.title}" 