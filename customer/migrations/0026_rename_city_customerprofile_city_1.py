# Generated by Django 3.2.3 on 2021-06-13 05:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0025_auto_20210613_1418'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customerprofile',
            old_name='city',
            new_name='city_1',
        ),
    ]