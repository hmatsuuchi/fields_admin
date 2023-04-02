# from os import terminal_size
from django.db import models
# from django.db.models.fields import DateField, IntegerField
from django.db.models.fields import IntegerField
from django.utils import timezone

from django.contrib.auth.models import User

class CustomerProfile(models.Model):

    # PREFECTURE CHOICES
    unknown = 0
    tokushima = 1
    kagawa = 2
    prefecture_choices = [
        (unknown, '-------'),
        (tokushima, '徳島県'),
        (kagawa, '香川県'),
    ]

    # PHONE CHOICES
    unknown     = 0
    own         = 1
    mother      = 2
    father      = 3
    grandmother = 4
    grandfather = 5
    uncle       = 6
    aunt        = 7
    phone_choices = [
        (unknown, '-------'),
        (own, '自身'),
        (mother, '母'),
        (father, '父'),
        (grandmother, '祖母'),
        (grandfather, '祖父'),
        (uncle, '叔父'),
        (aunt, '叔母'),
    ]

    # GRADE CHOICES
    unknown     = 0
    pre_0       = 1
    pre_1       = 2
    pre_2       = 3
    pre_3       = 4
    kin_1       = 5
    kin_2       = 6
    kin_3       = 7
    ele_1       = 8
    ele_2       = 9
    ele_3       = 10
    ele_4       = 11
    ele_5       = 12
    ele_6       = 13
    mid_1       = 14
    mid_2       = 15
    mid_3       = 16
    hig_1       = 17
    hig_2       = 18
    hig_3       = 19
    adu_1       = 20
    grade_choices = [
        (unknown, '-------'),
        (pre_0, '0才'),
        (pre_1, '1才'),
        (pre_2, '2才'),
        (pre_3, '3才'),
        (kin_1, '年小'),
        (kin_2, '年中'),
        (kin_3, '年長'),
        (ele_1, '小1'),
        (ele_2, '小2'),
        (ele_3, '小3'),
        (ele_4, '小4'),
        (ele_5, '小5'),
        (ele_6, '小6'),
        (mid_1, '中1'),
        (mid_2, '中2'),
        (mid_3, '中3'),
        (hig_1, '高1'),
        (hig_2, '高2'),
        (hig_3, '高3'),
        (adu_1, '大人'),
    ]

    # STATUS CHOICES
    unknown = 0
    pre_enrolled = 1
    enrolled = 2
    short_absence = 3
    long_absence = 4
    status_choices = [
        (unknown, '-------'),
        (pre_enrolled, '入学希望'),
        (enrolled, '在学'),
        (short_absence, '休校'),
        (long_absence, '退校'),
    ]

    # PAYMENT METHOD CHOICES
    unknown = 0
    cash = 1
    direct_deposit = 2
    payment_method_choices = [
        (unknown, '-------'),
        (cash, '月謝袋'),
        (direct_deposit, '引き落とし'),
    ]

    last_name_romaji            = models.CharField(max_length=35)
    first_name_romaji           = models.CharField(max_length=35)
    last_name_kanji             = models.CharField(max_length=35)
    first_name_kanji            = models.CharField(max_length=35)
    last_name_katakana          = models.CharField(max_length=35)
    first_name_katakana         = models.CharField(max_length=35)

    post_code                   = models.CharField(max_length=10, blank=True)
    prefecture                  = models.IntegerField(choices=prefecture_choices, default=1)
    city                        = models.CharField(max_length=35, blank=True)
    address_1                   = models.CharField(max_length=35, blank=True)
    address_2                   = models.CharField(max_length=35, blank=True)

    phone_1                     = models.CharField(max_length=20, blank=True)
    phone_1_type                = models.IntegerField(choices=phone_choices, default=0)
    phone_2                     = models.CharField(max_length=20, blank=True)
    phone_2_type                = models.IntegerField(choices=phone_choices, default=0)

    birthday                    = models.DateField(null=True, blank=True)
    grade                       = models.IntegerField(choices=grade_choices, default=0)

    status                      = models.IntegerField(choices=status_choices, default=0)

    payment_method              = models.IntegerField(choices=payment_method_choices, default=0)

    archived                    = models.BooleanField(default=False)

    def __str__(self):
        return self.last_name_romaji + ", " + self.first_name_romaji

    @property
    def age(self):
        if self.birthday:
            now = timezone.now()
            birthday = self.birthday

            age = now.year - birthday.year - ((now.month, now.day) < (birthday.month, birthday.day))
        else:
            age = ''

        return age

    @property
    def lifetime(self):
        from attendance.models import StudentAttendance

        records_all = StudentAttendance.objects.filter(student = self, attendance_status = 1).order_by('attendance_record__date')
        if records_all.count() > 1:
            record_earliest = records_all.first().attendance_record.date
            record_latest = records_all.last().attendance_record.date

            lifetime = record_latest - record_earliest

            return lifetime.days
        return 0

