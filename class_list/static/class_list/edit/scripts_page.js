// runs on page load
function initializingScripts() {
    studentSearchInput = document.getElementById('input-students');
    studentSearchInput.addEventListener("focus", studentSearchFocusIn); // adds focus in event listener
    studentSearchInput.addEventListener("focusout", studentSearchFocusOut); // adds focus out event listener
    studentSearchInput.addEventListener("keyup", filterStudentChoiceList); // adds keyup event listener for student choice filter
    studentSearchInput.addEventListener("keydown", customerKeyboardSelect); // adds event listener to trigger search filter on keyup
}

// handles student search input focus in
function studentSearchFocusIn() {
    clearCustomerHighlight(); // clears previously highlighted students
    let studentSelectList = document.getElementById('student-select-list');
    studentSelectList.classList.add('active');
    let studentSearchInput = document.getElementById('input-students');
    studentSearchInput.classList.add('active');
}

// handles student search input focus out
function studentSearchFocusOut() {
    let studentSelectList = document.getElementById('student-select-list');
    studentSelectList.classList.remove('active');
    let studentSearchInput = document.getElementById('input-students');
    studentSearchInput.classList.remove('active');
}

// toggles slider buttons
function toggleSlider(sliderID) {
    let slider = document.getElementById(sliderID); // gets slider node
    slider.classList.toggle('archived'); // toggles slider
}

