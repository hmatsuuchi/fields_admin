# Generated by Django 3.2.3 on 2021-05-21 02:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0012_auto_20210520_1455'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='status',
            field=models.IntegerField(choices=[(1, '在学'), (2, '休校'), (3, '退校')], default=1),
        ),
        migrations.AlterField(
            model_name='profile',
            name='grade',
            field=models.IntegerField(choices=[(0, '-------'), (1, '未就学児 0才'), (2, '未就学児 1才'), (3, '未就学児 2才'), (4, '未就学児 3才'), (5, '年小'), (6, '年中'), (7, '年長'), (8, '小1'), (9, '小2'), (10, '小3'), (11, '小4'), (12, '小5'), (13, '小6'), (14, '中1'), (15, '中2'), (16, '中3'), (17, '高1'), (17, '高2'), (17, '高3'), (20, '大人')], default=0),
        ),
        migrations.AlterField(
            model_name='profile',
            name='payment_method',
            field=models.IntegerField(choices=[(1, '月謝袋'), (2, '引き落とし')], default=1),
        ),
    ]