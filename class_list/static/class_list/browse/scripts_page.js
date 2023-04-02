// attach event listeners on load
function initializingScripts() {
    let searchButton = document.getElementById('search-submit-button-container');
    searchButton.addEventListener("click", searchButtonClick); // handles clicks to the search button

    setSelectedDayOfWeekButtons();
    setSelectedInstructorButtons();
}

// keystroke listener for search input
function searchInputKeystrokeListener(e) {
    let searchInput = document.getElementById('search-input');
    let searchInputValue = searchInput.value;

    if (e.keyCode == 13) {
        searchInput.removeEventListener("keydown", searchInputKeystrokeListener); // temporarily removes search input keystroke event listener
        searchButtonClick(); // clicks the search button
    } else if (e.keyCode == 8 && searchInputValue.length == 1) {
        searchInput.removeEventListener("keydown", searchInputKeystrokeListener); // temporarily removes search input keystroke event listener
        document.getElementById('search-input').value = '';
        searchButtonClick(); // clicks the search button; in this case, it will requery the DB with no search input
    } else if (e.keyCode == 8 && searchInputValue.length == document.getSelection().toString().length) {
        searchInput.removeEventListener("keydown", searchInputKeystrokeListener); // temporarily removes search input keystroke event listener
        document.getElementById('search-input').value = '';
        searchButtonClick(); // clicks the search button; in this case, it will requery the DB with no search input
    }
}

// SEARCH BUTTON
function searchButtonClick() {
    document.body.style.pointerEvents = "none"; // disables all clicks to body while processing
    // resets batch number in page meta div
    let pageMeta = document.getElementById('page-meta');
    pageMeta.dataset.batch_number = 0;
    // removes all records from DOM
    let classCardsPrimaryContainer = document.getElementById('class-cards-primary-container');
    classCardsPrimaryContainer.innerHTML = '';
    // clears results displayed number line in top information section
    let topInformationSection = document.getElementById('top-information-section');
    topInformationSection.innerHTML = '';

    let csrfToken = pageMeta.dataset.csrf; // gets CSRF token from page meta div
    loadClassRecords(csrfToken, "RETRIEVE_ALL");
}

// uses AJAX to asynchronously query database
function loadClassRecords(csrfToken, parameter) {
    addRemoveLoading('ADD', 'loading-container'); // adds loading spinner
    
    let batchNumber = document.getElementById('page-meta').dataset.batch_number; // gets current batch number
    let searchParameter = document.getElementById('search-input').value; // gets search field input value
    let displayArchived = document.getElementById('page-meta').dataset.display_archived; // gets display archived boolean
    let dayOfWeekFilter = document.getElementById('day-select-container').dataset.selected_days; // gets selected days
    let instructorFilter = document.getElementById('instructor-select-container').dataset.selected_instructors; // gets selected instructors

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': parameter,
        'batch_number': batchNumber,
        'search_parameter': searchParameter,
        'display_archived': displayArchived,
        'day_of_week_filter': dayOfWeekFilter,
        'instructor_filter': instructorFilter,
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "class_list_api",
        data: parameters,
        success: function (data) {
            if (data.parameter == "RETRIEVE_ALL") {
                buildBrowsePage(data);                
                jumpToClass();
            }
        },
    })
}

// uses AJAX to asynchronously query database
function loadNextPage(csrfToken, parameter) {
    let batchNumber = document.getElementById('page-meta').dataset.batch_number;
    let searchParameter = document.getElementById('search-input').value; // gets search field input value
    let displayArchived = document.getElementById('page-meta').dataset.display_archived; // gets display archived boolean
    let dayOfWeekFilter = document.getElementById('day-select-container').dataset.selected_days; // gets selected days
    let instructorFilter = document.getElementById('instructor-select-container').dataset.selected_instructors; // gets selected instructors


    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': parameter,
        'batch_number': batchNumber,
        'search_parameter': searchParameter,
        'display_archived': displayArchived,
        'day_of_week_filter': dayOfWeekFilter,
        'instructor_filter': instructorFilter,
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "class_list_api",
        data: parameters,
        success: function (data) {
            if (data.parameter == "RETRIEVE_ALL") {
                buildCard(data.classListAll,document.getElementById('class-cards-primary-container'));
            }
        },
    })
}

