# Generated by Django 3.2.3 on 2022-11-30 13:59

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0073_alter_notes_type'),
        ('game', '0005_alter_cardindex_linked_student'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cardindex',
            name='linked_student',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='customer.customerprofile'),
        ),
    ]
