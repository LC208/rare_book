from django.urls import path
from .views import AuctionListView, AuctionDetailView, BidCreateView, UserBidListView, AuctionBidListView

urlpatterns = [
    path('history/', AuctionListView.as_view(), name='list'),
    path('<int:pk>/', AuctionDetailView.as_view(), name='detail'),
    path('bids/', BidCreateView.as_view(), name='bid-create'),
    path('bids/history/', UserBidListView.as_view(), name='bid-history'),
    path('<int:auction_id>/bids/', AuctionBidListView.as_view(), name='auction-bids'), 
]