from django.urls import path

from . import views

urlpatterns = [
    # API
    path('', views.browse, name='browse'),
]