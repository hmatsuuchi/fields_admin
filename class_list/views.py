from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse

from django.contrib.auth.models import User

from .models import ClassList, ClassListChangelog
from customer.models import CustomerProfile
from logs.models import AccessLog
from user_profile.models import UserProfile

# CLASSLIST API
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def classListAPI(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    all_post = request.POST # get all post data
    parameter = all_post.get('parameter') # API parameter
    batch_number = all_post.get('batch_number') # batch number fetched from hidden page meta div
    search_parameter = all_post.get('search_parameter') # gets value of search input field
    display_archived = all_post.get('display_archived') # gets display archived boolean
    day_of_week_filter = all_post.get('day_of_week_filter') # gets list of days of week to include in results
    instructor_filter = all_post.get('instructor_filter') # gets list of instructors to include in results
    class_id = all_post.get('classID')

    if parameter == 'RETRIEVE_ALL':
        class_list_all = ClassList.objects.all() # gets all records

        if display_archived == 'False': # hides archived profiles when set to false
            class_list_all = class_list_all.exclude(archived=True)

        class_list_all = class_list_all.order_by('day_of_week', 'primary_instructor', 'start_time') # orders records

        # filters class list using search parameter
        if search_parameter:
            class_name = class_list_all.filter(class_name__icontains=search_parameter) # filters by class name
            student_last_name_romaji = class_list_all.filter(students__last_name_romaji__icontains=search_parameter) # filters by last_name_romaji
            student_first_name_romaji = class_list_all.filter(students__first_name_romaji__icontains=search_parameter) # filters by first_name_romaji
            student_last_name_kanji = class_list_all.filter(students__last_name_kanji__icontains=search_parameter) # filters by last_name_romaji
            student_first_name_kanji = class_list_all.filter(students__first_name_kanji__icontains=search_parameter) # filters by first_name_romaji
            student_last_name_katakana = class_list_all.filter(students__last_name_katakana__icontains=search_parameter) # filters by last_name_romaji
            student_first_name_katakana = class_list_all.filter(students__first_name_katakana__icontains=search_parameter) # filters by first_name_romaji
            class_list_all = class_name | student_last_name_romaji | student_first_name_romaji | student_last_name_kanji | student_first_name_kanji | student_last_name_katakana | student_first_name_katakana
            class_list_all = class_list_all.distinct()

        class_list_all_serialized = [] # creates empty class list

        # day of week filter
        if day_of_week_filter:
            filter_list = day_of_week_filter.split(',')
            filter_list = filter_list[1:]
            class_list_all = class_list_all.filter(day_of_week__in=filter_list)
        else:
            class_list_all = class_list_all.filter(day_of_week=7)

        # instructor filter
        class_list_temporary = class_list_all
        if instructor_filter:
            filter_list = instructor_filter.split(',')
            filter_list = filter_list[1:]
            class_list_all = class_list_all.filter(primary_instructor__in=filter_list)
        if '0' in filter_list:
            class_list_all = class_list_all | class_list_temporary.filter(primary_instructor = None)

        # pagination controls
        batch_size = 15
        batch_number = int(batch_number)
        start_position = batch_number * batch_size
        end_position = start_position + batch_size
        class_list_all_paginated = class_list_all[start_position:end_position]

        grade_values = [
            '-------',
            '0才',
            '1才',
            '2才',
            '3才',
            '年小',
            '年中',
            '年長',
            '小1',
            '小2',
            '小3',
            '小4',
            '小5',
            '小6',
            '中1',
            '中2',
            '中3',
            '高1',
            '高2',
            '高3',
            '大人',
        ]

        class_type_values = [
                '-------',
                '英会話 ベビー',
                '英会話 未就学児 前半',
                '英会話 未就学児 後半',
                '英会話 小学生',
                '英会話 中学生',
                '英会話 高校生',
                '英会話 大人',
                '個人 40分',
                '個人 50分', 
                '英検 小学生',
                '英検 中学生',
                '英検 高校生',
                '英検 大人',
                '英文法 小学生',
                '英文法 中学生',
                '英文法 高校生',
                '英文法 大人',
            ]

        for x in class_list_all_paginated:
            students = [] # creates empty student list
            for y in x.students.all():
                student = { # serlializes student data
                    'id':                       y.id,
                    'last_name_kanji':          y.last_name_kanji,
                    'first_name_kanji':         y.first_name_kanji,
                    'last_name_katakana':       y.last_name_katakana,
                    'first_name_katakana':      y.first_name_katakana,
                    'grade':                    grade_values[y.grade],
                    'enrollment_status':        y.status,
                }
                students.append(student)

            if x.primary_instructor:
                primary_instructor_id = x.primary_instructor.id
                primary_instructor_last_name_kanji = x.primary_instructor.userprofile.last_name_kanji
            else:
                primary_instructor_id = 0
                primary_instructor_last_name_kanji = ''

            if x.start_time:
                start_time = x.start_time.strftime("%H:%M")
            else:
                start_time = ''

            class_single = { # serlializes class data
                'classID':                          x.id,
                'className':                        x.class_name,
                'primaryInstructorId':              primary_instructor_id,
                'primaryInstructorLastNameKanji':   primary_instructor_last_name_kanji,
                'irregular':                        x.irregular,
                'dayOfWeek':                        x.day_of_week,
                'startTime':                        start_time,
                'students':                         students,
                'archived':                         x.archived,
                'classType':                        class_type_values[x.class_type],
            }
            class_list_all_serialized.append(class_single)

        class_count = class_list_all.count() # gets count of retrieved class records

        data = {
                'parameter': parameter,
                'classListAll': class_list_all_serialized,
                'classCount': class_count,
                'displayArchived': display_archived,
            }

    if parameter == 'CREATE_SINGLE':
        class_name              = all_post.get('class_name')
        primary_instructor_id   = all_post.get('primary_instructor')
        irregular               = all_post.get('irregular')
        day_of_week             = all_post.get('day_of_week')
        start_time              = all_post.get('start_time')
        enrolled_students_ids   = all_post.get('enrolled_students')
        archived                = all_post.get('archived')
        class_type              = all_post.get('class_type')
        return_link             = all_post.get('return_link')

        # gets instructor object
        if primary_instructor_id != '0':
            primary_instructor = User.objects.get(id=primary_instructor_id)
        else:
            primary_instructor = None

        # gets student objects
        enrolled_students = []
        if enrolled_students_ids:
            enrolled_students_list = enrolled_students_ids.split(",")
            enrolled_students = CustomerProfile.objects.filter(pk__in=enrolled_students_list)

        new_class                       = ClassList() # creates new object
        new_class.class_name            = class_name
        new_class.primary_instructor    = primary_instructor
        if irregular == 'false': # converts JS boolean to Python boolean
            new_class.irregular = False
        else:
            new_class.irregular = True
        new_class.day_of_week           = day_of_week
        if start_time:
            new_class.start_time        = start_time
        if class_type:
            new_class.class_type        = class_type
        if archived == 'false':  # converts JS boolean to Python boolean
            new_class.archived = False
        else:
            new_class.archived = True
        new_class.save()
        if enrolled_students:
            for x in enrolled_students:
                new_class.students.add(x)
            new_class.save()

        changelog                       = ClassListChangelog() # creates new object
        # CHANGELOG - META DATA
        changelog.changelog_user            = request.user.id
        changelog.changelog_type            = 1
        changelog.changelog_class           = new_class.id
        # CHANGELOG - MIRRORED DATA
        changelog.class_name                = new_class.class_name
        if new_class.primary_instructor:
            changelog.primary_instructor    = new_class.primary_instructor.id
        else:
            changelog.primary_instructor    = 0
        changelog.irregular                 = new_class.irregular
        changelog.day_of_week               = new_class.day_of_week
        changelog.start_time                = new_class.start_time
        changelog.students                  = enrolled_students_ids
        changelog.archived                  = new_class.archived
        changelog.class_type                = new_class.class_type
        changelog.save()

        data = {
            'parameter': parameter,
            'return_link': return_link,
            'class_id': new_class.id,
        }

    if parameter == 'EDIT_SINGLE':
        class_id                = all_post.get('class_id')
        class_name              = all_post.get('class_name')
        primary_instructor_id   = all_post.get('primary_instructor')
        irregular               = all_post.get('irregular')
        day_of_week             = all_post.get('day_of_week')
        start_time              = all_post.get('start_time')
        enrolled_students_ids   = all_post.get('enrolled_students')
        archived                = all_post.get('archived')
        class_type              = all_post.get('class_type')
        return_link             = all_post.get('return_link')

        # gets instructor object
        if primary_instructor_id != '0':
            primary_instructor = User.objects.get(id=primary_instructor_id)
        else:
            primary_instructor = None

        # gets student objects
        enrolled_students = []
        if enrolled_students_ids:
            enrolled_students_list = enrolled_students_ids.split(",")
            enrolled_students = CustomerProfile.objects.filter(pk__in=enrolled_students_list)

        edit_class                      = ClassList.objects.get(id=class_id) # fetches record to edit
        edit_class.class_name           = class_name
        edit_class.primary_instructor   = primary_instructor
        if irregular == 'false': # converts JS boolean to Python boolean
            edit_class.irregular = False
        else:
            edit_class.irregular = True
        edit_class.day_of_week           = day_of_week
        if start_time:
            edit_class.start_time        = start_time
        if class_type:
            edit_class.class_type        = class_type
        if archived == 'false':  # converts JS boolean to Python boolean
            edit_class.archived = False
        else:
            edit_class.archived = True
        edit_class.save()
        if enrolled_students:
            for x in edit_class.students.all():
                edit_class.students.remove(x)
            for x in enrolled_students:
                edit_class.students.add(x)
            edit_class.save()
        else:
            for x in edit_class.students.all():
                edit_class.students.remove(x)

        changelog                       = ClassListChangelog() # creates new object
        # CHANGELOG - META DATA
        changelog.changelog_user            = request.user.id
        changelog.changelog_type            = 3 # update record
        changelog.changelog_class           = edit_class.id
        # CHANGELOG - MIRRORED DATA
        changelog.class_name                = edit_class.class_name
        if edit_class.primary_instructor:
            changelog.primary_instructor    = edit_class.primary_instructor.id
        else:
            changelog.primary_instructor    = 0
        changelog.irregular                 = edit_class.irregular
        changelog.day_of_week               = edit_class.day_of_week
        changelog.start_time                = edit_class.start_time
        changelog.students                  = enrolled_students_ids
        changelog.archived                  = edit_class.archived
        changelog.class_type                = class_type
        changelog.save()

        data = {
            'parameter': parameter,
            'return_link': return_link,
            'class_id': edit_class.id,
            'jump_to': edit_class.id,
        }

    if parameter == 'DELETE_SINGLE':
        class_id = all_post.get('class_id')

        class_record = ClassList.objects.get(id=class_id)

        # gets student objects
        enrolled_students_ids = []
        for x in class_record.students.all():
            enrolled_students_ids.append(x.id)

        changelog                       = ClassListChangelog() # creates new object
        # CHANGELOG - META DATA
        changelog.changelog_user            = request.user.id
        changelog.changelog_type            = 4 # delete record
        changelog.changelog_class           = class_record.id
        # CHANGELOG - MIRRORED DATA
        changelog.class_name                = class_record.class_name
        if class_record.primary_instructor:
            changelog.primary_instructor    = class_record.primary_instructor.id
        else:
            changelog.primary_instructor    = 0
        changelog.irregular                 = class_record.irregular
        changelog.day_of_week               = class_record.day_of_week
        changelog.start_time                = class_record.start_time
        changelog.students                  = str(enrolled_students_ids)[1:-1]
        changelog.archived                  = class_record.archived
        changelog.class_type                = class_record.class_type
        changelog.save()

        class_record.delete()

        data = {
            'parameter': parameter,
        }

    if parameter == 'GET_FOR_STUDENT':
        customer_id = all_post.get('customer_id')

        enrolled_classes = ClassList.objects.filter(students__id=customer_id).filter(archived=False).order_by('day_of_week', 'start_time')

        class_type_values = [
                '-------',
                '英会話 ベビー',
                '英会話 未就学児 前半',
                '英会話 未就学児 後半',
                '英会話 小学生',
                '英会話 中学生',
                '英会話 高校生',
                '英会話 大人',
                '個人 40分',
                '個人 50分', 
                '英検 小学生',
                '英検 中学生',
                '英検 高校生',
                '英検 大人',
                '英文法 小学生',
                '英文法 中学生',
                '英文法 高校生',
                '英文法 大人',
            ]

        grade_values = [
            '-------',
            '0才',
            '1才',
            '2才',
            '3才',
            '年小',
            '年中',
            '年長',
            '小1',
            '小2',
            '小3',
            '小4',
            '小5',
            '小6',
            '中1',
            '中2',
            '中3',
            '高1',
            '高2',
            '高3',
            '大人',
        ]

        enrolled_classes_serialized = []
        for x in enrolled_classes:
            students = [] # creates empty student list
            for y in x.students.all():
                student = { # serlializes student data
                    'id':                       y.id,
                    'last_name_kanji':          y.last_name_kanji,
                    'first_name_kanji':         y.first_name_kanji,
                    'last_name_katakana':       y.last_name_katakana,
                    'first_name_katakana':      y.first_name_katakana,
                    'grade':                    grade_values[y.grade],
                    'enrollment_status':        y.status,
                }
                students.append(student)

            if (x.start_time):
                start_time_formatted = x.start_time.strftime("%H:%M")
            else:
                start_time_formatted = x.start_time

            class_single = {
                'classID': x.id,
                'className': x.class_name,
                'primaryInstructorLast': x.primary_instructor.userprofile.last_name_kanji,
                'dayOfWeek': x.day_of_week,
                'startTime': start_time_formatted,
                'primaryInstructorID': x.primary_instructor.id,
                'classType': class_type_values[x.class_type],
                'irregular': x.irregular,
                'students': students,
            }
            enrolled_classes_serialized.append(class_single)

        data = {
            'parameter': parameter,
            'classes': enrolled_classes_serialized,
            'enrollmentStatus': CustomerProfile.objects.get(id=customer_id).status,
        }

    if parameter == 'TOGGLE_ARCHIVED_SINGLE':
        this_class = ClassList.objects.get(id=class_id)

        if this_class.archived:
            this_class.archived = False
            this_class.save()
        else:
            this_class.archived = True
            this_class.save()

        data = {
            'parameter': parameter,
        }

    return JsonResponse(data)

# CLASSLIST - BROWSE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def browse(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Class List - Browse'
    return_link = '/class_list/browse'
    user_profile = UserProfile.objects.get(user=request.user)
    display_archived_classes = user_profile.display_archived_classes
    selected_days = user_profile.display_classes_day_of_week
    selected_instructors = user_profile.display_classes_instructors

    # generates active instructor list
    active_instructor_profiles = UserProfile.objects.filter(class_list_active=True).order_by('user__id')
    
    context = {
        'page_title': page_title,
        'return_link': return_link,
        'display_archived_classes': display_archived_classes,
        'selected_days': selected_days,
        'selected_instructors': selected_instructors,
        'active_instructor_profiles': active_instructor_profiles,
    }
    
    return render(request, 'class_list/browse/index.html', context)

# CLASSLIST - CREATE
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def create(request):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)
    page_title = 'Class List - Create'

    all_post = request.GET # gets all GET parameters
    return_link = all_post.get('return_link') # gets return link

    # instructor list used in dropdown menu
    # generates active instructor list
    active_instructor_profiles = UserProfile.objects.filter(class_list_active=True).order_by('user__id')
    all_instructor_list = [(0, '-------')]
    for x in active_instructor_profiles:
        tupple = x.user.id, x.last_name_kanji + x.first_name_kanji
        all_instructor_list.append(tupple)

    # day of week list used in dropdown menu
    day_of_week_list = [
        (7, '-------'),
        (0, '日曜日'),
        (1, '月曜日'),
        (2, '火曜日'),
        (3, '水曜日'),
        (4, '木曜日'),
        (5, '金曜日'),
        (6, '土曜日'),
    ]

    # class type list used in dropdown menu
    class_type_list = [
        (0, '-------'),
        (1, '英会話 ベビー'),
        (2, '英会話 未就学児 前半'),
        (3, '英会話 未就学児 後半'),
        (4, '英会話 小学生'),
        (5, '英会話 中学生'),
        (6, '英会話 高校生'),
        (7, '英会話 大人'),
        (8, '個人 40分'),
        (9, '個人 50分'),
        (10, '英検 小学生'),
        (12, '英検 中学生'),
        (13, '英検 高校生'),
        (14, '英検 大人'),
        (15, '英文法 小学生'),
        (16, '英文法 中学生'),
        (17, '英文法 高校生'),
        (18, '英文法 大人'),
    ]

    # generates student dropdown list
    all_students_list = CustomerProfile.objects.all()
    
    context = {
        'page_title': page_title,
        'all_instructor_list': all_instructor_list,
        'day_of_week_list': day_of_week_list,
        'all_students_list': all_students_list,
        'class_type_list': class_type_list,
        'return_link': return_link,
    }
    
    return render(request, 'class_list/create/index.html', context)

