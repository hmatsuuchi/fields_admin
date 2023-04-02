from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
# from django.core import serializers
import statistics # remove this import after calculate lessons per student is moved to crontab

from datetime import datetime, timedelta

from .models import AttendanceAnalyticsWeek, AttendanceAnalyticsDay, AttendanceAnalyticsMonth, StudentLifetime, StudentDemographics, LessonsPerStudent
from logs.models import AccessLog
from class_list.models import ClassListChangelog
from customer.models import CustomerProfile, CustomerProfileChangelog, NotesChangelog
from attendance.models import Attendance, StudentAttendance

# ANALYTICS API
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def AnalyticsAPI(request):
    all_post = request.POST # get all post data
    parameter = all_post.get('parameter') # get parameter

    if parameter == 'get_analytics_data_for_student':
        student_id = all_post.get('student_id')
        student = CustomerProfile.objects.get(id=student_id)
        enrollment_status = student.status

        attendance_records_all = StudentAttendance.objects.filter(student=student, attendance_status=1).order_by('attendance_record__date')
        if len(attendance_records_all) > 1:
            earliest_attendance_record  = attendance_records_all.first().date
            latest_attendance_record    = attendance_records_all.last().date
            lifetime                    = student.lifetime
        else:
            earliest_attendance_record  = None
            latest_attendance_record    = None
            lifetime                    = None

        data = {
            'parameter': parameter,
            'enrollmentStatus': enrollment_status,
            'lifetime': lifetime,
            'earliestAttendanceRecord': earliest_attendance_record,
            'latestAttendanceRecord': latest_attendance_record,
        }

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

    # REFRESH ATTENDANCE
    if parameter == 'refresh_attendance':
        increment       = all_post.get('increment')
        date_provided   = all_post.get('date')

        # UPDATE ALL ANALYTICS TABLES
        if increment == 'all':
            record_id = all_post.get('record_id') # record ID from JS
            if record_id != '':
                student_attendance_record = StudentAttendance.objects.get(id=record_id) # gets associated record
                date = student_attendance_record.attendance_record.date # gets date from associated record
            else:
                date = datetime.strptime(date_provided, '%Y-%m-%d')

            # MONTH TABLE UPDATE
            # calculates first and last days of month
            first_day_of_month = date.replace(day = 1)
            first_day_of_next_month = (first_day_of_month + timedelta(days = 31)).replace(day = 1)
            last_day_of_month = first_day_of_next_month - timedelta(days = 1)
            
            # gets student attendance records and performs counts
            records_all             = StudentAttendance.objects.filter(attendance_record__date__gte=first_day_of_month, attendance_record__date__lte=last_day_of_month)
            records_present         = records_all.filter(attendance_status = 1)
            records_absent          = records_all.filter(attendance_status = 2)
            records_pending         = records_all.filter(attendance_status = 0)

            records_all_count       = records_all.count()
            records_present_count   = records_present.count()
            records_absent_count    = records_absent.count()
            records_pending_count   = records_pending.count()

            # updates database
            record = AttendanceAnalyticsMonth.objects.filter(month_start_date = first_day_of_month)
            if record.count() != 0 and records_all_count != 0:
                record = AttendanceAnalyticsMonth.objects.get(month_start_date = first_day_of_month)
                record.month_present_count   = records_present_count
                record.month_absent_count    = records_absent_count
                record.month_pending_count   = records_pending_count
                record.save()
            elif record.count() != 0 and records_all_count == 0:
                record = AttendanceAnalyticsMonth.objects.get(month_start_date = first_day_of_month)
                record.delete()
            else:
                record                      = AttendanceAnalyticsMonth()
                record.month_start_date      = first_day_of_month
                record.month_present_count   = records_present_count
                record.month_absent_count    = records_absent_count
                record.month_pending_count   = records_pending_count
                record.save()

            # WEEK TABLE UPDATE
            # calculates date of closest previous Sunday
            first_sunday = date
            while first_sunday.weekday() != 6:
                first_sunday -= timedelta(days=1)
            last_saturday = first_sunday + timedelta(days=6)

            # gets student attendance records and performs counts
            records_all             = StudentAttendance.objects.filter(attendance_record__date__gte=first_sunday, attendance_record__date__lte=last_saturday)
            records_present         = records_all.filter(attendance_status = 1)
            records_absent          = records_all.filter(attendance_status = 2)
            records_pending         = records_all.filter(attendance_status = 0)

            records_all_count       = records_all.count()
            records_present_count   = records_present.count()
            records_absent_count    = records_absent.count()
            records_pending_count   = records_pending.count()

            # updates database
            record = AttendanceAnalyticsWeek.objects.filter(week_start_date = first_sunday)
            if record.count() != 0 and records_all_count != 0:
                record = AttendanceAnalyticsWeek.objects.get(week_start_date = first_sunday)
                record.week_present_count   = records_present_count
                record.week_absent_count    = records_absent_count
                record.week_pending_count   = records_pending_count
                record.save()
            elif record.count() != 0 and records_all_count == 0:
                record = AttendanceAnalyticsWeek.objects.get(week_start_date = first_sunday)
                record.delete()
            else:
                record                      = AttendanceAnalyticsWeek()
                record.week_start_date      = first_sunday
                record.week_present_count   = records_present_count
                record.week_absent_count    = records_absent_count
                record.week_pending_count   = records_pending_count
                record.save()

            # WEEK TABLE UPDATE
            # gets student attendance records and performs counts
            records_all             = StudentAttendance.objects.filter(attendance_record__date = date)
            records_present         = records_all.filter(attendance_status = 1)
            records_absent          = records_all.filter(attendance_status = 2)
            records_pending         = records_all.filter(attendance_status = 0)

            records_all_count       = records_all.count()
            records_present_count   = records_present.count()
            records_absent_count    = records_absent.count()
            records_pending_count   = records_pending.count()

            # updates database
            record = AttendanceAnalyticsDay.objects.filter(day_date = date)
            if record.count() != 0 and records_all_count != 0:
                record = AttendanceAnalyticsDay.objects.get(day_date = date)
                record.day_present_count    = records_present_count
                record.day_absent_count     = records_absent_count
                record.day_pending_count    = records_pending_count
                record.save()
            elif record.count() != 0 and records_all_count == 0:
                record = AttendanceAnalyticsDay.objects.get(day_date = date)
                record.delete()
            else:
                record                      = AttendanceAnalyticsDay()
                record.day_date             = date
                record.day_present_count    = records_present_count
                record.day_absent_date      = records_absent_count
                record.day_pending_count    = records_pending_count
                record.save()

            data = {
            }

        # UPDATE WEEK ANALYTICS TABLES
        if increment == 'week':
            record_id = all_post.get('record_id') # record ID from JS
            if record_id != '':
                student_attendance_record = StudentAttendance.objects.get(id=record_id) # gets associated record
                date = student_attendance_record.attendance_record.date # gets date from associated record
            else:
                date = datetime.strptime(date_provided, '%Y-%m-%d')

            # calculates date of closest previous Sunday
            first_sunday = date
            while first_sunday.weekday() != 6:
                first_sunday -= timedelta(days=1)
            last_saturday = first_sunday + timedelta(days=6)

            # gets student attendance records and performs counts
            records_all             = StudentAttendance.objects.filter(attendance_record__date__gte=first_sunday, attendance_record__date__lte=last_saturday)
            records_present         = records_all.filter(attendance_status = 1)
            records_absent          = records_all.filter(attendance_status = 2)
            records_pending         = records_all.filter(attendance_status = 0)

            records_all_count       = records_all.count()
            records_present_count   = records_present.count()
            records_absent_count    = records_absent.count()
            records_pending_count   = records_pending.count()

            # updates database
            record = AttendanceAnalyticsWeek.objects.filter(week_start_date = first_sunday)
            if record.count() != 0 and records_all_count != 0:
                record = AttendanceAnalyticsWeek.objects.get(week_start_date = first_sunday)
                record.week_present_count   = records_present_count
                record.week_absent_count    = records_absent_count
                record.week_pending_count   = records_pending_count
                record.save()
            elif record.count() != 0 and records_all_count == 0:
                record = AttendanceAnalyticsWeek.objects.get(week_start_date = first_sunday)
                record.delete()
            else:
                record                      = AttendanceAnalyticsWeek()
                record.week_start_date      = first_sunday
                record.week_present_count   = records_present_count
                record.week_absent_count    = records_absent_count
                record.week_pending_count   = records_pending_count
                record.save()

            data = {
                'dateInput': date,
                'firstSunday': first_sunday,
                'lastSaturday': last_saturday,
                'recordsAllCount': records_all_count,
                'recordsPresentCount': records_present_count,
                'recordsAbsentCount': records_absent_count,
                'recordsPendingCount': records_pending_count,
            }

        # UPDATE DAY ANALYTICS TABLES
        if increment == 'day':
            record_id = all_post.get('record_id') # record ID from JS
            if record_id != '':
                student_attendance_record = StudentAttendance.objects.get(id=record_id) # gets associated record
                date = student_attendance_record.attendance_record.date # gets date from associated record
            else:
                date = datetime.strptime(date_provided, '%Y-%m-%d')

            # gets student attendance records and performs counts
            records_all             = StudentAttendance.objects.filter(attendance_record__date = date)
            records_present         = records_all.filter(attendance_status = 1)
            records_absent          = records_all.filter(attendance_status = 2)
            records_pending         = records_all.filter(attendance_status = 0)

            records_all_count       = records_all.count()
            records_present_count   = records_present.count()
            records_absent_count    = records_absent.count()
            records_pending_count   = records_pending.count()

            # updates database
            record = AttendanceAnalyticsDay.objects.filter(day_date = date)
            if record.count() != 0 and records_all_count != 0:
                record = AttendanceAnalyticsDay.objects.get(day_date = date)
                record.day_present_count    = records_present_count
                record.day_absent_count     = records_absent_count
                record.day_pending_count    = records_pending_count
                record.save()
            elif record.count() != 0 and records_all_count == 0:
                record = AttendanceAnalyticsDay.objects.get(day_date = date)
                record.delete()
            else:
                record                      = AttendanceAnalyticsDay()
                record.day_date             = date
                record.day_present_count    = records_present_count
                record.day_absent_date      = records_absent_count
                record.day_pending_count    = records_pending_count
                record.save()

            data = {

            }
    
    # MODULE 001 - Attendance by Week
    if parameter == 'module_001':
        # start_date = datetime.strptime(all_post.get('start_date'), '%Y-%m-%d')
        # end_date = datetime.strptime(all_post.get('end_date'), '%Y-%m-%d')

        # start_of_next_week = datetime.now() - timedelta(days=7)

        # records_all = AttendanceAnalyticsWeek.objects.filter(week_start_date__lte=datetime.now()).order_by('-week_start_date')[:10]
        records_all = AttendanceAnalyticsWeek.objects.all().order_by('-week_start_date')[:24]

        labels  = []
        present = []
        absent  = []
        pending = []

        for x in reversed(records_all):
            labels.append(x.week_start_date)
            present.append(x.week_present_count)
            absent.append(x.week_absent_count)
            pending.append(x.week_pending_count)
            
        data = {
            'labels': labels,
            'present': present,
            'absent': absent,
            'pending': pending,
        }

    # MODULE 002 - Total Attendance
    if parameter == 'module_002':
        # start_date = datetime.strptime(all_post.get('start_date'), '%Y-%m-%d')
        # end_date = datetime.strptime(all_post.get('end_date'), '%Y-%m-%d')

        records_all = Attendance.objects.all() # get all records

        attendance_all = StudentAttendance.objects.filter(attendance_record__in = records_all)

        present             = attendance_all.filter(attendance_status = 1)
        present_count       = present.count()

        absent              = attendance_all.filter(attendance_status = 2)
        absent_count        = absent.count()

        incomplete          = attendance_all.filter(attendance_status = 0)
        incomplete_count    = incomplete.count()

        data = {
            'presentCount': present_count,
            'absentCount': absent_count,
            'incompleteCount': incomplete_count,
        }
    
    # MODULE 003 - Attendance by Day
    if parameter == 'module_003':
        # start_date = datetime.strptime(all_post.get('start_date'), '%Y-%m-%d')
        # end_date = datetime.strptime(all_post.get('end_date'), '%Y-%m-%d')

        start_date = datetime.now() - timedelta(days=28)

        # records_all = AttendanceAnalyticsDay.objects.filter(day_date__gte=start_date, day_date__lte=datetime.now()).order_by('-day_date')[:10]
        records_all = AttendanceAnalyticsDay.objects.filter(day_date__lte=datetime.now()).order_by('-day_date')[:24]

        labels  = []
        present = []
        absent  = []
        pending = []
        for x in reversed(records_all):
            labels.append(x.day_date)
            present.append(x.day_present_count)
            absent.append(x.day_absent_count)
            pending.append(x.day_pending_count)
            
        data = {
            'labels': labels,
            'present': present,
            'absent': absent,
            'pending': pending,
        }
    
    # MODULE 004 - Absent Rate by Week
    if parameter == 'module_004':
        # start_date = datetime.strptime(all_post.get('start_date'), '%Y-%m-%d')
        # end_date = datetime.strptime(all_post.get('end_date'), '%Y-%m-%d')

        # start_of_next_week = datetime.now() - timedelta(days=7)

        # records_all = AttendanceAnalyticsWeek.objects.filter(week_start_date__lte=datetime.now()).order_by('week_start_date')[:10]
        records_all = AttendanceAnalyticsWeek.objects.all().order_by('-week_start_date')[:24]

        labels  = []
        absent_rate = []

        for x in reversed(records_all):
            labels.append(x.week_start_date)
            absent_rate.append(round(x.week_absent_rate, 1))
            
        data = {
            'labels': labels,
            'absentRate': absent_rate,
        }

    # MODULE 005 - Absent Rate by Day
    if parameter == 'module_005':
        # start_date = datetime.strptime(all_post.get('start_date'), '%Y-%m-%d')
        # end_date = datetime.strptime(all_post.get('end_date'), '%Y-%m-%d')

        start_date = datetime.now() - timedelta(days=28)

        # records_all = AttendanceAnalyticsDay.objects.filter(day_date__gte=start_date, day_date__lte=datetime.now()).order_by('day_date')[:10]
        records_all = AttendanceAnalyticsDay.objects.filter(day_date__lte=datetime.now()).order_by('-day_date')[:24]

        labels  = []
        absent_rate = []

        for x in reversed(records_all):
            labels.append(x.day_date)
            absent_rate.append(round(x.day_absent_rate, 1))
            
        data = {
            'labels': labels,
            'absentRate': absent_rate,
        }
        
    # MODULE 006 - Attendance by Month
    if parameter == 'module_006':
        # records_all = AttendanceAnalyticsMonth.objects.filter(month_start_date__lte=datetime.now()).order_by('month_start_date')[:10]
        records_all = AttendanceAnalyticsMonth.objects.all().order_by('-month_start_date')[:24]

        labels = []
        labels_short = []
        present = []
        absent = []
        pending = []

        for x in reversed(records_all):
            labels.append(str(x.month_start_date)[0:-3])
            labels_short.append(str(x.month_start_date)[2:7])
            present.append(x.month_present_count)
            absent.append(x.month_absent_count)
            pending.append(x.month_pending_count)
            
        data = {
            'labels': labels,
            'labelsShort': labels_short,
            'present': present,
            'absent': absent,
            'pending': pending,
        }

    # MODULE 007 - Absent Rate by Month
    if parameter == 'module_007':
        # start_date = datetime.strptime(all_post.get('start_date'), '%Y-%m-%d')
        # end_date = datetime.strptime(all_post.get('end_date'), '%Y-%m-%d')

        # start_of_next_week = datetime.now() - timedelta(days=7)

        # records_all = AttendanceAnalyticsMonth.objects.filter(month_start_date__lte=datetime.now()).order_by('month_start_date')[:10]
        records_all = AttendanceAnalyticsMonth.objects.all().order_by('-month_start_date')[:24]

        labels = []
        labels_short = []
        absent_rate = []

        for x in reversed(records_all):
            labels.append(str(x.month_start_date)[0:-3])
            labels_short.append(str(x.month_start_date)[2:7])
            absent_rate.append(round(x.month_absent_rate, 1))
            
        data = {
            'labels': labels,
            'labelsShort': labels_short,
            'absentRate': absent_rate,
        }
    
    # MODULE 008 - Student Lifetime (all students)
    if parameter == 'module_008':
        records_all = StudentLifetime.objects.all().order_by('-date_time')[:24]

        labels              = []
        lifetime_all_mean   = []
        lifetime_all_med    = []

        for x in reversed(records_all):
            labels.append(str(x.date_time.astimezone().date()))
            lifetime_all_mean.append(x.lifetime_all_mean)
            lifetime_all_med.append(x.lifetime_all_med)
            
        data = {
            'labels':           labels,
            'lifetimeAllMean':  lifetime_all_mean,
            'lifetimeAllMed':   lifetime_all_med,
        }

    # MODULE 009 - Student Grade Distribution
    if parameter == 'module_009':
        records = StudentDemographics.objects.all().order_by('year','month')[:24]

        labels = []
        totals = []
        pre = []
        kin = []
        ele = []
        mid = []
        hig = []
        adu = []
        for x in records:
            year = str(x.year)[2:]
            month = f"0{x.month}"
            # labels.append(f"{year}-{month[-2:]} ({x.total})")
            labels.append(f"{year}-{month[-2:]}")
            totals.append(x.total)
            pre.append(x.pre_total)
            kin.append(x.kin_total)
            ele.append(x.ele_total)
            mid.append(x.mid_total)
            hig.append(x.hig_total)
            adu.append(x.adu_total)

        datasets = [
            {
            'label': 'ベビー',
            'backgroundColor': "rgba(246,65,108,.8)",
            'data': pre,
            }, {
            'label': '幼児',
            'backgroundColor': "rgba(255,222,125,.8)",
            'data': kin,
            }, {
            'label': '小学',
            'backgroundColor': "rgba(0,184,169,.8)",
            'data': ele,
            }, {
            'label': '中学',
            'backgroundColor': "rgba(246,65,108,.8)",
            'data': mid,
            }, {
            'label': '高校',
            'backgroundColor': "rgba(255,222,125,.8)",
            'data': hig,
            }, {
            'label': '大人',
            'backgroundColor': "rgba(0,184,169,.8)",
            'data': adu,
            }
        ]
            
        data = {
            'labels': labels,
            'totals': totals,
            'datasets': datasets,
        }

    # MODULE 010 - Average Number of Lessons Per Student
    if parameter == 'module_010':
        records_all = LessonsPerStudent.objects.all().order_by('-year', '-month')[:24]

        year                    = []
        month                   = []
        lessons_per_student     = []
        student_count           = []

        for x in reversed(records_all):
            formatted_month = f"0{x.month}"[-2:]
            year.append(str(x.year))
            month.append(str(formatted_month))
            lessons_per_student.append(x.lessons_per_student)
            student_count.append(x.multi_lesson_student_count)
            
        data = {
            'year': year,
            'month': month,
            'lessonsPerStudent': lessons_per_student,
            'studentCount': student_count,
        }
    
    return JsonResponse(data)

# DASHBOARD (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def Dashboard(request):
    page_title = 'Dashboard'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/dashboard/index.html', context)

# ACCESSLOG - BROWSE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def AccesslogBrowse(request):

    page_title = 'Access Log - Browse'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/accesslog/browse/index.html', context)

# CHANGELOG - CLASS LIST - BROWSE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def ChangelogClasslistBrowse(request):

    page_title = 'Change Log - Class List - Browse'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/changelog/class_list/browse/index.html', context)

# CHANGELOG - CUSTOMER - BROWSE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def ChangelogCustomerBrowse(request):

    page_title = 'Change Log - Customer - Browse'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/changelog/customer/browse/index.html', context)

# CHANGELOG - NOTES - BROWSE (STUB)
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def ChangelogNotesBrowse(request):
    page_title = 'Change Log - Notes - Browse'
    
    context = {
        'page_title': page_title,
    }
    
    return render(request, 'analytics/changelog/notes/browse/index.html', context)
