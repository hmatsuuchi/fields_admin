from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse

from .models import UserProfile
from customer.models import CustomerProfile
from logs.models import AccessLog

def loginPage(request):
    page_title = 'User Profiles - Login'

    next = request.GET.get('next')
    if not next:
        next = '/customer/browse'

    context = {
        'page_title': page_title,
        'next': next,
    }
    
    return render(request, 'user_profile/login/index.html', context)

def loginAuthenticate(request):
    username = request.POST['username']
    password = request.POST['password']

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        data = {
            'status_response': True,
        }
        return JsonResponse(data)
    else:
        data = {
            'status_response': False,
        }
        return JsonResponse(data)

def logoutUser(request):
    logout(request)
    response = redirect('/user_profile/login')
    return response

# adds and removes customer profile ids from the FLAGGED PROFILES manytomany relationship
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def flagCustomer(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    user = request.user

    customer_id = request.POST['customer']
    customer = CustomerProfile.objects.get(id=customer_id)

    user_meta = UserProfile.objects.get(user=user)
    flagged_profiles = user_meta.flagged_profiles

    if customer in flagged_profiles.all():
        flagged_profiles.remove(customer)
        data = {
            'flag_status': False,
            'customer_id': customer_id,
            }
    else:
        flagged_profiles.add(customer)
        data = {
            'flag_status': True,
            'customer_id': customer_id,
        }

    return JsonResponse(data)

# modifies users sticky preferences
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def setUserPreference(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)
    output = '' # default output value; used by display archived classes to communicate status to DOM

    # gets POST values
    preference = request.POST['preference']
    value = request.POST['value']

    # gets logged in user
    user_meta = UserProfile.objects.get(user=request.user)

    # toggles display profiles archived boolean
    if preference == 'archive' and user_meta.display_archived_profiles == True:
        user_meta.display_archived_profiles = False
        user_meta.save()
        output = False #indicates new status in JSON response
    elif preference == 'archive' and user_meta.display_archived_profiles == False:
        user_meta.display_archived_profiles = True
        user_meta.save()
        output = True #indicates new status in JSON response

    # toggles display notes archived boolean
    if preference == 'display_archived_notes' and user_meta.display_archived_notes == True:
        user_meta.display_archived_notes = False
        user_meta.save()
        output = False #indicates new status in JSON response
    elif preference == 'display_archived_notes' and user_meta.display_archived_notes == False:
        user_meta.display_archived_notes = True
        user_meta.save()
        output = True #indicates new status in JSON response

    # toggles display class archived boolean
    if preference == 'display_archived_classes' and user_meta.display_archived_classes == True:
        user_meta.display_archived_classes = False
        user_meta.save()
        output = False #indicates new status in JSON response
    elif preference == 'display_archived_classes' and user_meta.display_archived_classes == False:
        user_meta.display_archived_classes = True
        user_meta.save()
        output = True #indicates new status in JSON response

    # toggles display classes day of week
    if preference == 'display_classes_day_of_week':
        user_meta.display_classes_day_of_week = value
        user_meta.save()
        output = value # indicates value list in JSON response

    # toggles display instructor day of week
    if preference == 'display_classes_instructors':
        user_meta.display_classes_instructors = value
        user_meta.save()
        output = value # indicates value list in JSON response

    # toggles expanded attendance view
    if preference == 'attendance_expanded_view':
        if value == 'true':
            value_bool = True
        else:
            value_bool = False

        user_meta.attendance_expanded_view_active = value_bool
        user_meta.save()

    # toggles attendance instructor filters
    if preference == 'display_attendance_instructors':
        user_meta = UserProfile.objects.get(user = request.user)
        filter_string = user_meta.display_attendance_instructors
        
        filter_list = []
        if filter_string:
            filter_list = filter_string.split(",")
            filter_list = [eval(i) for i in filter_list]

        value_int = int(value)
        if value_int in filter_list:
            filter_list.remove(value_int)
        else:
            filter_list.append(value_int)

        filter_list_string = ''
        for x in filter_list:
            filter_list_string += ","
            filter_list_string += str(x)

        filter_list_string = filter_list_string[1:]

        user_meta.display_attendance_instructors = filter_list_string
        user_meta.save()

    data = {
        'preference': preference,
        'value': value,
        'output': output, # display archived classes value
    }

    return JsonResponse(data)

# gets user preference data
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def getUserPreference(request):
    preference = request.POST['preference']
    user_meta = UserProfile.objects.get(user=request.user)
    value = getattr(user_meta, preference)

    print(preference)
    print(value)

    data = {
        'preference': preference,
        'value': value,
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