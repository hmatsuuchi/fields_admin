# Generated by Django 3.2.3 on 2021-05-20 14:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0011_alter_profile_grade'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='birthday',
            field=models.DateField(blank=True),
        ),
        migrations.AlterField(
            model_name='profile',
            name='grade',
            field=models.IntegerField(choices=[(0, '-------'), (1, 'Preschool 0'), (2, 'Preschool 1'), (3, 'Preschool 2'), (4, 'Preschool 3'), (5, 'Kindergarten 1'), (6, 'Kindergarten 2'), (7, 'Kindergarten 3'), (8, 'Elementary 1'), (9, 'Elementary 2'), (10, 'Elementary 3'), (11, 'Elementary 4'), (12, 'Elementary 5'), (13, 'Elementary 6'), (14, 'Middle 1'), (15, 'Middle 2'), (16, 'Middle 3'), (17, 'High 1'), (17, 'High 2'), (17, 'High 3'), (20, 'Adult')], default=0),
        ),
        migrations.AlterField(
            model_name='profile',
            name='phone_1_type',
            field=models.IntegerField(choices=[(0, '-------'), (1, '自身'), (2, '母'), (3, '父'), (4, '祖母'), (5, '祖父'), (6, '叔父'), (7, '叔母')], default=0),
        ),
        migrations.AlterField(
            model_name='profile',
            name='phone_2_type',
            field=models.IntegerField(choices=[(0, '-------'), (1, '自身'), (2, '母'), (3, '父'), (4, '祖母'), (5, '祖父'), (6, '叔父'), (7, '叔母')], default=0),
        ),
    ]
