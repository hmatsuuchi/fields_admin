# Generated by Django 3.2.3 on 2022-02-03 01:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_profile', '0011_userprofile_display_archived_notes'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='display_only_flagged_profiles',
            field=models.BooleanField(default=False),
        ),
    ]
