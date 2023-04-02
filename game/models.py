from django.db import models

from customer.models import CustomerProfile

class CardIndex(models.Model):
    linked_student      = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE)
    card_identifier     = models.CharField(max_length=64)
    date_time           = models.DateTimeField(auto_now_add=True)