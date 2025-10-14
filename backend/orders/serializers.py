from rest_framework import serializers
from orders.models import Order, OrderItem
from books.models import Book


class OrderItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'book_title', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_display = serializers.CharField(source='get_payment_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'date', 'status', 'status_display',
            'payment', 'payment_display', 'amount', 'items'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """Создание заказа с проверкой наличия нужного количества экземпляров"""
    items = serializers.ListField(write_only=True)

    class Meta:
        model = Order
        fields = ['payment', 'items']

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Корзина пуста.")

        unavailable_books = []
        insufficient_books = []
        valid_books = []

        for item in items:
            book_id = item.get('id')

            if not book_id:
                continue

            try:
                book = Book.objects.get(pk=book_id)
            except Book.DoesNotExist:
                unavailable_books.append(f"id={book_id} (не существует)")
                continue

            # Проверка доступности для продажи
            if book.status != 1:  # 1 = "К продаже"
                unavailable_books.append(f"{book.title} ({book.get_status_display()})")
                continue


            valid_books.append((book))

        if unavailable_books or insufficient_books:
            raise serializers.ValidationError({
                "unavailable_books": unavailable_books,
                "insufficient_books": insufficient_books,
                "detail": "Некоторые книги недоступны в нужном количестве."
            })

        return valid_books

    def create(self, validated_data):
        user = self.context['request'].user
        book_items = validated_data.pop('items')
        payment = validated_data.get('payment', 'H')

        order = Order.objects.create(
            user=user,
            payment=payment,
            status=Order.Status.PENDING,
            amount=0
        )

        total = 0
        for book in book_items:
            price = book.price
            total += price

            OrderItem.objects.create(
                order=order,
                book=book,
                price=book.price,
            )

            book.status = 2
            book.save(update_fields=["status"])

        order.amount = total
        order.save()
        return order