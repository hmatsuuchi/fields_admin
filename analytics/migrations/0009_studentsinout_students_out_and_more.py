# Generated by Django 4.1.3 on 2023-05-01 12:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0073_alter_notes_type'),
        ('analytics', '0008_studentsinout'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentsinout',
            name='students_out',
            field=models.ManyToManyField(blank=True, null=True, related_name='CustomerProfileOut', to='customer.customerprofile'),
        ),
        migrations.AlterField(
            model_name='studentsinout',
            name='students_in',
            field=models.ManyToManyField(blank=True, null=True, related_name='CustomerProfileIn', to='customer.customerprofile'),
        ),
    ]
