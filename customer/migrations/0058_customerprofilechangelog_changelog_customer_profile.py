# Generated by Django 3.2.3 on 2022-03-06 11:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0057_auto_20220306_1226'),
    ]

    operations = [
        migrations.AddField(
            model_name='customerprofilechangelog',
            name='changelog_customer_profile',
            field=models.ForeignKey(default=3, on_delete=django.db.models.deletion.CASCADE, to='customer.customerprofile'),
            preserve_default=False,
        ),
    ]