// BUILD BROWSE PAGE
function buildBrowsePage(data) {
    // FIXED PAGE ELEMENTS
    let pageMeta = document.getElementById('page-meta');

    // TOP INFORMATION SECTION
    let topInformationContainer = document.getElementById('top-information-section');

    // CLASS CARDS SECTION
    let classCardsSection = document.getElementById('class-cards-section');

    // CLASS CARDS SECTION -> PRIMARY CONTAINER
    let classCardsPrimaryContainer = document.getElementById('class-cards-primary-container');
    classCardsSection.appendChild(classCardsPrimaryContainer);

    // BUILDS CARD AND INSERTS INTO DOM
    buildCard(data.classListAll, classCardsPrimaryContainer);

    // TOP INFORMATION SECTION -> NUMBER OF DISPLAYED
    let topInformationLineOne = document.createElement('div');
    topInformationLineOne.id = "results-displayed-top-information";
    topInformationLineOne.innerHTML = `${data.classCount}件を表示しています`;
    topInformationContainer.appendChild(topInformationLineOne);

    // TOP INFORMATION SECTION -> ARCHIVED CLASSES DISPLAYED
    let topInformationLineTwo = document.createElement('div');
    topInformationLineTwo.id = "archived-displayed-top-information";
    if (data.displayArchived == 'False') {
        topInformationLineTwo.innerHTML = 'アーカイブされた件は非表示です';
    } else {
        topInformationLineTwo.innerHTML = 'アーカイブされた件も表示しています';
    }
    topInformationContainer.appendChild(topInformationLineTwo);

    // TOP INFORMATION SECTION -> ACTIVE SEARCH
    let searchInputValue = document.getElementById('search-input').value;
    if (searchInputValue.length > 0) {
        let topInformationLineThree = document.createElement('div');
        topInformationLineThree.id = 'search-active-top-information';
        topInformationLineThree.innerHTML = `「${searchInputValue}」で検索しました`;
        topInformationContainer.appendChild(topInformationLineThree);
    }

    lazyLoad(); // performs a lazy load check once after the page is initially loaded
}

