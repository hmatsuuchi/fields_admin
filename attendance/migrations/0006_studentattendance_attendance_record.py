# Generated by Django 3.2.3 on 2022-08-11 02:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('attendance', '0005_studentattendance'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentattendance',
            name='attendance_record',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='attendance.attendance'),
        ),
    ]