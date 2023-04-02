from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse

from logs.models import AccessLog
from class_list.models import ClassListChangelog
from customer.models import CustomerProfileChangelog, NotesChangelog, CustomerProfile

# ANALYTICS API
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Superusers']).exists())
def AnalyticsAPI(request):
    all_post = request.POST # get all post data
    parameter = all_post.get('parameter') # get parameter

    if parameter == 'GET_ACCESSLOG_ALL':
        batch_number = all_post.get('batch_number') # get batch number

        batch_size = 100 # sets number of records to fetch per batch
        start_position = int(batch_number) * batch_size # start position for slice
        end_position = start_position + batch_size # end position for slice

        records = AccessLog.objects.all() # get records
        records = records.order_by('-accesslog_date_time') # orders records
        # records = records.filter(accesslog_user=2) # filters records
        records = records[start_position:end_position] # slice records
        
        serialized_records = [] # serializes accesslog records
        for x in records:
            record = {
                'id': x.id,
                'url': x.accesslog_url,
                'dateTime': x.accesslog_date_time,
                'user': x.accesslog_user,
                'postParameters': x.accesslog_post_parameters[1:-1], # slices out angle brackets at start and end of string
                'getParameters': x.accesslog_get_parameters[1:-1], # slices out angle brackets at start and end of string
            }
            serialized_records.append(record)

        data = {
            'parameter': parameter,
            'records': serialized_records,
            'batchNumber': batch_number,
        }

    if parameter == 'GET_CLASS_CHANGELOG_ALL':
        batch_number = all_post.get('batch_number') # get batch number

        batch_size = 100 # sets number of records to fetch per batch
        start_position = int(batch_number) * batch_size # start position for slice
        end_position = start_position + batch_size # end position for slice

        records = ClassListChangelog.objects.all() # get records
        # records = records.filter(changelog_class=5) # filters records
        records = records.order_by('-changelog_date_time') # orders records
        records = records[start_position:end_position] # slice records
        
        serialized_records = [] # serializes accesslog records
        for x in records:
            record = {
                'id': x.id,
                'changelogClass': x.changelog_class,
                'changelogDateTime': x.changelog_date_time,
                'changelogUser': x.changelog_user,
                'changelogType': x.changelog_type,
                'className': x.class_name,
                'primaryInstructor': x.primary_instructor,
                'irregular': x.irregular,
                'dayOfWeek': x.day_of_week,
                'startTime': x.start_time,
                'students': x.students,
                'archived': x.archived,
                'classType': x.class_type,
            }
            serialized_records.append(record)

        data = {
            'parameter': parameter,
            'records': serialized_records,
            'batchNumber': batch_number,
        }

    if parameter == 'GET_CUSTOMER_CHANGELOG_ALL':
        batch_number = all_post.get('batch_number') # get batch number

        batch_size = 100 # sets number of records to fetch per batch
        start_position = int(batch_number) * batch_size # start position for slice
        end_position = start_position + batch_size # end position for slice

        records = CustomerProfileChangelog.objects.all() # get records
        # records = records.filter(changelog_class=5) # filters records
        records = records.order_by('-changelog_date_time') # orders records
        records = records[start_position:end_position] # slice records
        
        serialized_records = [] # serializes accesslog records
        for x in records:
            record = {
                'id': x.id,
                'changelogCustomerProfile': x.changelog_customer_profile,
                'changelogDateTime': x.changelog_date_time,
                'changelogUser': x.changelog_user,
                'changelogType': x.changelog_type,
                'lastNameRomaji': x.last_name_romaji,
                'firstNameRomaji': x.first_name_romaji,
                'lastNameKanji': x.last_name_kanji,
                'firstNameKanji': x.first_name_kanji,
                'lastNameKatakana': x.last_name_katakana,
                'firstNameKatakana': x.first_name_katakana,
                'postCode': x.post_code,
                'prefecture': x.prefecture,
                'city': x.city,
                'addressOne': x.address_1,
                'addressTwo': x.address_2,
                'phoneOne': x.phone_1,
                'phoneOneType': x.phone_1_type,
                'phoneTwo': x.phone_2,
                'phoneTwoType': x.phone_2_type,
                'birthday': x.birthday,
                'grade': x.grade,
                'status': x.status,
                'paymentMethod': x.payment_method,
                'archived': x.archived,
            }
            serialized_records.append(record)

        data = {
            'parameter': parameter,
            'records': serialized_records,
            'batchNumber': batch_number,
        }

    if parameter == 'GET_NOTES_CHANGELOG_ALL':
        batch_number = all_post.get('batch_number') # get batch number

        batch_size = 100 # sets number of records to fetch per batch
        start_position = int(batch_number) * batch_size # start position for slice
        end_position = start_position + batch_size # end position for slice

        records = NotesChangelog.objects.all() # get records
        # records = records.filter(changelog_class=5) # filters records
        records = records.order_by('-changelog_date_time') # orders records
        records = records[start_position:end_position] # slice records
        
        serialized_records = [] # serializes accesslog records
        for x in records:
            record = {
                'id': x.id,
                'changelogNote': x.changelog_note,
                'changelogDateTime': x.changelog_date_time,
                'changelogUser': x.changelog_user,
                'changelogType': x.changelog_type,
                'customerId': x.customer_id,
                'date': x.date,
                'time': x.time,
                'type': x.type,
                'instructorOne': x.instructor_1,
                'instructorTwo': x.instructor_2,
                'noteText': x.note_text,
                'archived': x.archived,
            }
            serialized_records.append(record)

        data = {
            'parameter': parameter,
            'records': serialized_records,
            'batchNumber': batch_number,
        }

    # DASHBOARD DATA CALL - UNENROLLED PROSPECTIVE STUDENTS
    # unarchived; taken trial or counseling/trial; no signup
    if parameter == 'module001':

        students_all = CustomerProfile.objects.all() # get all students
        students_pre_enrolled = students_all.filter(status=1, archived=False, notes__type__in=[2,4]).order_by('notes__date') # filter students

        students_pre_enrolled_distinct = []
        students_pre_enrolled_id_list = []
        for x in students_pre_enrolled:
            if not x.id in students_pre_enrolled_id_list:
                students_pre_enrolled_distinct.append(x)
                students_pre_enrolled_id_list.append(x.id)

        students = []
        for x in students_pre_enrolled_distinct:
            student = {
                'id': x.id,
                'lastNameKanji': x.last_name_kanji,
                'firstNameKanji': x.first_name_kanji,
                'lastTrialDate': x.notes_set.all().filter(type__in=[2,4]).first().date,
            }
            students.append(student)

        data = {
            'parameter': parameter,
            'students': students,
        }

    # DASHBOARD DATA CALL - COLD LEADS
    # unarchived; contacted; no trial
    if parameter == 'module002':

        students_all = CustomerProfile.objects.all() # get all students
        students_cold = students_all.filter(status=1, archived=False, notes__type=14).exclude(notes__type__in=[2,4]).order_by('notes__date') # filter students

        students_cold_distinct = []
        students_cold_id_list = []
        for x in students_cold:
            if not x.id in students_cold_id_list:
                students_cold_distinct.append(x)
                students_cold_id_list.append(x.id)

        students = []
        for x in students_cold_distinct:
            student = {
                'id': x.id,
                'lastNameKanji': x.last_name_kanji,
                'firstNameKanji': x.first_name_kanji,
                'lastContactDate': x.notes_set.all().filter(type=14).first().date,
            }
            students.append(student)

        data = {
            'parameter': parameter,
            'students': students,
        }

    # DASHBOARD DATA CALL - ATTENDANCE
    # something to do with attendance
    if parameter == 'module003':
        print('======= ATTENDNACE =======')
        data = {
            'parameter': parameter,
        }

    return JsonResponse(data)

# DASHBOARD (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Superusers']).exists())
def Dashboard(request):

    page_title = 'Dashboard'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/dashboard/index.html', context)

# ACCESSLOG - BROWSE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Superusers']).exists())
def AccesslogBrowse(request):

    page_title = 'Access Log - Browse'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/accesslog/browse/index.html', context)

# CHANGELOG - CLASS LIST - BROWSE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Superusers']).exists())
def ChangelogClasslistBrowse(request):

    page_title = 'Change Log - Class List - Browse'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/changelog/class_list/browse/index.html', context)

# CHANGELOG - CUSTOMER - BROWSE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Superusers']).exists())
def ChangelogCustomerBrowse(request):

    page_title = 'Change Log - Customer - Browse'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/changelog/customer/browse/index.html', context)

# CHANGELOG - NOTES - BROWSE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Superusers']).exists())
def ChangelogNotesBrowse(request):

    page_title = 'Change Log - Notes - Browse'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/changelog/notes/browse/index.html', context)