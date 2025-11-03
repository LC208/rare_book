from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Book, Author, Genre, Publisher, Donor
from .serializers import (
    BookSerializer, PublisherSerializer, AuthorSerializer,
    GenreSerializer, DonorSerializer
)
from django_filters.rest_framework import FilterSet, NumberFilter
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12  # стандартное количество записей
    page_size_query_param = 'page_size'  # 👈 позволяет клиенту задавать своё
    max_page_size = 100

class BookFilter(FilterSet):
    min_price = NumberFilter(field_name="price", lookup_expr="gte")
    max_price = NumberFilter(field_name="price", lookup_expr="lte")
    min_quantity = NumberFilter(field_name="quantity", lookup_expr="gte")
    max_quantity = NumberFilter(field_name="quantity", lookup_expr="lte")

    class Meta:
        model = Book
        fields = [
            'id', 'authors', 'genres', 'status', 'condition', 'publisher',
            'min_price', 'max_price', 'min_quantity', 'max_quantity'
        ]

class AuthorListView(generics.ListAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [permissions.AllowAny]


class GenreListView(generics.ListAPIView):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [permissions.AllowAny]


class PublisherListView(generics.ListAPIView):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer
    permission_classes = [permissions.AllowAny]


class DonorListCreateView(generics.ListAPIView):
    """
    Список и создание сдатчиков.
    """
    queryset = Donor.objects.all().order_by('name')
    serializer_class = DonorSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class DonorDetailView(generics.RetrieveAPIView):
    """
    Получение, обновление и удаление сдатчика.
    """
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [permissions.AllowAny]


class BookListView(generics.ListAPIView):
    """
    Список книг с возможностью фильтрации по коду, автору, жанру, статусу, состоянию, названию и количеству.
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = BookFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'year', 'title', 'quantity']
    ordering = ['title']
    pagination_class = StandardResultsSetPagination