# CLASSLIST - EDIT
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def edit(request, class_id):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)
    page_title = 'Class List - Edit'

    all_post = request.GET # gets all GET parameters
    return_link = all_post.get('return_link') # gets return link

    class_object = ClassList.objects.get(id=class_id)

    # generates student dropdown list
    all_students_list = CustomerProfile.objects.all()

    # instructor list used in dropdown menu
    active_instructor_profiles = UserProfile.objects.filter(class_list_active=True).order_by('user__id')
    all_instructor_list = [(0, '-------')]
    for x in active_instructor_profiles:
        tupple = x.user.id, x.last_name_kanji + x.first_name_kanji
        all_instructor_list.append(tupple)

    # day of week list used in dropdown menu
    day_of_week_list = [
        (7, '-------'),
        (0, '日曜日'),
        (1, '月曜日'),
        (2, '火曜日'),
        (3, '水曜日'),
        (4, '木曜日'),
        (5, '金曜日'),
        (6, '土曜日'),
    ]

    # class type list used in dropdown menu
    class_type_list = [
        (0, '-------'),
        (1, '英会話 ベビー'),
        (2, '英会話 未就学児 前半'),
        (3, '英会話 未就学児 後半'),
        (4, '英会話 小学生'),
        (5, '英会話 中学生'),
        (6, '英会話 高校生'),
        (7, '英会話 大人'),
        (8, '個人 40分'),
        (9, '個人 50分'),
        (10, '英検 小学生'),
        (11, '英検 中学生'),
        (12, '英検 高校生'),
        (13, '英検 大人'),
        (14, '英文法 小学生'),
        (15, '英文法 中学生'),
        (16, '英文法 高校生'),
        (17, '英文法 大人'),
    ]

    class_data = {
        'class_id': class_id,
        'class_name': class_object.class_name,
        'primary_instructor': class_object.primary_instructor,
        'irregular': class_object.irregular,
        'day_of_week': class_object.day_of_week,
        'start_time': str(class_object.start_time),
        'class_type': class_object.class_type,
        'archived': class_object.archived,
    }

    enrolled_students = []
    enrolled_students_ids = []
    for x in class_object.students.all():
        current_student = [x.id, x.last_name_kanji, x.first_name_kanji]
        enrolled_students.append(current_student)
        enrolled_students_ids.append(x.id)
    
    context = {
        'page_title': page_title,
        'all_students_list': all_students_list,
        'all_instructor_list': all_instructor_list,
        'day_of_week_list': day_of_week_list,
        'class_type_list': class_type_list,
        'class_data': class_data,
        'enrolled_students': enrolled_students,
        'enrolled_students_ids': enrolled_students_ids,
        'return_link': return_link,
    }
    
    return render(request, 'class_list/edit/index.html', context)