// filters customer choice list
function filterStudentChoiceList(e) {
    var input = document.getElementById('input-students'); // get input field
    var inputText = input.value; // gets input value
    var inputTextUpper = inputText.toUpperCase(); // parses to uppercase
    
    var choiceListContainer = document.getElementById('student-select-list'); // gets container which contains all customer names
    var allChoices = choiceListContainer.getElementsByClassName('student-choice'); // gets all choices

    var i;
    for (i = 0; i < allChoices.length; i++) {
        var searchMeta = allChoices[i].dataset.meta; // gets meta data (first/last kanji, katakana, romaji)
        var searchMetaUpper = searchMeta.toUpperCase(); // parses to uppercase
        var stringMatch = searchMetaUpper.indexOf(inputTextUpper);
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

// select student from choice list
function selectStudentFromChoiceList(studentID, studentLastName, studentFirstName) {
    clearStudentSearchInputField(); // clears input field
    toggleSelectedStudentHighlighting(studentID); // toggles highlighting in student select list
    addStudentToSelectedStudentBox(studentID, studentLastName, studentFirstName) // adds selected student to box
    disableClicksToSlectedCustomers(studentID); // disables clicks to selected customer
    filterStudentChoiceList(); // runs search algorithm to reset contents of list
}

// clears search input field
function clearStudentSearchInputField() {
    let inputField = document.getElementById('input-students');
    inputField.value = '';
}

// toggles selected student highting in student choice list
function toggleSelectedStudentHighlighting(studentID) {
    let studentListItem = document.getElementById(`student-${studentID}`);
    studentListItem.classList.add('selected');
}

// add student to selected student box
function addStudentToSelectedStudentBox(studentID, studentLastName, studentFirstName) {
    let box = document.getElementById('student-box');

    let student = document.createElement('div');
    student.id = `selected-student-${studentID}`;
    student.classList.add('selected-students');
    student.dataset.student_id = studentID;
    student.innerHTML = `${studentLastName} ${studentFirstName}`;
    box.appendChild(student);

    let removeButton = document.createElement('div');
    removeButton.classList.add('remove-button');
    removeButton.addEventListener("click", removeStudentFromSelectedStudentBox);
    let crossOne = document.createElement('div');
    crossOne.classList.add('cross-one');
    removeButton.appendChild(crossOne);
    let crossTwo = document.createElement('div');
    crossTwo.classList.add('cross-two');
    removeButton.appendChild(crossTwo);
    student.appendChild(removeButton);
}

// disables clicks to already selected customers in list
function disableClicksToSlectedCustomers(studentID) {
    let listItem = document.getElementById(`student-${studentID}`);
    listItem.style.pointerEvents = 'none';
}

// removes student from selected student box and removes higlighting from list
function removeStudentFromSelectedStudentBox() {
    let parent = this.parentElement;

    let listItem = document.getElementById(`student-${parent.dataset.student_id}`);
    listItem.classList.remove('selected'); // removes highlighting from list
    listItem.style.pointerEvents = 'auto'; // re-enables clicks to list item

    parent.remove(); // removes item from selected students box
}

// removes student from selected student box and removes higlighting from list
function removeStudentFromSelectedStudentBoxInitial(studentID) {
    let studentBubble = document.getElementById(`selected-student-${studentID}`);

    let listItem = document.getElementById(`student-${studentID}`);
    listItem.classList.remove('selected'); // removes highlighting from list
    listItem.style.pointerEvents = 'auto'; // re-enables clicks to list item

    studentBubble.remove(); // removes item from selected students box
}

// handles clicks to the edit button
function editClass() {
    let classMeta = document.getElementById('page-meta');

    let classID = classMeta.dataset.class_id;
    let className = document.getElementById('input-class-name').value; // class name

    let selectedStudents = document.getElementsByClassName('selected-students'); // students currently in class DOM elements
    var selectedStudentsIdList = []; // blank array for storing enrolled student IDs
    var i;
    for (i = 0; i < selectedStudents.length; i++) {
        selectedStudentsIdList.push(selectedStudents[i].dataset.student_id); // adds student id to array
    }
    
    let primaryInstructor           = document.getElementById('input-primary-instructor').value; // primary instructor
    let irregular                   = document.getElementById('irregular-lesson').classList.contains('archived'); // irregular lesson boolean
    let dayOfWeek                   = document.getElementById('input-day-of-week').value; // day of week
    let startTime                   = document.getElementById('input-start-time').value; // start time
    let archived                    = document.getElementById('archived').classList.contains('archived'); // archived boolean
    let classType                   = document.getElementById('input-class-type').value; // class type

    let params = new URLSearchParams(location.search);
    let returnLink = params.get('return_link');

    let csrfToken = document.body.dataset.csrf;

    parameters = {
        'csrfmiddlewaretoken': csrfToken, // CSRF token
        'parameter': 'EDIT_SINGLE', // create single instance of class
        'class_id': classID,
        'class_name': className,
        'primary_instructor': primaryInstructor,
        'irregular': irregular,
        'day_of_week': dayOfWeek,
        'start_time': startTime,
        'enrolled_students': String(selectedStudentsIdList),
        'archived': archived,
        'class_type': classType,
        'return_link': returnLink,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "../class_list_api",
        data: parameters,
        success: function (data) { 
            window.location.href = `${data.return_link}?jump_to_class=${data.class_id}`;
            console.log('AJAX SUCCESS');
        }
    })
}

// select customer using up/down arrow keys and return key
function customerKeyboardSelect(e) {
    function handleKeypress(keyCode) {
        let studentSelectList = document.getElementById('student-select-list'); // gets customer list container
        let allStudents = studentSelectList.getElementsByClassName('student-choice display-student-choice'); // gets all customers in list

        var emptyStudentList = false; // student list is empty
        emptyStudentList = allStudents.length == 0;

        // checks for presence of highlighted item in list
        var containsHighlighted = false;
        var i;
        for (i = 0; i < allStudents.length; i++) {
            if (allStudents[i].classList.contains('highlighted-student')) {
                containsHighlighted = true;
                break;
            }
        }

        if (!emptyStudentList) {
            // down arrow key
            if (keyCode == 40) {
                var highlightedIndex = -1;
                var n;
                for (n = 0; n < allStudents.length; n++) {
                    var isHighlighted = allStudents[n].classList.contains('highlighted-student');
                    var lastItemInList = n + 1 == allStudents.length;
                    if (isHighlighted) {
                        highlightedIndex = n;
                    }

                    if (!lastItemInList && highlightedIndex != -1 && !allStudents[n + 1].classList.contains('selected')) {
                        allStudents[highlightedIndex].classList.remove('highlighted-student');
                        allStudents[n + 1].classList.add('highlighted-student');
                        break;
                    }

                    // highlights first item in list if no highlighted items are found
                    if (highlightedIndex == -1 && lastItemInList) {
                        var y;
                        for (y = 0; y < allStudents.length; y++) {
                            if (!allStudents[y].classList.contains('selected')) {
                                allStudents[y].classList.add('highlighted-student');
                                break;
                            }
                        }
                    }
                }
            }
            // up arrow key
            else if (keyCode == 38) {
                var highlightedIndex = -1;
                var n;
                for (n = allStudents.length - 1; n > 0; n--) {
                    var isHighlighted = allStudents[n].classList.contains('highlighted-student');
                    if (isHighlighted) {
                        highlightedIndex = n;
                    }

                    if (highlightedIndex != -1 && !allStudents[n - 1].classList.contains('selected')) {
                        allStudents[highlightedIndex].classList.remove('highlighted-student');
                        allStudents[n - 1].classList.add('highlighted-student');
                        break;
                    }
                }
            }
        }

        if (containsHighlighted == true && keyCode == 13) {
            // return key
            let highlightedStudent = document.getElementsByClassName('highlighted-student')[0];
            let studentID = highlightedStudent.dataset.id;
            let studentLastNameKanji = highlightedStudent.dataset.last_name_kanji;
            let studentFirstNameKanji = highlightedStudent.dataset.first_name_kanji;
            selectStudentFromChoiceList(studentID, studentLastNameKanji, studentFirstNameKanji);
            let studentSearchInput = document.getElementById('input-students');
            studentSearchInput.blur();
        } else if (keyCode == 27) {
            // escape key
            let studentSearchInput = document.getElementById('input-students');
            studentSearchInput.blur();
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