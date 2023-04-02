from django.urls import path

from . import views

urlpatterns = [
    # LOBBY DISPLAYS
    path('display_one', views.displayOne, name='displayOne'),
    
    # APIs
    path('game_api', views.gameAPI, name='gameAPI'), # game API
]