from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'authors', 'year', 'publisher',
            'condition', 'condition_display', 'description', 'price', 'photo',
            'status', 'status_display', 'genres',
            'created_at', 'updated_at', 'authors_list', 'genres_list'
        ]
