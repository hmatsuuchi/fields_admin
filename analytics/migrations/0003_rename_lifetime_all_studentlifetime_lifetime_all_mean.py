# Generated by Django 3.2.3 on 2022-12-31 07:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('analytics', '0002_studentlifetime_lifetime_all_med'),
    ]

    operations = [
        migrations.RenameField(
            model_name='studentlifetime',
            old_name='lifetime_all',
            new_name='lifetime_all_mean',
        ),
    ]