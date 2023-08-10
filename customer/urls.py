from django.urls import path

from . import views

urlpatterns = [
    # STUDENT PROFILES
    path('', views.browse, name='browse'),
    path('browse', views.browse, name='browse'),
    path('detail/<int:customer_id>', views.detail, name='detail'),
    path('new', views.new, name='new'),
    path('new_create', views.newCreate, name='newCreate'),
    path('edit/<int:customer_id>', views.edit, name='edit'),
    path('edit_update', views.editUpdate, name='editUpdate'),
    path('delete/<int:customer_id>', views.delete, name='delete'),
    path('delete_confirmed', views.deleteConfirmed, name="deleteConfirmed"),
    path('get_archived', views.getArchived, name="getArchived"),
    path('active_notes', views.activeNotes, name="activeNotes"),

    # STUDENT NOTES
    path('notes', views.notesView, name='notesView'), # view note page
    path('notes_edit', views.notesEdit, name=('notesEdit')), # edit note page
    path('notes_create', views.notesCreate, name=('notesCreate')), # create note page
    path('notes_delete/<int:note_id>', views.notesDelete, name='notesDelete'), # delete note page
    
    # APIs
    path('notes_api', views.notesAPI, name='notesAPI'), # notes API
    path('admin_profile_api', views.adminProfileAPI, name='adminProfileAPI'), # admin profile preference API
    path('customer_profiles_api', views.customerProfilesAPI, name='customerProfilesAPI'), # customer profile API
    path('customer_details_api', views.customerDetailsAPI, name='customerDetailsAPI'), # customer details API
    # path('customer_access_log', views.customerAccessLog, name='customerAccessLog'), # customer access log

    # INCREMENT STUDENT YEAR
    # use this only once a year to increment student grades
    # path('increment_student_year', views.incrementStudentYear, name='incrementStudentYear'),
]