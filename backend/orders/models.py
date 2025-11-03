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
    date = models.DateField(auto_now_add=True)
    status = models.CharField(
        max_length=1, choices=Status.choices, default=Status.PENDING
    )
    payment = models.CharField(max_length=1, choices=Payment.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Сумма", default=0)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="orders"
    )

    def __str__(self):
        return f"Заказ {self.id} от {self.user} ({self.get_status_display()})"

    def calculate_amount(self):
        total = sum(item.price * item.quantity for item in self.items.all())
        self.amount = total
        self.save()


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="items"
    )
    book = models.ForeignKey(
        Book, on_delete=models.CASCADE, related_name="order_items"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)  # ✅ новое поле

    def __str__(self):
        return f"{self.book.title} x{self.quantity}"

    def save(self, *args, **kwargs):
        # Автоматически можно рассчитывать цену за все экземпляры
        if not self.price:
            self.price = self.book.price
        super().save(*args, **kwargs)