// BUILDS CARDS
function buildCard(classListAll, classCardsPrimaryContainer) {
    const statusCSS = [ // enrollment status css classes
        'pre-enrolled',
        'pre-enrolled',
        'enrolled',
        'short-absence',
        'long-absence',
    ]

    // CLASS CARDS SECTION -> PRIMARY CONTAINER -> CLASS CARD CONTAINER
    // classListAll = data.classListAll; // gets all class data
    var i;
    for (i = 0; i < classListAll.length; i++) {
        // ... -> CLASS CARD CONTAINER
        let classCardContainer = document.createElement('div');
        classCardContainer.classList.add('class-card-container');
        classCardContainer.id = `class-${classListAll[i].classID}`;
        classCardsPrimaryContainer.appendChild(classCardContainer);

        // ... -> CLASS CARD CONTAINER -> HEADER CONTAINER
        let classCardHeader = document.createElement('div');
        classCardHeader.classList.add('class-card-header');
        classCardContainer.appendChild(classCardHeader);

        // ... -> CLASS CARD CONTAINER -> HEADER CONTAINER -> ARCHIVED
        let archived = document.createElement('div');
        archived.classList.add('archived-icon');
        classCardHeader.appendChild(archived);
        if (classListAll[i].archived) {
            classCardContainer.classList.add('archived');
        }

        // ... -> CLASS CARD CONTAINER -> HEADER CONTAINER -> CLASS HEADER NAME
        let classHeaderName = document.createElement('div');
        classHeaderName.classList.add('class-header-name');
        classHeaderName.innerHTML = classListAll[i].className;
        classCardHeader.appendChild(classHeaderName);

        // ... -> CLASS CARD CONTAINER -> BODY
        let classCardBody = document.createElement('div');
        classCardBody.classList.add('class-card-body');
        classCardContainer.appendChild(classCardBody);

        // ... -> CLASS CARD CONTAINER -> BODY -> DAY OF WEEK CONTAINER
        let dayOfWeekContainer = document.createElement('div');
        dayOfWeekContainer.classList.add('day-of-week-container');
        classCardBody.appendChild(dayOfWeekContainer);

        // ... -> CLASS CARD CONTAINER -> BODY -> TIME CONTAINER
        let timeContainer = document.createElement('div');
        timeContainer.classList.add('time-container');
        classCardBody.appendChild(timeContainer);

        // ... -> CLASS CARD CONTAINER -> BODY -> DAY OF WEEK CONTAINER -> DAY
        const dayOfWeekValues = [
            '日',
            '月',
            '火',
            '水',
            '木',
            '金',
            '土',
            '-------',
        ]

        var y;
        for (y = 0; y < 7; y++) {
            // days of week
            let day = document.createElement('div');
            day.classList.add('day');
            day.innerHTML = dayOfWeekValues[y];
            dayOfWeekContainer.appendChild(day);
            // time
            let time = document.createElement('div');
            time.classList.add('time');
            timeContainer.appendChild(time);

            if (classListAll[i].dayOfWeek == y) {
                day.classList.add('day-active'); // adds active class to day of week
                if (classListAll[i].startTime != '') {
                    time.innerHTML = classListAll[i].startTime; // adds start time value beneath highlighted day of week
                    time.classList.add('time-active'); // adds active class to time
                }
            }
        }

        // ... -> CLASS CARD CONTAINER -> BODY -> PRIMARY INSTRUCTOR ICON
        let primaryInstructor = document.createElement('div');
        if (classListAll[i].primaryInstructorId != '0') {
            primaryInstructor.classList.add('primary-instructor-icon');
            primaryInstructor.style.backgroundImage = `url('/static/customer/notes/img/instructors/${classListAll[i].primaryInstructorId}.svg')`;
        }
        classCardBody.appendChild(primaryInstructor);

        // ... -> CLASS CARD CONTAINER -> BODY -> LESSON DESCRIPTION CONTAINER
        let descriptionContainer = document.createElement('div');
        descriptionContainer.classList.add('class-description-container');
        classCardBody.appendChild(descriptionContainer);

        // ... -> CLASS CARD CONTAINER -> BODY -> LESSON DESCRIPTION CONTAINER -> CLASS TYPE
        let classType = document.createElement('div');
        classType.classList.add('class-type');
        classType.innerHTML = classListAll[i].classType
        descriptionContainer.appendChild(classType);

        // ... -> CLASS CARD CONTAINER -> BODY -> LESSON DESCRIPTION CONTAINER -> INSTRUCTOR
        let instructor = document.createElement('div');
        instructor.classList.add('instructor');
        instructor.innerHTML = `${classListAll[i].primaryInstructorLastNameKanji}先生`
        descriptionContainer.appendChild(instructor);


        // ... -> CLASS CARD CONTAINER -> BODY -> LESSON DESCRIPTION CONTAINER -> REGULARITY
        var regularityValue;
        if (classListAll[i].irregular == false) {
                regularityValue = '定期';
            } else {
                regularityValue = '不定期';
            }
        let regularity = document.createElement('div');
        regularity.classList.add('regularity');
        regularity.innerHTML = regularityValue
        descriptionContainer.appendChild(regularity);

        // ... -> CLASS CARD CONTAINER -> BODY -> SEPARATOR
        let separator = document.createElement('div');
        separator.classList.add('separator');
        classCardBody.appendChild(separator);

        // ... -> CLASS CARD CONTAINER -> BODY -> STUDENTS CONTAINER
        let studentsContainer = document.createElement('div');
        studentsContainer.classList.add('students-container');
        classCardBody.appendChild(studentsContainer);

        // ... -> CLASS CARD CONTAINER -> BODY -> STUDENTS CONTAINER - STUDENT NAME CONTAINER
        // STUDENT DATA SORT
        classListAll[i].students.sort((a, b) => {
            let fa = a.last_name_katakana;
                fb = b.last_name_katakana;
            if (fa < fb) {
                return -1;
            }
            if (fa > fb) {
                return 1;
            }
            return 0;
        });

        var n;
        for (n = 0; n < classListAll[i].students.length; n++) {
            // STUDENT NAME CONTAINER
            let studentNameContainer = document.createElement('a');
            studentNameContainer.classList.add('student-name-container');
            studentNameContainer.href = `/customer/detail/${classListAll[i].students[n].id}`;
            studentsContainer.appendChild(studentNameContainer);
            // STUDENT NAME CONTAINER -> STATUS
            let statusIndicator = document.createElement('div');
            statusIndicator.classList.add('enrollment-status-indicator');
            statusIndicator.classList.add(statusCSS[classListAll[i].students[n].enrollment_status]);
            statusIndicator.style.backgroundImage = `url("/static/class_list/img/enrollment_status_icons/${classListAll[i].students[n].enrollment_status}.svg")`;
            studentNameContainer.appendChild(statusIndicator);
            // STUDENT NAME CONTAINER -> NAME KANJI & GRADE
            let studentNameKanji = document.createElement('div');
            studentNameKanji.classList.add('student-name-kanji');
            if (classListAll[i].students[n].grade != '-------') {
                studentNameKanji.innerHTML = `${classListAll[i].students[n].last_name_kanji} ${classListAll[i].students[n].first_name_kanji}（${classListAll[i].students[n].grade}）`;
            } else {
                studentNameKanji.innerHTML = `${classListAll[i].students[n].last_name_kanji} ${classListAll[i].students[n].first_name_kanji}`;
            }
            studentNameContainer.appendChild(studentNameKanji);
            // STUDENT NAME CONTAINER -> NAME KATAKANA
            let studentNameKatakana = document.createElement('div');
            studentNameKatakana.classList.add('student-name-katakana');
            studentNameKatakana.innerHTML = `${classListAll[i].students[n].last_name_katakana}　${classListAll[i].students[n].first_name_katakana}`;
            studentNameContainer.appendChild(studentNameKatakana);
        }

        // ... -> CLASS CARD CONTAINER -> FOOTER
        let classCardFooter = document.createElement('div');
        classCardFooter.classList.add('class-card-footer');
        classCardContainer.appendChild(classCardFooter);

        // ... -> CLASS CARD CONTAINER -> FOOTER -> EDIT BUTTON
        let editButton = document.createElement('a');
        editButton.classList.add('edit-button');
        editButton.href = `/class_list/edit/${classListAll[i].classID}?return_link=/class_list/browse`;
        classCardFooter.appendChild(editButton);

        // ... -> CLASS CARD CONTAINER -> FOOTER -> ARCHIVE BUTTON
        let archiveButton = document.createElement('div');
        archiveButton.classList.add('archive-button');
        archiveButton.addEventListener("click", archiveClassButton);
        classCardFooter.appendChild(archiveButton);

        // CONTAINER -> FOOTER -> BUTTON PLACEHOLDERS
        // var y;
        // for (y = 0; y < 2; y++) {
        //     let placeholderButton = document.createElement('div');
        //     classCardFooter.appendChild(placeholderButton);
        // }

    }

    // increments batch number meta data
    let pageMeta = document.getElementById('page-meta');
    let batchNumberInteger = parseInt(pageMeta.dataset.batch_number);
    pageMeta.dataset.batch_number = batchNumberInteger + 1;

    // reload lazy load event listener if previous query returns results
    if (classListAll.length != 0) {
        document.addEventListener("scroll", lazyLoad); // adds lazy load event listener
    }

    // re-adds keystroke listener to search field
    let searchInput = document.getElementById('search-input');
    searchInput.addEventListener("keydown", searchInputKeystrokeListener);

    addRemoveLoading(); // removes loading spinner
    document.body.style.pointerEvents = "auto"; // re-enables clicks to the body

    let subMenu = document.getElementById('buttons-container-sub-menu');
    if (subMenu.classList.contains('show-sub-menu') | window.innerWidth >= 768) {
        subMenu.classList.remove('disable-clicks'); // re-enables clicks to filter button menu
    }

    // checks page hight and performs lazy load if insufficient page height
    lazyLoadPageHeightCheck(classListAll.length);
}

