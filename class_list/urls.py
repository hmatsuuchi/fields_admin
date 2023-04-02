from django.urls import path

from . import views

urlpatterns = [
    path('browse', views.browse, name='browse'),
    path('create', views.create, name='create'),
    path('edit/<int:class_id>', views.edit, name='edit'),
    path('delete_confirm/<int:class_id>', views.deleteConfirm, name='deleteConfirm'),
    path('class_list_api', views.classListAPI, name='classListAPI'),
]