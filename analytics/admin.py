from django.contrib import admin

from .models import AttendanceAnalyticsMonth, AttendanceAnalyticsWeek, AttendanceAnalyticsDay, StudentLifetime, StudentDemographics, LessonsPerStudent, StudentsInOut

admin.site.register(AttendanceAnalyticsMonth)
admin.site.register(AttendanceAnalyticsWeek)
admin.site.register(AttendanceAnalyticsDay)
admin.site.register(StudentLifetime)
admin.site.register(StudentDemographics)
admin.site.register(LessonsPerStudent)
admin.site.register(StudentsInOut)