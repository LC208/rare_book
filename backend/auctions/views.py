from rest_framework import generics, permissions
from .models import Auction
from .serializers import AuctionSerializer


class AuctionListView(generics.ListAPIView):
    """
    Список всех аукционов
    """
    queryset = Auction.objects.all().prefetch_related('product')
    serializer_class = AuctionSerializer
    permission_classes = [permissions.AllowAny]


class AuctionDetailView(generics.RetrieveAPIView):
    """
    Подробная информация по аукциону
    """
    queryset = Auction.objects.all().prefetch_related('product')
    serializer_class = AuctionSerializer
    permission_classes = [permissions.AllowAny]
