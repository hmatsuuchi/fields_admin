# Generated by Django 3.2.3 on 2022-11-26 12:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('customer', '0073_alter_notes_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExperiencePoints',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_date_time', models.DateTimeField(auto_now_add=True)),
                ('transaction_amount', models.IntegerField()),
                ('transaction_description', models.TextField()),
                ('linked_student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='customer.customerprofile')),
            ],
        ),
    ]
