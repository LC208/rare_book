# Generated by Django 5.0.2 on 2025-04-17 05:03

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255, verbose_name='Название')),
                ('author', models.CharField(max_length=255, verbose_name='Автор')),
                ('description', models.CharField(max_length=255, verbose_name='Описание')),
                ('price', models.DecimalField(decimal_places=2, max_digits=8, verbose_name='Цена')),
                ('published_date', models.DateField(blank=True, null=True, verbose_name='Дата публикции')),
                ('isbn', models.CharField(max_length=13, unique=True, verbose_name='ISBN')),
                ('condition', models.CharField(choices=[('N', 'Новая'), ('G', 'Хорошее'), ('A', 'Удовлетворительное'), ('P', 'Плохое')], max_length=1, verbose_name='Состояние книги')),
                ('is_rare', models.BooleanField(default=False, verbose_name='Редкая книга')),
                ('signed', models.BooleanField(default=False, verbose_name='Подпись автора')),
                ('sign_desc', models.CharField(max_length=255, verbose_name='Описание подписи')),
                ('created_at', models.DateField(auto_now_add=True)),
                ('updated_at', models.DateField(auto_now=True)),
            ],
        ),
    ]