// LAZY LOAD SCROLL LISTENER
function lazyLoad() {
    // gets necessary scroll values to calculate approximate position from bottom of scroll
    var windowPosition = window.pageYOffset;
    var windowSize = window.innerHeight;
    var bodyHeight = document.body.offsetHeight;

    var calculation = windowPosition + windowSize - bodyHeight;

    if (calculation > -500) {
        document.body.style.pointerEvents = "none"; // disables all clicks to body while processing

        let searchInput = document.getElementById('search-input');
        searchInput.removeEventListener("keydown", searchInputKeystrokeListener); // temporarily removes search input keystroke event listener

        addRemoveLoading('ADD', 'loading-container'); // adds loading spinner

        document.removeEventListener("scroll", lazyLoad); // removes lazy load event listener

        pageMeta = document.getElementById('page-meta');
        csrfToken = pageMeta.dataset.csrf;
        loadNextPage(csrfToken, "RETRIEVE_ALL");
    }
}

// ADD/REMOVE LOADING SPINNER
function addRemoveLoading(addRemove) {
    // removes any existing loading spinners
    let loadingContainer = document.getElementById('loading-container');
    loadingContainer.innerHTML = '';

    if (addRemove == 'ADD') {
        let spinnerContainer = document.createElement('div');
        spinnerContainer.classList.add('loading-spinner');
        spinnerContainer.innerHTML = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
        loadingContainer.appendChild(spinnerContainer);
    }
}

