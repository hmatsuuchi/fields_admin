# Generated by Django 3.2.3 on 2022-09-14 00:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_profile', '0020_userprofile_attendance_expanded_view_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='display_attendance_instructors',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]