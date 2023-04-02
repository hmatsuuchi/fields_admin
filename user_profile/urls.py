from django.urls import path

from . import views

urlpatterns = [
    path('login/', views.loginPage, name='loginPage'),
    path('login_authenticate/', views.loginAuthenticate, name='loginAuthenticate'),
    path('logout/', views.logoutUser, name='logoutUser'),
    path('flag_customer/', views.flagCustomer, name='flagCustomer'),
    path('set_user_preference/', views.setUserPreference, name='setUserPreference'),
    path('get_user_preference/', views.getUserPreference, name='getUserPreference'),
]