// LAZY LOAD PAGE HEIGHT CHECK
function lazyLoadPageHeightCheck(resultsLength) {
    windowHeight = window.innerHeight;
    bodyHeight = document.body.offsetHeight;
    heightComparison = bodyHeight - windowHeight;

    if (resultsLength != 0  && heightComparison < 500) {
        lazyLoad(); // performs lazy load
    }
}

// ARCHIVED CLASS TOGGLE
function toggleArchived() {
    // disables all clicks to page
    document.body.style.pointerEvents = 'none';
    // toggles display archived button status
    document.getElementById('archive-button').classList.toggle('archive-button-active');
    // clears all contents from DOM
    let classCardsPrimaryContainer = document.getElementById('class-cards-primary-container');
    classCardsPrimaryContainer.innerHTML = '';
    // clears top information
    let topInformation = document.getElementById('top-information-section');
    topInformation.innerHTML = '';
    // resets batch number counter
    document.getElementById('page-meta').dataset.batch_number = 0;

    let csrfToken = document.getElementById('page-meta').dataset.csrf;

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'preference': 'display_archived_classes',
        'value': '',
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/user_profile/set_user_preference/",
        data: parameters,
        success: function (data) {
            // toggles display_archived status
            let outputString = String(data.output).charAt(0).toUpperCase() + String(data.output).slice(1);
            document.getElementById('page-meta').dataset.display_archived = outputString;
            // reloads class records
            loadClassRecords(csrfToken, 'RETRIEVE_ALL');
        },
    })

}

// DAY FILTER - TOGGLE
function toggleDayFilter(dayID) {
    document.body.style.pointerEvents = 'none'; // disables all clicks to page
    document.getElementById('buttons-container-sub-menu').classList.add('disable-clicks'); // disables clicks to filter button menu

    let container = document.getElementById('day-select-container'); // get button container

    let selectedDaysString = container.dataset.selected_days; // gets list of selected days
    let selectedDaysArray = selectedDaysString.split(',');

    let matchIndex = selectedDaysArray.indexOf(dayID.slice(4)); // derives day of week integer from button id

    if (matchIndex != -1) {
        selectedDaysArray.splice(matchIndex, 1); // if day of week integer is found, remove from array
    } else {
        selectedDaysArray.push(dayID.slice(4));  // if day of week integer is not found, add to array
    }

    // sets filter toggle button status
    let filterToggleButton = document.getElementById('day-filter-button');
    if (selectedDaysArray.length == 1) {
        filterToggleButton.classList.remove('day-filter-button-active');
    } else if (selectedDaysArray.length == 2) {
        filterToggleButton.classList.add('day-filter-button-active');
    }

    container.dataset.selected_days = selectedDaysArray; // sets data attribute to selected day string

    let dayButton = document.getElementById(dayID); // gets button
    dayButton.classList.toggle('selected'); // toggles selected class

    // clears all contents from DOM
    let classCardsPrimaryContainer = document.getElementById('class-cards-primary-container');
    classCardsPrimaryContainer.innerHTML = '';

    // clears top information
    let topInformation = document.getElementById('top-information-section');
    topInformation.innerHTML = '';

    // resets batch number counter
    document.getElementById('page-meta').dataset.batch_number = 0;

    let csrfToken = document.getElementById('page-meta').dataset.csrf;

    loadClassRecords(csrfToken, 'RETRIEVE_ALL');

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'preference': 'display_classes_day_of_week',
        'value': selectedDaysArray.toString(),
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/user_profile/set_user_preference/",
        data: parameters,
        success: function (data) {
        },
    })
}

// DAY FILTER - SET INITIAL VALUES
function setSelectedDayOfWeekButtons() {
    let buttonContainer = document.getElementById('day-select-container'); // gets button container
    valueList = buttonContainer.dataset.selected_days.split(','); // creates list

    var i;
    for (i = 0; i < valueList.length; i++) {
        button = document.getElementById(`day-${valueList[i]}`); // gets button
        if (button) { // if button exists
            button.classList.add('selected'); // add selected class
        }
    }

    // sets filter toggle button status
    if (valueList.length > 1) {
        let filterToggleButton = document.getElementById('day-filter-button');
        filterToggleButton.classList.add('day-filter-button-active');
    }
}

