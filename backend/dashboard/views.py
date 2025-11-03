from rest_framework import viewsets, permissions, filters
from books.models import Book, Author, Genre, Publisher, Donor
from orders.models import Order
from auctions.models import Auction, Bid
from users.models import CustomUser
from .serializers import (
    BookSerializer, OrderSerializer, AuctionSerializer, BidSerializer,
    CustomUserSerializer, GenreSerializer, AuthorSerializer,
    PublisherSerializer, DonorSerializer
)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.response import Response

class AdminPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff


# --- Книги и связанные модели ---
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


class DonorViewSet(viewsets.ModelViewSet):
    """
    CRUD для сдатчиков (Donor)
    """
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'email', 'phone']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'genres', 'condition', 'donor', 'quantity']
    search_fields = ['title', 'authors__name', 'isbn', 'donor__name']
    ordering_fields = ['price', 'year', 'title', 'quantity']


# --- Заказы ---
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related('items__book').all()
    serializer_class = OrderSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment', 'user']
    search_fields = ['items__book__title', 'user__email']
    ordering_fields = ['date', 'amount']
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        PATCH /api/admin/orders/<id>/update_status/
        {
          "status": "A"  # Оплата подтверждена
          "status": "C"  # Заказ отменён
        }
        """
        try:
            order = self.get_object()
            new_status = request.data.get("status")

            if new_status not in ["A", "C"]:
                return Response(
                    {"error": "Недопустимый статус. Используй 'A' или 'C'"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if new_status == "A":
                # подтверждение оплаты
                order.status = "A"
                order.save(update_fields=["status"])
                return Response({"message": f"Заказ {order.id} подтверждён"}, status=status.HTTP_200_OK)

            elif new_status == "C":
                # отмена заказа → возврат количества книг
                for item in order.items.all():
                    book = item.book
                    book.quantity += item.quantity
                    if book.status == 2:  # если продано
                        book.status = 1  # вернуть в продажу
                    book.save(update_fields=["quantity", "status"])

                order.status = "C"
                order.save(update_fields=["status"])
                return Response({"message": f"Заказ {order.id} отменён и книги возвращены"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- Аукционы ---
class AuctionViewSet(viewsets.ModelViewSet):
    queryset = Auction.objects.all()
    serializer_class = AuctionSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'start_time', 'end_time']
    search_fields = ['product__title']
    ordering_fields = ['starting_price', 'current_bid', 'start_time']


# --- Ставки ---
class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['auction', 'user']
    search_fields = ['auction__product__title', 'user__email']
    ordering_fields = ['amount', 'created_at']


# --- Пользователи ---
class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [AdminPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]

    filterset_fields = ['status', 'is_admin', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'email']
