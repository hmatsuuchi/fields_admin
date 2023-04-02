from django.urls import path

from . import views

urlpatterns = [
    path('', views.Attendance, name='attendance'),
    path('attendance_api', views.AttendanceAPI, name='attendanceAPI'),
]