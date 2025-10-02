from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from books.models import Book
from orders.models import Order
from auctions.models import Auction, Bid


# -------------------------
# Пользователи
# -------------------------
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'status')
    list_filter = ('is_staff', 'is_active', 'status')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Личные данные', {'fields': ('first_name', 'last_name', 'status')}),
        ('Права', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'created_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )


# -------------------------
# Книги
# -------------------------
@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'publisher', 'condition', 'status', 'price', 'genre', 'type')
    list_filter = ('status', 'condition', 'genre', 'type', 'publisher', 'author')
    search_fields = ('title', 'description')
    ordering = ('title',)


# -------------------------
# Заказы
# -------------------------
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'book', 'amount', 'status', 'payment', 'date')
    list_filter = ('status', 'payment', 'date')
    search_fields = ('user__email', 'book__title')
    ordering = ('-date',)


# -------------------------
# Аукционы
# -------------------------
@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'starting_price', 'current_bid', 'status', 'start_time', 'end_time')
    list_filter = ('status',)
    search_fields = ('product__title',)
    ordering = ('-start_time',)


# -------------------------
# Ставки
# -------------------------
@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'auction', 'amount', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'auction__product__title')
    ordering = ('-created_at',)
