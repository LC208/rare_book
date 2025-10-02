from rest_framework import viewsets, permissions, filters
from books.models import Book
from orders.models import Order
from auctions.models import Auction, Bid
from .serializers import BookSerializer, OrderSerializer, AuctionSerializer, BidSerializer
from django_filters.rest_framework import DjangoFilterBackend

class AdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'genre', 'condition']
    search_fields = ['title', 'author', 'isbn']
    ordering_fields = ['price', 'published_date']


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
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