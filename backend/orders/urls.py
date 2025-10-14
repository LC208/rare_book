from django.urls import path
from .views import OrderHistoryView, OrderCreateView

urlpatterns = [
    path("history/", OrderHistoryView.as_view(), name="history"),
    path("create/", OrderCreateView.as_view(), name="order-create"),
]
