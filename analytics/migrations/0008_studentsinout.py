# Generated by Django 4.1.3 on 2023-05-01 12:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0073_alter_notes_type'),
        ('analytics', '0007_lessonsperstudent_multi_lesson_student_count'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentsInOut',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_modified', models.DateTimeField(auto_now=True)),
                ('year', models.IntegerField()),
                ('month', models.IntegerField()),
                ('students_in', models.ManyToManyField(to='customer.customerprofile')),
            ],
        ),
    ]
