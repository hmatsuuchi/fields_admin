function deleteClassRecord(classID, csrfToken) {

    document.body.style.pointerEvents = 'none';

    parameters = {
        'csrfmiddlewaretoken': csrfToken, // CSRF token
        'parameter': 'DELETE_SINGLE', // delete class record
        'class_id': classID,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/class_list/class_list_api",
        data: parameters,
        success: function (data) { 
            window.location.href = "/class_list/browse";
        }
    })
}