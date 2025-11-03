from celery import shared_task
from django.utils import timezone
from .models import Auction
from orders.models import Order, OrderItem

@shared_task
def update_auction_status():
    now = timezone.now()

    # 1. Запланированные аукционы -> активные
    Auction.objects.filter(status=1, start_time__lte=now).update(status=2)

    # 2. Активные аукционы -> завершённые
    auctions_to_close = Auction.objects.filter(status=2, end_time__lte=now)
    
    for auction in auctions_to_close:
        auction.status = 3  # Завершён
        auction.save(update_fields=['status'])

        # 3. Создаём заказ только если есть ставки
        winning_bid = auction.bids.order_by('-amount', 'created_at').first()
        if winning_bid:
            user = winning_bid.user
            book = auction.product
            qty = 1  # обычно аукцион на 1 книгу

            # Создаём заказ
            order = Order.objects.create(
                user=user,
                payment=Order.Payment.HANDS,  # можно менять по логике
                status=Order.Status.PENDING,
                amount=winning_bid.amount
            )

            # Создаём элемент заказа
            OrderItem.objects.create(
                order=order,
                book=book,
                price=winning_bid.amount,
                quantity=qty
            )

            # Уменьшаем количество книг
            book.quantity -= qty
            if book.quantity <= 0:
                book.quantity = 0
                book.status = 2  # Продано
            book.save(update_fields=['quantity', 'status'])