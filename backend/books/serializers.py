from rest_framework import serializers
from .models import Book, Author, Genre, Publisher, Donor


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


class DonorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donor
        fields = "__all__"


class BookSerializer(serializers.ModelSerializer):
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    publisher = PublisherSerializer(read_only=True)
    donor = DonorSerializer(read_only=True)
    donor_id = serializers.PrimaryKeyRelatedField(
        source='donor',
        queryset=Donor.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'authors', 'year', 'publisher',
            'condition', 'condition_display', 'description', 'price', 'photo',
            'status', 'status_display', 'genres', 'donor', 'donor_id',
            'quantity',  # ✅ добавлено поле quantity
            'created_at', 'updated_at', 'authors_list', 'genres_list'
        ]