# Generated by Django 3.2.3 on 2021-12-10 13:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user_profile', '0009_remove_userprofile_notes'),
    ]

    operations = [
        migrations.RenameField(
            model_name='userprofile',
            old_name='display_archived',
            new_name='display_archived_profiles',
        ),
    ]
