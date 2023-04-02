from django.db import models

from django.contrib.auth.models import User
from customer.models import CustomerProfile, Notes

class UserProfile(models.Model):
    user                            = models.OneToOneField(User, on_delete=models.CASCADE)
    last_name_kanji                 = models.CharField(max_length=35, blank=True, null=True)
    first_name_kanji                = models.CharField(max_length=35, blank=True, null=True)
    last_name_katakana              = models.CharField(max_length=35, blank=True, null=True)
    first_name_katakana             = models.CharField(max_length=35, blank=True, null=True)
    last_name_romaji                = models.CharField(max_length=35, blank=True, null=True)
    first_name_romaji               = models.CharField(max_length=35, blank=True, null=True)
    profile_img_url                 = models.CharField(max_length=35, blank=True, null=True)
    flagged_profiles                = models.ManyToManyField(CustomerProfile, blank=True)
    display_archived_profiles       = models.BooleanField(default=False)
    display_archived_notes          = models.BooleanField(default=False)
    display_only_flagged_profiles   = models.BooleanField(default=False)
    display_archived_classes        = models.BooleanField(default=False)
    display_classes_day_of_week     = models.CharField(max_length=32, blank=True, null=True)
    display_classes_instructors     = models.CharField(max_length=128, blank=True, null=True)

    notes_active                    = models.BooleanField(default=False)
    class_list_active               = models.BooleanField(default=False)

    attendance_record_active        = models.BooleanField(default=False)
    attendance_expanded_view_active = models.BooleanField(default=False)
    display_attendance_instructors  = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return str(self.user.username)