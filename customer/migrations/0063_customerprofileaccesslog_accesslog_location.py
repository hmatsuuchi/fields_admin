# Generated by Django 3.2.3 on 2022-03-07 14:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0062_customerprofileaccesslog'),
    ]

    operations = [
        migrations.AddField(
            model_name='customerprofileaccesslog',
            name='accesslog_location',
            field=models.CharField(default='', max_length=64),
            preserve_default=False,
        ),
    ]
