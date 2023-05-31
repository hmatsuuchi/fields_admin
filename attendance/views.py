from asyncio import AbstractEventLoop
from xml.etree.ElementPath import prepare_descendant
from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.core import serializers

import json
from datetime import datetime

from django.contrib.auth.models import User

from user_profile.models import UserProfile

from .models import Attendance as AttendanceModel, StudentAttendance
from class_list.models import ClassList
from customer.models import CustomerProfile

# ATTENDANCE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def Attendance(request):

    page_title = 'Attendance'

    current_user = request.user
    user_profile = UserProfile.objects.get(user = current_user)

    expanded_view_active = user_profile.attendance_expanded_view_active
    
    context = {
        'page_title': page_title,
        'expanded_view_active': expanded_view_active,
    }
    
    return render(request, 'attendance/index.html', context)

# ATTENDANCE API
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def AttendanceAPI(request):
    all_post = request.POST
    parameter = all_post.get('parameter')

    if parameter == 'get_attendance_data_for_date':
        date = all_post.get('date') # get attendance records for this date

        # creates list of instructor ids used to filter attendance records
        user_profile = UserProfile.objects.get(user = request.user)
        active_instructors_string = user_profile.display_attendance_instructors

        # filters by current date
        all_records = AttendanceModel.objects.filter(date=date).order_by('start_time')
        # filters by active instructors
        active_instructors_list = []
        if active_instructors_string:
            active_instructors_list = active_instructors_string.split(",")
        if '0' in active_instructors_list:
            all_records = all_records.filter(instructor__isnull=True) | all_records.filter(instructor__in=active_instructors_list)
        else:
            all_records = all_records.filter(instructor__in=active_instructors_list)
        all_records_serlialized = serializers.serialize("json", all_records)

        # parses attendance record content
        previous_content_list = []
        current_content_list = []
        previous_date_list = []

        for x in all_records:
            previous_record = AttendanceModel.objects.all().filter(linked_class=x.linked_class, date__lt=x.date).order_by("-date").first()
            current_record = x

            previous_record_content = []
            current_record_content = []
            
            if previous_record and previous_record.content.all():
                previous_content = previous_record.content.all().order_by('content_materials')
                for y in previous_content:                    
                    previous_record_content.append({'id': y.id, 'material': y.content_materials.title, 'start': y.content_start, 'end': y.content_end})

            current_content = current_record.content.all().order_by('content_materials')
            for y in current_content:
                current_record_content.append({'id': y.id, 'material': y.content_materials.title, 'start': y.content_start, 'end': y.content_end})

            previous_content_list.append(previous_record_content)
            current_content_list.append(current_record_content)
            if previous_record:
                previous_date_list.append(previous_record.date)
            else:
                previous_date_list.append('no_date')

        all_classes = ClassList.objects.filter(attendance__in=all_records).distinct()
        all_classes_serialized = serializers.serialize("json", all_classes)

        all_attendance = StudentAttendance.objects.filter(attendance_record__in=all_records)
        all_attendance_serialized = serializers.serialize("json", all_attendance)

        # need to include both students from class list and students from attendance records
        all_students_from_attendance = CustomerProfile.objects.filter(studentattendance__in=all_attendance)
        all_students_from_class_list = CustomerProfile.objects.filter(classlist__in=all_classes)

        all_students = all_students_from_attendance | all_students_from_class_list
        all_students = all_students.distinct()

        all_students_serialized = serializers.serialize("json", all_students)

        all_instructors = UserProfile.objects.filter(user__groups__name='Instructors')
        all_instructors_serialized = serializers.serialize("json", all_instructors)

        class_type_lookup_list = ClassList.class_type.field.choices

        # gets all active instructors for dropdown menu
        all_instructors = User.objects.filter(userprofile__attendance_record_active=True)

        instructors = []
        for x in all_instructors:
            instructor = {
                'id': x.id,
                'last_name_kanji': x.userprofile.last_name_kanji,
                'first_name_kanji': x.userprofile.first_name_kanji,
            }
            
            instructors.append(instructor)

        data = {
            'parameter': parameter, # API parameter
            'date': date, # get attendance records for this date
            'allRecords': all_records_serlialized, # all record data
            'allClasses': all_classes_serialized, # all associated class data
            'allAttendance': all_attendance_serialized, # all associated attendance data
            'allStudents': all_students_serialized, # all associated student data
            'allInstructors': all_instructors_serialized, # all associated instructor data
            'classTypeLookupList': class_type_lookup_list, # dictionary of integer values and matching class type descriptive text
            'allInstructorChoices': instructors, # list of all active instructors for use in dropdown menus
            'currentContent': current_content_list, # list of all content covered in current attendance record
            'previousContent': previous_content_list, # list of all content covered in previous attendance record
            'previousDate': previous_date_list, # list of dates of previous attendance content records
        }

    # GET ALL ACTIVE CLASSES
    if parameter == 'get_all_active_classes':
        all_classes = ClassList.objects.filter(archived=False).order_by('day_of_week', 'primary_instructor', 'start_time') # gets all unarchived classes
        
        status_css = [
            'unknown',
            'pre-enrolled',
            'enrolled',
            'short-absence',
            'long-absence',
        ]

        classes = []
        for x in all_classes:
            student_meta = '' # instantiates student meta string for current class
            student_list = []
            for y in x.students.all():
                student = {
                    'id': y.id,
                    'lastNameKanji': y.last_name_kanji,
                    'firstNameKanji': y.first_name_kanji,
                    'lastNameKatakana': y.last_name_katakana,
                    'firstNameKatakana': y.first_name_katakana,
                    'status': y.status,
                    'statusCSS': status_css[y.status],
                    'grade': y.get_grade_display(),
                }

                student_list.append(student)

                student_meta += y.last_name_kanji
                student_meta += y.first_name_kanji
                student_meta += y.last_name_katakana
                student_meta += y.first_name_katakana
                student_meta += y.last_name_romaji
                student_meta += y.first_name_romaji

            # generates instructor string used in real-time client-side JS search
            instructor_meta = ''
            if x.primary_instructor.userprofile.last_name_kanji:
                instructor_meta += x.primary_instructor.userprofile.last_name_kanji
            if x.primary_instructor.userprofile.first_name_kanji:
                instructor_meta += x.primary_instructor.userprofile.first_name_kanji
            if x.primary_instructor.userprofile.last_name_katakana:
                instructor_meta += x.primary_instructor.userprofile.last_name_katakana
            if x.primary_instructor.userprofile.first_name_katakana:
                instructor_meta += x.primary_instructor.userprofile.first_name_katakana
            if x.primary_instructor.userprofile.last_name_romaji:
                instructor_meta += x.primary_instructor.userprofile.last_name_romaji
            if x.primary_instructor.userprofile.first_name_romaji:
                instructor_meta += x.primary_instructor.userprofile.first_name_romaji
            instructor_id = x.primary_instructor.id

            single_class = {
                'id': x.id,
                'className': x.class_name,
                'primaryInstructor': x.primary_instructor.id,
                'primaryInstructorLastName': x.primary_instructor.userprofile.last_name_kanji,
                'instructorMeta': instructor_meta,
                'instructorID': instructor_id,
                'studentMeta': student_meta,
                'irregular': x.irregular,
                'dayOfWeek': x.day_of_week,
                'startTime': str(x.start_time)[:5],
                'students': student_list,
                'archived': x.archived,
                'classType': x.get_class_type_display(),
            }

            classes.append(single_class)

        data = {
            'parameter': parameter,
            'classes': classes,
        }

    # GET ALL ACTIVE STUDENTS
    if parameter == 'get_all_active_students':
        all_students = CustomerProfile.objects.filter(archived=False) # get unarchived students

        students = []
        for x in all_students:
            student = {
                'id': x.id,
                'lastNameRomaji': x.last_name_romaji,
                'firstNameRomaji': x.first_name_romaji,
                'lastNameKanji': x.last_name_kanji,
                'firstNameKanji': x.first_name_kanji,
                'lastNameKatakana': x.last_name_katakana,
                'firstNameKatakana': x.first_name_katakana,
                'grade': x.get_grade_display(),
            }
            
            students.append(student)

        data = {
            'parameter': parameter,
            'students': students,
        }

    # GET ALL ACTIVE INSTRUCTORS
    if parameter == 'get_all_active_instructors':
        all_instructors = User.objects.filter(userprofile__attendance_record_active=True)

        instructors = []
        for x in all_instructors:
            instructor = {
                'id': x.id,
                'last_name_kanji': x.userprofile.last_name_kanji,
                'first_name_kanji': x.userprofile.first_name_kanji,
            }
            
            instructors.append(instructor)

        data = {
            'parameter': parameter,
            'instructors': instructors,
        }

    # ATTENDANCE RECORD - CREATE
    if parameter == 'attendance_record_create':
        date = all_post.get('date')

        record = AttendanceModel()
        record.date = date
        record.save()

        data = {
            'parameter': parameter,
            'recordID': record.id,
        }

    # ATTENDANCE RECORD - ADD CLASS
    if parameter == 'attendance_record_add_class':
        record_id = all_post.get('record_id')
        class_id = all_post.get('class_id')
        start_time = all_post.get('start_time')
        instructor_id = all_post.get('instructor')

        record_to_edit = AttendanceModel.objects.get(id=record_id)
        class_to_add = ClassList.objects.get(id=class_id)

        instructor = User.objects.get(id = instructor_id)

        record_to_edit.linked_class = class_to_add
        record_to_edit.start_time = start_time
        record_to_edit.instructor = instructor

        record_to_edit.save()

        data = {
            'parameter': parameter,
            'recordID': record_id,
            'classID': class_id,
        }

    # ATTENDANCE RECORD - DELETE RECORD
    if parameter == 'record_delete':
        record_id = all_post.get('record_id')

        record = AttendanceModel.objects.get(id=record_id)
        record.delete()

        data = {
            'parameter': parameter,
            'recordID': record_id,
        }

    # ATTENDANCE RECORD - DELETE RECORD MULTIPLE
    if parameter == 'record_delete_multiple':
        record_id_list = json.loads(all_post.get('record_id_list'))

        for x in record_id_list:
            record = StudentAttendance.objects.get(id=x)
            record.delete()

        data = {
            'parameter': parameter,
            'recordID': record_id_list,
        }
    
    # ATTENDANCE RECORD - UPDATE START TIME
    if parameter == 'attendance_record_update_time':
        record_id = all_post.get('record_id')
        start_time = all_post.get('start_time')

        record = AttendanceModel.objects.get(id=record_id)
        if start_time == '':
            record.start_time = None
        else:
            record.start_time = start_time
        record.save()

        data = {
            'parameter': parameter,
            'recordID': record_id,
            'startTime': start_time,
        }

    # ATTENDANCE RECORD - UPDATE INSTRUCTOR
    if parameter == 'attendance_record_update_instructor':
        record_id = all_post.get('record_id')
        instructor_id = all_post.get('instructor_id')

        if instructor_id != '0':
            instructor = User.objects.get(id=instructor_id)

            record = AttendanceModel.objects.get(id=record_id)
            record.instructor = instructor
            record.save()

            data = {
                'parameter': parameter,
                'recordID': record_id,
                'instructorID': instructor_id,
            }
        else:
            record = AttendanceModel.objects.get(id=record_id)
            record.instructor = None
            record.save()

            data = {
                'parameter': parameter,
                'recordID': record_id,
                'instructorID': instructor_id,
            }

    # ATTENDANCE RECORD - ADD MULTIPLE STUDENT ATTENDANCE RECORDS TO DATABASE
    if parameter == 'attendance_record_add_student_attendance_multiple':
        # attendance record
        record_id = all_post.get('record_id')
        record = AttendanceModel.objects.get(id=record_id)

        # students within attendance record
        attendance_record_string = all_post.get('attendance_list')
        attendance_record_list = json.loads(attendance_record_string)

        # student attendance record ID list to be returned
        student_attendance_id_list = []

        # creates new student attendance records for each student
        for x in attendance_record_list:
            sub_list = json.loads(x)

            attendance_new = StudentAttendance() # create new student attendance

            # associates attendance record
            attendance_new.attendance_record = record
            # associates student
            student = CustomerProfile.objects.get(id=sub_list[0])
            attendance_new.student = student
            # associates status
            attendance_new.attendance_status = 0
            # saves student attendanc record
            attendance_new.save()

            student_attendance_id_list.append(attendance_new.id)

        data = {
            'parameter': parameter,
            'recordID': record_id,
            'studentAttendanceIDList': student_attendance_id_list,
        }

    # ATTENDANCE RECORD - ADD STUDENT ATTENDANCE RECORD TO DATABASE
    if parameter == 'attendance_record_add_student_attendance_single':
        # attendance record
        record_id = all_post.get('record_id')
        record = AttendanceModel.objects.get(id=record_id)

        # student record
        student_id = all_post.get('student_id')
        student = CustomerProfile.objects.get(id=student_id)

        # creates new student attendance records
        attendance_new = StudentAttendance()
        # associates attendance record
        attendance_new.attendance_record = record
        # associates student
        attendance_new.student = student
        # associates status
        attendance_new.attendance_status = 0
        # saves student attendanc record
        attendance_new.save()

        data = {
            'parameter': parameter,
            'recordID': record_id,
            'studentAttendanceIDList': attendance_new.id,
        }

    # ATTENDANCE RECORD - TOGGLE STUDENT ATTENDANCE STATUS
    if parameter == 'attendance_record_toggle_attendance_status':
        # student attendance record
        record_id = all_post.get('record_id')
        record = StudentAttendance.objects.get(id=record_id)

        # attendance status
        attendance_status = all_post.get('attendance_status')
        record.attendance_status = attendance_status

        record.save()

        data = {
            'parameter': parameter,
            'recordID': record_id,
            'status': attendance_status,
        }

    # ATTENDANCE RECORD - REMOVE STUDENT ATTENDANCE STATUS
    if parameter == 'attendance_record_remove_attendance_status':
        # student attendance record
        record_id = all_post.get('record_id')
        record = StudentAttendance.objects.get(id=record_id)

        record.delete()

        data = {
            'parameter': parameter,
            'recordID': record_id,
        }
    
    # POPULATE ATTENDANCE RECORDS FOR DATE
    if parameter == 'populate_for_date':
        date_string = all_post.get('date') # currently displayed date value
        date = datetime.strptime(date_string, '%Y-%m-%d')
        day_of_week = date.weekday() # returns int; monday is 0

        day_of_week_conversion_dict = {
            0: 1,
            1: 2, 
            2: 3,
            3: 4,
            4: 5,
            5: 6,
            6: 7,
            7: 0,
        }

        # loaded_classes = json.loads(all_post.get('loaded_classes')) # get list of classes which already exist in day's attendance

        created_attendance = AttendanceModel.objects.filter(date=date)
        loaded_classes_value_list = created_attendance.values_list('linked_class', flat=True)

        classes = ClassList.objects.filter(day_of_week=day_of_week_conversion_dict[day_of_week]).filter(archived=False).exclude(id__in=loaded_classes_value_list)

        # creates new attendance records for missing classes
        for x in classes:
            record = AttendanceModel()
            record.linked_class = x
            record.date = date
            record.start_time = x.start_time
            record.instructor = x.primary_instructor
            record.save()

            for y in x.students.all():
                attendance = StudentAttendance()
                attendance.attendance_record = record
                attendance.student = y
                attendance.attendance_status = 0
                attendance.save()

        data = {
            'parameter': parameter,
        }

    # GET ATTENDANCE FOR STUDENT
    if parameter == 'get_attendance_for_student':
        student_id = all_post.get('student_id')

        student_attendance_all  = StudentAttendance.objects.filter(student=student_id).distinct().order_by('-attendance_record__date')
        if student_attendance_all:
            attendance_records_all  = AttendanceModel.objects.filter(studentattendance__in=student_attendance_all).distinct()
            classes_all             = ClassList.objects.filter(attendance__in=attendance_records_all).distinct()

            present                 = student_attendance_all.filter(attendance_status = 1)
            present_count           = present.count()
            absent                  = student_attendance_all.filter(attendance_status = 2)
            absent_count            = absent.count()
            all_count               = present_count + absent_count

            absent_rate             = absent_count / (absent_count + present_count) * 100
            absent_rate_round       = round(absent_rate, 1)

            present_rate            = present_count / (present_count + absent_count) * 100
            present_rate_round      = round(present_rate, 1)

            data = {
                'parameter': parameter,
                'studentAttendanceAll': serializers.serialize('json', student_attendance_all),
                'attendanceRecordsAll': serializers.serialize('json', attendance_records_all),
                'classesAll': serializers.serialize('json', classes_all),
                'presentCount': present_count,
                'absentCount': absent_count,
                'allCount': all_count,
                'presentRate': present_rate_round,
                'absentRate': absent_rate_round,
                'enrollmentStatus': CustomerProfile.objects.get(id=student_id).status,
                'noData': False,
            }
        else:
            data = {
                'noData': True,
            }

    # LIST OF ALL TEACHERS AND LIST OF FILTERED TEACHERS
    if parameter == 'get_teacher_filter_data':

        active_teachers = UserProfile.objects.filter(attendance_record_active = True)
        active_teachers_serlialized = serializers.serialize('json', active_teachers)

        current_user = UserProfile.objects.get(user = request.user)
        teacher_filter = current_user.display_attendance_instructors

        data = {
            'parameter': parameter,
            'instructors': active_teachers_serlialized,
            'activeInstructors': teacher_filter,
        }
    
    return JsonResponse(data)