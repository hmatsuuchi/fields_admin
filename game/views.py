import os
import qrcode
import qrcode.image.svg
from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test
from django.http import JsonResponse
from django.core import serializers

# from customer.models import CustomerProfile
from attendance.models import Attendance, StudentAttendance
from customer.models import CustomerProfile
from class_list.models import ClassList
from game.models import CardIndex

# lobby display one
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Lobby Display', 'Superusers']).exists())
def displayOne(request):
    page_title = 'Display One'
    
    context = {
        'page_title': page_title,
    }

    return render(request, 'game/display_one/index.html', context)

# game API
@login_required(login_url='/user_profile/login')
@user_passes_test(lambda u: u.groups.filter(name__in=['Lobby Display', 'Superusers']).exists())
def gameAPI(request):
    all_post = request.POST
    parameter = all_post.get('parameter')
    card_data = all_post.get('uuid_input')

    if parameter == 'student_search':
        try:
            card_index                          = CardIndex.objects.get(card_identifier = card_data)
            no_record_found                     = False
            student                             = card_index.linked_student

            student_attendance_all              = StudentAttendance.objects.filter(student = student).exclude(attendance_status = 0).order_by('-attendance_record__date', '-attendance_record__start_time')
            student_attendance                  = student_attendance_all[:13]
            student_attendance_serlialized      = serializers.serialize("json", student_attendance)
            total_record_count                  = student_attendance_all.count()

            attendance_records                  = Attendance.objects.filter(studentattendance__in=student_attendance)
            attendance_records_serialized       = serializers.serialize("json", attendance_records)

            class_list                          = ClassList.objects.filter(attendance__in=attendance_records)
            class_list_serialized               = serializers.serialize("json", class_list)

            present_record_count                = student_attendance_all.filter(attendance_status = 1).count()

            data = {
                'noRecordFound': no_record_found,
                'attendanceRecords': attendance_records_serialized,
                'studentAttendance': student_attendance_serlialized,
                'classList': class_list_serialized,
                'studentInformation': {
                    'lastNameRomaji': student.last_name_romaji,
                    'firstNameRomaji': student.first_name_romaji,
                    'grade': student.grade,
                    },
                    'totalRecordCount': total_record_count,
                    'presentRecordCount': present_record_count,
                }
        except:
            no_record_found                     = True
            data = {
                'noRecordFound': no_record_found,
            }

    if parameter == 'get_all_data_for_student':
        student                 = CustomerProfile.objects.get(id=all_post.get('student_id'))

        enrollment_status       = student.status

        codes                   = CardIndex.objects.filter(linked_student = student).order_by('-date_time')
        codes_serialized        = serializers.serialize("json", codes)

        for x in codes:
            path = 'media/game/qr_codes/' + x.card_identifier + '.svg'
            image_exists = os.path.exists(path)
            if not image_exists:
                factory = qrcode.image.svg.SvgImage
                img = qrcode.make(x.card_identifier, image_factory=factory)
                img.save('media/game/qr_codes/' + x.card_identifier + '.svg', 'SVG')

        data = {
            'codesAll': codes_serialized,
            'enrollmentStatus': enrollment_status,
        }

    if parameter == 'add_qr_code':
        card_created = False

        student                 = CustomerProfile.objects.get(id=all_post.get('student_id'))
        raw_card_value          = all_post.get('qr_code_value')
        card_value              = raw_card_value.replace(' ', '_')

        print(card_value.replace(' ', '_'))

        if card_value:
            new_card                    = CardIndex()
            new_card.linked_student     = student
            new_card.card_identifier    = card_value
            new_card.save()

            path = 'media/game/qr_codes/' + card_value + '.svg'
            image_exists = os.path.exists(path)
            if not image_exists:
                factory = qrcode.image.svg.SvgImage
                img = qrcode.make(card_value, image_factory=factory)
                img.save('media/game/qr_codes/' + card_value + '.svg', 'SVG')

            card_created = True

            data = {
                'success': card_created,
                'codeID': new_card.id,
                'codeValue': card_value,
                'creation': new_card.date_time,
            }
        
        else:
            data = {
                'success': card_created,
            }
    
    return JsonResponse(data)