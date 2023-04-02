from django.urls import path

from . import views

urlpatterns = [
    # API
    path('analytics_api', views.AnalyticsAPI, name='analyticsAPI'),
    # DASHBOARD
    path('dashboard', views.Dashboard, name='dashboard'),
    # ACCESSLOG
    path('accesslog/browse', views.AccesslogBrowse, name='accesslogBrowse'),
    # CHANGELOG - CLASS LIST
    path('changelog/class_list/browse', views.ChangelogClasslistBrowse, name='changelogClasslistBrowse'),
    # CHANGELOG - CUSTOMER
    path('changelog/customer/browse', views.ChangelogCustomerBrowse, name='changelogCustomerBrowse'),
    # CHANGELOG - NOTES
    path('changelog/notes/browse', views.ChangelogNotesBrowse, name='changelogNotesBrowse'),
]