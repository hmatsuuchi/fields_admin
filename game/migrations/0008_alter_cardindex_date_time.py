# Generated by Django 3.2.3 on 2022-12-01 00:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0007_cardindex_date_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cardindex',
            name='date_time',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
