from django.urls import path
from .views import OrderItemReportView, OrderHistoryView, OrderCreateView

urlpatterns = [
    path("history/", OrderHistoryView.as_view(), name="history"),
    path("create/", OrderCreateView.as_view(), name="order-create"),
    path("report/items/", OrderItemReportView.as_view(), name="orderitem-report"),  # <-- новый эндпоинт
]