import statistics
from datetime import datetime, timedelta
from customer.models import CustomerProfile
from analytics.models import StudentLifetime, StudentDemographics, LessonsPerStudent, StudentsInOut
from attendance.models import Attendance, StudentAttendance
from class_list.models import ClassList

def calculate_student_demographics():
    year = int(2022)
    month = int(9)
    today = datetime.today()
    end_year = int(today.year)
    end_month = int(today.month)

    while year <= end_year:
        all_attendance = StudentAttendance.objects.filter(attendance_record__date__year=year, attendance_record__date__month=month, attendance_status=1) # gets all attendance records
        all_students = CustomerProfile.objects.filter(studentattendance__in=all_attendance).distinct().exclude(grade=0) # gets students with attendance records in time period

        record = StudentDemographics.objects.filter(year=year, month=month)

        if len(record) == 1:
            record[0].year         = year
            record[0].month        = month
            record[0].pre_0     = all_students.filter(grade=1).count()
            record[0].pre_1     = all_students.filter(grade=2).count()
            record[0].pre_2     = all_students.filter(grade=3).count()
            record[0].pre_3     = all_students.filter(grade=4).count()
            record[0].kin_1     = all_students.filter(grade=5).count()
            record[0].kin_2     = all_students.filter(grade=6).count()
            record[0].kin_3     = all_students.filter(grade=7).count()
            record[0].ele_1     = all_students.filter(grade=8).count()
            record[0].ele_2     = all_students.filter(grade=9).count()
            record[0].ele_3     = all_students.filter(grade=10).count()
            record[0].ele_4     = all_students.filter(grade=11).count()
            record[0].ele_5     = all_students.filter(grade=12).count()
            record[0].ele_6     = all_students.filter(grade=13).count()
            record[0].mid_1     = all_students.filter(grade=14).count()
            record[0].mid_2     = all_students.filter(grade=15).count()
            record[0].mid_3     = all_students.filter(grade=16).count()
            record[0].hig_1     = all_students.filter(grade=17).count()
            record[0].hig_2     = all_students.filter(grade=18).count()
            record[0].hig_3     = all_students.filter(grade=19).count()
            record[0].adu_1     = all_students.filter(grade=20).count()
            record[0].save()
        else:
            record.delete()
            record = StudentDemographics()
            record.year         = year
            record.month        = month
            record.pre_0        = all_students.filter(grade=1).count()
            record.pre_1        = all_students.filter(grade=2).count()
            record.pre_2        = all_students.filter(grade=3).count()
            record.pre_3        = all_students.filter(grade=4).count()
            record.kin_1        = all_students.filter(grade=5).count()
            record.kin_2        = all_students.filter(grade=6).count()
            record.kin_3        = all_students.filter(grade=7).count()
            record.ele_1        = all_students.filter(grade=8).count()
            record.ele_2        = all_students.filter(grade=9).count()
            record.ele_3        = all_students.filter(grade=10).count()
            record.ele_4        = all_students.filter(grade=11).count()
            record.ele_5        = all_students.filter(grade=12).count()
            record.ele_6        = all_students.filter(grade=13).count()
            record.mid_1        = all_students.filter(grade=14).count()
            record.mid_2        = all_students.filter(grade=15).count()
            record.mid_3        = all_students.filter(grade=16).count()
            record.hig_1        = all_students.filter(grade=17).count()
            record.hig_2        = all_students.filter(grade=18).count()
            record.hig_3        = all_students.filter(grade=19).count()
            record.adu_1        = all_students.filter(grade=20).count()
            record.save()

        if year == end_year and month == end_month:
            break

        if month >= 12:
            year += 1
            month = 1
        else:
            month += 1

def calculate_student_lifetime():
    customer_all = CustomerProfile.objects.all()

    lifetime_list = []
    for x in customer_all:
        if x.lifetime > 0:
            lifetime_list.append(x.lifetime)

    # lifetime_all = sum(lifetime_list) / len(lifetime_list)
    lifetime_all_mean = statistics.mean(lifetime_list)
    lifetime_all_med  = statistics.median(lifetime_list)

    record = StudentLifetime()
    record.lifetime_all_mean = lifetime_all_mean
    record.lifetime_all_med = lifetime_all_med
    record.save()

