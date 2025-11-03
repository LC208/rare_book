from django.urls import path
from .views import (
    AuthorListView, GenreListView, PublisherListView,
    BookListView, DonorListCreateView, DonorDetailView
)
urlpatterns = [
    path('', BookListView.as_view(), name='list'),
    path('authors', AuthorListView.as_view()),
    path('genres', GenreListView.as_view()),
    path('publishers', PublisherListView.as_view()),
    path('donors', DonorListCreateView.as_view(), name='donor-list-create'),
    path('donors/<int:pk>', DonorDetailView.as_view(), name='donor-detail'),
]
