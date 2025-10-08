from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Book
from .serializers import BookSerializer

class BookListView(generics.ListAPIView):
    """
    Список книг с возможностью фильтрации по коду, автору, жанру, статусу, состоянию и названию.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    filterset_fields = [
        'id', 'authors', 'genres', 'status', 'condition', 'publisher'
    ]
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'year', 'title']
    ordering = ['title']
