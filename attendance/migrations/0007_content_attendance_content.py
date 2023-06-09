# Generated by Django 4.1.3 on 2023-05-11 14:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('materials', '0002_materials_edition'),
        ('attendance', '0006_studentattendance_attendance_record'),
    ]

    operations = [
        migrations.CreateModel(
            name='Content',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content_start', models.IntegerField()),
                ('content_end', models.IntegerField()),
                ('content_materials', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='materials.materials')),
            ],
        ),
        migrations.AddField(
            model_name='attendance',
            name='content',
            field=models.ManyToManyField(to='attendance.content'),
        ),
    ]
