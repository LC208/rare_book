from django.db import models


class Book(models.Model):
    # Классификаторы
    CONDITION_CHOICES = (
        (1, "Отличное"),
        (2, "Хорошее"),
        (3, "Удовлетворительное"),
    )

    STATUS_CHOICES = (
        (1, "К продаже"),
        (2, "Продано"),
        (3, "На аукционе"),
        (4, "Заблокировано"),
    )

    GENRE_CHOICES = (
        (1, "Мемуары"),
        (2, "История"),
        (3, "Фантастика"),
        # добавьте остальные жанры
    )

    TYPE_CHOICES = (
        (1, "Художественная"),
        (2, "Учебная"),
        (3, "Техническая"),
        # и т.д.
    )

    PUBLISHER_CHOICES = (
        (1, "Издательство А"),
        (2, "Издательство Б"),
        # и т.д.
    )

    AUTHOR_CHOICES = (
        (1, "Ф.М. Достоевский"),
        (2, "Г.Ф. Лавкрафт"),
        (3, "А.С. Пушкин"),
        # и т.д.
    )

    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=50, verbose_name="Название книги")
    author = models.PositiveSmallIntegerField(choices=AUTHOR_CHOICES, verbose_name="Автор")
    year = models.PositiveIntegerField(verbose_name="Год издания")
    publisher = models.PositiveSmallIntegerField(choices=PUBLISHER_CHOICES, verbose_name="Издательство")
    condition = models.PositiveSmallIntegerField(choices=CONDITION_CHOICES, verbose_name="Состояние")
    description = models.CharField(max_length=250, verbose_name="Описание")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    photo = models.ImageField(upload_to="books_photos", null=True, blank=True, verbose_name="Фото книги")
    status = models.PositiveSmallIntegerField(choices=STATUS_CHOICES, verbose_name="Статус книги")
    genre = models.PositiveSmallIntegerField(choices=GENRE_CHOICES, verbose_name="Жанр")
    type = models.PositiveSmallIntegerField(choices=TYPE_CHOICES, verbose_name="Вид книги")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def get_condition_display(self):
        return dict(self.CONDITION_CHOICES).get(self.condition)

    def get_status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status)

    def get_genre_display(self):
        return dict(self.GENRE_CHOICES).get(self.genre)

    def get_type_display(self):
        return dict(self.TYPE_CHOICES).get(self.type)

    def get_author_display(self):
        return dict(self.AUTHOR_CHOICES).get(self.author)

    def get_publisher_display(self):
        return dict(self.PUBLISHER_CHOICES).get(self.publisher)
