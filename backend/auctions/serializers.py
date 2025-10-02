from rest_framework import serializers
from .models import Auction
from books.models import Book


class AuctionSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    status_display = serializers.CharField(source='status_display', read_only=True)
    is_active_now = serializers.SerializerMethodField()

    class Meta:
        model = Auction
        fields = [
            "id",
            "product",
            "product_title",
            "starting_price",
            "bid_step",
            "start_time",
            "end_time",
            "status",
            "status_display",
            "current_bid",
            "is_active_now",
        ]

    def get_is_active_now(self, obj):
        return obj.is_active()
