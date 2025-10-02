from rest_framework import serializers
from orders.models import Order, OrderItem
from books.models import Book


class OrderItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'book_title', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_display = serializers.CharField(source='get_payment_display', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'date', 'status', 'status_display', 'payment', 'payment_display', 'amount', 'items']