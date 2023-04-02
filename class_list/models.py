from django.db import models
from django.contrib.auth.models import User
from customer.models import CustomerProfile

class ClassList(models.Model):
    # DAY OF WEEK CHOICES
    unknown     = 7
    sunday      = 0
    monday      = 1
    tuesday     = 2
    wednesday   = 3
    thursday    = 4
    friday      = 5
    saturday    = 6

    day_of_week_choices = [
        (unknown, '-------'),
        (sunday, '日曜日'),
        (monday, '月曜日'),
        (tuesday, '火曜日'),
        (wednesday, '水曜日'),
        (thursday, '木曜日'),
        (friday, '金曜日'),
        (saturday, '土曜日'),
    ]

    # CLASS TYPE CHOICES
    unknown             = 0
    baby                = 1
    preschool_a         = 2
    preschool_b         = 3
    elementary          = 4
    middle              = 5
    high                = 6
    adult               = 7
    private_40          = 8
    private_50          = 9
    eiken_elementary    = 10
    eiken_middle        = 11
    eiken_high          = 12
    eiken_adult         = 13
    grammar_elementary  = 14
    grammar_middle      = 15
    grammar_high        = 16
    grammar_adult       = 17


    class_type_choices = [
        (unknown, '-------'),
        (baby, '英会話 ベビー'),
        (preschool_a, '英会話 未就学児 前半'),
        (preschool_b, '英会話 未就学児 後半'),
        (elementary, '英会話 小学生'),
        (middle, '英会話 中学生'),
        (high, '英会話 高校生'),
        (adult, '英会話 大人'),
        (eiken_elementary, '英検 小学生'),
        (eiken_middle, '英検 中学生'),
        (eiken_high, '英検 高校生'),
        (eiken_adult, '英検 大人'),
        (grammar_elementary, '英文法 小学生'),
        (grammar_middle, '英文法 中学生'),
        (grammar_high, '英文法 高校生'),
        (grammar_adult, '英文法 大人'),
        (private_40, '個人 40分'),
        (private_50, '個人 50分'),
    ]

    class_name          = models.CharField(max_length=512)
    primary_instructor  = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    irregular           = models.BooleanField(default=False)
    day_of_week         = models.IntegerField(choices=day_of_week_choices, default=7, null=True, blank=True)
    start_time          = models.TimeField(null=True, blank=True)
    students            = models.ManyToManyField(CustomerProfile, blank=True)
    archived            = models.BooleanField(default=False)
    class_type          = models.IntegerField(choices=class_type_choices, default=0, null=True, blank=True)

    def __str__(self):
        return str(self.id)

class ClassListChangelog(models.Model):
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
    changelog_class                 = models.IntegerField(default=0)
    changelog_date_time             = models.DateTimeField(auto_now_add=True)
    changelog_user                  = models.IntegerField(default=0)
    changelog_type                  = models.IntegerField(default=0, choices=changelog_type_choices)
    # mirrored class fields
    class_name                      = models.CharField(max_length=512)
    primary_instructor              = models.IntegerField(default=0, null=True, blank=True)
    irregular                       = models.BooleanField(default=False)
    day_of_week                     = models.IntegerField(default=7, null=True, blank=True)
    start_time                      = models.TimeField(null=True, blank=True)
    students                        = models.CharField(max_length=1024, null=True, blank=True)
    archived                        = models.BooleanField(default=False)
    class_type                      = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return str(self.class_name) + " - " + str(self.day_of_week) + " - " + str(self.start_time)