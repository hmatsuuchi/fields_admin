function disableMenuClicks(toggle) {
    let header = document.getElementById('toolbar-container');
    if (toggle == 'disable') {
        header.style.pointerEvents = 'none';
    } else {
        header.style.pointerEvents = 'auto';
    }
}

function performNoteSearch() {
    document.removeEventListener("keydown", searchFieldReturnKey); // removes event listener
    document.removeEventListener("scroll", lazyLoad); // removes lazy load event listener

    document.getElementById('primary-container').innerHTML = ''; // clears all notes

    let topInformation = document.getElementsByClassName('top-information'); // clears top information bar
    var i;
    for (i = 0; i < topInformation.length; i++) {
        topInformation[i].remove();
    }

    document.getElementById('lazy-load').dataset.batch_number = '0'; // resets batch number
    
    let csrfToken = document.body.dataset.csrf; // gets csrf token
    queryDatabase(csrfToken, ['GET']);

    addRemoveLoading('ADD', 'primary-container'); // adds loading element

    disableOverlay(); // disables overlay
}

// DISABLES OVERLAY
function disableOverlay() {
    let overlay = document.getElementById('overlay-screen');
    overlay.classList.remove('overlay-active');
}

// SEARCH FIELD RETURN KEY DETECTION
function searchFieldReturnKey(event) {
    let searchInput = document.getElementById('search-input');
    let searchInputLength = searchInput.value.length;

    let returnActive = event.keyCode === 13 && searchInput == document.activeElement;
    let deleteActiveNoValue = event.keyCode === 8 && searchInput == document.activeElement && searchInputLength === 1;
    let selectAllDelete = event.keyCode === 8 && searchInputLength === document.getSelection().toString().length;

    if (returnActive) {
        performNoteSearch();
    } else if (deleteActiveNoValue | selectAllDelete) {
        searchInput.value = ''; // resetting the search field value is required because event triggers on keydown and will query database with single character before it is deleted
        performNoteSearch();
    }
}

// INITIALIZING FUNCTIONS
function initializingFunctions() {
    // adds lazy load event listener
    document.addEventListener("scroll", lazyLoad);
    // adds search field return key detection
    document.addEventListener("keydown", searchFieldReturnKey);
}

// LOADING
function addRemoveLoading(addRemove, parentId) {
    // removes any existing loading spinners
    let existingLoading = document.getElementsByClassName('loading-container');
    var i;
    for (i = 0; i < existingLoading.length; i++) {
        existingLoading[i].remove();
    }

    if (addRemove == 'ADD') {
        let loadingContainer = document.createElement('div');
        loadingContainer.classList.add('loading-container');

        let spinnerContainer = document.createElement('div');
        spinnerContainer.classList.add('loading-spinner');
        spinnerContainer.innerHTML = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
        loadingContainer.appendChild(spinnerContainer);

        let parentContainer = document.getElementById(parentId);
        parentContainer.appendChild(loadingContainer);
    }
}

// LAZY LOAD
function lazyLoad() {
    // gets necessary scroll values to calculate approximate position from bottom of scroll
    var windowPosition = window.pageYOffset;
    var windowSize = window.innerHeight;
    var bodyHeight = document.body.offsetHeight;

    var calculation = windowPosition + windowSize - bodyHeight;

    if (calculation > -500) {
        // temporarily removes lazy load event listener
        document.removeEventListener("scroll", lazyLoad); // disables lazy load

        addRemoveLoading('ADD', 'primary-container'); // adds loading spinner

        disableMenuClicks('disable'); // disables clicks to menu while content loads

        document.removeEventListener("keydown", searchFieldReturnKey); // removes keyup search field event listener

        csrfToken = document.body.dataset.csrf; // gets CSRF token from body data attribute

        queryDatabase(csrfToken, ['GET']); // queries DB
    }
}

