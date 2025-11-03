from rest_framework.routers import DefaultRouter
from .views import BookViewSet, DonorViewSet,OrderViewSet, AuctionViewSet, BidViewSet, CustomUserViewSet, AuthorViewSet, GenreViewSet, PublisherViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'genres', GenreViewSet)
router.register(r'publishers', PublisherViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'auctions', AuctionViewSet)
router.register(r'bids', BidViewSet)
router.register(r'users', CustomUserViewSet)
router.register(r'donors', DonorViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
