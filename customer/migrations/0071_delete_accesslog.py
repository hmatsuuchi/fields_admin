# Generated by Django 3.2.3 on 2022-03-18 05:56

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0070_auto_20220318_0016'),
    ]

    operations = [
        migrations.DeleteModel(
            name='AccessLog',
        ),
    ]
