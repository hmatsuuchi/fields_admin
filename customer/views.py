from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.core import serializers
from datetime import timedelta
# import datetime
import json

from .models import CustomerProfile, Notes, CustomerProfileChangelog, NotesChangelog
from user_profile.models import UserProfile
from django.contrib.auth.models import User
from logs.models import AccessLog

# ======================== CUSTOMER PROFILES ========================

# customer - browse page
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def browse(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Customer - Browse'

    return_link = '/customer/browse'

    user = UserProfile.objects.get(user=request.user)

    display_archived = user.display_archived_profiles
    display_unarchived = 'True'
    display_only_flagged = user.display_only_flagged_profiles
    
    context = {
        'page_title': page_title,
        'return_link': return_link,
        'display_archived': display_archived,
        'display_unarchived': display_unarchived,
        'display_only_flagged': display_only_flagged,
    }
    
    return render(request, 'customer/browse/index.html', context)

# customer - active notes
# generates a list of student ids with active notes and responds with JSON
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def activeNotes(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    # creates list of student ids with active notes
    active_notes = Notes.objects.filter(archived=False)
    active_notes_val_list = active_notes.values_list('customer_id', flat=True)
    active_notes_clean = list(dict.fromkeys(active_notes_val_list))

    data = {
        'active_notes': active_notes_clean,
    }

    return JsonResponse(data)

# customer - detail
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def detail(request, customer_id):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Customer - Detail'

    return_link = '/customer/detail/' + str(customer_id)
    
    context = {
        'page_title': page_title,
        'customer_id': customer_id,
        'return_link': return_link,
    }
    
    return render(request, 'customer/detail/index.html', context)

# customer - new
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def new(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Customer - New'

    prefecture_choices = CustomerProfile.prefecture_choices
    phone_choices = CustomerProfile.phone_choices
    grade_choices = CustomerProfile.grade_choices
    status_choices = CustomerProfile.status_choices
    payment_method_choices = CustomerProfile.payment_method_choices

    return_link = request.GET.get('return_link')
    
    context = {
        'page_title': page_title,
        'prefecture_choices': prefecture_choices,
        'phone_choices': phone_choices,
        'grade_choices': grade_choices,
        'status_choices': status_choices,
        'payment_method_choices': payment_method_choices,
        'return_link': return_link,
    }
    
    return render(request, 'customer/new/index.html', context)

# customer - new (backend)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def newCreate(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    post_data = request.POST
    
    user = CustomerProfile()
    user.last_name_romaji = post_data.get('last_name_romaji')
    user.first_name_romaji = post_data.get('first_name_romaji')
    user.last_name_kanji = post_data.get('last_name_kanji')
    user.first_name_kanji = post_data.get('first_name_kanji')
    user.last_name_katakana = post_data.get('last_name_katakana')
    user.first_name_katakana = post_data.get('first_name_katakana')
    user.post_code = post_data.get('post_code')
    user.prefecture = post_data.get('prefecture')
    user.city = post_data.get('city')
    user.address_1 = post_data.get('address_1')
    user.address_2 = post_data.get('address_2')
    user.phone_1 = post_data.get('phone_1')
    user.phone_1_type = post_data.get('phone_1_type')
    user.phone_2 = post_data.get('phone_2')
    user.phone_2_type = post_data.get('phone_2_type')
    if post_data.get('birthday'):
        user.birthday = post_data.get('birthday')
    user.grade = post_data.get('grade')
    user.status = post_data.get('status')
    user.payment_method = post_data.get('payment_method')
    user.save()

    # CHANGELOG
    user_changelog = CustomerProfileChangelog()
    # changelog meta data
    user_changelog.changelog_customer_profile = user.id
    user_changelog.changelog_user = request.user.id
    user_changelog.changelog_type = 1
    # changelog mirrored data
    user_changelog.last_name_romaji = user.last_name_romaji
    user_changelog.first_name_romaji = user.first_name_romaji
    user_changelog.last_name_kanji = user.last_name_kanji
    user_changelog.first_name_kanji = user.first_name_kanji
    user_changelog.last_name_katakana = user.last_name_katakana
    user_changelog.first_name_katakana = user.first_name_katakana
    user_changelog.post_code = user.post_code
    user_changelog.prefecture = user.prefecture
    user_changelog.city = user.city
    user_changelog.address_1 = user.address_1
    user_changelog.address_2 = user.address_2
    user_changelog.phone_1 = user.phone_1
    user_changelog.phone_1_type = user.phone_1_type
    user_changelog.phone_2 = user.phone_2
    user_changelog.phone_2_type = user.phone_2_type
    user_changelog.birthday = user.birthday
    user_changelog.grade = user.grade
    user_changelog.status = user.status
    user_changelog.payment_method = user.payment_method
    # adds record to DB
    user_changelog.save()

    json_response = {
        'id' : user.id,
    }

    data = {
        'json_response': json_response,
    }

    return JsonResponse(data)

# customer - edit
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def edit(request, customer_id):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Customer - Edit'

    customer = CustomerProfile.objects.get(id=customer_id)

    prefecture_choices = CustomerProfile.prefecture_choices
    phone_choices = CustomerProfile.phone_choices
    grade_choices = CustomerProfile.grade_choices
    status_choices = CustomerProfile.status_choices
    payment_method_choices = CustomerProfile.payment_method_choices

    return_link = request.GET.get('return_link')
    
    context = {
        'page_title': page_title,
        'customer': customer,
        'prefecture_choices': prefecture_choices,
        'phone_choices': phone_choices,
        'grade_choices': grade_choices,
        'status_choices': status_choices,
        'payment_method_choices': payment_method_choices,
        'return_link': return_link,
    }
    
    return render(request, 'customer/edit/index.html', context)

# customer - edit (backend)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def editUpdate(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    post_data = request.POST
    customer_id = post_data.get('customer_id')
    
    user = CustomerProfile.objects.get(id=customer_id)
    user.last_name_romaji               = post_data.get('last_name_romaji')
    user.first_name_romaji              = post_data.get('first_name_romaji')
    user.last_name_kanji                = post_data.get('last_name_kanji')
    user.first_name_kanji               = post_data.get('first_name_kanji')
    user.last_name_katakana             = post_data.get('last_name_katakana')
    user.first_name_katakana            = post_data.get('first_name_katakana')
    user.post_code                      = post_data.get('post_code')
    user.prefecture                     = post_data.get('prefecture')
    user.city                           = post_data.get('city')
    user.address_1                      = post_data.get('address_1')
    user.address_2                      = post_data.get('address_2')
    user.phone_1                        = post_data.get('phone_1')
    user.phone_1_type                   = post_data.get('phone_1_type')
    user.phone_2                        = post_data.get('phone_2')
    user.phone_2_type                   = post_data.get('phone_2_type')
    if post_data.get('birthday'):
        user.birthday                   = post_data.get('birthday')
    user.grade                          = post_data.get('grade')
    user.status                         = post_data.get('status')
    user.payment_method                 = post_data.get('payment_method')
    user.archived                       = post_data.get('archived')
    user.save()

    # CHANGELOG
    user_changelog = CustomerProfileChangelog()
    # changelog meta data
    user_changelog.changelog_customer_profile = user.id
    user_changelog.changelog_user = request.user.id
    user_changelog.changelog_type = 3
    # changelog mirrored data
    user_changelog.last_name_romaji     = user.last_name_romaji
    user_changelog.first_name_romaji    = user.first_name_romaji
    user_changelog.last_name_kanji      = user.last_name_kanji
    user_changelog.first_name_kanji     = user.first_name_kanji
    user_changelog.last_name_katakana   = user.last_name_katakana
    user_changelog.first_name_katakana  = user.first_name_katakana
    user_changelog.post_code            = user.post_code
    user_changelog.prefecture           = user.prefecture
    user_changelog.city                 = user.city
    user_changelog.address_1            = user.address_1
    user_changelog.address_2            = user.address_2
    user_changelog.phone_1              = user.phone_1
    user_changelog.phone_1_type         = user.phone_1_type
    user_changelog.phone_2              = user.phone_2
    user_changelog.phone_2_type         = user.phone_2_type
    user_changelog.birthday             = user.birthday
    user_changelog.grade                = user.grade
    user_changelog.status               = user.status
    user_changelog.payment_method       = user.payment_method
    user_changelog.archived             = user.archived
    # adds record to DB
    user_changelog.save()

    status_response = "PYTHON VIEWS JSON RESPONSE"

    data = {
        'status_response': status_response,
    }

    return JsonResponse(data)

# customer - delete
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def delete(request, customer_id):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Customer - Delete'

    customer = CustomerProfile.objects.get(id=customer_id)

    return_link = request.GET.get('return_link')

    context = {
        'page_title': page_title,
        'customer': customer,
        'return_link': return_link,
    }
    
    return render(request, 'customer/delete/index.html', context)

# customer - delete (backend)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def deleteConfirmed(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    post_data = request.POST
    customer_id = post_data.get('customer_id')

    customer = CustomerProfile.objects.get(id=customer_id)

    # CHANGELOG
    user_changelog = CustomerProfileChangelog()
    # changelog meta data
    user_changelog.changelog_customer_profile = customer.id
    user_changelog.changelog_user = request.user.id
    user_changelog.changelog_type = 4
    # changelog mirrored data
    user_changelog.last_name_romaji = customer.last_name_romaji
    user_changelog.first_name_romaji = customer.first_name_romaji
    user_changelog.last_name_kanji = customer.last_name_kanji
    user_changelog.first_name_kanji = customer.first_name_kanji
    user_changelog.last_name_katakana = customer.last_name_katakana
    user_changelog.first_name_katakana = customer.first_name_katakana
    user_changelog.post_code = customer.post_code
    user_changelog.prefecture = customer.prefecture
    user_changelog.city = customer.city
    user_changelog.address_1 = customer.address_1
    user_changelog.address_2 = customer.address_2
    user_changelog.phone_1 = customer.phone_1
    user_changelog.phone_1_type = customer.phone_1_type
    user_changelog.phone_2 = customer.phone_2
    user_changelog.phone_2_type = customer.phone_2_type
    if customer.birthday:
        user_changelog.birthday = customer.birthday
    user_changelog.grade = customer.grade
    user_changelog.status = customer.status
    user_changelog.payment_method = customer.payment_method
    user_changelog.archived = customer.archived
    # adds record to DB
    user_changelog.save()

    customer.delete()

    status_response = "PYTHON VIEWS JSON RESPONSE"

    data = {
        'status_response': status_response,
    }

    return JsonResponse(data)

# gets archived customer profiles and returns data as JSON response
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def getArchived(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    profiles = CustomerProfile.objects.filter(archived=True)

    data = serializers.serialize("json", profiles)

    return JsonResponse(data, safe=False)

# API for generating customer profiles cards
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def customerProfilesAPI(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    all_post = request.POST
    parameter = all_post.get('parameter')

    # GET PROFILES
    if parameter == 'GET':
        # all profile get parameters
        result_limit                    = all_post.get('result_limit')
        batch_number                    = all_post.get('batch_number')
        batch_size                      = all_post.get('batch_size')
        display_archived                = all_post.get('display_archived')
        display_unarchived              = all_post.get('display_unarchived')
        sort                            = all_post.get('sort')
        search_parameter                = all_post.get('search_parameter')
        display_only_flagged            = all_post.get('display_only_flagged')

        # adds all original parameters to dictionary to be passed back to JS
        parameters = {
            'parameter': parameter,
            'result_limit': result_limit,
            'batch_number': batch_number,
            'batch_size': batch_size,
            'display_archived': display_archived,
            'display_unarchived': display_unarchived,
            'sort': sort,
            'search_parameter': search_parameter,
            'display_only_flagged': display_only_flagged,
        }

        all_profiles = CustomerProfile.objects.all()

        if display_only_flagged == 'True': # has flag priority
            userMeta = UserProfile.objects.get(user=request.user)
            all_profiles = userMeta.flagged_profiles.all()

        search_parameter = search_parameter.replace(" ","") # removes spaces from search string

        last_four = search_parameter[-4:] # isolates last four characters of search string for phone number search
        
        if search_parameter != '':
            last_name_romaji = all_profiles.filter(last_name_romaji__icontains=search_parameter)
            first_name_romaji = all_profiles.filter(first_name_romaji__icontains=search_parameter)
            last_name_kanji = all_profiles.filter(last_name_kanji__icontains=search_parameter)
            first_name_kanji = all_profiles.filter(first_name_kanji__icontains=search_parameter)
            last_name_katakana = all_profiles.filter(last_name_katakana__icontains=search_parameter)
            first_name_katakana = all_profiles.filter(first_name_katakana__icontains=search_parameter)
            phone_1 = all_profiles.filter(phone_1__icontains=search_parameter)
            phone_2 = all_profiles.filter(phone_2__icontains=search_parameter)
            phone_1_last_four = all_profiles.filter(phone_1__icontains=last_four)
            phone_2_last_four = all_profiles.filter(phone_2__icontains=last_four)
            post_code = all_profiles.filter(post_code__icontains=search_parameter)
            city = all_profiles.filter(city__icontains=search_parameter)
            address_1 = all_profiles.filter(address_1__icontains=search_parameter)
            address_2 = all_profiles.filter(address_2__icontains=search_parameter)
            all_profiles = last_name_romaji | first_name_romaji | last_name_kanji | first_name_kanji | last_name_katakana | first_name_katakana | phone_1 | phone_2 | phone_1_last_four | phone_2_last_four | post_code | city | address_1 | address_2

        # filters archived notes
        if display_archived == 'False':
            all_profiles = all_profiles.filter(archived=False)

        # counts returned records
        result_count = all_profiles.count()

        # limits results by batch number and size
        start = int(batch_number) * int(batch_size)
        end = start + int(batch_size)
        s = slice(start, end)
        all_profiles = all_profiles[s]

        # serlializes query results for JSON response
        profiles = []
        for x in all_profiles:    
            if x.birthday: # gets birthday month
                birthday_month = x.birthday.month
                birthday_day = x.birthday.day
                age = str(x.age)
            else:
                birthday_month = 0
                birthday_day = 0
                age = ''

            profile = {
                # display data
                'profile_id': x.id,
                'last_name_romaji': x.last_name_romaji,
                'first_name_romaji': x.first_name_romaji,
                'last_name_kanji': x.last_name_kanji,
                'first_name_kanji': x.first_name_kanji,
                'last_name_katakana': x.last_name_katakana,
                'first_name_katakana': x.first_name_katakana,
                'post_code': x.post_code,
                'prefecture': x.prefecture,
                'city': x.city,
                'address_1': x.address_1,
                'address_2': x.address_2,
                'phone_1': x.phone_1,
                'phone_1_type': x.phone_1_type,
                'phone_2': x.phone_2,
                'phone_2_type': x.phone_2_type,
                'birthday': x.birthday,
                'age': age,
                # hidden metadata
                'status': x.status,
                'grade': x.grade,
                'birthdayMonth': birthday_month,
                'birthdayDay': birthday_day,
                'payment': x.payment_method,
                'archived': x.archived,
            }
            profiles.append(profile)

    data = {
        'parameters': parameters,
        'profiles': profiles,
        'resultCount': result_count,
    }

    return JsonResponse(data)

# ======================== NOTES ========================

# view notes page
@login_required(login_url='/user_profile/login')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def notesView(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Customer - Notes'
    return_link = '/customer/notes'

    current_user = request.user # gets logged in user
    user_meta = UserProfile.objects.get(user=current_user) # gets user metadata
    display_archived = user_meta.display_archived_notes # sets display archived bool
    display_unarchived = 'True' # sets display unarchived bool

    context = {
        'page_title': page_title,
        'return_link': return_link,
        'display_archived': display_archived,
        'display_unarchived': display_unarchived,
    }

    return render(request, 'customer/notes/index.html', context)

# edit note page
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def notesEdit(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Customer - Notes - Edit'

    return_link = request.GET.get('return_link')
    edit_note   = request.GET.get('edit_note')

    # generates all students list for dropdown menu
    all_student_list = [] # list of student information to be passed to JS
    all_students = CustomerProfile.objects.all() # gets all student profiles
    for x in all_students:
        all_student_list.append([x.id, x.last_name_kanji, x.first_name_kanji, x.last_name_katakana, x.first_name_katakana, x.last_name_romaji, x. first_name_romaji])
    
    # generates instructor list for dropdown menu
    # generates active instructor list
    active_instructor_profiles = UserProfile.objects.filter(notes_active=True).order_by('user__id')
    all_instructor_list = [(0, '-------')]
    for x in active_instructor_profiles:
        tupple = x.user.id, x.last_name_kanji + x.first_name_kanji
        all_instructor_list.append(tupple)

    # generates type list for dropdown menu
    all_type_list           = Notes.note_type_choices

    # gets all the values of the note to be edited
    note = Notes.objects.get(id=edit_note)
    customer_name = note.customer_id.last_name_kanji + " " + note.customer_id.first_name_kanji
    if note.instructor_1 != None:
        instructor = note.instructor_1.id
    else:
        instructor = 0
    if note.instructor_2 != None:
        instructor_2 = note.instructor_2.id
    else:
        instructor_2 = 0

    note_data = {
        'id' : note.id,
        'customer_id' : note.customer_id.id,
        'customer_name' : customer_name,
        'date' : note.date,
        'time' : note.time,
        'type' : note.type,
        'instructor' : instructor,
        'instructor_2': instructor_2,
        'note_text' : note.note_text,
        'archived' : note.archived,
    }

    context = {
        'page_title' : page_title,
        'return_link' : return_link,
        'edit_note' : edit_note,
        'all_student_list' : all_student_list,
        'all_type_list' : all_type_list,
        'all_instructor_list' : all_instructor_list,
        'note_data' : note_data,
    }

    return render(request, 'customer/notes_edit/index.html', context)

# new note page
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def notesCreate(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Customer - Notes - Create'

    return_link = request.GET.get('return_link')
    edit_note   = request.GET.get('edit_note')

    # generates all students list for dropdown menu
    all_student_list = [] # list of student information to be passed to JS
    all_students = CustomerProfile.objects.all() # gets all student profiles
    for x in all_students:
        all_student_list.append([x.id, x.last_name_kanji, x.first_name_kanji, x.last_name_katakana, x.first_name_katakana, x.last_name_romaji, x. first_name_romaji])
    
    # generates type and instructor list for dropdown menu
    # generates active instructor list
    active_instructor_profiles = UserProfile.objects.filter(notes_active=True).order_by('user__id')
    all_instructor_list = [(0, '-------')]
    for x in active_instructor_profiles:
        tupple = x.user.id, x.last_name_kanji + x.first_name_kanji
        all_instructor_list.append(tupple)

    # generates type choices for dropdown menu
    all_type_list           = Notes.note_type_choices

    context = {
        'page_title' : page_title,
        'return_link' : return_link,
        'edit_note' : edit_note,
        'all_student_list' : all_student_list,
        'all_type_list' : all_type_list,
        'all_instructor_list' : all_instructor_list,
    }

    return render(request, 'customer/notes_create/index.html', context)

# delete note page
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def notesDelete(request, note_id):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Customer - Notes - Delete'

    return_link = request.GET.get('return_link')

    note = Notes.objects.get(id=note_id)

    customer_name = note.customer_id.last_name_kanji + " " + note.customer_id.first_name_kanji

    container_date = note.date

    title = Notes.note_type_choices[note.type][1]

    grade = CustomerProfile.grade_choices[note.customer_id.grade][1]
    
    # generates active instructor list
    active_instructor_profiles = UserProfile.objects.filter(notes_active=True).order_by('user__id')
    all_instructor_list = {}
    for x in active_instructor_profiles:
        all_instructor_list[x.user.id] = x.last_name_kanji + x.first_name_kanji

    if note.instructor_1 != None:
        instructor_img_url = note.instructor_1.id
        instructor_name = note.instructor_1.userprofile.last_name_kanji + note.instructor_1.userprofile.first_name_kanji
    else:
        instructor_img_url = None
        instructor_name = None
    if note.instructor_2 != None:
        instructor_2_img_url = note.instructor_2.id

        instructor_2_name = note.instructor_2.userprofile.last_name_kanji + note.instructor_2.userprofile.first_name_kanji
    else:
        instructor_2_img_url = None
        instructor_2_name = None

    note_date = note.date

    name_katakana = note.customer_id.last_name_katakana + " " + note.customer_id.first_name_katakana
    name_romaji = note.customer_id.last_name_romaji + " " + note.customer_id.first_name_romaji

    note_text = note.note_text

    note_data = {
        'customer_name': customer_name,
        'container_date': container_date,
        'title': title,
        'instructor': note.instructor_1,
        'instructor_2': note.instructor_2,
        'instructor_img_url': instructor_img_url,
        'instructor_2_img_url': instructor_2_img_url,
        'time': note.time,
        'grade': grade,
        'note_date': note_date,
        'name_katakana': name_katakana,
        'name_romaji': name_romaji,
        'instructor_name': instructor_name,
        'instructor_2_name': instructor_2_name,
        'note_text': note_text,
    }

    context = {
        'page_title': page_title,
        'note_data': note_data,
        'return_link': return_link,
        'note_id': note_id,
    }

    return render(request, 'customer/notes_delete/index.html', context)

# notes API
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def notesAPI(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    all_post = request.POST
    parameter = all_post.get('parameter')

    # generates active instructor list
    active_instructor_profiles = UserProfile.objects.filter(notes_active=True).order_by('user__id')
    all_instructor_list = {}
    for x in active_instructor_profiles:
        all_instructor_list[x.user.id] = x.last_name_kanji + x.first_name_kanji

    # GET NOTES
    if parameter == 'GET':
        # all note get parameters
        result_limit        = all_post.get('result_limit')
        batch_number        = all_post.get('batch_number')
        batch_size          = all_post.get('batch_size')
        batch_size_days     = all_post.get('batch_size_days')
        display_archived    = all_post.get('display_archived')
        display_unarchived  = all_post.get('display_unarchived')
        start_date          = all_post.get('start_date')
        end_date            = all_post.get('end_date')
        sort                = all_post.get('sort')
        search_parameter    = all_post.get('search_parameter')

        # adds all original parameters to dictionary to be passed back to JS
        parameters = {
            'parameter': parameter,
            'result_limit': result_limit,
            'batch_number': batch_number,
            'batch_size': batch_size,
            'batch_size_days': batch_size_days,
            'display_archived': display_archived,
            'display_unarchived': display_unarchived,
            'start_date': start_date,
            'end_date': end_date,
            'sort': sort,
            'search_parameter': search_parameter,
        }

        # performs notes query
        all_notes = Notes.objects.all()
        # applies search parameter
        if search_parameter != '':
            last_name_romaji = all_notes.filter(customer_id__last_name_romaji__icontains=search_parameter)
            first_name_romaji = all_notes.filter(customer_id__first_name_romaji__icontains=search_parameter)
            last_name_kanji = all_notes.filter(customer_id__last_name_kanji__icontains=search_parameter)
            first_name_kanji = all_notes.filter(customer_id__first_name_kanji__icontains=search_parameter)
            last_name_katakana = all_notes.filter(customer_id__last_name_katakana__icontains=search_parameter)
            first_name_katakana = all_notes.filter(customer_id__first_name_katakana__icontains=search_parameter)
            all_notes = last_name_romaji | first_name_romaji | last_name_kanji | first_name_kanji | last_name_katakana | first_name_katakana
        # display archived notes
        if display_archived == 'False':
            all_notes = all_notes.filter(archived=False)
        # display unarchived notes
        if display_unarchived == 'False':
            all_notes = all_notes.filter(archived=True)
        # applies sort
        if sort != 'none':
            sort = sort.split(',')
            all_notes = all_notes.order_by(*sort)

        # gets total number of notes in operation excluding number and date limits
        note_count = all_notes.count()

        # limits batch size based on number
        if batch_size != 'none':
            start = int(batch_number) * int(batch_size)
            end = start + int(batch_size)
            s = slice(start, end)
            all_notes = all_notes[s]
        # limits batch size based on date
        if batch_size_days != 'none' and search_parameter == '':
            batch_size_days = -int(batch_size_days) # converts to negative integer

            latest_note = all_notes.order_by('-date')[0].date # gets date from latest

            start_date = latest_note + timedelta(batch_size_days * int(batch_number))
            end_date = start_date + timedelta(days=batch_size_days) # derives end date for filter range

            all_notes = all_notes.filter(date__gt=end_date, date__lte=start_date)
        
        # serlializes query results for JSON response
        notes = []
        for x in all_notes:
            # if no instructor 1 is assigned to note
            if x.instructor_1:
                instructor = x.instructor_1.id
            else:
                instructor = None
            # if no instructor 2 is assigned to note
            if x.instructor_2:
                instructor_2 = x.instructor_2.id
            else:
                instructor_2 = None

            note = {
                'note_id': x.id,
                'customer_id': x.customer_id.id,
                'last_name_kanji': x.customer_id.last_name_kanji,
                'first_name_kanji': x.customer_id.first_name_kanji,
                'last_name_katakana': x.customer_id.last_name_katakana,
                'first_name_katakana': x.customer_id.first_name_katakana,
                'last_name_romaji': x.customer_id.last_name_romaji,
                'first_name_romaji': x.customer_id.first_name_romaji,
                'grade': x.customer_id.grade,
                'date': x.date,
                'time': x.time,
                'type': x.type,
                'instructor': instructor,
                'instructor_2': instructor_2,
                'note_text': x.note_text,
                'archived': x.archived,
            }
            notes.append(note)

    if parameter == 'UPDATE':
        # edit note parameters
        return_link = all_post.get('return_link')
        note_id = all_post.get('note_id')
        field_value = all_post.get('field_value')
        field_value_array = json.loads(field_value) # converst string to array

        note = Notes.objects.get(id=note_id)

        for x in field_value_array:
            if x[0] == 'customer_id' and x[1] != '':
                student = CustomerProfile.objects.get(id=x[1]) # converts student ID value into student object
                setattr(note, str(x[0]), student) # sets field x[0] of note with value of x[1]; same syntax is used below

            if x[0] == 'date' and x[1] != '':
                setattr(note, str(x[0]), x[1])

            if x[0] == 'time' and x[1] != '':
                setattr(note, str(x[0]), x[1])

            if x[0] == 'type' and x[1] != '':
                setattr(note, str(x[0]), x[1])
            
            if x[0] == 'instructor_1' and x[1] != '0':
                instructor = User.objects.get(id=x[1]) # converts instructor ID value into student object
                setattr(note, str(x[0]), instructor)
            elif x[0] == 'instructor_1':
                setattr(note, str(x[0]), None)
            if x[0] == 'instructor_2' and x[1] != '0':
                instructor2 = User.objects.get(id=x[1]) # converts instructor ID value into student object
                setattr(note, str(x[0]), instructor2)
            elif x[0] == 'instructor_2':
                setattr(note, str(x[0]), None)

            if x[0] == 'note_text' and x[1] != '':
                setattr(note, str(x[0]), x[1])
            elif x[0] == 'note_text' and x[1] == '':
                setattr(note, str(x[0]), '')

            if x[0] == 'archived' and x[1] != '':
                setattr(note, str(x[0]), x[1])
        
        note.save()

        # CHANGELOG
        note_changelog = NotesChangelog()
        # changelog meta data
        note_changelog.changelog_note   = note.id
        note_changelog.changelog_user   = request.user.id
        note_changelog.changelog_type   = 3
        # changelog mirrored data
        if note.customer_id:
            note_changelog.customer_id  = note.customer_id.id # stores relationship as immutable integer
        note_changelog.date             = note.date
        note_changelog.time             = note.time
        note_changelog.type             = note.type
        if note.instructor_1:
            note_changelog.instructor_1 = note.instructor_1.id # stores relationship as immutable integer
        if note.instructor_2:
            note_changelog.instructor_2 = note.instructor_2.id # stores relationship as immutable integer
        note_changelog.note_text        = note.note_text
        note_changelog.archived         = note.archived
        # saves changelog record
        note_changelog.save()

        parameters = {
            'parameter': parameter,
            'note_id': note_id,
            'field_value': field_value,
            'return_link': return_link,
        }

        notes = {
            'note_id': note_id, # data used to update the DOM or confirm changes to DB; in GET requests, this data would be used to build note list
        }

        # gets total number of notes in operation
        note_count = 1

    if parameter == 'CREATE':
        # create note parameters
        note_id = all_post.get('note_id')
        field_value = all_post.get('field_value')
        field_value_array = json.loads(field_value) # converst string to array

        note = Notes()

        for x in field_value_array:
            if x[0] == 'customer_id' and x[1] != '':
                student = CustomerProfile.objects.get(id=x[1]) # converts student ID value into student object
                setattr(note, str(x[0]), student) # sets field x[0] of note with value of x[1]; same syntax is used below

            if x[0] == 'date' and x[1] != '':
                setattr(note, str(x[0]), x[1])

            if x[0] == 'time' and x[1] != '':
                setattr(note, str(x[0]), x[1])

            if x[0] == 'type' and x[1] != '':
                setattr(note, str(x[0]), x[1])
            
            if x[0] == 'instructor_1' and x[1] != '0':
                instructor = User.objects.get(id=x[1]) # converts instructor ID value into student object
                setattr(note, str(x[0]), instructor)

            if x[0] == 'instructor_2' and x[1] != '0':
                instructor2 = User.objects.get(id=x[1]) # converts instructor ID value into student object
                setattr(note, str(x[0]), instructor2)

            if x[0] == 'note_text' and x[1] != '':
                setattr(note, str(x[0]), x[1])
            elif x[0] == 'note_text' and x[1] == '':
                setattr(note, str(x[0]), '')

            if x[0] == 'archived' and x[1] != '':
                setattr(note, str(x[0]), x[1])
        note.save()

        # CHANGELOG
        note_changelog = NotesChangelog()
        # changelog meta data
        note_changelog.changelog_note   = note.id
        note_changelog.changelog_user   = request.user.id
        note_changelog.changelog_type   = 1
        # changelog mirrored data
        if note.customer_id:
            note_changelog.customer_id  = note.customer_id.id # stores relationship as immutable integer
        note_changelog.date             = note.date
        note_changelog.time             = note.time
        note_changelog.type             = note.type
        if note.instructor_1:
            note_changelog.instructor_1 = note.instructor_1.id # stores relationship as immutable integer
        if note.instructor_2:
            note_changelog.instructor_2 = note.instructor_2.id # stores relationship as immutable integer
        note_changelog.note_text        = note.note_text
        note_changelog.archived         = note.archived
        # saves changelog record
        note_changelog.save()
        print("customer id:", note_changelog.customer_id)

        parameters = {
            'parameter': parameter,
            'field_value': field_value,
            'student_kanji_last': student.last_name_kanji,
            'student_kanji_first': student.first_name_kanji, 
        }

        notes = {
            'note_id': note.id, # data used to update the DOM or confirm changes to DB; in GET requests, this data would be used to build note list
        }

        # gets total number of notes in operation
        note_count = 1

    if parameter == 'DELETE':
        # delete note parameters
        note_id = all_post.get('note_id')

        note = Notes.objects.get(id=note_id)

        # CHANGELOG
        note_changelog = NotesChangelog()
        # changelog meta data
        note_changelog.changelog_note   = note.id
        note_changelog.changelog_user   = request.user.id
        note_changelog.changelog_type   = 4
        # changelog mirrored data
        if note.customer_id:
            note_changelog.customer_id  = note.customer_id.id # stores relationship as immutable integer
        note_changelog.date             = note.date
        note_changelog.time             = note.time
        note_changelog.type             = note.type
        if note.instructor_1:
            note_changelog.instructor_1 = note.instructor_1.id # stores relationship as immutable integer
        if note.instructor_2:
            note_changelog.instructor_2 = note.instructor_2.id # stores relationship as immutable integer
        note_changelog.note_text        = note.note_text
        note_changelog.archived         = note.archived
        # saves changelog record
        note_changelog.save()

        parameters = {
            'parameter': parameter,
            'note_id': note_id,
        }

        notes = {
            'note_id': note_id, # data used to update the DOM or confirm changes to DB; in GET requests, this data would be used to build note list
        }

        note.delete() # deletes note after note information set in 'notes' variable

        # gets total number of notes in operation
        note_count = 1

    data = {
        'parameters': parameters,
        'notes': notes,
        'note_count': note_count,
        'allInstructorList': all_instructor_list,
    }

    return JsonResponse(data)

# ======================== ADMIN PREFERENCES ========================
# admin profiles API
@login_required(login_url='/user_profile/login')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def adminProfileAPI(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)
    
    all_post = request.POST # get all post data
    parameter = all_post.get('parameter') # API parameter

    user = UserProfile.objects.get(user=request.user) # current authenticated user

    if parameter == 'UPDATE':
        field_value = all_post.get('field_value')
        field_value_array = json.loads(field_value)

        for x in field_value_array:
            setattr(user, str(x[0]), x[1])

        user.save()

        parameters = {
            'parameter': parameter,
            'field_value': field_value,
        }

        data = {
            'parameters': parameters,
        }

    if parameter == 'GET_FLAGGED':
        queryset = user.flagged_profiles.all().values_list('id', flat=True)

        values = []
        for x in queryset:
            values.append(x)
        data = {
            'values': values,
        }

    if parameter == 'ADD_FLAG':
        profile = CustomerProfile.objects.get(id=all_post.get('profile_id'))
        user.flagged_profiles.add(profile)
        
        data = {
            'success': 'SUCCESS',
        }

    if parameter == 'REMOVE_FLAG':
        profile = CustomerProfile.objects.get(id=all_post.get('profile_id'))
        user.flagged_profiles.remove(profile)
        
        data = {
            'success': 'SUCCESS',
        }

    if parameter == 'CHECK_FLAGGED_SINGLE':
        queryset = user.flagged_profiles.all().values_list('id', flat=True) # generates list of flagged profiles from user metadata
        customer_id = all_post.get('customer_id') # gets customer id via javascript AJAX post

        flag_present = int(customer_id) in queryset # converts customer id to integer and checks for presence in list

        data = {
            'flag_present': flag_present,
        }

    return JsonResponse(data)

# ======================== CUSTOMER DETAILS ========================
# customer details API
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def customerDetailsAPI(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)
    
    all_post = request.POST # get all POST data

    # GET CUSTOMER PROFILE
    if all_post.get('parameter') == 'GET_PROFILE':
        customer_id = all_post.get('customer_id') # get cusotmer id
        customer = CustomerProfile.objects.get(id=customer_id)

        return_link = '/customer/detail/' + customer_id

        if customer.age: # sets age variable if birthday is present
            age = str(customer.age)
        else:
            age = ''

        data = {
            'return_link': return_link,

            'customer_id': customer.id,
            'last_name_romaji': customer.last_name_romaji,
            'first_name_romaji': customer.first_name_romaji,
            'last_name_kanji': customer.last_name_kanji,
            'first_name_kanji': customer.first_name_kanji,
            'last_name_katakana': customer.last_name_katakana,
            'first_name_katakana': customer.first_name_katakana,
            'post_code': customer.post_code,
            'prefecture': customer.prefecture,
            'city': customer.city,
            'address_1': customer.address_1,
            'address_2': customer.address_2,
            'phone_1': customer.phone_1,
            'phone_1_type': customer.phone_1_type,
            'phone_2': customer.phone_2,
            'phone_2_type': customer.phone_2_type,
            'birthday': customer.birthday,
            'age': age,
            'grade': customer.grade,
            'status': customer.status,
            'payment_method': customer.payment_method,
            'lifetime': customer.lifetime,
        }

    # GET CUSTOMER NOTES
    if all_post.get('parameter') == 'GET_NOTES':
        customer_id = all_post.get('customer_id') # get cusotmer id
        customer = CustomerProfile.objects.get(id=customer_id)

        notes = Notes.objects.filter(customer_id=customer).order_by('-date', '-time')
        archived_count = 0
        unarchived_count = 0

        all_notes = []
        for x in notes:
            # if no instructor is assigned to note
            if x.instructor_1:
                instructor = UserProfile.objects.get(user=x.instructor_1)
                instructor_last_name_kanji = instructor.last_name_kanji
                instructor_first_name_kanji = instructor.first_name_kanji
                instructor_id = x.instructor_1.id
            else:
                instructor_last_name_kanji = None
                instructor_first_name_kanji = None
                instructor_id = None

            # if no instructor_2 is assigned to note
            if x.instructor_2:
                instructor_2 = UserProfile.objects.get(user=x.instructor_2)
                instructor_2_last_name_kanji = instructor_2.last_name_kanji
                instructor_2_first_name_kanji = instructor_2.first_name_kanji
                instructor_2_id = x.instructor_2.id
            else:
                instructor_2_last_name_kanji = None
                instructor_2_first_name_kanji = None
                instructor_2_id = None

            note = {
                'note_id': x.id,
                'date': x.date,
                'time': x.time,
                'type': x.type,
                'instructor': instructor_id,
                'instructor_last_name_kanji': instructor_last_name_kanji,
                'instructor_first_name_kanji': instructor_first_name_kanji,
                'instructor_2': instructor_2_id,
                'instructor_2_last_name_kanji': instructor_2_last_name_kanji,
                'instructor_2_first_name_kanji': instructor_2_first_name_kanji,
                'note_text': x.note_text,
                'archived': x.archived,
            }
            all_notes.append(note)

            if x.archived == True:
                archived_count += 1
            else:
                unarchived_count += 1

        data = {
            'all_notes': all_notes,
            'archived_count': archived_count,
            'unarchived_count': unarchived_count,
            'enrollmentStatus': customer.status,
        }

    # UPDATE NOTE ARCHIVED STATUS
    if all_post.get('parameter') == 'UPDATE_NOTE_ARCHIVED_STATUS':
        note_id         = all_post.get('note_id') # gets note id
        archive_bool    = all_post.get('archive') # gets archive boolean (true = archive, false = unarchive)

        note = Notes.objects.get(id=note_id) # gets note

        if archive_bool == 'false': # unarchives note
            note.archived = False
            note.save()
        else: # archives note
            note.archived = True
            note.save()

        # CHANGELOG
        note_changelog = NotesChangelog()

        if note.instructor_1:
            instructor_1 = note.instructor_1.id
        else:
            instructor_1 = 0
        if note.instructor_2:
            instructor_2 = note.instructor_2.id
        else:
            instructor_2 = 0
        # changelog meta data
        note_changelog.changelog_note   = note.id
        note_changelog.changelog_user   = request.user.id
        note_changelog.changelog_type   = 3
        # changelog mirrored data
        note_changelog.customer_id      = note.customer_id.id
        note_changelog.date             = note.date
        note_changelog.time             = note.time
        note_changelog.type             = note.type
        note_changelog.instructor_1     = instructor_1
        note_changelog.instructor_2     = instructor_2
        note_changelog.note_text        = note.note_text
        note_changelog.archived         = note.archived
        # saves changelog record
        note_changelog.save()

        data = {
            'status': 'SUCCESS!',
        }

    return JsonResponse(data)
# ======================== ACCESS LOG ========================
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def accessLog(request):
    log = AccessLog()
    log.accesslog_url               = request.path
    log.accesslog_user              = request.user.id
    log.accesslog_post_parameters   = request.POST
    log.accesslog_get_parameters    = request.GET
    log.save()

    # print('================= ACCESS LOG ==================')
    # print('URL:', log.accesslog_url)
    # print('USER:', log.accesslog_user)
    # print('DATE/TIME:', log.accesslog_date_time)
    # print('POST PARAMETERS:', log.accesslog_post_parameters)
    # print('GET PARAMETERS:', log.accesslog_get_parameters)
    # print('===============================================')

# ======================== INCREMENT STUDENT YEAR ========================
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def incrementStudentYear(request):
    customers = CustomerProfile.objects.all()
    print(f"CUSTOMER COUNT: {customers.count()}")

    for x in customers:
        print('-------')
        print(x.last_name_romaji, x.first_name_romaji)
        print(x.last_name_kanji, x.first_name_kanji)
        print(x.last_name_katakana, x.first_name_katakana)
        print(x.grade)
        if x.grade != 0 and x.grade != 20:
            x.grade += 1
            # x.save()
        print(x.grade)

    data = {
        'customerCount': customers.count(),
    }

    return JsonResponse(data)