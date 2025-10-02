from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    genre_display = serializers.CharField(source='get_genre_display', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    author_display = serializers.CharField(source='get_author_display', read_only=True)
    publisher_display = serializers.CharField(source='get_publisher_display', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'author_display', 'year', 'publisher', 'publisher_display',
            'condition', 'condition_display', 'description', 'price', 'photo',
            'status', 'status_display', 'genre', 'genre_display', 'type', 'type_display',
            'created_at', 'updated_at'
        ]
