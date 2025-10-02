from rest_framework import generics, permissions
from .models import Auction, Bid
from .serializers import AuctionSerializer, BidSerializer


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


class BidCreateView(generics.CreateAPIView):
    """
    Сделать ставку на аукцион
    """
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class UserBidListView(generics.ListAPIView):
    """
    История ставок пользователя
    """
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bid.objects.filter(user=self.request.user).select_related('auction', 'auction__product')


class AuctionBidListView(generics.ListAPIView):
    """
    Список ставок для конкретного аукциона
    """
    serializer_class = BidSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        auction_id = self.kwargs['auction_id']
        return Bid.objects.filter(auction_id=auction_id).select_related('user').order_by('-amount', 'created_at')