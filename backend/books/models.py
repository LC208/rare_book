from django.db import models


class Book(models.Model):
    class Condition(models.TextChoices):
        NEW = "N", "Новая"
        GOOD = "G", "Хорошее"
        ACCEPTABLE = "A", "Удовлетворительное"
        POOR = "P", "Плохое"

    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255, verbose_name="Название")
    author = models.CharField(max_length=255, verbose_name="Автор")
    description = models.CharField(max_length=255, verbose_name="Описание")
    price = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="Цена")
    published_date = models.DateField(
        null=True, blank=True, verbose_name="Дата публикции"
    )
    isbn = models.CharField(max_length=13, unique=True, verbose_name="ISBN")
    cover_image = models.ImageField(
        upload_to="books_cover", null=True, blank=True, verbose_name="Обложка"
    )
    condition = models.CharField(
        max_length=1, choices=Condition.choices, verbose_name="Состояние книги"
    )
    is_rare = models.BooleanField(default=False, verbose_name="Редкая книга")
    signed = models.BooleanField(default=False, verbose_name="Подпись автора")
    sign_desc = models.CharField(max_length=255, verbose_name="Описание подписи")
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    def get_condition_display(self):
        return dict(self.Condition.choices).get(self.condition)