// JUMP TO NOTE
function jumpToNote() {
    let batchNumber = document.getElementById('lazy-load').dataset.batch_number; // gets batch number; disables jumpToNote feature when lazy loading additional items
    const queryString = window.location.search; // gets the url search string
    if (queryString.includes('jump_to') & batchNumber == '0') {
        const urlParams = new URLSearchParams(queryString); // parses the string into url parameters
        const jumpTo = urlParams.get('jump_to');
        const jumpToElement = document.getElementById(jumpTo);
        if (jumpToElement) {
            jumpToElement.classList.add('highlighted'); // highlights the newly created element
            jumpToElement.scrollIntoView(); // scrolls the element into view
            const windowScrollPosition = window.scrollY;
            window.scroll(0, windowScrollPosition - 200); // offsets the scroll positon to account for the navigation bars.
        }
    }
}

// EXPANDS & COLLAPSES CARD
// when header section of card is clicked, toggles full note display
function toggleCard() {
    const card = this.parentNode; // gets card
    card.classList.toggle('card-active'); // appends active class

    const overlay = document.getElementById('overlay-screen'); // gets overlay screen
    overlay.classList.toggle('overlay-active'); // appends active class

    if (card.classList.contains('highlighted')) {
        card.classList.remove('highlighted');
    }
}

// CLOSES OVERLAY
// when lightbox overlay is active, clicks to element close full note display
function closeOverlay() {
    var overlay = document.getElementById('overlay-screen');
    overlay.classList.remove('overlay-active');

    var activeCards = document.getElementsByClassName('card-active');
    var i;
    for (i = 0; i < activeCards.length; i++) {
        activeCards[i].classList.remove('card-active');
    }
}

// TOGGLE ARCHIVE STATUS OF NOTE
function archiveToggle() {
    // this bit of code collapses the card and removes the background overlay
    const card = this.parentNode.parentNode.parentNode; // gets card
    card.classList.remove('card-active'); // appends active class
    const overlay = document.getElementById('overlay-screen'); // gets overlay screen
    overlay.classList.remove('overlay-active'); // appends active class
    if (card.classList.contains('highlighted')) { // removes outline highlight if present
        card.classList.remove('highlighted');
    }
    // toggles archived card CSS class
    // makes API call to toggle archived status
    if (card.classList.contains('archived-card')) {
        card.classList.remove('archived-card');
        csrfToken = document.body.dataset.csrf;
        queryDatabase(csrfToken, ['UPDATE', card.id.slice(3), [['archived', 'False']]]);
    } else {
        csrfToken = document.body.dataset.csrf;
        card.classList.add('archived-card');
        queryDatabase(csrfToken, ['UPDATE', card.id.slice(3), [['archived', 'True']]]);
    }
}

// FORMAT VARIOUS DATA FOR DISPLAY
// formats raw values from database and other data for display
function formatData(parameter, value) {
    if (parameter == 'type') {
        const note_type_choices = [
            'タグなし',
            'カウンセリング',
            '体験レッスン',
            '入学',
            'カウンセリング・体験',
            'レッスン開始',
            '休校',
            'メモ',
            '振替',
            '欠席',
            '予定変更',
            'レッスン再開',
            '内部キャンセル',
            '特別レッスン',
            '連絡',
        ]
        return note_type_choices[value];
    }

    if (parameter == 'grade') {
        const grade_type_choices = [
            '-------',
            '0才',
            '1才',
            '2才',
            '3才',
            '年小',
            '年中',
            '年長',
            '小1',
            '小2',
            '小3',
            '小4',
            '小5',
            '小6',
            '中1',
            '中2',
            '中3',
            '高1',
            '高2',
            '高3',
            '大人',
        ]
        return grade_type_choices[value];
    }

    if (parameter == 'time') {
        let time = value.slice(0,5);
        return time
    }

    if (parameter == 'date') {
        const daysOfWeek = [
            '日',
            '月',
            '火',
            '水',
            '木',
            '金',
            '土',
        ]
        let date = new Date(value);
        let month = date.getMonth() + 1;
        let date_string = date.getFullYear() + "年" + month + "月" + date.getDate() + "日 (" + daysOfWeek[date.getDay()] + ")";

        return date_string
    }

    if (parameter == 'subtitle') {
        let string = ""
        if (value[0]) {
            string += value[0] + " ";
        }
        if (value[1]) {
            string += value[1] + " ";
        }
        if (value[2]) {
            string += "(" + formatData('grade', value[2]) + ") ";
        }
        if (value[3]) {
            string += formatData('time', value[3]);
        }

        return string
    }

    if (parameter == 'instructor') {
        const instructor_type_choices = [
            '-------', 
            '',
            '松内先生',
            '遠藤基世先生',
            'デイビッド先生',
            '遠藤真知子先生',
        ]

        return instructor_type_choices[value];
    }
}

