# Generated by Django 3.2.3 on 2022-03-17 15:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0067_noteschangelog_instructor_2'),
    ]

    operations = [
        migrations.AlterField(
            model_name='noteschangelog',
            name='customer_id',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='noteschangelog',
            name='instructor_1',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='noteschangelog',
            name='instructor_2',
            field=models.IntegerField(default=0),
        ),
    ]
