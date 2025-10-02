from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(read_only=True)

    class Meta:
        model = CustomUser
        exclude = ["password"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = CustomUser
        fields = ["email", "first_name", "last_name", "password"]

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email уже используется")
        return value

    def validate_password(self, value):
        if ' ' in value:
            raise serializers.ValidationError("Пароль не должен содержать пробелов")
        return value

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError("Неверный email или пароль")
        if user.status == 2:
            raise serializers.ValidationError("Аккаунт заблокирован")
        if not user.is_active:
            raise serializers.ValidationError("Пользователь неактивен")
        return user