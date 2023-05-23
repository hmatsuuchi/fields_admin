from django.shortcuts import render
from django.contrib.auth.decorators import login_required, user_passes_test

# ======================== CUSTOMER PROFILES ========================

# customer - browse page
@login_required(login_url='/user_profile/login/')
@user_passes_test(lambda u: u.groups.filter(name__in=['Instructors', 'Superusers']).exists())
def browse(request):

    
    context = {
        'some_context_data': 'some context data',
    }
    
    return render(request, 'materials/index.html', context)