function createCustomer(csrfToken) {
    // all fields in the create user form
    var fieldList = [
        'last-name-romaji',
        'first-name-romaji',
        'last-name-kanji',
        'first-name-kanji',
        'last-name-katakana',
        'first-name-katakana',
        'post-code',
        'prefecture',
        'city',
        'address-1',
        'address-2',
        'phone-1',
        'phone-1-type',
        'phone-2',
        'phone-2-type',
        'birthday',
        'grade',
        'status',
        'payment-method',
    ]

    var new_user_data = {};
    new_user_data.csrfmiddlewaretoken = csrfToken;

    var i;
    for (i = 0; i < fieldList.length; i++) {
        var fieldListUnderscore = fieldList[i].replaceAll('-', '_');
        new_user_data[fieldListUnderscore] = document.getElementById(fieldList[i]).value;
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "new_create",
        data: new_user_data,
        success: function (data) {
            newUser = data.json_response;
            var redirect = '/customer/detail/' + String(newUser.id);
            window.location.href = redirect;
        }
    })
}