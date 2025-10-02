from rest_framework import generics, permissions
from orders.models import Order
from .serializers import OrderSerializer


class OrderHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__book').order_by('-date')