// BUILD DATE GROUPS
function buildDateGroups(notesAll) {
    const noteGroupAll = []; // contains all note groups
    var noteGroup = []; // contains current notes being inserted into note group

    var i;
    for (i = 0; i < notesAll.length; i++) {
        if (i == 0) { // runs only for first iteration
            noteGroup.push(notesAll[i]);
        } else if (notesAll[i].date == notesAll[i - 1].date) {
            noteGroup.push(notesAll[i]); // if current date and previous date match, notes are placed within same group
        } else {
            noteGroupAll.push(noteGroup); // pushes note group to all group list
            noteGroup = []; // clears current note group array
            noteGroup.push(notesAll[i]); // adds current note to new array
        }
        if (i == notesAll.length - 1) {
            noteGroupAll.push(noteGroup); // pushes group to group list on last iteration
        }
    }
    
    return noteGroupAll; // array containing all notes separated into date groups
}

// BUILD NOTES
function buildNotes(dateGroupsAll, allInstructorList) {
    let primaryContainer = document.getElementById('primary-container'); // gets primary container
    var noteCount = 0; // keeps running count of rendered notes
    // gets today's date and returns YYYY-MM-DD
    var today = new Date();
    var month = `0${today.getMonth() + 1}` // adds zero to the left side of the month digit
    var day = `0${today.getDate()}` // adds zero to the left side of the day digit
    today = `${today.getFullYear()}-${month.slice(-2)}-${day.slice(-2)}`; // slices rightmost two digits; gets month/day with leading zero

    // loops through date containers
    var i;
    for (i = 0; i < dateGroupsAll.length; i++) {
        // creates date container
        let dateContainer = document.createElement('div');
        dateContainer.id = dateGroupsAll[i][0].date;
        dateContainer.classList.add('date-container');
        // adds today css class to today's date container
        if(today == dateGroupsAll[i][0].date) {
            dateContainer.classList.add('today');
        }
        // creates date container text
        let dateContainerText = document.createElement('div');
        dateContainerText.classList.add('date-container-date');
        dateContainerText.innerHTML = formatData('date', dateGroupsAll[i][0].date);
        dateContainer.appendChild(dateContainerText);
        // appends date container to DOM
        primaryContainer.appendChild(dateContainer);

        // loops through notes within date container
        var n;
        for (n = 0; n < dateGroupsAll[i].length; n++) {
            // current card
            currentCard = dateGroupsAll[i][n];
            // creates note container [container]
            let noteContainer = document.createElement('div');
            noteContainer.id = 'nc-' + currentCard.note_id;
            // adds class for archived cards
            if (currentCard.archived == true) {
                noteContainer.classList.add('archived-card');
            }
            noteContainer.classList.add('note-container');
            // creates note header [container - header]
            let header = document.createElement('div');
            header.classList.add('note-header');
            header.addEventListener("click", toggleCard);
            noteContainer.appendChild(header);
            // instructor 1 [container - header - instructor]
            if (currentCard.instructor != null) {
                let instructor = document.createElement('div');
                instructor.classList.add('instructor');
                instructor.style.backgroundImage = "url(/static/customer/notes/img/instructors/" + currentCard.instructor + ".svg)";
                header.appendChild(instructor);
            }
            // instructor 2 [container - header - instructor]
            if (currentCard.instructor_2 != null) {
                let instructor2 = document.createElement('div');
                instructor2.classList.add('instructor');
                instructor2.style.backgroundImage = "url(/static/customer/notes/img/instructors/" + currentCard.instructor_2 + ".svg)";
                header.appendChild(instructor2);
            }
            // checks for multiple instructors in the note header and applies styling and scripts
            let instructorsAll = header.getElementsByClassName('instructor');
            if (instructorsAll.length == 2) {
                instructorsAll[1].classList.add('instructor-2'); // applies styling to second instructor image
                instructorsAll[0].addEventListener("mouseover", function () {instructorsAll[1].classList.add('instructor-2-hovered');});
                instructorsAll[0].addEventListener("mouseout", function () {instructorsAll[1].classList.remove('instructor-2-hovered');});
            }
            // title [container - header - title]
            let title = document.createElement('div');
            title.classList.add('title');
            title.innerHTML = formatData('type', currentCard.type);
            header.appendChild(title);
            // subtitle [container - header - subtitle]
            let subtitle = document.createElement('div');
            subtitle.classList.add('note-subtitle');
            subtitle.innerHTML = formatData('subtitle', [currentCard.last_name_kanji, currentCard.first_name_kanji, currentCard.grade, currentCard.time]);
            header.appendChild(subtitle);
            // note cotains description indicator [container - header - description indicator]
            if (currentCard.note_text != '') {
                let descriptionIndicatorContainer = document.createElement('div');
                descriptionIndicatorContainer.classList.add('description-indicator');
                header.appendChild(descriptionIndicatorContainer);
            }
            // archived indicator [container - header - archived indicator]
            let archivedIndicatorContainer = document.createElement('div');
            archivedIndicatorContainer.classList.add('archived-indicator-container');
            header.appendChild(archivedIndicatorContainer);
            // note body [container - body]
            let body = document.createElement('div');
            body.classList.add('note-body');
            noteContainer.appendChild(body);
            // name in kanji [container - body - name in kanji]
            let nameKanji = document.createElement('div');
            nameKanji.classList.add('name-kanji');
            nameKanji.innerHTML = currentCard.last_name_kanji + " " + currentCard.first_name_kanji;
            body.appendChild(nameKanji);
            // name in katakana [container - body - name in katakana]
            let nameKatakana = document.createElement('div');
            nameKatakana.classList.add('name-katakana');
            nameKatakana.innerHTML = currentCard.last_name_katakana + " " + currentCard.first_name_katakana;
            body.appendChild(nameKatakana);
            // name in romaji [container - body - name in romaji]
            let nameRomaji = document.createElement('div');
            nameRomaji.classList.add('name-romaji');
            nameRomaji.innerHTML = currentCard.last_name_romaji + ", " + currentCard.first_name_romaji;
            body.appendChild(nameRomaji);
            // note desription [container - body - note description]
            let noteDescription = document.createElement('div');
            noteDescription.classList.add('note-text');
            noteDescription.innerHTML = currentCard.note_text;
            body.appendChild(noteDescription);
            // date [container - body - date]
            let date = document.createElement('div');
            date.classList.add('note-date');
            date.innerHTML = formatData('date', currentCard.date);
            body.appendChild(date);
            // time [container - body - time]
            if (currentCard.time) {
                let time = document.createElement('div');
                time.classList.add('note-time');
                time.innerHTML = formatData('time', currentCard.time);
                body.appendChild(time);
            }
            // instructor [container - body - instructor 1]
            if (currentCard.instructor) {
                let instructor = document.createElement('div');
                instructor.classList.add('note-instructor');
                instructor.innerHTML = allInstructorList[currentCard.instructor];
                // instructor [container - body - instructor 2]
                if (currentCard.instructor_2) {
                    instructor.innerHTML = `${instructor.innerHTML}・${allInstructorList[currentCard.instructor_2]}`;
                }
                body.appendChild(instructor);
            }
            // footer [container - footer]
            let footer = document.createElement('div');
            footer.classList.add('card-footer');
            body.appendChild(footer);
            // edit button [container - footer - edit button]
            let edit = document.createElement('a');
            edit.classList.add('edit');
            edit.href = "/customer/notes_edit?return_link=/customer/notes&edit_note=" + currentCard.note_id;
            footer.appendChild(edit);
            // archive button [container - footer - archive button]
            let archive = document.createElement('div');
            archive.classList.add('archive');
            archive.addEventListener("click", archiveToggle);
            footer.appendChild(archive);
            // customer details page button [container - footer - customer detail page button]
            let customerDetails = document.createElement('a');
            customerDetails.classList.add('customer-details-button');
            customerDetails.href = `/customer/detail/${currentCard.customer_id}`;
            footer.appendChild(customerDetails);

            // appends note container to date container
            dateContainer.appendChild(noteContainer);
        }
        // adds note count from current date group to running total
        noteCount += n;
    }

    // jumps to created/edited note
    jumpToNote();

    // enables clicks to view archived button after contents have loaded
    let viewArchivedButton = document.getElementById('archive-button');
    if (viewArchivedButton.style.pointerEvents == 'none') {
        viewArchivedButton.style.pointerEvents = 'auto';
    }

    // increments lazy load batch parameter
    let batchNumberAttribute = document.getElementById('lazy-load').dataset.batch_number;
    let batchNumber = parseInt(batchNumberAttribute);
    document.getElementById('lazy-load').dataset.batch_number = batchNumber + 1;

    // re-adds lazy load event listener after notes have been added to DOM
    if (dateGroupsAll.length != 0 & document.getElementById('search-input').value == '') {
        document.addEventListener("scroll", lazyLoad);
    }

    addRemoveLoading('REMOVE', 'none'); // remove loading spinner

    document.addEventListener("keydown", searchFieldReturnKey); // re-adds keyup search field event listener

    disableMenuClicks('enable'); // enables all clicks to menu

    // checks page hight and performs lazy load if insufficient page height
    lazyLoadPageHeightCheck(dateGroupsAll.length);
}

