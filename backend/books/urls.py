from django.urls import path
from .views import BookListView, AuthorListView, GenreListView, PublisherListView

urlpatterns = [
    path('', BookListView.as_view(), name='list'),
    path('authors', AuthorListView.as_view()),
    path('genres', GenreListView.as_view()),
    path('publishers', PublisherListView.as_view()),
]
