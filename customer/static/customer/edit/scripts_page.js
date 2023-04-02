function updateCustomer(csrfToken, customerId) {
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
        'archived',
    ]

    var new_user_data = {};
    new_user_data.csrfmiddlewaretoken = csrfToken;
    new_user_data.customer_id = customerId;

    var i;
    for (i = 0; i < fieldList.length; i++) {
        var fieldListUnderscore = fieldList[i].replaceAll('-', '_');
        new_user_data[fieldListUnderscore] = document.getElementById(fieldList[i]).value;
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/customer/edit_update",
        data: new_user_data,
        success: function () {
            window.location.href = '/customer/detail/' + String(customerId);
        }
    })
}

// toggles archive status
// This function takes care of the styling for the archive button and updates the value in the form.
// The archive button is the little toggle switch at the bottom of the edit student profile page.
function archiveProfile() {
    var archiveButton = document.getElementById('archive-button-container');
    var archived = archiveButton.classList.contains('archived');
    var archivedValue = document.getElementById('archived');

    if (archived) {
        archiveButton.classList.remove('archived');
        archivedValue.value = 'False';
    } else {
        archiveButton.classList.add('archived');
        archivedValue.value = 'True';
    }
}