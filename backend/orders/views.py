from rest_framework import generics, permissions
from orders.models import Order
from .serializers import OrderSerializer, OrderCreateSerializer


class OrderHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__book').order_by('-date')


class OrderCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer  # Для возврата созданного заказа

    def post(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        payment = data.get("payment")
        items = data.get("items", [])

        insufficient_books = []
        unavailable_books = []

        for item in items:
            try:
                book = Book.objects.get(id=item["id"])
            except Book.DoesNotExist:
                unavailable_books.append(item.get("id"))
                continue

            if book.status != 1:
                unavailable_books.append(book.title)

        if unavailable_books or insufficient_books:
            return Response(
                {"unavailable_books": unavailable_books, "insufficient_books": insufficient_books},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создаем заказ
        order = Order.objects.create(user=user, payment=payment, amount=0)

        total_amount = 0
        for item in items:
            book = Book.objects.get(id=item["id"])
            price = book.price
            OrderItem.objects.create(order=order, book=book, price=price)
            total_amount += price

        order.amount = total_amount
        order.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)