// INSTRUCTOR FILTER - TOGGLE
function toggleInstructorDisplay(instructorId) {
    document.body.style.pointerEvents = 'none'; // disables all clicks to page
    document.getElementById('buttons-container-sub-menu').classList.add('disable-clicks'); // disables clicks to filter button menu

    let container = document.getElementById('instructor-select-container'); // get button container

    let selectedInstructorsString = container.dataset.selected_instructors; // gets list of selected instructors
    let selectedInstructorsArray = selectedInstructorsString.split(',');

    let matchIndex = selectedInstructorsArray.indexOf(instructorId.slice(11)); // derives instructor integer from button id

    if (matchIndex != -1) {
        selectedInstructorsArray.splice(matchIndex, 1); // if instructor integer is found, remove from array
    } else {
        selectedInstructorsArray.push(instructorId.slice(11));  // if instructor integer is not found, add to array
    }

    // sets filter toggle button status
    let filterToggleButton = document.getElementById('day-filter-button');

    let daysContainer = document.getElementById('day-select-container'); // get button container
    let selectedDaysString = daysContainer.dataset.selected_days; // gets list of selected days
    let selectedDaysArray = selectedDaysString.split(',');

    if (selectedDaysArray.length == 1 && selectedInstructorsArray.length == 1) {
        filterToggleButton.classList.remove('day-filter-button-active');
    } else if (selectedInstructorsArray.length == 2) {
        filterToggleButton.classList.add('day-filter-button-active');
    }

    container.dataset.selected_instructors = selectedInstructorsArray; // sets data attribute to selected day string

    let instructorButton = document.getElementById(instructorId); // gets button
    instructorButton.classList.toggle('selected'); // toggles selected class

    // clears all contents from DOM
    let classCardsPrimaryContainer = document.getElementById('class-cards-primary-container');
    classCardsPrimaryContainer.innerHTML = '';

    // clears top information
    let topInformation = document.getElementById('top-information-section');
    topInformation.innerHTML = '';

    // resets batch number counter
    document.getElementById('page-meta').dataset.batch_number = 0;

    let csrfToken = document.getElementById('page-meta').dataset.csrf;

    loadClassRecords(csrfToken, 'RETRIEVE_ALL');

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'preference': 'display_classes_instructors',
        'value': selectedInstructorsArray.toString(),
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/user_profile/set_user_preference/",
        data: parameters,
        success: function (data) {
        },
    })
}

// INSTRUCTOR FILTER - SET INITIAL VALUES
function setSelectedInstructorButtons() {
    let buttonContainer = document.getElementById('instructor-select-container'); // gets button container
    valueList = buttonContainer.dataset.selected_instructors.split(','); // creates list

    var i;
    for (i = 0; i < valueList.length; i++) {
        button = document.getElementById(`instructor-${valueList[i]}`); // gets button
        if (button) { // if button exists
            button.classList.add('selected'); // add selected class
        }
    }

    // sets filter toggle button status
    if (valueList.length > 1) {
        let filterToggleButton = document.getElementById('day-filter-button');
        filterToggleButton.classList.add('day-filter-button-active');
    }
}

// TOGGLES DAY OF WEEK SELECTION MENU WHEN ON SMALL DEVICES
function toggleDayOfWeekDisplay() {
    let primaryContainer = document.getElementById('buttons-container-sub-menu');
    if (primaryContainer.classList.contains('show-sub-menu')) {
        primaryContainer.classList.add('disable-clicks');
    } else {
        primaryContainer.classList.remove('disable-clicks');
    }
    primaryContainer.classList.toggle('show-sub-menu');
}

// ARCHIVES/UNARCHIVES CLASS
function archiveClassButton() {
    document.body.style.pointerEvents = 'none'; // disables clicks to body

    let csrfToken = document.getElementById('page-meta').dataset.csrf; // gets csrf token

    let cardContainer = this.parentElement.parentElement; // gets class card container

    let classID = cardContainer.id.slice(6); // gets class card id
    
    cardContainer.classList.toggle('archived'); // toggles archived class

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': 'TOGGLE_ARCHIVED_SINGLE',
        'classID': classID,
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "class_list_api",
        data: parameters,
        success: function (data) {
            document.body.style.pointerEvents = 'auto'; // enables clicks to body
        },
    })
}