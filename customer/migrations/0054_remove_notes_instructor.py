# Generated by Django 3.2.3 on 2021-12-11 23:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0053_notes_instructor_1'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='notes',
            name='instructor',
        ),
    ]