// BUILD TIMELINE
function buildTimeline(data) {
    // generates top information
    // generates descriptive sentence at top of page
    let previousTopInformation = document.getElementsByClassName('top-information')
    if (previousTopInformation) {
        var i;
        for (i = 0; i < previousTopInformation.length; i++) {
            previousTopInformation[i].remove();
        }
    }
    let primaryContainer = document.getElementById('primary-container');
    var topInformation = document.createElement('div');
    topInformation.classList.add('top-information');
    topInformation.innerHTML = '<span id="result-number">' + data.note_count + '</span>件を表示しています';

    // generates description of archived toggle status
    let archiveButton = document.getElementById('archive-button');
    if (archiveButton.classList.contains('archive-button-active')) {
        topInformation.innerHTML += '<br>アーカイブされた件も表示しています';
    } else {
        topInformation.innerHTML += '<br>アーカイブされた件は非表示です';
    }

    // generates description of search term if present
    let searchValue = document.getElementById('search-input').value;
    if (searchValue != '') {
        topInformation.innerHTML += '<br>「' + String(searchValue) + '」で検索しました' ;
    }

    var timeline = document.getElementById('timeline');
    timeline.insertBefore(topInformation, primaryContainer);

    // builds date groups from JSON response from view
    let dateGroups = buildDateGroups(data.notes);
    // builds notes from date grouped data
    buildNotes(dateGroups, data.allInstructorList);
}

