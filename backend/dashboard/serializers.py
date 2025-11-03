from rest_framework import serializers
from books.models import Book, Author, Genre, Publisher, Donor
from orders.models import Order, OrderItem
from auctions.models import Auction, Bid
from users.models import CustomUser

# --- Книги ---
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = "__all__"


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = "__all__"


class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publisher
        fields = "__all__"


# --- Сдатчики ---
class DonorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donor
        fields = "__all__"


class BookSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)
    publisher = PublisherSerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    donor = DonorSerializer(read_only=True)

    authors_ids = serializers.PrimaryKeyRelatedField(
        queryset=Author.objects.all(), many=True, write_only=True, source='authors'
    )
    genres_ids = serializers.PrimaryKeyRelatedField(
        queryset=Genre.objects.all(), many=True, write_only=True, source='genres'
    )
    publisher_id = serializers.PrimaryKeyRelatedField(
        queryset=Publisher.objects.all(), write_only=True, source='publisher'
    )
    donor_id = serializers.PrimaryKeyRelatedField(
        queryset=Donor.objects.all(), write_only=True, source='donor', required=False, allow_null=True
    )
    quantity = serializers.IntegerField(required=True, min_value=0)
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Book
        fields = "__all__"

    def validate(self, attrs):
        new_status = attrs.get('status', getattr(self.instance, 'status', None))
        quantity = attrs.get('quantity', getattr(self.instance, 'quantity', 0))

        if new_status == 2 and quantity > 0:  # 2 = "Продано"
            raise serializers.ValidationError(
                "Нельзя установить статус 'Продано', пока есть доступные экземпляры книги (quantity > 0)."
            )
        return attrs


# --- Заказы ---
class OrderItemSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'book', 'book_title', 'price']


class OrderSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_display = serializers.CharField(source='get_payment_display', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

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


# --- Пользователи ---
class CustomUserSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = "__all__"
    
    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
