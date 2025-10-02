from django.db import models
from books.models import Book  # Если аукционы привязаны к книгам
from django.utils import timezone


class Auction(models.Model):
    STATUS_CHOICES = (
        (1, "Запланирован"),
        (2, "Активен"),
        (3, "Завершён"),
        (4, "Отменён"),
    )

    id = models.BigAutoField(primary_key=True)
    product = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="auctions")
    starting_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Начальная цена")
    bid_step = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Шаг торгов")
    start_time = models.DateTimeField(verbose_name="Время начала аукциона")
    end_time = models.DateTimeField(verbose_name="Время окончания аукциона")
    status = models.PositiveSmallIntegerField(choices=STATUS_CHOICES, default=1)
    current_bid = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    class Meta:
        ordering = ["-start_time"]

    def __str__(self):
        return f"Аукцион {self.id} на {self.product.title}"

    @property
    def status_display(self):
        return dict(self.STATUS_CHOICES).get(self.status, "Неизвестно")

    def is_active(self):
        """Проверка, активен ли аукцион по времени и статусу"""
        now = timezone.now()
        return self.status == 2 and self.start_time <= now <= self.end_time
