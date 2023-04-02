# Generated by Django 3.2.3 on 2022-03-06 12:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0059_auto_20220306_2038'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='address_1',
            field=models.CharField(blank=True, max_length=35),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='address_2',
            field=models.CharField(blank=True, max_length=35),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='archived',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='birthday',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='changelog_customer_profile',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='city',
            field=models.CharField(blank=True, max_length=35),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='first_name_kanji',
            field=models.CharField(max_length=35),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='first_name_katakana',
            field=models.CharField(max_length=35),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='first_name_romaji',
            field=models.CharField(max_length=35),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='grade',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='last_name_kanji',
            field=models.CharField(max_length=35),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='last_name_katakana',
            field=models.CharField(max_length=35),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='last_name_romaji',
            field=models.CharField(max_length=35),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='payment_method',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='phone_1',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='phone_1_type',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='phone_2',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='phone_2_type',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='post_code',
            field=models.CharField(blank=True, max_length=10),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='prefecture',
            field=models.IntegerField(default=1),
        ),
        migrations.AlterField(
            model_name='customerprofilechangelog',
            name='status',
            field=models.IntegerField(default=0),
        ),
    ]
