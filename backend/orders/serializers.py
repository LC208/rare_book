from rest_framework import serializers
from orders.models import Order, OrderItem
from books.models import Book
from books.serializers import PublisherSerializer


class BookNestedSerializer(serializers.ModelSerializer):
    authors_list = serializers.CharField(read_only=True)
    genres_list = serializers.CharField(read_only=True)
    publisher = PublisherSerializer(read_only=True)
    condition_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    quantity = serializers.IntegerField(read_only=True)  # ✅ отображаем количество

    class Meta:
        model = Book
        fields = ['id', 'title', 'authors_list', 'genres_list', 'publisher',
                  'condition_display', 'status_display', 'quantity']

    def get_condition_display(self, obj):
        return obj.get_condition_display()

    def get_status_display(self, obj):
        return obj.get_status_display()


class OrderItemReportSerializer(serializers.ModelSerializer):
    # Включаем данные заказа и книги
    book = BookNestedSerializer(read_only=True)
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    order_date = serializers.DateField(source='order.date', read_only=True)
    user = serializers.SerializerMethodField()
    payment_display = serializers.SerializerMethodField()
    order_status = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'order_id',
            'order_date',
            'user',
            'payment_display',
            'order_status',
            'book',
            'price'
        ]

    def get_user(self, obj):
        user = obj.order.user
        return {
            "id": getattr(user, "id", None),
            "username": getattr(user, "username", str(user))
        }

    def get_payment_display(self, obj):
        return obj.order.get_payment_display()

    def get_order_status(self, obj):
        return obj.order.get_status_display()


class OrderItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_quantity = serializers.IntegerField(source='book.quantity', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'book_title', 'book_quantity', 'price', 'quantity']


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
    """
    Создание заказа с учётом quantity каждой книги
    """
    items = serializers.ListField(write_only=True)

    class Meta:
        model = Order
        fields = ['payment', 'items']

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Корзина пуста.")

        unavailable_books = []

        for item in items:
            book_id = item.get('id')
            quantity_requested = int(item.get('quantity', 1))

            try:
                book = Book.objects.get(pk=book_id)
            except Book.DoesNotExist:
                unavailable_books.append(f"id={book_id} (не существует)")
                continue

            if book.quantity < quantity_requested or book.status != 1:
                unavailable_books.append(f"{book.title} (доступно {book.quantity})")

        if unavailable_books:
            raise serializers.ValidationError({"unavailable_books": unavailable_books})

        return items

    def create(self, validated_data):
        user = self.context['request'].user
        items_data = validated_data.pop('items')
        payment = validated_data.get('payment', 'H')

        order = Order.objects.create(user=user, payment=payment, status=Order.Status.PENDING, amount=0)
        total_amount = 0

        for item in items_data:
            book = Book.objects.get(id=item['id'])
            qty = int(item.get('quantity', 1))

            # Создаём OrderItem
            OrderItem.objects.create(order=order, book=book, price=book.price, quantity=qty)
            total_amount += book.price * qty

            # Уменьшаем количество книг
            book.quantity -= qty
            if book.quantity <= 0:
                book.quantity = 0
                book.status = 2  # Продано
            book.save(update_fields=['quantity', 'status'])

        order.amount = total_amount
        order.save()
        return order