class Notes(models.Model):
    # NOTE TYPE CHOICES
    unknown             = 0
    counseling          = 1
    trial               = 2
    signup              = 3
    counseling_trial    = 4
    first_lesson        = 5
    short_absence       = 6
    miscellaneous       = 7
    makeup              = 8
    lesson_absence      = 9
    schedule_change     = 10
    lesson_restart      = 11
    internal_cancel     = 12
    special_lesson      = 13
    initial_contact     = 14
    note_type_choices = [
        (unknown, 'タグなし'),
        (counseling, 'カウンセリング'),
        (trial, '体験レッスン'),
        (signup, '入学'),
        (counseling_trial, 'カウンセリング・体験'),
        (first_lesson, 'レッスン開始'),
        (short_absence, '休校'),
        (miscellaneous, 'メモ'),
        (makeup, '振替'),
        (lesson_absence, '欠席'),
        (schedule_change, '予定変更'),
        (lesson_restart, 'レッスン再開'),
        (internal_cancel, '内部キャンセル'),
        (special_lesson, '特別レッスン'),
        (initial_contact, '連絡'),
    ]

    # # INSTRUCTOR CHOICES
    # unknown             = 0
    # mendo               = 1
    # dfarries            = 2
    # hmatsuuchi          = 3
    # instructor_choices = [
    #     (unknown, '-------'),
    #     (mendo, '遠藤先生'),
    #     (dfarries, 'ファーリス先生'),
    #     (hmatsuuchi, '松内先生'),
    # ]

    customer_id                 = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE)
    date                        = models.DateField()
    time                        = models.TimeField(null=True, blank=True)
    type                        = IntegerField(choices=note_type_choices, default=0)
    # instructor                  = IntegerField(choices=instructor_choices, default=0)
    instructor_1                = models.ForeignKey(User, on_delete=models.CASCADE, related_name="instructor_1", blank=True, null=True)
    instructor_2                = models.ForeignKey(User, on_delete=models.CASCADE, related_name="instructor_2", blank=True, null=True)
    note_text                   = models.TextField(null=True, blank=True)
    archived                    = models.BooleanField(default=False)

    def __str__(self):
        return str(self.id) + " - " + self.customer_id.last_name_romaji + ", " + self.customer_id.first_name_romaji + " - " + str(self.date) + " " + str(self.time)

class CustomerProfileChangelog(models.Model):
    # CHANGELOG TYPE CHOICES
    create              = 1
    retrieve            = 2
    update              = 3
    delete              = 4
    changelog_type_choices = [
        (create, 'create'),
        (retrieve, 'retrieve'),
        (update, 'update'),
        (delete, 'delete'),
    ]

    # changlog fields
    changelog_customer_profile      = models.IntegerField(default=0)
    changelog_date_time             = models.DateTimeField(auto_now_add=True)
    changelog_user                  = models.IntegerField(default=0)
    changelog_type                  = models.IntegerField(choices=changelog_type_choices)
    # mirrored customer profile fields
    last_name_romaji                = models.CharField(max_length=35)
    first_name_romaji               = models.CharField(max_length=35)
    last_name_kanji                 = models.CharField(max_length=35)
    first_name_kanji                = models.CharField(max_length=35)
    last_name_katakana              = models.CharField(max_length=35)
    first_name_katakana             = models.CharField(max_length=35)
    post_code                       = models.CharField(max_length=10, blank=True)
    prefecture                      = models.IntegerField(default=1)
    city                            = models.CharField(max_length=35, blank=True)
    address_1                       = models.CharField(max_length=35, blank=True)
    address_2                       = models.CharField(max_length=35, blank=True)
    phone_1                         = models.CharField(max_length=20, blank=True)
    phone_1_type                    = models.IntegerField(default=0)
    phone_2                         = models.CharField(max_length=20, blank=True)
    phone_2_type                    = models.IntegerField(default=0)
    birthday                        = models.DateField(null=True, blank=True)
    grade                           = models.IntegerField(default=0)
    status                          = models.IntegerField(default=0)
    payment_method                  = models.IntegerField(default=0)
    archived                        = models.BooleanField(default=False)

    def __str__(self):
        return str(self.changelog_date_time) + " - " + str(self.changelog_customer_profile) + " - " + str(self.changelog_user) + " - " + str(self.changelog_type)

class NotesChangelog(models.Model):
    # CHANGELOG TYPE CHOICES
    create              = 1
    retrieve            = 2
    update              = 3
    delete              = 4
    changelog_type_choices = [
        (create, 'create'),
        (retrieve, 'retrieve'),
        (update, 'update'),
        (delete, 'delete'),
    ]

    # changlog fields
    changelog_note              = models.IntegerField(default=0)
    changelog_date_time         = models.DateTimeField(auto_now_add=True)
    changelog_user              = models.IntegerField(default=0)
    changelog_type              = IntegerField(choices=changelog_type_choices)
    # mirrored notes fields
    customer_id                 = models.IntegerField(default=0)
    date                        = models.DateField()
    time                        = models.TimeField(null=True, blank=True)
    type                        = models.IntegerField(default=0)
    instructor_1                = models.IntegerField(default=0)
    instructor_2                = models.IntegerField(default=0)
    note_text                   = models.TextField(null=True, blank=True)
    archived                    = models.BooleanField(default=False)

    def __str__(self):
        return str(self.changelog_date_time) + " - " + str(self.changelog_note) + " - " + str(self.changelog_user) + " - " + str(self.changelog_type)