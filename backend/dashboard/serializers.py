from rest_framework import serializers
from books.models import Book
from orders.models import Order
from auctions.models import Auction, Bid

# --- Книги ---
class BookSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(read_only=True)
    condition_display = serializers.CharField(read_only=True)
    genre_display = serializers.CharField(read_only=True)

    class Meta:
        model = Book
        fields = "__all__"

# --- Заказы ---
class OrderSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(read_only=True)
    payment_display = serializers.CharField(read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = "__all__"

# --- Аукционы ---
class AuctionSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = Auction
        fields = "__all__"

# --- Ставки ---
class BidSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    auction_product = serializers.CharField(source='auction.product.title', read_only=True)

    class Meta:
        model = Bid
        fields = "__all__"