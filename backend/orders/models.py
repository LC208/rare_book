from django.db import models
from users.models import CustomUser
from books.models import Book


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "P", "Ожидает оплаты"
        ACCEPT = "A", "Оплачен"
        CANCELED = "C", "Отменён"

    class Payment(models.TextChoices):
        HANDS = "H", "При получении"
        CARD = "C", "Картой"

    id = models.BigAutoField(primary_key=True)
    date = models.DateField()
    status = models.CharField(
        max_length=1, choices=Status.choices, default=Status.PENDING
    )
    payment = models.CharField(max_length=1, choices=Payment.choices)
    amount = models.DecimalField(max_digits=8, decimal_places=2, verbose_name="Цена")
    user = models.ForeignKey(CustomUser, models.DO_NOTHING, related_name="buyer")
    book = models.ForeignKey(Book, models.DO_NOTHING, related_name="merchandise")
