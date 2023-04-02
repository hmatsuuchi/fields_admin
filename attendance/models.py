from django.db import models

from django.contrib.auth.models import User
from class_list.models import ClassList
from customer.models import CustomerProfile

# primary attendance record
class Attendance(models.Model):
    linked_class        = models.ForeignKey(ClassList, on_delete=models.CASCADE, null=True, blank=True)
    date                = models.DateField(null=True, blank=True)
    start_time          = models.TimeField(null=True, blank=True)
    instructor          = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return str(self.id) + ": " + str(self.date)

# individual attendance records for each student
class StudentAttendance(models.Model):
    # attendance status choices
    pending = 0
    present = 1
    absent = 2
    attendance_status_choices = [
        (pending, '未定'),
        (present, '出席'),
        (absent, '欠席'),
    ]

    attendance_record   = models.ForeignKey(Attendance, on_delete=models.CASCADE, null=True, blank=True)
    student             = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, null=True, blank=True)
    attendance_status   = models.IntegerField(choices=attendance_status_choices, default=0)

    # gets record date
    @property
    def date(self):
        return self.attendance_record.date

    def __str__(self):
        return str(self.id) + ": " + str(self.attendance_record.date)