from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', include('customer.urls')),
    path('customer/', include('customer.urls')),
    path('class_list/', include('class_list.urls')),
    path('user_profile/', include('user_profile.urls')),
    path('analytics/', include('analytics.urls')),
    path('attendance/', include('attendance.urls')),
    path('game/', include('game.urls')),
    path('materials/', include('materials.urls')),
    path('admin/', admin.site.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)