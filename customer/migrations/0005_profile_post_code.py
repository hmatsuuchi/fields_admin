# Generated by Django 3.2.3 on 2021-05-19 14:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0004_auto_20210519_1453'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='post_code',
            field=models.CharField(blank=True, max_length=10),
        ),
    ]
