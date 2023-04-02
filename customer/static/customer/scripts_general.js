function flagToggle(csrfToken, customerId, page) {
    // flag is toggled on click
    var flag = document.getElementById('flag-' + String(customerId))
    flag.classList.toggle('flag-true');

    if (page == 'browse') {
        // gets boolean for whether flagged filter is applied
        var flaggedButton = document.getElementById('flagged-button');
        var filtered_bool = flaggedButton.classList.contains('filtered-flagged');
        var flagTrue = flag.classList.contains('flag-true');
    }

    if (filtered_bool && !flagTrue && page == 'browse') {
        var customerCard = document.getElementById('customer-card-' + String(customerId));
        customerCard.style.display = 'none';

        var resultNum = document.getElementById('result-number');
        var resultValue = resultNum.innerHTML;
        resultNum.innerHTML = resultValue - 1;
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/user_profile/flag_customer/",
        data: {
            'csrfmiddlewaretoken': csrfToken,
            'customer': customerId,
        },
        success: function (data) {
            // flag status is verified by server response and adjusted if necessary
            var flag = document.getElementById('flag-' + String(data.customer_id));

            if (data.flag_status == true) {
                flag.classList.add('flag-true');
            }
            else {
                flag.classList.remove('flag-true');
            }
        }
    })
}

function statusUpdate(selectedStatus) {
    // updates the radio button style box
    var statusContainer = document.getElementById('status-container');
    var statusChoices = statusContainer.getElementsByTagName('*');
    var i;
    for (i = 0; i < statusChoices.length; i++) {
        statusChoices[i].classList.remove('status-active');
        var choiceNumber = statusChoices[i].id.replace('status-', '');
        if (selectedStatus == choiceNumber) {
            statusChoices[i].classList.add('status-active');
        }
    }
    // updates the hidden input field
    var statusInput = document.getElementById('status');
    statusInput.value = selectedStatus;
}

function paymentUpdate(selectedStatus) {
    // updates the radio button style box
    var paymentContainer = document.getElementById('payment-container');
    var paymentChoices = paymentContainer.getElementsByTagName('*');
    var i;
    for (i = 0; i < paymentChoices.length; i++) {
        paymentChoices[i].classList.remove('payment-active');
        var choiceNumber = paymentChoices[i].id.replace('payment-', '');
        if (selectedStatus == choiceNumber) {
            paymentChoices[i].classList.add('payment-active');
        }
    }
    // updates the hidden input field
    var paymentInput = document.getElementById('payment-method');
    paymentInput.value = selectedStatus;
}