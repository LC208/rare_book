from django.urls import path
from .views import AuctionListView, AuctionDetailView

urlpatterns = [
    path('', AuctionListView.as_view(), name='list'),
    path('<int:pk>/', AuctionDetailView.as_view(), name='detail'),
]