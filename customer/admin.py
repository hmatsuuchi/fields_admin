from django.contrib import admin
from .models import CustomerProfile, Notes, CustomerProfileChangelog, NotesChangelog

admin.site.register(CustomerProfile)
admin.site.register(Notes)
admin.site.register(CustomerProfileChangelog)
admin.site.register(NotesChangelog)