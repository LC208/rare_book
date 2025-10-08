# books/models.py
from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=100, verbose_name="Имя автора")

    def __str__(self):
        return self.name

class Genre(models.Model):
    name = models.CharField(max_length=50, verbose_name="Жанр")

    def __str__(self):
        return self.name

class Publisher(models.Model):
    name = models.CharField(max_length=50, verbose_name="Издательство")

    def __str__(self):
        return self.name

class Book(models.Model):
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
    
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=50, verbose_name="Название книги")
    authors = models.ManyToManyField(Author, related_name="books", verbose_name="Авторы")
    year = models.PositiveIntegerField(verbose_name="Год издания")
    publisher = models.ForeignKey(Publisher, on_delete=models.PROTECT, verbose_name="Издательство")
    condition = models.PositiveSmallIntegerField(choices=CONDITION_CHOICES, verbose_name="Состояние")
    description = models.CharField(max_length=250, verbose_name="Описание")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена")
    photo = models.ImageField(upload_to="books_photos", null=True, blank=True, verbose_name="Фото книги")
    status = models.PositiveSmallIntegerField(choices=STATUS_CHOICES, verbose_name="Статус книги")
    genres = models.ManyToManyField(Genre, related_name="books", verbose_name="Жанры")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def get_condition_display(self):
        return dict(self.CONDITION_CHOICES).get(self.condition)

    def get_status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status)
    
    @property
    def authors_list(self):
        """Возвращает список имён авторов"""
        return ", ".join([author.name for author in self.authors.all()])
    
    @property
    def genres_list(self):
        """Возвращает список жанров"""
        return ", ".join([genre.name for genre in self.genres.all()])