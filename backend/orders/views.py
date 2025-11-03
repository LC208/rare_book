from rest_framework import generics, permissions
from orders.models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from .serializers import OrderItemReportSerializer
from django.db.models import Count, Sum, Avg, F, Q
from rest_framework.response import Response
from books.models import Book, Genre, Author
import logging
from rest_framework import status


logger = logging.getLogger(__name__)

class OrderItemReportView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderItemReportSerializer

    def parse_multi_param(self, request, name):
        raw_list = request.query_params.getlist(name)
        result = []
        for entry in raw_list:
            if not entry:
                continue
            parts = [p.strip() for p in entry.split(',') if p.strip()]
            for p in parts:
                try:
                    result.append(int(p))
                except ValueError:
                    continue
        return list(dict.fromkeys(result))

    def get_filtered_qs(self):
        """Возвращает OrderItem queryset с применёнными фильтрами (по user + параметрам)."""
        user = self.request.user
        params = self.request.query_params

        qs = OrderItem.objects.select_related('order', 'book', 'book__publisher') \
            .prefetch_related('book__authors', 'book__genres')

        # показываем только свои заказы (при необходимости поменяйте)
        qs = qs.filter(order__user=user)

        # параметры
        genre_list = self.parse_multi_param(self.request, 'genres')
        author_list = self.parse_multi_param(self.request, 'authors')
        publisher = params.get('publisher')
        book_status = params.get('book_status')
        book_condition = params.get('book_condition')
        date_after = params.get('date_after')
        date_before = params.get('date_before')
        price_min = params.get('price_min')
        price_max = params.get('price_max')

        logger.debug("Report params: genres=%s authors=%s publisher=%s book_status=%s book_condition=%s date_after=%s date_before=%s price_min=%s price_max=%s",
                     genre_list, author_list, publisher, book_status, book_condition, date_after, date_before, price_min, price_max)

        if genre_list:
            qs = qs.filter(book__genres__in=genre_list)
        if author_list:
            qs = qs.filter(book__authors__in=author_list)
        if publisher:
            try:
                qs = qs.filter(book__publisher=int(publisher))
            except ValueError:
                pass
        if book_status:
            qs = qs.filter(book__status=book_status)
        if book_condition:
            qs = qs.filter(book__condition=book_condition)
        if date_after:
            qs = qs.filter(order__date__gte=date_after)
        if date_before:
            qs = qs.filter(order__date__lte=date_before)
        if price_min:
            qs = qs.filter(price__gte=price_min)
        if price_max:
            qs = qs.filter(price__lte=price_max)

        return qs.distinct()

    def list(self, request, *args, **kwargs):
        """
        Возвращаем JSON:
        {
          "analytics": { ... },
          "items": [ ... serialized OrderItem ... ]
        }
        """
        filtered_qs = self.get_filtered_qs()

        # считаем "проданные" — позиции, где заказ оплачен (Order.Status.ACCEPT -> "A")
        sold_qs = filtered_qs.filter(order__status=Order.Status.ACCEPT)

        # 1) Количество проданных книг (экземпляров)
        total_sold_count = sold_qs.count()

        # 2) Общая сумма продаж
        total_sales_amount = sold_qs.aggregate(total=Sum('price'))['total'] or 0

        # 3) Средняя цена книги (по проданным)
        avg_price = sold_qs.aggregate(avg=Avg('price'))['avg'] or 0

        # 4) Продажи по жанрам
        by_genres_qs = sold_qs.values('book__genres__id', 'book__genres__name') \
            .annotate(count=Count('id'), total=Sum('price'), avg=Avg('price')) \
            .order_by('-total')
        by_genres = [
            {
                "id": g['book__genres__id'],
                "name": g.get('book__genres__name') or "",
                "count": g['count'],
                "total": float(g['total'] or 0),
                "avg": float(g['avg'] or 0)
            }
            for g in by_genres_qs
        ]

        # 5) Продажи по видам (поле book__status — используем display из модели Book)
        by_status_qs = sold_qs.values('book__status').annotate(count=Count('id'), total=Sum('price'), avg=Avg('price')).order_by('-total')
        # создаём отображение display -> значение
        status_display_map = dict(Book.STATUS_CHOICES)
        by_status = []
        for s in by_status_qs:
            key = s['book__status']
            by_status.append({
                "status": key,
                "label": status_display_map.get(key, str(key)),
                "count": s['count'],
                "total": float(s['total'] or 0),
                "avg": float(s['avg'] or 0)
            })

        # 6) Продажи по состояниям (book__condition)
        condition_map = dict(Book.CONDITION_CHOICES)
        by_condition_qs = sold_qs.values('book__condition').annotate(count=Count('id'), total=Sum('price'), avg=Avg('price')).order_by('-total')
        by_condition = []
        for c in by_condition_qs:
            key = c['book__condition']
            by_condition.append({
                "condition": key,
                "label": condition_map.get(key, str(key)),
                "count": c['count'],
                "total": float(c['total'] or 0),
                "avg": float(c['avg'] or 0)
            })

        # 7) Продажи по авторам
        by_authors_qs = sold_qs.values('book__authors__id', 'book__authors__name') \
            .annotate(count=Count('id'), total=Sum('price'), avg=Avg('price')) \
            .order_by('-total')
        by_authors = [
            {
                "id": a['book__authors__id'],
                "name": a.get('book__authors__name') or "",
                "count": a['count'],
                "total": float(a['total'] or 0),
                "avg": float(a['avg'] or 0)
            } for a in by_authors_qs
        ]

        # 8) Продажи за период: если указан date_after/date_before — пересчитаем для периода
        params = request.query_params
        date_after = params.get('date_after')
        date_before = params.get('date_before')
        period = {}
        if date_after or date_before:
            period_qs = sold_qs
            if date_after:
                period_qs = period_qs.filter(order__date__gte=date_after)
            if date_before:
                period_qs = period_qs.filter(order__date__lte=date_before)
            period_count = period_qs.count()
            period_total = period_qs.aggregate(total=Sum('price'))['total'] or 0
            period_avg = period_qs.aggregate(avg=Avg('price'))['avg'] or 0
            period = {
                "start": date_after,
                "end": date_before,
                "count": period_count,
                "total": float(period_total),
                "avg": float(period_avg)
            }

        analytics = {
            "total_sold_count": total_sold_count,
            "total_sales_amount": float(total_sales_amount),
            "average_price": float(avg_price),
            "by_genres": by_genres,
            "by_status": by_status,
            "by_condition": by_condition,
            "by_authors": by_authors,
            "period": period,
        }

        # Сериализуем позиции (фильтрованные, не только проданные)
        serializer = self.get_serializer(filtered_qs.order_by('-order__date'), many=True)

        return Response({
            "analytics": analytics,
            "items": serializer.data
        })

class OrderHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__book').order_by('-date')


class OrderCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderCreateSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)