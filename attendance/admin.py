from django.contrib import admin

from .models import Attendance, StudentAttendance, Content

admin.site.register(Attendance)
admin.site.register(StudentAttendance)
admin.site.register(Content)