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
    if (hiddenInput.value != '' && e && e.keyCode != 13) {
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

    getStudentClassInformation(studentId); // gets student class information
}

// NEW/EDIT NOTE - ADD NEW NOTE & GO TO RETURN LINK
function createNote(csrfToken) {
    var studentId   = document.getElementById('new-customer-input-hidden').value;
    var date        = document.getElementById('new-date-input').value;
    var time        = document.getElementById('new-time-input').value;
    var type        = document.getElementById('new-type-input').value;
    var instructor  = document.getElementById('new-instructor-input').value;
    var instructor2 = document.getElementById('new-instructor-2-input').value;
    var noteText    = document.getElementById('new-note-text-input').value;
    var archived    = document.getElementById('archived').value;

    let fieldValue = [['customer_id', studentId],['date', date], ['time', time], ['type', type],['instructor_1', instructor], ['instructor_2', instructor2], ['note_text', noteText], ['archived', archived],]
    let parameter = 'CREATE';

    function sendData() {
        parameters = {
            'csrfmiddlewaretoken': csrfToken, // CSRF token
            'parameter': parameter,
            'field_value': JSON.stringify(fieldValue),
        }
    
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "notes_api",
            data: parameters,
            success: function (data) { 
                let urlParams = window.location.search; // gets url search string
                let urlParamsAll = new URLSearchParams(urlParams); // parses all parameters
                let returnLink = urlParamsAll.get('return_link'); // gets return link parameter
                window.location.href = `${returnLink}?jump_to=nc-${data.notes.note_id}`; //redirects to return link
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

// NEW/EDIT NOTE - ADD NEW NOTE & CREATE NEW NOTE
function createNoteAndNew(csrfToken) {
    var studentId   = document.getElementById('new-customer-input-hidden').value;
    var date        = document.getElementById('new-date-input').value;
    var time        = document.getElementById('new-time-input').value;
    var type        = document.getElementById('new-type-input').value;
    var instructor  = document.getElementById('new-instructor-input').value;
    var instructor2 = document.getElementById('new-instructor-2-input').value;
    var noteText    = document.getElementById('new-note-text-input').value;
    var archived    = document.getElementById('archived').value;

    let fieldValue = [['customer_id', studentId],['date', date], ['time', time], ['type', type],['instructor_1', instructor], ['instructor_2', instructor2], ['note_text', noteText], ['archived', archived],]
    let parameter = 'CREATE';

    function sendData() {
        parameters = {
            'csrfmiddlewaretoken': csrfToken, // CSRF token
            'parameter': parameter,
            'field_value': JSON.stringify(fieldValue),
        }
    
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "notes_api",
            data: parameters,
            success: function (data) { 
                alertMessage(`「${data.parameters.student_kanji_last} ${data.parameters.student_kanji_first}」のイベントを作成しました`); // generates alert message
                clearNoteInputValues(); // clears input values
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

// CLEAR INPUT VALUES IN NOTES CREATE PAGE
function clearNoteInputValues() {
    let customerInput = document.getElementById('new-customer-input');
    let customerInputHidden = document.getElementById('new-customer-input-hidden');
    let classInfoContainer = document.getElementById('student-class-info-container');
    let date = document.getElementById('new-date-input');
    let time = document.getElementById('new-time-input');
    let type = document.getElementById('new-type-input');
    let instructorOne = document.getElementById('new-instructor-input');
    let instructorTwo = document.getElementById('new-instructor-2-input');
    let text = document.getElementById('new-note-text-input');
    let archiveButton = document.getElementById('archive-button-container');
    let archiveValue = document.getElementById('archived');

    customerInput.value = '';
    customerInputHidden.value = '';
    classInfoContainer.innerHTML = '';
    date.value = '';
    time.value = '';
    type.value = 0;
    instructorOne.value = 0;
    instructorTwo.value = 0;
    text.value = '';
    archiveButton.classList.remove('archived');
    archiveValue.value = 'False';
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
        } else if (containsHighlighted == true && keyCode == 13) { // ENTER KEY PRESS
            let studentID = allCustomers[i].id.slice(2); // gets student ID

            let studentInput = document.getElementById('new-customer-input');
            studentInput.value = allCustomers[i].innerHTML;

            let hiddenInput = document.getElementById('new-customer-input-hidden');
            hiddenInput.value = studentID;
            
            let dateInput = document.getElementById('new-date-input');
            dateInput.focus();

            getStudentClassInformation(studentID); // gets student class information
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

    if (e.keyCode == 13 | e.keyCode == 38 | e.keyCode == 40 | e.keyCode == 27) {
        e.preventDefault();
        handleKeypress(e.keyCode);
    }
    if (e.keyCode == 8) {
        let studentClassInfoContainer = document.getElementById('student-class-info-container');
        studentClassInfoContainer.innerHTML = '';
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

// PREFILL NOTE FIELDS
function prefillNote() {
    let urlParams = window.location.search; // gets url search string
    let urlParamsAll = new URLSearchParams(urlParams); // parses all parameters
    let prefillCustomerID = urlParamsAll.get('prefill_note_customer'); // gets customer id parameter

    if (prefillCustomerID) {
        let hiddenInput = document.getElementById('new-customer-input-hidden'); // get: hidden input
        hiddenInput.value = prefillCustomerID; // sets customer ID as hidden input value
    
        let studentName = document.getElementById(`s-${prefillCustomerID}`).innerHTML;
        let input = document.getElementById('new-customer-input'); // get: new customer input
        input.value = studentName; // sets input value as customer choice text

        getStudentClassInformation(prefillCustomerID); // gets student class information
    }
}

// GET STUDENT CLASS INFO
function getStudentClassInformation(studentId) {
    csrfToken = document.getElementById('page-meta').dataset.csrf_token;
    parameter = "GET_FOR_STUDENT"

    parameters = {
        'csrfmiddlewaretoken': csrfToken, // CSRF token
        'parameter': parameter,
        'customer_id': studentId,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/class_list/class_list_api",
        data: parameters,
        success: function (data) {
            // passes classes data into building function
            buildStudentClassInformation(data.classes);
        }
    })
}

// BUILD STUDENT CLASS INFO
function buildStudentClassInformation(classes) {
    let mainContainer = document.getElementById('student-class-info-container');
    mainContainer.innerHTML = '';

    var i;
    for (i = 0; i < classes.length; i++) {
        // CONTAINER
        let classContainer = document.createElement('div');
        classContainer.classList.add('class-container');
        classContainer.addEventListener("click", autoFillNoteInfo);
        mainContainer.appendChild(classContainer);

        // CONTAINER -> INSTRUCTOR ICON
        let instructorIcon = document.createElement('div');
        instructorIcon.classList.add('instructor-icon');
        instructorIcon.style.backgroundImage = `url('/static/customer/notes/img/instructors/${classes[i].primaryInstructorID}.svg')`;
        classContainer.appendChild(instructorIcon);

        // CONTAINER -> CLASS NAME / DAY OF WEEK / TIME
        dayOfWeekList = [
            '日曜日',
            '月曜日',
            '火曜日',
            '水曜日',
            '木曜日',
            '金曜日',
            '土曜日',
            '-------'
        ]
        let className = document.createElement('div');
        className.classList.add('class-name');
        className.innerHTML = `${classes[i].className} - ${dayOfWeekList[classes[i].dayOfWeek]} - ${classes[i].startTime}`;
        classContainer.appendChild(className);

        // CONTAINER -> NEXT LESSON
        let today = new Date();
        var n;
        for (n = 0; n < 7; n++) {
            date = today.setDate(today.getDate() + 1);
            if (new Date(date).getDay() == classes[i].dayOfWeek) {
                var nextLessonDate = new Date(date);
            }
        }
        let nextLesson = document.createElement('div');
        nextLesson.classList.add('next-lesson');
        nextLesson.innerHTML = `${nextLessonDate.getMonth() + 1}月${nextLessonDate.getDate()}日 - ${dayOfWeekList[nextLessonDate.getDay()]} - ${classes[i].startTime} - ${classes[i].primaryInstructorLast}先生`;
        classContainer.appendChild(nextLesson);

        // CONTAINER -> METADATA
        classContainer.dataset.date = nextLessonDate;
        classContainer.dataset.time = classes[i].startTime;
        classContainer.dataset.instructor = classes[i].primaryInstructorID

        // ADDS CSS TO CLASS CONTAINER TO FADE IN
        classContainer.classList.add('class-container-visible');
    }
}

// STUDENT INPUT KEYUP FUNCTION
function studentInputKeyup(e) {
    let studentInput = document.getElementById('new-customer-input').value;
    let studentInputLength = studentInput.length;
    if (studentInputLength == 0) {
        let studentClassInfoContainer = document.getElementById('student-class-info-container');
        studentClassInfoContainer.innerHTML = '';
    }
}

// AUTO FILL NOT INFORMATION
function autoFillNoteInfo() {
    let dateField = document.getElementById('new-date-input');
    let timeField = document.getElementById('new-time-input');
    let instructorField = document.getElementById('new-instructor-input');

    let date = new Date(this.dataset.date);
    let monthFull = `0${date.getMonth() + 1}`.slice(-2);
    let dayFull = `0${date.getDate()}`.slice(-2);
    let dateString = `${date.getFullYear()}-${monthFull}-${dayFull}`;

    dateField.value = dateString;
    timeField.value = this.dataset.time;
    instructorField.value = this.dataset.instructor;
}

// GENERATES ALERT MESSAGE
function alertMessage(alertMessage) {
    // REMOVES PREVIOUS ALERTS
    let previousContainer = document.getElementById('alert-container');
    if (previousContainer) {
        previousContainer.remove();
    }
    // CONTAINER
    let alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    document.body.appendChild(alertContainer);
    // CONTAINER -> MESSAGE
    let message = document.createElement('div');
    message.id = 'alert-message';
    message.innerHTML = alertMessage;
    alertContainer.appendChild(message);
}