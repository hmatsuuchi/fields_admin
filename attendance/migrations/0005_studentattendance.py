# Generated by Django 3.2.3 on 2022-08-11 02:24

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0073_alter_notes_type'),
        ('attendance', '0004_alter_attendance_linked_class'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentAttendance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('attendance_status', models.IntegerField(choices=[(0, '未定'), (1, '出席'), (2, '欠席')], default=0)),
                ('student', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='customer.customerprofile')),
            ],
        ),
    ]