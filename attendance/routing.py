# chat/routing.py
# from django.urls import re_path
from django.urls import path

from . import consumers

# websocket_urlpatterns = [
#     re_path(r"", consumers.AttendanceStatusUpdate.as_asgi()),
# ]

websocket_urlpatterns = [
    path('ws/', consumers.AttendanceStatusUpdate.as_asgi()),
]