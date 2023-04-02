// NEW/EDIT NOTE - TOGGLE POINTER EVENTS FOR OTHER INPUTS
// This function turns off pointer events for any other inputs except the input specified in the 'skip' argument.
// If the 'toggle' argument is set to true, it will disable pointer events except the input specified in the 'skip' argument.
// If the 'toggle' argument is set to false, it will enable ALL input pointer events
function togglePointerEvents(toggle, skip) {
    var container = document.getElementById('new-edit-note-container');
    var allInputs = container.getElementsByClassName('input');
    var i;
    for (i = 1; i < allInputs.length; i++) {
        if (toggle == true && skip != allInputs[i].id) {
            allInputs[i].style.pointerEvents = 'none';
        } else {
            allInputs[i].style.pointerEvents = 'auto';
        }
    }
}

// NEW/EDIT NOTE - DISPLAY CUSTOMER CHOICE LIST
function displayCustomerChoiceList() {
    clearCustomerHighlight(); // clears previously highlighted students
    var container = document.getElementById('customer-choice-list-container');
    container.classList.add('active-type-choice-list');
    var customerInput = document.getElementById('new-customer-input'); // gets the customer input field
    customerInput.classList.add('active-customer-input'); // adds class so style selected field

    togglePointerEvents(true, 'new-customer-input'); // disables pointer events for input fields
    filterCustomerChoiceList(); // runs filter once when choice list is displayed
}

// NEW/EDIT NOTE - HIDE CUSTOMER CHOICE LIST
function hideCustomerChoiceList() {
    var container = document.getElementById('customer-choice-list-container');
    container.classList.remove('active-type-choice-list');
    var customerInput = document.getElementById('new-customer-input'); // gets the customer input field
    customerInput.classList.remove('active-customer-input'); // adds class so style selected field

    togglePointerEvents(false); // enables pointer events for input fields

    // this looks at the currently assigned value to the hidden student input field and clears the visible input field if no value is present
    var hiddenCustomerInput = document.getElementById('new-customer-input-hidden');
    if (hiddenCustomerInput.value == '') {
        customerInput.value = '';
    }
}

// NEW/EDIT NOTE - FILTER CUSTOMER CHOICE LIST
function filterCustomerChoiceList(e) {
    var input = document.getElementById('new-customer-input'); // get: input field
    var inputText = input.value; // gets input value
    var inputTextUpper = inputText.toUpperCase(); // parses to uppercase
    
    var choiceListContainer = document.getElementById('customer-choice-list-container'); // gets container which contains all customer names
    var allChoices = choiceListContainer.getElementsByClassName('customer-choice-item'); // gets all choices

    var hiddenInput = document.getElementById('new-customer-input-hidden'); // gets the hidden customer value
    if (hiddenInput.value != '') {
        hiddenInput.value = ''; // the value needs to be reset on changes to the input; this ensures proper form validation
    }

    var i;
    for (i = 0; i < allChoices.length; i++) {
        var textContent = allChoices[i].textContent; // use text content to search data-* attribute fields
        var textAll = textContent + allChoices[i].dataset.meta; // generates string for comparison
        var textAllUpper = textAll.toUpperCase(); // parses to uppercase
        var stringMatch = textAllUpper.indexOf(inputTextUpper);
        if (stringMatch == -1) {
            allChoices[i].classList.remove('display-student-choice');
        } else {
            allChoices[i].classList.add('display-student-choice');
        }
    }

    let keyPressWhitelist = [40, 13, 38, 27];
    if (e && keyPressWhitelist.indexOf(e.keyCode) < 0) {
        clearCustomerHighlight();
    }
}

// NEW/EDIT NOTE - SELECT STUDENT FROM CHOICE LIST
function selectStudentChoice(studentId, studentName) {
    var input = document.getElementById('new-customer-input'); // get: new customer input
    input.value = studentName; // sets input value as customer choice text

    var hiddenInput = document.getElementById('new-customer-input-hidden'); // get: hidden input
    hiddenInput.value = studentId; // sets customer ID as hidden input value
}