// QUERY DATABASE - NOTES
function queryDatabase(csrfToken, parameters) {
    // RETRIEVE NOTES
    if (parameters[0] == 'GET') {
        // gets arguments
        parameter           = parameters[0];
        
        // gets parameters
        let lazyLoad = document.getElementById('lazy-load');
        sort                = lazyLoad.dataset.sort;
        start_date          = lazyLoad.dataset.start_date;
        end_date            = lazyLoad.dataset.end_date;
        display_unarchived  = lazyLoad.dataset.display_unarchived;
        display_archived    = lazyLoad.dataset.display_archived;
        batch_size_days     = lazyLoad.dataset.batch_size_days;
        batch_size          = lazyLoad.dataset.batch_size;
        batch_number        = lazyLoad.dataset.batch_number;
        result_limit        = lazyLoad.dataset.result_limit;
        search_parameter    = document.getElementById('search-input').value;

        parameters = {
            'csrfmiddlewaretoken': csrfToken,
            'parameter': parameter,
            'result_limit': result_limit,
            'batch_number': batch_number,
            'batch_size': batch_size,
            'batch_size_days': batch_size_days,
            'display_archived': display_archived,
            'display_unarchived': display_unarchived,
            'start_date': start_date,
            'end_date': end_date,
            'sort': sort,
            'search_parameter': search_parameter,
        }

        // queries database
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "notes_api",
            data: parameters,
            success: function (data) {
                buildTimeline(data);
            }
        })
    }

    // UPDATE NOTE
    if (parameters[0] == 'UPDATE') {
        // gets arguments
        let parameter   = parameters[0];
        let noteId      = parameters[1];
        let fieldValue  = parameters[2];

        parameters = {
            'csrfmiddlewaretoken': csrfToken,
            'parameter': parameter,
            'note_id': noteId,
            'field_value': JSON.stringify(fieldValue),
        }

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "notes_api",
            data: parameters,
            success: function (data) {
            }
        })
    }
}

