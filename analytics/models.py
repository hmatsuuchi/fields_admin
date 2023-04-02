from datetime import date
from django.db import models

# ATTENDANCE ANALYTICS
class AttendanceAnalyticsDay(models.Model):
    day_date                = models.DateField()
    day_present_count       = models.IntegerField(default=0)
    day_absent_count        = models.IntegerField(default=0)
    day_pending_count       = models.IntegerField(default=0)

    # calculates absent rate
    @property
    def day_absent_rate(self):
        if self.day_absent_count + self.day_present_count != 0:
            return self.day_absent_count / ( self.day_absent_count + self.day_present_count ) * 100
        else:
            return 0

    def __str__(self):
        return str(self.id) + " - " + str(self.day_date) + "  (" + str(self.day_present_count) + ", " + str(self.day_absent_count) + ", " + str(self.day_pending_count) + ")"

class AttendanceAnalyticsWeek(models.Model):
    week_start_date         = models.DateField()
    week_present_count      = models.IntegerField(default=0)
    week_absent_count       = models.IntegerField(default=0)
    week_pending_count      = models.IntegerField(default=0)
    
    # calculates absent rate
    @property
    def week_absent_rate(self):
        if self.week_absent_count + self.week_present_count != 0:
            return self.week_absent_count / ( self.week_absent_count + self.week_present_count ) * 100
        else:
            return 0

    def __str__(self):
        return str(self.id) + " - " + str(self.week_start_date) + "  (" + str(self.week_present_count) + ", " + str(self.week_absent_count) + ", " + str(self.week_pending_count) + ")"

class AttendanceAnalyticsMonth(models.Model):
    month_start_date        = models.DateField()
    month_present_count     = models.IntegerField(default=0)
    month_absent_count      = models.IntegerField(default=0)
    month_pending_count     = models.IntegerField(default=0)
    
    # calculates absent rate
    @property
    def month_absent_rate(self):
        if self.month_absent_count + self.month_present_count != 0:
            return self.month_absent_count / ( self.month_absent_count + self.month_present_count ) * 100
        else:
            return 0

    def __str__(self):
        return str(self.id) + " - " + str(self.month_start_date) + "  (" + str(self.month_present_count) + ", " + str(self.month_absent_count) + ", " + str(self.month_pending_count) + ")"

class StudentLifetime(models.Model):
    last_modified       = models.DateTimeField(auto_now=True)
    date_time           = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    lifetime_all_mean   = models.IntegerField()
    lifetime_all_med    = models.IntegerField()

    def __str__(self):
        return str(self.id) + " (" + str(self.last_modified) + ") " + str(self.date_time) + " [" + str(self.lifetime_all_mean) + ", " + str(self.lifetime_all_med) + "]"

class StudentDemographics(models.Model):
    last_modified       = models.DateTimeField(auto_now=True)
    year                = models.IntegerField()
    month               = models.IntegerField()
    pre_0               = models.IntegerField()
    pre_1               = models.IntegerField()
    pre_2               = models.IntegerField()
    pre_3               = models.IntegerField()
    kin_1               = models.IntegerField()
    kin_2               = models.IntegerField()
    kin_3               = models.IntegerField()
    ele_1               = models.IntegerField()
    ele_2               = models.IntegerField()
    ele_3               = models.IntegerField()
    ele_4               = models.IntegerField()
    ele_5               = models.IntegerField()
    ele_6               = models.IntegerField()
    mid_1               = models.IntegerField()
    mid_2               = models.IntegerField()
    mid_3               = models.IntegerField()
    hig_1               = models.IntegerField()
    hig_2               = models.IntegerField()
    hig_3               = models.IntegerField()
    adu_1               = models.IntegerField()

    @property
    def total(self):
        total = sum([self.pre_0, self.pre_1, self.pre_2, self.pre_3, self.kin_1, self.kin_2, self.kin_3, self.ele_1, self.ele_2, self.ele_3, self.ele_4, self.ele_5, self.ele_6, self.mid_1, self.mid_2, self.mid_3, self.hig_1, self.hig_2, self.hig_3, self.adu_1])
        return total

    @property
    def pre_total(self):
        total = sum([self.pre_0, self.pre_1, self.pre_2, self.pre_3])
        return total

    @property
    def kin_total(self):
        total = sum([self.kin_1, self.kin_2, self.kin_3])
        return total

    @property
    def ele_total(self):
        total = sum([self.ele_1, self.ele_2, self.ele_3, self.ele_4, self.ele_5, self.ele_6,])
        return total

    @property
    def mid_total(self):
        total = sum([self.mid_1, self.mid_2, self.mid_3,])
        return total

    @property
    def hig_total(self):
        total = sum([self.hig_1, self.hig_2, self.hig_3])
        return total

    @property
    def adu_total(self):
        total = sum([self.adu_1,])
        return total

    def __str__(self):
        return str(self.id) + " (" + str(self.last_modified) + ") " + str(self.year) + "/" + str(self.month) + " [" + str(self.total) + "]"

class LessonsPerStudent(models.Model):
    last_modified                   = models.DateTimeField(auto_now=True)
    year                            = models.IntegerField()
    month                           = models.IntegerField()
    lessons_per_student             = models.FloatField()
    multi_lesson_student_count      = models.IntegerField()

    def __str__(self):
        return str(self.id) + " (" + str(self.last_modified) + ") " + str(self.year) + "/" + str(self.month) + " [" + str(self.lessons_per_student) + "] [" + str(self.multi_lesson_student_count) + "]"