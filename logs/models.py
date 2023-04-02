from django.db import models

class AccessLog(models.Model):
    accesslog_url                   = models.CharField(max_length=128)
    accesslog_date_time             = models.DateTimeField(auto_now_add=True)
    accesslog_user                  = models.IntegerField(default=0)
    accesslog_post_parameters       = models.CharField(max_length=2048, null=True, blank=True)
    accesslog_get_parameters        = models.CharField(max_length=2048, null=True, blank=True)

    def __str__(self):
        return str(self.accesslog_date_time) + " - " + str(self.accesslog_url) + " - " + str(self.accesslog_user)