// EDIT NOTE
function editNote(csrfToken, noteId) {
    var studentId   = document.getElementById('new-customer-input-hidden').value;
    var date        = document.getElementById('new-date-input').value;
    var time        = document.getElementById('new-time-input').value;
    var type        = document.getElementById('new-type-input').value;
    var instructor  = document.getElementById('new-instructor-input').value;
    var instructor2 = document.getElementById('new-instructor-2-input').value;
    var noteText    = document.getElementById('new-note-text-input').value;
    var archived    = document.getElementById('archived').value;

    let fieldValue = [['customer_id', studentId],['date', date], ['time', time], ['type', type], ['instructor_1', instructor], ['instructor_2', instructor2], ['note_text', noteText], ['archived', archived],]
    let parameter = 'UPDATE';

    let urlParams = window.location.search;
    let urlParamsAll = new URLSearchParams(urlParams);
    let returnLink = urlParamsAll.get('return_link');

    function sendData() {
        parameters = {
            'csrfmiddlewaretoken': csrfToken, // CSRF token
            'parameter': parameter,
            'note_id': noteId,
            'field_value': JSON.stringify(fieldValue),
            'return_link': returnLink,
        }
    
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "notes_api",
            data: parameters,
            success: function (data) {
                window.location.href = `${data.parameters.return_link}?jump_to=nc-${data.notes.note_id}`;
            }
        })
    }

    /* if the student and date input fields are not blank, update the database */
    if (studentId != '' && date !='') {
        sendData();
    }
    if (studentId == '') {
        var customerInput = document.getElementById('new-customer-input');
        customerInput.classList.add('missing-input');
    } else {
        var customerInput = document.getElementById('new-customer-input');
        customerInput.classList.remove('missing-input');
    }
    if (date == '') {
        var dateInput = document.getElementById('new-date-input');
        dateInput.classList.add('missing-input');
    } else {
        var dateInput = document.getElementById('new-date-input');
        dateInput.classList.remove('missing-input');
    }
}

// NEW/EDIT NOTE - TOGGLE ARCHIVED STATUS
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

// select customer using up/down arrow keys and return key
function customerKeyboardSelect(e) {
    function handleKeypress(keyCode) {
        let customerList = document.getElementById('customer-choice-list-container'); // gets customer list container
        let allCustomers = customerList.getElementsByClassName('customer-choice-item display-student-choice'); // gets all customers in list

        // checks for presence of highlighted item in list
        var containsHighlighted = false;
        var i;
        for (i = 0; i < allCustomers.length; i++) {
            if (allCustomers[i].classList.contains('highlighted-student')) {
                containsHighlighted = true;
                break;
            }
        }

        if (containsHighlighted == false && keyCode == 40) {
            allCustomers[0].classList.add('highlighted-student');
        } else if (containsHighlighted == true && keyCode == 40 && i + 1 != allCustomers.length) {
            allCustomers[i].classList.remove('highlighted-student');
            allCustomers[i + 1].classList.add('highlighted-student');
        } else if (containsHighlighted == true && keyCode == 13) {
            let studentInput = document.getElementById('new-customer-input');
            studentInput.value = allCustomers[i].innerHTML;

            let hiddenInput = document.getElementById('new-customer-input-hidden');
            hiddenInput.value = allCustomers[i].id.slice(2);
            
            let dateInput = document.getElementById('new-date-input');
            dateInput.focus();
        } else if (containsHighlighted == true && keyCode == 38 && i > 0) {
            allCustomers[i].classList.remove('highlighted-student');
            allCustomers[i - 1].classList.add('highlighted-student');
        } else if (containsHighlighted == true && keyCode == 38 & i == 0) {
            allCustomers[i].classList.remove('highlighted-student');
        } else if (keyCode == 27) {
            let studentInput = document.getElementById('new-customer-input');
            studentInput.blur();
        }
    }

    if (e.keyCode == 13 | e.keyCode == 38 | e.keyCode == 40 | e.keyCode == 27 ) {
        e.preventDefault();
        handleKeypress(e.keyCode);
    }
}

// clears highlighted customers in customer selection list
function clearCustomerHighlight() {
    let highlighteStudents = document.getElementsByClassName('highlighted-student');
    var i;
    for (i = 0; i < highlighteStudents.length; i++) {
        highlighteStudents[i].classList.remove('highlighted-student');
    }
}

// NEW/EDIT NOTE - EVENT LISTENERS
function noteEventListeners() {
    var studentInput = document.getElementById('new-customer-input');
    studentInput.addEventListener("focus", displayCustomerChoiceList); // adds event listener for focus in
    studentInput.addEventListener("focusout", hideCustomerChoiceList); // adds event listener for focus out
    studentInput.addEventListener("keyup", filterCustomerChoiceList); // adds event listener to trigger search filter on keyup
    studentInput.addEventListener("keydown", customerKeyboardSelect); // adds event listener to trigger search filter on keyup
}