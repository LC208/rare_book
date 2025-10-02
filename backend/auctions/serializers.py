from rest_framework import serializers
from .models import Auction, Bid
from books.models import Book


class AuctionSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True)
    status_display = serializers.CharField(read_only=True)
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

class BidSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    auction_status = serializers.CharField(source='auction.status_display', read_only=True)
    product_title = serializers.CharField(source='auction.product.title', read_only=True)

    class Meta:
        model = Bid
        fields = ['id', 'user', 'user_email', 'auction', 'product_title', 'auction_status', 'amount', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate(self, data):
        auction = data['auction']
        amount = data['amount']

        if not auction.is_active():
            raise serializers.ValidationError("Аукцион не активен")

        min_bid = max(auction.starting_price, auction.current_bid + auction.bid_step)
        if amount < min_bid:
            raise serializers.ValidationError(f"Ставка должна быть не меньше {min_bid}")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        bid = Bid.objects.create(user=user, **validated_data)
        auction = bid.auction
        auction.current_bid = bid.amount
        auction.save(update_fields=['current_bid'])
        return bid