# Generated by Django 3.2.3 on 2023-02-07 01:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analytics', '0005_lessonsperstudent'),
    ]

    operations = [
        migrations.AddField(
            model_name='lessonsperstudent',
            name='last_modified',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='studentdemographics',
            name='last_modified',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='studentlifetime',
            name='last_modified',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
