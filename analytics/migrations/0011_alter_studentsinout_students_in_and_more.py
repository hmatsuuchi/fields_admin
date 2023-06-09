# Generated by Django 4.1.3 on 2023-05-01 13:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0073_alter_notes_type'),
        ('analytics', '0010_alter_studentsinout_students_in_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studentsinout',
            name='students_in',
            field=models.ManyToManyField(null=True, related_name='CustomerProfileIn', to='customer.customerprofile'),
        ),
        migrations.AlterField(
            model_name='studentsinout',
            name='students_out',
            field=models.ManyToManyField(null=True, related_name='CustomerProfileOut', to='customer.customerprofile'),
        ),
    ]