# CLASSLIST - DELETE CONFIRMATION
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def deleteConfirm(request, class_id):
    accessLog(request) # accesslog (url, user, date/time, POST parameters)

    page_title = 'Class List - Delete Confirmation'

    all_post = request.GET # gets all GET parameters
    return_link = all_post.get('return_link') # gets return link

    current_class = ClassList.objects.get(id=class_id)

    # class type list used in dropdown menu
    class_type_values = [
            '-------',
            '英会話 ベビー',
            '英会話 未就学児 前半',
            '英会話 未就学児 後半',
            '英会話 小学生',
            '英会話 中学生',
            '英会話 高校生',
            '英会話 大人',
            '個人 40分',
            '個人 50分', 
            '英検 小学生',
            '英検 中学生',
            '英検 高校生',
            '英検 大人',
            '英文法 小学生',
            '英文法 中学生',
            '英文法 高校生',
            '英文法 大人',
        ]

    # creates a list of values used when displaying class delete confirmation page
    active_instructor_profiles = UserProfile.objects.all().order_by('user__id')
    instructor_values = ['-------']
    for x in active_instructor_profiles:
        if x.last_name_kanji:
            string = x.last_name_kanji + '先生'
        else:
            string = 'UNKNOWN'
        instructor_values.append(string)

    grade_choices_values = [
        '-------',
        '0才',
        '1才',
        '2才',
        '3才',
        '年小',
        '年中',
        '年長',
        '小1',
        '小2',
        '小3',
        '小4',
        '小5',
        '小6',
        '中1',
        '中2',
        '中3',
        '高1',
        '高2',
        '高3',
        '大人',
    ]

    student_list = []
    for x in current_class.students.all():
        student_list.append([x.id, x.last_name_kanji, x.first_name_kanji, x.last_name_katakana, x.first_name_katakana, grade_choices_values[x.grade]])

    if current_class.primary_instructor:
        instructor = instructor_values[current_class.primary_instructor.id]
    else:
        instructor = ''

    class_data = {
        'id': current_class.id,
        'name': current_class.class_name,
        'day_of_week': current_class.day_of_week,
        'start_time': current_class.start_time,
        'primary_instructor': current_class.primary_instructor,
        'primary_instructor_name': instructor,
        'class_type': class_type_values[current_class.class_type],
        'irregular': current_class.irregular,
        'student_list': student_list,
    }

    context = {
            'page_title': page_title,
            'return_link': return_link,
            'class_data': class_data,
        }
    
    return render(request, 'class_list/delete_confirm/index.html', context)

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