# Generated by Django 3.2.3 on 2021-08-26 14:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('customer', '0044_alter_notes_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notes',
            name='type',
            field=models.IntegerField(choices=[(0, '-------'), (1, 'カウンセリング'), (2, '体験レッスン'), (3, '入学'), (4, 'カウンセリング・体験レッスン'), (5, 'レッスン開始'), (6, '休校'), (7, 'メモ'), (8, '振替'), (9, '欠席'), (10, '予定変更'), (11, 'レッスン再開')], default=0),
        ),
    ]