// QUERY DATABASE - ADMIN PROFILES
function queryDatabaseAdminProfiles(csrfToken, parameters) {
    // gets arguments
    parameter           = parameters[0];
    field_value         = parameters[1];

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': parameter,
        'field_value': JSON.stringify(field_value),
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "admin_profile_api",
        data: parameters,
        success: function (data) {}
    })
}

// TOGGLES VIEW ARCHIVED NOTES
function toggleArchivedNoteView() {
    csrfToken = document.body.dataset.csrf;
    let viewArchivedButton = document.getElementById('archive-button');

    // disables clicks to button; prevents spamming clicks
    viewArchivedButton.style.pointerEvents = 'none';

    disableOverlay(); // disables overlay

    // clears DOM elements
    function clearTimeline() {
        let primaryContainer = document.getElementById('primary-container');
        primaryContainer.innerHTML = '';
        let topInformation = document.getElementsByClassName('top-information')[0];
        topInformation.remove();
    }

    // toggles backend preference
    function toggleViewArchivedBackend(status) {
        if (status == 'showArchived') {
            queryDatabaseAdminProfiles(csrfToken, ['UPDATE', [['display_archived_notes', 'True']]]);
        } else {
            queryDatabaseAdminProfiles(csrfToken, ['UPDATE', [['display_archived_notes', 'False']]]);
        }
    }

    // gets (lazy) load parameters
    let lazyLoad = document.getElementById('lazy-load');
    lazyLoad.dataset.batch_number = '0'; // resets lazy load batch number

    if (viewArchivedButton.classList.contains('archive-button-active')) {
        viewArchivedButton.classList.remove('archive-button-active');
        lazyLoad.dataset.display_archived = 'False';
        clearTimeline();
        addRemoveLoading('ADD', 'primary-container'); // adds loading element
        queryDatabase(csrfToken, ['GET', 'none', '0', 'none', '28']);
        toggleViewArchivedBackend('hideArchived');
    } else {
        viewArchivedButton.classList.add('archive-button-active');
        lazyLoad.dataset.display_archived = 'True';
        clearTimeline();
        addRemoveLoading('ADD', 'primary-container'); // adds loading element
        queryDatabase(csrfToken, ['GET', 'none', '0', 'none', '28']);
        toggleViewArchivedBackend('showArchived');
    }
}

// LAZY LOAD PAGE HEIGHT CHECK
function lazyLoadPageHeightCheck(resultsLength) {
    windowHeight = window.innerHeight;
    bodyHeight = document.body.offsetHeight;
    heightComparison = bodyHeight - windowHeight;

    if (resultsLength != 0  && heightComparison < 500) {
        console.log('LAZY LOAD');
        lazyLoad(); // performs lazy load
    }
}