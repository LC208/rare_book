from rest_framework import viewsets, permissions, filters
from books.models import Book, Author, Genre, Publisher
from orders.models import Order
from auctions.models import Auction, Bid
from users.models import CustomUser
from .serializers import BookSerializer, OrderSerializer, AuctionSerializer, BidSerializer, CustomUserSerializer, GenreSerializer, AuthorSerializer, PublisherSerializer
from django_filters.rest_framework import DjangoFilterBackend

class AdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff



class AuthorViewSet(viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [AdminPermission]

class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [AdminPermission]

class PublisherViewSet(viewsets.ModelViewSet):
    queryset = Publisher.objects.all()
    serializer_class = PublisherSerializer
    permission_classes = [AdminPermission]

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'genres', 'condition']
    search_fields = ['title', 'authors', 'isbn']
    ordering_fields = ['price', 'year', 'title']



class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related('items__book').all()  # Чтобы подгружались товары
    serializer_class = OrderSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment', 'user']
    search_fields = ['book__title', 'user__email']
    ordering_fields = ['date', 'amount']


class AuctionViewSet(viewsets.ModelViewSet):
    queryset = Auction.objects.all()
    serializer_class = AuctionSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'start_time', 'end_time']
    search_fields = ['product__title']
    ordering_fields = ['starting_price', 'current_bid', 'start_time']


class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['auction', 'user']
    search_fields = ['auction__product__title', 'user__email']
    ordering_fields = ['amount', 'created_at']

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Фильтры по статусу и админским правам
    filterset_fields = ['status', 'is_admin', 'is_staff']
    
    # Поиск по email, имени и фамилии
    search_fields = ['email', 'first_name', 'last_name']
    
    # Сортировка по дате создания и email
    ordering_fields = ['created_at', 'email']