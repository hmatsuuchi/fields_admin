from django.contrib import admin

from .models import Attendance, StudentAttendance

admin.site.register(Attendance)
admin.site.register(StudentAttendance)