def calculate_lessons_per_student():    
    year = int(2022)
    month = int(9)
    today = datetime.today()
    end_year = int(today.year)
    end_month = int(today.month)

    all_data = []

    while year <= end_year:        
        # GENERATES LIST OF FULL WEEKS IN MONTH
        full_weeks = []
        # gets the first Monday of the month
        start_date = datetime(year, month, 1)
        date = start_date
        day_increment = 1
        while date.weekday() != 0:
            date = start_date + timedelta(days=day_increment)
            day_increment += 1
        else:
            first_monday = date

        week_increment = 0 # counter to advance date by one week increments
        monday = first_monday + timedelta(days=week_increment) # initializes variable for use in while loop
        next_sunday = monday + timedelta(days=6) # initializes variable for use in while loop

        # calculates integer for following month
        if month == 12:
            next_month = 1
        else:
            next_month = month + 1

        while (next_sunday.month != next_month): # while the following Sunday is still in the same month
            full_weeks.append(monday)
            week_increment += 7
            monday = first_monday + timedelta(days=week_increment)
            next_sunday = monday + timedelta(days=6)


        # ANALYZES ATTENDNACE RECORDS FOR EACH STUDENT FOR EACH WEEK
        all_attendance = StudentAttendance.objects.filter(attendance_record__date__year=year, attendance_record__date__month=month, attendance_status=1) # gets all attendance records
        all_students = CustomerProfile.objects.filter(studentattendance__in=all_attendance).distinct().exclude(grade=0) # gets students with attendance records in time period

        month_lesson_count_all_students = []
        multi_lesson_student_count = 0
        # multi_lesson_student_list = [] # DEBUGGING PURPOSES
        for x in all_students:
            count_list = []
            for y in full_weeks:
                start_of_week = y
                end_of_week = y + timedelta(days=6)
                # gets all student attendance records for week
                student_attendance = all_attendance.filter(student=x, attendance_record__date__gte=start_of_week, attendance_record__date__lte=end_of_week)
                # gets corresponding attendance records
                associated_attendance = Attendance.objects.filter(studentattendance__in=student_attendance)
                # gets distinct list of associated classes
                associated_classes = ClassList.objects.filter(attendance__in=associated_attendance).distinct()
                # appends length of list to list which tracks counts for each week in the month
                count_list.append(len(associated_classes))

            final_count = 1
            for z in count_list:
                # only increases the final count if greater than current highest count and appears more than once in the month
                if count_list.count(z) > 1 and z > final_count:
                    final_count = z

            if final_count > 1:
                multi_lesson_student_count += 1
                # multi_lesson_student_list.append(x.first_name_romaji)

            month_lesson_count_all_students.append(final_count)

        average_classes = statistics.mean(month_lesson_count_all_students)
        class MonthData:
            def __init__(self, year, month, lessons_per_student, multi_lesson_student_count):
                self.year = year
                self.month = month
                self.lessons_per_student = lessons_per_student
                self.multi_lesson_student_count = multi_lesson_student_count
        month_data = MonthData(year, month, average_classes, multi_lesson_student_count)
        all_data.append(month_data)

        if year == end_year and month == end_month:
            break

        if month >= 12:
            year += 1
            month = 1
        else:
            month += 1

    analytics_records_all = LessonsPerStudent.objects.all()
    for x in all_data:
        current_record = analytics_records_all.filter(year=x.year, month=x.month)
        if len(current_record) == 1:
            current_record[0].year = x.year
            current_record[0].month = x.month
            current_record[0].lessons_per_student = x.lessons_per_student
            current_record[0].multi_lesson_student_count = x.multi_lesson_student_count
            current_record[0].save()
        elif len(current_record) == 0:
            new_record = LessonsPerStudent()
            new_record.year = x.year
            new_record.month = x.month
            new_record.lessons_per_student = x.lessons_per_student
            new_record.multi_lesson_student_count = x.multi_lesson_student_count
            new_record.save()
        elif len(current_record) > 1:
            current_record.delete()
            new_record = LessonsPerStudent()
            new_record.year = x.year
            new_record.month = x.month
            new_record.lessons_per_student = x.lessons_per_student
            new_record.multi_lesson_student_count = x.multi_lesson_student_count
            new_record.save()

def calculate_students_in_out():
    # current year and month
    today = datetime.now()
    curr_year = today.year
    curr_month = today.month
    four_weeks_ago = today - timedelta(days=28)

    # set year and month start values
    year = 2022
    month = 10

    # instantiates start/end date list
    dates = []

    # get all students
    students = CustomerProfile.objects.all()
    # get all attendance records
    records = StudentAttendance.objects.all()

    # iterates through all students
    for x in students:
        student_record = records.filter(student=x, attendance_status=1)
        # only add records for students who have attended more than two lessons
        if len(student_record) > 2:
            first = student_record.first()
            last = student_record.last()

            if first and last:
                dates.append([first, last])

    while year <= curr_year:
        record_search = StudentsInOut.objects.filter(year=year, month=month)
        if record_search.count() == 0:
            in_out_record = StudentsInOut()
            in_out_record.year = year
            in_out_record.month = month
            in_out_record.save()
        else:
            in_out_record = record_search[0]

        in_out_record.students_in.clear()
        in_out_record.students_out.clear()

        # increments first record count if students first record is in current month
        # increments last record count if students last record is in current month and more than 28 days ago
        for y in dates:
            if year == y[0].date.year and month == y[0].date.month:
                in_out_record.students_in.add(y[0].student)
            if year == y[1].date.year and month == y[1].date.month and four_weeks_ago.date() > y[1].date:
                in_out_record.students_out.add(y[0].student)

        in_out_record.save()

        # increments year and month
        if year == curr_year and month == curr_month:
            break
        elif month == 12:
            year += 1
            month = 1
        else:
            month += 1