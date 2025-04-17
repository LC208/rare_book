from rest_framework import serializers
from orders.models import Order


class OrderListSerializer(serializers.ListSerializer):
    class Meta:
        model = Order
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"
