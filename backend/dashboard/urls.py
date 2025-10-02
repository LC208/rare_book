from rest_framework.routers import DefaultRouter
from .views import BookViewSet, OrderViewSet, AuctionViewSet, BidViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'auctions', AuctionViewSet)
router.register(r'bids', BidViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
