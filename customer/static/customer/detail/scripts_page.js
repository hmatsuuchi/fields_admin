// builds DOM elements
function buildElement(elementType, elementClass, elementID, elementInnerHTML) {
    let newElement = document.createElement(elementType);
    if (elementClass != '') {
        newElement.classList.add(elementClass);
    }
    if (elementID != '') {
        newElement.id = elementID;
    }
    if (elementInnerHTML != '') {
        newElement.innerHTML = elementInnerHTML;
    }
    return newElement;
}

// ======================= PAGE INITIALIZATION =======================

// PAGE INITIALIZATION
function initializePage() {
    let pageMeta = document.getElementById('page-meta'); // gets page meta div
    let customerId = pageMeta.dataset.customer_id; // gets customer id
    let csrfToken = pageMeta.dataset.csrf; // gets CSRF token

    getCustomerProfile(customerId, csrfToken); // gets customer profile from DB
    setInitialFlagValue(customerId); // sets initial flag value
    getCustomerNotes(customerId, csrfToken); // gets customer notes
    getEnrolledClasses(customerId, csrfToken); // gets enrolled classes
    getAttendanceRecords(customerId, csrfToken); // gets attendance data
    fetchQRCodeData(customerId, csrfToken); // gets QR data and builds code list
    fetchStudentAnalyticsData(customerId, csrfToken); // gets analytics data for individual student
}

function setInitialFlagValue(customerId) {
    let parameter = 'CHECK_FLAGGED_SINGLE' // sets parameter for API
    let csrfToken = document.getElementById('page-meta').dataset.csrf; // gets csrf token from body

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': parameter,
        'customer_id': customerId,
    }

    // queries database to check for profile in list of flagged profiles
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "../admin_profile_api",
        data: parameters,
        success: function (data) {
            if (data.flag_present) {
                let flagButton = document.getElementById(`flag-${customerId}`);
                flagButton.classList.add('flag-true');
            }
        }
    })
}

// ======================= INTERACTIVITY =======================

// CUSTOMER DETAILS FLAG TOGGLE
function detailsPageFlagToggle() {
    let customerId = document.getElementById('page-meta').dataset.customer_id;
    let flagButton = document.getElementById(`flag-${customerId}`); // get flag button
    let csrfToken = document.getElementById('page-meta').dataset.csrf; // gets csrf token from body
    flagButton.style.pointerEvents = 'none'; // disables clicks to flag button

    // AJAX used to toggle flag value in DB
    function detailsPageFlagToggleAJAX(parameters) {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "../admin_profile_api",
            data: parameters,
            success: function (data) {
                let flagButton = document.getElementById(`flag-${parameters.profile_id}`);
                flagButton.style.pointerEvents = 'auto'; // re-enables clicks to flag button
            }
        })
    }

    if (flagButton.classList.contains('flag-true')) { // if profile is flagged
        flagButton.classList.remove('flag-true'); // removes flagged class
        let parameter = 'REMOVE_FLAG' // sets parameter for API
        parameters = {
            'csrfmiddlewaretoken': csrfToken,
            'parameter': parameter,
            'profile_id': customerId,
        }
        detailsPageFlagToggleAJAX(parameters);
    } else { // if profile NOT flagged
        flagButton.classList.add('flag-true'); // adds flagged class
        let parameter = 'ADD_FLAG' // sets parameter for API
        parameters = {
            'csrfmiddlewaretoken': csrfToken,
            'parameter': parameter,
            'profile_id': customerId,
        }
        detailsPageFlagToggleAJAX(parameters);
    }
}
// ======================= CUSTOMER PROFILE =======================

// FETCHES PROFILE DATA FROM API
function getCustomerProfile(customerId, csrfToken) {
    parameters = {
        'parameter': 'GET_PROFILE',
        'csrfmiddlewaretoken': csrfToken,
        'customer_id': customerId,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "../customer_details_api",
        data: parameters,
        success: function (data) {
            buildTopInformation(data);
            buildCustomerProfileCard(data);
        },
    })
}

// format name kanji or katakana
function formatNameKanjiKatakana(last_name, first_name) {
    if (last_name != '' && first_name != '') {
        formattedName = `${last_name} ${first_name}`;
    } else if (last_name != '' && first_name == '') {
        formattedName = last_name;
    } else {
        formattedName = first_name;
    }

    return formattedName
}

// format name romaji
function formatNameRomaji(last_name, first_name) {
    if (last_name != '' && first_name != '') {
        formattedName = `${last_name}, ${first_name}`;
    } else if (last_name != '' && first_name == '') {
        formattedName = last_name;
    } else {
        formattedName = first_name;
    }

    return formattedName
}

// format row one of name container
function formatNameContainerRowOne(formattedName, grade) {
    if (grade != '-------') {
        formattedRowOne = `${formattedName} (${grade})`;
    } else {
        formattedRowOne = formattedName;
    }

    return formattedRowOne
}

// format phone number and type
function formatPhone(number, type) {
    if (number != '' && type != '-------') {
        formattedNumber = `${number} (${type})`;
    } else if (number != '' && type == '-------') {
        formattedNumber = number;
    } else {
        formattedNumber = type;
    }
    return formattedNumber
}

// format address line one
function formatAddressOne(prefecture, city, addressOne) {
    var formattedAddress = '';
    if (prefecture != '') {
        formattedAddress += prefecture;
    }
    if (city != '') {
        formattedAddress += city;
    }
    if (addressOne != '') {
        formattedAddress += addressOne;
    }

    return formattedAddress
}

// format birthday and age
function formatBirthdayAge(birthday, age) {
    birthday = `${birthday} (${age}才)`;

    return birthday
}

// BUILD TOP INFORMATION
function buildTopInformation(data) {
    let primaryContainer = document.getElementById('primary-container'); // gets primary container

    let topInformation = document.createElement('div');
    topInformation.classList.add('top-information');
    topInformation.innerHTML = `「${formatNameKanjiKatakana(data.last_name_kanji, data.first_name_kanji)}」を表示しています`
    primaryContainer.appendChild(topInformation);
}

// BUILDS CUSTOMER PROFILE CARD
function buildCustomerProfileCard(data) {
    // DATABASE CONVERSION VALUES
    const statusCSS = [ // enrollment status css classes
        'pre-enrolled',
        'pre-enrolled',
        'enrolled',
        'short-absence',
        'long-absence',
    ]

    const statusText = [ // enrollment status text
        '-------',
        '入学希望',
        '在学',
        '休校',
        '退校',
    ]

    const gradeText = [ // grade text
        '-------',
        '0才',
        '1才',
        '2才',
        '3才',
        '年少',
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

    const phoneTypeText = [ // phone type text
        '-------',
        '自身',
        '母',
        '父',
        '祖母',
        '祖父',
        '叔父',
        '叔母',
    ]

    const prefectureText = [ // prefecture type text
        '-------',
        '徳島県',
        '香川県',
    ]

    const paymentMethodText = [ // payment method text
        '-------',
        '月謝袋',
        '引き落とし',
    ]

    let pageMeta = document.getElementById('page-meta');
    pageMeta.dataset.enrollment_status = data.status; // adds students enrollment status to page meta
    
    let primaryContainer = document.getElementById('primary-container'); // gets primary container

    // PROFILE CONTAINER
    let profileContainer = document.createElement('div');
    profileContainer.id = 'profile-container';
    profileContainer.classList.add('customer-card');
    primaryContainer.appendChild(profileContainer);

    // PROFILE CONTAINER -> HEADER
    let cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');
    cardHeader.classList.add(statusCSS[data.status]);
    profileContainer.appendChild(cardHeader);

    // PROFILE CONTAINER -> HEADER -> TITLE
    let detailCardTitle = document.createElement('div');
    detailCardTitle.classList.add('detail-card-title');
    detailCardTitle.innerHTML = '基礎情報'
    cardHeader.appendChild(detailCardTitle);

    // PROFILE CONTAINER -> HEADER -> STATUS
    let status = document.createElement('div');
    status.classList.add('status');
    status.innerHTML = statusText[data.status];
    cardHeader.appendChild(status);

    // PROFILE CONTAINER -> BODY
    let body = document.createElement('div');
    body.classList.add('card-body');
    profileContainer.appendChild(body);

    // PROFILE CONTAINER -> BODY -> NAME CONTAINER
    let nameContainer = document.createElement('div');
    nameContainer.classList.add('name-container');
    body.appendChild(nameContainer);

    // PROFILE CONTAINER -> BODY -> NAME CONTAINER -> ROW ONE
    let rowOne = document.createElement('div');
    rowOne.classList.add('full-name-ja');
    rowOne.innerHTML = formatNameContainerRowOne(formatNameKanjiKatakana(data.last_name_kanji, data.first_name_kanji), gradeText[data.grade]);
    nameContainer.appendChild(rowOne);

    // PROFILE CONTAINER -> BODY -> NAME CONTAINER -> ROW TWO
    let rowTwo = document.createElement('div');
    rowTwo.classList.add('sub-name');
    rowTwo.innerHTML = formatNameKanjiKatakana(data.last_name_katakana, data.first_name_katakana);
    nameContainer.appendChild(rowTwo);

    // PROFILE CONTAINER -> BODY -> NAME CONTAINER -> ROW THREE
    let rowThree = document.createElement('div');
    rowThree.classList.add('sub-name');
    rowThree.innerHTML = formatNameRomaji(data.last_name_romaji, data.first_name_romaji);
    nameContainer.appendChild(rowThree);

    // PROFILE CONTAINER -> BODY -> PHONE CONTAINER
    let phoneContainer = document.createElement('div');
    phoneContainer.classList.add('phone-container');
    phoneContainer.classList.add('bottom-separator');
    body.appendChild(phoneContainer);
    

    // PROFILE CONTAINER -> BODY -> PHONE CONTAINER -> PHONE ONE
    if (data.phone_1 != '') {
        let phoneOne = document.createElement('div');
        phoneOne.classList.add('phone-1');
        phoneOne.innerHTML = formatPhone(data.phone_1,phoneTypeText[data.phone_1_type]);
        phoneContainer.appendChild(phoneOne);
    }

    // PROFILE CONTAINER -> BODY -> PHONE CONTAINER -> PHONE TWO
    if (data.phone_2 != '') {
        let phoneTwo = document.createElement('div');
        phoneTwo.classList.add('phone-2');
        phoneTwo.innerHTML = formatPhone(data.phone_2,phoneTypeText[data.phone_2_type]);
        phoneContainer.appendChild(phoneTwo);
    }

    // PROFILE CONTAINER -> BODY -> ADDRESS CONTAINER
    if (data.post_code != '' | data.address_1 != '' | data.address_2 != '') {
        let addressContainer = document.createElement('div');
        addressContainer.classList.add('address-container');
        addressContainer.classList.add('bottom-separator');
        body.appendChild(addressContainer);

        // PROFILE CONTAINER -> BODY -> POST CODE
        if (data.post_code != '') {
            let postCode = document.createElement('div');
            postCode.classList.add('address-1');
            postCode.innerHTML = `〒${data.post_code}`;
            addressContainer.appendChild(postCode);
        }

        // PROFILE CONTAINER -> BODY -> ADDRESS ONE
        if (data.address_1 != '') {
            let addressOne = document.createElement('div');
            addressOne.classList.add('address-2');
            addressOne.innerHTML = formatAddressOne(prefectureText[data.prefecture], data.city, data.address_1);
            addressContainer.appendChild(addressOne);
        }

        // PROFILE CONTAINER -> BODY -> ADDRESS TWO
        if (data.address_2 != '') {
            let addressTwo = document.createElement('div');
            addressTwo.classList.add('address-3');
            addressTwo.innerHTML = data.address_2;
            addressContainer.appendChild(addressTwo);
        }
    }

    // PROFILE CONTAINER -> BODY -> BIRTHDAY
    if (data.birthday != null) {
        let birthday = document.createElement('div');
        birthday.classList.add('birthday');
        birthday.classList.add('bottom-separator');
        birthday.innerHTML = formatBirthdayAge(data.birthday, data.age);
        body.appendChild(birthday);
    }

    // PROFILE CONTAINER -> BODY -> PAYMENT METHOD
    if (data.payment_method != '') {
        let paymentMethod = document.createElement('div');
        paymentMethod.classList.add('payment-method');
        paymentMethod.classList.add('bottom-separator');
        paymentMethod.innerHTML = paymentMethodText[data.payment_method];
        body.appendChild(paymentMethod);
    }

    // PROFILE CONTAINER -> FOOTER
    let footer = document.createElement('div');
    footer.classList.add('card-footer');
    profileContainer.appendChild(footer);

    // PROFILE CONTAINER -> FOOTER -> EDIT BUTTON
    let editButton = document.createElement('a');
    editButton.classList.add('edit');
    editButton.href = `/customer/edit/${data.customer_id}?return_link=${data.return_link}`;
    footer.appendChild(editButton);

    // PROFILE CONTAINER -> FOOTER -> DETAILS (INACTIVE)
    let detailsButton = document.createElement('div');
    detailsButton.classList.add('details');
    detailsButton.classList.add('inactive');
    footer.appendChild(detailsButton);

    // PROFILE CONTAINER -> FOOTER -> NOTES
    let notesButton = document.createElement('div');
    notesButton.classList.add('notes');
    notesButton.id = `notes-${data.customer_id}`;
    footer.appendChild(notesButton);

    // PROFILE CONTAINER -> FOOTER -> FLAG
    let flagButton = document.createElement('div');
    flagButton.classList.add('flag');
    flagButton.id = `flag-${data.customer_id}`;
    flagButton.addEventListener("click", detailsPageFlagToggle);
    footer.appendChild(flagButton);

    // add CSS to fade in element
    profileContainer.classList.add('fade-to-visible');
}

// ======================= CUSTOMER NOTES =======================

// FETCHES NOTES DATA FROM API
function getCustomerNotes(customerId, csrfToken) {
    function setInitialNotesIconValue(customerId, archived, unarchived) {
        let pageMeta = document.getElementById('page-meta');
        pageMeta.dataset.archived_notes = archived; // adds ARCHIVED note count to page meta
        pageMeta.dataset.unarchived_notes = unarchived; // adds UNARCHIVED note count to page meta

        if (unarchived != 0) {
            let notesIcon = document.getElementById(`notes-${customerId}`);
            notesIcon.classList.add('notes-true');
        }
    }
    parameters = {
        'parameter': 'GET_NOTES',
        'csrfmiddlewaretoken': csrfToken,
        'customer_id': customerId,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "../customer_details_api",
        data: parameters,
        success: function (data) {
            buildCustomerNotesCard(data);
            setInitialNotesIconValue(customerId, data.archived_count, data.unarchived_count);
        },
    })
}

// BUILDS CUSTOMER NOTES CARD
function buildCustomerNotesCard(data) {
    let profileContainer = document.getElementById('profile-container');
    // let profileContainerHeight = profileContainer.offsetHeight; // gets height of profile container
    // let notesBodyHeight = profileContainerHeight - (profileContainerHeight / 9 * 2) // calculates height of note container body

    let pageMeta = document.getElementById('page-meta'); // gets page meta div from DOM
    let customerId = pageMeta.dataset.customer_id; // gets customer ID from page meta div

    let primaryContainer = document.getElementById('primary-container'); // details page cards primary container

    const noteTypeText = [
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

    const statusCSS = [ // enrollment status css classes
        'pre-enrolled',
        'pre-enrolled',
        'enrolled',
        'short-absence',
        'long-absence',
    ]

    function formatDateTime(date, time) {
        const daysOfWeek = [
            '日',
            '月',
            '火',
            '水',
            '木',
            '金',
            '土',
        ]

        if (time) {
            newTime = ` ${time.slice(0,5)}`;
        } else {
            newTime = '';
        }

        let newDate = new Date(date);
        let month = newDate.getMonth() + 1;
        let date_string = `${newDate.getFullYear()}年${month}月${newDate.getDate()}日 (${daysOfWeek[newDate.getDay()]})${newTime}`;

        return date_string
    }

    // NOTES SECTION
    let notesSection = document.createElement('section');
    notesSection.id = "customer-notes";
    // notesSection.style.height = `${profileContainerHeight}px`;
    primaryContainer.appendChild(notesSection);

    // NOTES SECTION -> NOTES HEADER
    let notesHeader = document.createElement('div');
    notesHeader.classList.add('notes-header');
    // notesHeader.classList.add(statusCSS[document.getElementById('page-meta').dataset.enrollment_status]);
    notesHeader.classList.add(statusCSS[data.enrollmentStatus]);
    notesSection.appendChild(notesHeader);

    // NOTES SECTION -> NOTES HEADER -> TITLE
    let detailCardTitle = document.createElement('div');
    detailCardTitle.classList.add('detail-card-title');
    detailCardTitle.innerHTML = '履歴';
    notesHeader.appendChild(detailCardTitle);

    // NOTES SECTION -> NOTES HEADER -> TOTAL
    let totalNotes = document.createElement('div');
    totalNotes.classList.add('count');
    totalNotes.innerHTML = `${data.archived_count + data.unarchived_count}件`;
    notesHeader.appendChild(totalNotes);

    // NOTES SECTION -> MAIN CONTAINER
    let mainContainer = document.createElement('div');
    mainContainer.classList.add('main-container');
    notesSection.appendChild(mainContainer);

    // NOTES SECTION -> MAIN CONTAINER -> NOTES
    allNotes = data.all_notes;
    var i;
    for (i = 0; i < allNotes.length; i++) {
        let note = document.createElement('div');
        note.id = `note-${allNotes[i].note_id}`;
        note.classList.add('note');
        if (allNotes[i].archived) {
            note.classList.add('archived');
        }
        mainContainer.appendChild(note);

        // TEACHER 1
        if (allNotes[i].instructor) {
            let teacher = document.createElement('div');
            teacher.classList.add('teacher');
            teacher.style.backgroundImage = `url(/static/customer/notes/img/instructors/${allNotes[i].instructor}.svg)`;
            note.appendChild(teacher);
        }
        // TEACHER 2
        if (allNotes[i].instructor_2) {
            let teacher2 = document.createElement('div');
            teacher2.classList.add('teacher');
            teacher2.style.backgroundImage = `url(/static/customer/notes/img/instructors/${allNotes[i].instructor_2}.svg)`;
            note.appendChild(teacher2);
        }
        // checks for multiple instructors in the note and applies styling and scripts
        let teachersAll = note.getElementsByClassName('teacher');
        if (teachersAll.length == 2) {
            teachersAll[1].classList.add('teacher-2'); // applies styling to second instructor image
        }

        // TYPE
        let type = document.createElement('div');
        type.classList.add('type');
        type.innerHTML = noteTypeText[allNotes[i].type];
        note.appendChild(type);

        // DATE AND TIME
        let date = document.createElement('div');
        date.classList.add('date-time');
        date.innerHTML = formatDateTime(allNotes[i].date, allNotes[i].time);
        note.appendChild(date);

        // TEACHER NAME
        let teacher = document.createElement('div');
        teacher.classList.add('teacher-name');
        let instructor1Name = allNotes[i].instructor_last_name_kanji + allNotes[i].instructor_first_name_kanji
        let instructor2Name = allNotes[i].instructor_2_last_name_kanji + allNotes[i].instructor_2_first_name_kanji
        if (instructor1Name && !instructor2Name) {
            teacher.innerHTML = `${instructor1Name}`;
        } else if (instructor1Name && instructor2Name) {
            teacher.innerHTML = `${instructor1Name}・${instructor2Name}`;
        } else if (!instructor1Name && instructor2Name) {
            teacher.innerHTML = `${instructor2Name}`;
        }
        note.appendChild(teacher);

        // CONTENT
        if (allNotes[i].note_text != '') {
            let content = document.createElement('div');
            content.classList.add('content');
            content.innerHTML = allNotes[i].note_text;
            note.appendChild(content);
        }

        // ARCHIVED ICON
        let archivedIcon = document.createElement('div');
        archivedIcon.classList.add('note-archived-icon');
        note.appendChild(archivedIcon);

        // FOOTER
        let footer = document.createElement('div');
        footer.classList.add('footer');
        note.appendChild(footer);

        // FOOTER -> EDIT BUTTON
        let editButton = document.createElement('a');
        editButton.classList.add('edit');
        editButton.href = `/customer/notes_edit?return_link=/customer/detail/${customerId}&edit_note=${allNotes[i].note_id}`;
        footer.appendChild(editButton);

        // FOOTER -> ARCHIVE BUTTON
        let archiveButton = document.createElement('div');
        archiveButton.classList.add('archive');
        archiveButton.addEventListener("click", customerDetailsNotesArchive);
        footer.appendChild(archiveButton);
    }

    // NOTES SECTION -> NOTES FOOTER
    let notesFooter = document.createElement('div');
    notesFooter.classList.add('notes-footer');
    notesSection.appendChild(notesFooter);

    // NOTES SECTION -> NOTES FOOTER -> ADD NEW NOTE BUTTON
    let newNoteButton = document.createElement('a');
    newNoteButton.classList.add('new-note-button');
    newNoteButton.href = `/customer/notes_create?return_link=/customer/detail/${customerId}&prefill_note_customer=${customerId}`;
    notesFooter.appendChild(newNoteButton);

    // NOTES SECTION -> NOTES FOOTER -> PLACE HOLDER BUTTONS
    var i;
    for (i = 0; i < 3; i++) {
        let placeholder = document.createElement('div');
        notesFooter.appendChild(placeholder);
    }

    highlightEditedNote(); // highlights recently edited notes
    highlightEditedClass(); // highlights recently edited classes

    // add CSS to fade in element
    notesSection.classList.add('fade-to-visible');
}

// HANDLES CLICKS TO NOTE ARCHIVE BUTTON
function customerDetailsNotesArchive() {
    toggleClicksToAllNotes(false);

    let csrfToken = document.getElementById('page-meta').dataset.csrf;
    let note = this.parentElement.parentElement; // gets note
    let noteId = note.id.slice(5); // gets note id

    if (note.classList.contains('archived')) { // for archived notes
        note.classList.remove('archived');
        var archiveBoolean = false;
    } else { // for unarchived notes
        note.classList.add('archived');
        var archiveBoolean = true;
    }

    archivedNotesCheck(); // checks for unarchived notes and adjust active note button if required

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': 'UPDATE_NOTE_ARCHIVED_STATUS',
        'note_id': noteId,
        'archive': archiveBoolean,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "../customer_details_api",
        data: parameters,
        success: function (data) {
            toggleClicksToAllNotes(true);
        },
    })

    function toggleClicksToAllNotes(param) {
        let notesAll = document.getElementsByClassName('note'); // get all notes

        var i;
        if (param == false) {
            for (i = 0; i < notesAll.length; i++) {
                notesAll[i].style.pointerEvents = 'none';
            }
        } else {
            for (i = 0; i < notesAll.length; i++) {
                notesAll[i].style.pointerEvents = 'auto';
            }
        }
    }

    function archivedNotesCheck() {
        let customerId = document.getElementById('page-meta').dataset.customer_id;
        let notesAll = document.getElementsByClassName('note');
        var unarchivedNote = false;
        let notesIcon = document.getElementById(`notes-${customerId}`);

        var i;
        for (i = 0; i < notesAll.length; i++) {
            if (!notesAll[i].classList.contains('archived')) {
                unarchivedNote = true;
            }
        }

        if (unarchivedNote == false) {
            notesIcon.classList.remove('notes-true');
        } else {
            notesIcon.classList.add('notes-true');
        }
    }
}

// HIGHLGHTS RECENTLY EDITED NOTE
function highlightEditedNote() {
    let urlParams = window.location.search; // gets url search string
    let urlParamsAll = new URLSearchParams(urlParams); // parses all parameters
    let jumpTo = urlParamsAll.get('jump_to'); // gets jump to parameter
    if (jumpTo) {
        noteId = jumpTo.slice(3); // gets recently edited note id
        let note = document.getElementById(`note-${noteId}`); // get note from DOM
        if (note) {
            note.classList.add('highlighted'); // add highlghted css class
            note.scrollIntoView(); // scroll note into view
            let mainContainer = document.getElementsByClassName('main-container')[0]; // gets notes container
            mainContainer.scrollBy(0,-25); // after note is scrolled into view, continue to scroll the note by additional pixels
        }
    }
}

function highlightEditedClass() {
    let urlParams = window.location.search; // gets url search string
    let urlParamsAll = new URLSearchParams(urlParams); // parses all parameters
    let jumpTo = urlParamsAll.get('jump_to_class'); // gets jump to parameter

    classId = jumpTo; // gets recently edited note id
    let jumpToClass = document.getElementById(`class-${classId}`); // get note from DOM
    
    if (jumpTo && jumpToClass) {
        jumpToClass.classList.add('highlighted'); // add highlghted css class
        jumpToClass.scrollIntoView(); // scroll note into view
        let mainContainer = document.getElementsByClassName('main-container')[0]; // gets notes container
        mainContainer.scrollBy(0,-25); // after note is scrolled into view, continue to scroll the note by additional pixels
    }
}

// ======================= ENROLLED CLASSES =======================

// FETCHES ENROLLED CLASS DATA FROM API
function getEnrolledClasses(customerId, csrfToken) {
    parameters = {
        'parameter': 'GET_FOR_STUDENT',
        'csrfmiddlewaretoken': csrfToken,
        'customer_id': customerId,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/class_list/class_list_api",
        data: parameters,
        success: function (data) {
            buildClassCards(data.classes, data.enrollmentStatus);
        },
    })
}

// BUILDS ENROLLED CLASS CARDS
function buildClassCards(classes, enrollmentStatus) {
    let pageMeta = document.getElementById('page-meta'); // get page meta div

    let primaryContainer = document.getElementById('primary-container');

    const statusCSS = [ // enrollment status css classes
        'pre-enrolled',
        'pre-enrolled',
        'enrolled',
        'short-absence',
        'long-absence',
    ]

    var i;
    for (i = 0; i < classes.length; i++) {
        // CONTAINER
        let classContainer = document.createElement('div');
        classContainer.classList.add('class-container');
        classContainer.id = `class-${classes[i].classID}`;
        primaryContainer.appendChild(classContainer);

        // CONTAINER -> HEADER
        let header = document.createElement('div');
        header.classList.add('class-card-header');
        // header.classList.add(statusCSS[document.getElementById('page-meta').dataset.enrollment_status]);
        header.classList.add(statusCSS[enrollmentStatus]);
        classContainer.appendChild(header);

        // CONTAINER -> HEADER -> CARD TITLE
        let title = document.createElement('div')
        title.classList.add('class-header-title');
        title.innerHTML = 'クラス';
        header.appendChild(title);

        // CONTAINER -> HEADER -> NAME
        let name = document.createElement('div')
        name.classList.add('class-header-name');
        name.innerHTML = classes[i].className;
        header.appendChild(name);

        // CONTAINER -> BODY
        let classCardBody = document.createElement('div');
        classCardBody.classList.add('class-card-body');
        classContainer.appendChild(classCardBody);

        // CONTAINER -> BODY -> DAY OF WEEK CONTAINER
        let dayOfWeekContainer = document.createElement('div');
        dayOfWeekContainer.classList.add('day-of-week-container');
        classCardBody.appendChild(dayOfWeekContainer);

        // CONTAINER -> BODY -> TIME CONTAINER
        let timeContainer = document.createElement('div');
        timeContainer.classList.add('time-container');
        classCardBody.appendChild(timeContainer);

        // CONTAINER -> BODY -> DAY OF WEEK CONTAINER -> DAY
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

            if (classes[i].dayOfWeek == y) {
                day.classList.add('day-active'); // adds active class to day of week
                if (classes[i].startTime) {
                    time.innerHTML = classes[i].startTime; // adds start time value beneath highlighted day of week
                    time.classList.add('time-active'); // adds active class to time
                }
            }
        }

        // CONTAINER -> BODY -> PRIMARY INSTRUCTOR ICON
        let primaryInstructor = document.createElement('div');
        if (classes[i].primaryInstructorID != '0') {
            primaryInstructor.classList.add('primary-instructor-icon');
            primaryInstructor.style.backgroundImage = `url('/static/customer/notes/img/instructors/${classes[i].primaryInstructorID}.svg')`;
        }
        classCardBody.appendChild(primaryInstructor);

        // CONTAINER -> BODY -> LESSON DESCRIPTION CONTAINER
        let descriptionContainer = document.createElement('div');
        descriptionContainer.classList.add('class-description-container');
        classCardBody.appendChild(descriptionContainer);

        // CONTAINER -> BODY -> LESSON DESCRIPTION CONTAINER -> CLASS TYPE
        let classType = document.createElement('div');
        classType.classList.add('class-type');
        classType.innerHTML = classes[i].classType
        descriptionContainer.appendChild(classType);

        // CONTAINER -> BODY -> LESSON DESCRIPTION CONTAINER -> INSTRUCTOR
        let instructor = document.createElement('div');
        instructor.classList.add('instructor');
        instructor.innerHTML = `${classes[i].primaryInstructorLast}先生`
        descriptionContainer.appendChild(instructor);


        // CONTAINER -> BODY -> LESSON DESCRIPTION CONTAINER -> REGULARITY
        var regularityValue;
        if (classes[i].irregular == false) {
                regularityValue = '定期';
            } else {
                regularityValue = '不定期';
            }
        let regularity = document.createElement('div');
        regularity.classList.add('regularity');
        regularity.innerHTML = regularityValue
        descriptionContainer.appendChild(regularity);

        // CONTAINER -> BODY -> SEPARATOR
        let separator = document.createElement('div');
        separator.classList.add('separator');
        classCardBody.appendChild(separator);

        // CONTAINER -> BODY -> STUDENTS CONTAINER
        let studentsContainer = document.createElement('div');
        studentsContainer.classList.add('students-container');
        classCardBody.appendChild(studentsContainer);

        // CONTAINER -> BODY -> STUDENTS CONTAINER - STUDENT NAME CONTAINER
        var n;
        for (n = 0; n < classes[i].students.length; n++) {
            // STUDENT NAME CONTAINER
            let studentNameContainer = document.createElement('a');
            studentNameContainer.classList.add('student-name-container');
            studentNameContainer.href = `/customer/detail/${classes[i].students[n].id}`;
            studentsContainer.appendChild(studentNameContainer);
            // STUDENT NAME CONTAINER -> STATUS
            let statusIndicator = document.createElement('div');
            statusIndicator.classList.add('enrollment-status-indicator');
            statusIndicator.classList.add(statusCSS[classes[i].students[n].enrollment_status]);
            statusIndicator.style.backgroundImage = `url("/static/class_list/img/enrollment_status_icons/${classes[i].students[n].enrollment_status}.svg")`;

            studentNameContainer.appendChild(statusIndicator);
            // STUDENT NAME CONTAINER -> NAME KANJI & GRADE
            // let studentNameKanji = document.createElement('div');
            // studentNameKanji.classList.add('student-name-kanji');
            // studentNameKanji.innerHTML = `${classes[i].students[n].last_name_kanji} ${classes[i].students[n].first_name_kanji}（${classes[i].students[n].grade}）`;
            // studentNameContainer.appendChild(studentNameKanji);

            let studentNameKanji = document.createElement('div');
            studentNameKanji.classList.add('student-name-kanji');
            if (classes[i].students[n].grade != '-------') {
                studentNameKanji.innerHTML = `${classes[i].students[n].last_name_kanji} ${classes[i].students[n].first_name_kanji}（${classes[i].students[n].grade}）`;
            } else {
                studentNameKanji.innerHTML = `${classes[i].students[n].last_name_kanji} ${classes[i].students[n].first_name_kanji}`;
            }
            studentNameContainer.appendChild(studentNameKanji);
            // STUDENT NAME CONTAINER -> NAME KATAKANA
            let studentNameKatakana = document.createElement('div');
            studentNameKatakana.classList.add('student-name-katakana');
            studentNameKatakana.innerHTML = `${classes[i].students[n].last_name_katakana}　${classes[i].students[n].first_name_katakana}`;
            studentNameContainer.appendChild(studentNameKatakana);
        }

        // CONTAINER -> FOOTER
        let classCardFooter = document.createElement('div');
        classCardFooter.classList.add('class-card-footer');
        classContainer.appendChild(classCardFooter);

        // CONTAINER -> FOOTER -> EDIT BUTTON
        let editButton = document.createElement('a');
        editButton.classList.add('edit');

        let customerID = pageMeta.dataset.customer_id;

        editButton.href = `/class_list/edit/${classes[i].classID}?return_link=/customer/detail/${customerID}`;
        classCardFooter.appendChild(editButton);

        // CONTAINER -> FOOTER -> BUTTON PLACEHOLDERS
        var y;
        for (y = 0; y < 3; y++) {
            let placeholderButton = document.createElement('div');
            classCardFooter.appendChild(placeholderButton);
        }

        // add CSS to fade in element
        classContainer.classList.add('fade-to-visible');
    }
}

// ======================= ATTENDANCE RECORDS =======================
function getAttendanceRecords(studentID, csrfToken) {
    parameters = {
        'parameter': 'get_attendance_for_student',
        'csrfmiddlewaretoken': csrfToken,
        'student_id': studentID,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/attendance/attendance_api",
        data: parameters,
        success: function (data) {
            if (data.noData == false) {
                buildAttendanceCard(data);
            }
        },
    })   
}

function buildAttendanceCard(data) {
    let attendanceAll = JSON.parse(data.studentAttendanceAll);
    let recordsAll = JSON.parse(data.attendanceRecordsAll);
    let classesAll = JSON.parse(data.classesAll);

    // let pageMeta = document.getElementById('page-meta'); // get page meta div

    const statusCSS = [ // enrollment status css classes
        'pre-enrolled',
        'pre-enrolled',
        'enrolled',
        'short-absence',
        'long-absence',
    ]

    let primaryContainer = document.getElementById('primary-container');

    // ATTENDANCE CONTAINER
    let attendanceContainer = buildElement('div', 'attendance-container', '', '');
    primaryContainer.appendChild(attendanceContainer);

    // ATTENDANCE CONTAINER - HEADER
    let header = buildElement('div', 'header-container', '', '');
    header.classList.add(statusCSS[data.enrollmentStatus]);
    // header.classList.add(statusCSS[document.getElementById('page-meta').dataset.enrollment_status]);
    attendanceContainer.appendChild(header);

    // ATTENDANCE CONTAINER - HEADER - CARD TITLE
    let title = buildElement('div', 'title', '', '出席');
    header.appendChild(title);

    // ATTENDANCE CONTAINER - HEADER - RECORD COUNT
    let count = buildElement('div', 'count', '', `${data.allCount}件`);
    header.appendChild(count);

    // ATTENDANCE CONTAINER - BODY
    let body = buildElement('div', 'card-body', '', '');
    attendanceContainer.appendChild(body);

    // ATTENDANCE COTNAINER - BODY - DONUT GRAPH CONTAINER
    let donutGraphContainer = buildElement('div', 'donut-graph-container', '', '');
    body.appendChild(donutGraphContainer);

    // ATTENDANCE CONTAINER - BODY - DONUT GRAPH
    let donutGraph = buildElement('canvas', 'donut-graph', '', '');
    donutGraphContainer.appendChild(donutGraph);

    const ctx = donutGraph.getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [`出席 ${data.presentRate}%`, `欠席 ${data.absentRate}%`],
            datasets: [{
                label: 'present students',
                data: [data.presentCount, data.absentCount],
                backgroundColor: [
                    'rgba(0, 184, 169, 1)',
                    'rgba(246, 65, 108, 1)',
                ],
                borderColor: [
                    'rgba(255, 255, 255, 1)',
                    'rgba(255, 255, 255, 1)',
                ],
                borderWidth: 2,
                radius: '90%',
            }]
        },
        options: {
            responsive: true,
        }
    });

    // ATTENDANCE CONTAINER - BODY - STUDENT ATTENDANCE CONTAINER
    let studentAttendanceContainer = buildElement('div', 'student-attendance-container', '', '');
    body.appendChild(studentAttendanceContainer);

    // ATTENDANCE STATUS CSS
    const attendanceStatusCSS = [
        'incomplete-record',
        'present-record',
        'absent-record',
    ]

    const dayOfWeekConvertShort = [
        '日',
        '月',
        '火',
        '水',
        '木',
        '金',
        '土',
    ]

    var i;
    for (i = 0; i < attendanceAll.length; i++) {
        // RECORD CONTAINER
        let recordContainer = buildElement('a', 'attendance-record-container', '', '');
        studentAttendanceContainer.appendChild(recordContainer);

        // RECORD CONTAINER - DATE
        let relatedAttendance = recordsAll.find(o => o.pk === attendanceAll[i].fields.attendance_record);
        let dateData = new Date(relatedAttendance.fields.date);
        let dateFormatted = `${dateData.getFullYear()}年${dateData.getMonth() + 1}月${dateData.getDate()}日（${dayOfWeekConvertShort[dateData.getDay()]}）`;
        let date = buildElement('div', 'date', '', dateFormatted);
        recordContainer.appendChild(date);

        // RECORD CONTAINER (CREATE LINK)
        let monthFormat = (0 + (dateData.getMonth() + 1).toString()).slice(-2);
        let dateFormat = (0 + (dateData.getDate()).toString()).slice(-2);
        recordContainer.href = `/attendance/?date=${dateData.getFullYear()}-${monthFormat}-${dateFormat}`;

        // RECORD CONTAINER - INSTRUCTOR
        let instructor = buildElement('div', 'instructor', '', '');
        instructor.style.backgroundImage = `url("/static/customer/notes/img/instructors/${relatedAttendance.fields.instructor}.svg")`
        recordContainer.appendChild(instructor);

        // RECORD CONTAINER - CLASS
        let classData = classesAll.find(o => o.pk === relatedAttendance.fields.linked_class);
        let className = buildElement('div', 'class', '', classData.fields.class_name);
        recordContainer.appendChild(className);

        // RECORD CONTAINER - STATUS
        let statusData = attendanceAll[i].fields.attendance_status;
        let attendanceStatus = buildElement('div', 'attendance-status', '', '');
        attendanceStatus.classList.add(attendanceStatusCSS[statusData]);
        recordContainer.appendChild(attendanceStatus);
    }

    // CONTAINER -> FOOTER
    let classCardFooter = buildElement('div', 'class-card-footer', '', '');
    attendanceContainer.appendChild(classCardFooter);

    // add CSS to fade in element
    attendanceContainer.classList.add('fade-to-visible');
}

// ======================= QR CODE =======================
function fetchQRCodeData(studentId, csrfToken) {
    parameters = {
        'parameter': 'get_all_data_for_student',
        'csrfmiddlewaretoken': csrfToken,
        'student_id': studentId,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/game/game_api",
        data: parameters,
        success: function (data) {
            const codesAll = JSON.parse(data.codesAll);
            buildQRCodeCard(codesAll, data.enrollmentStatus);
        },
    })
}

function buildQRCodeCard(data, enrollmentStatus) {
    const statusCSS = [ // enrollment status css classes
        'pre-enrolled',
        'pre-enrolled',
        'enrolled',
        'short-absence',
        'long-absence',
    ]

    let primaryContainer = document.getElementById('primary-container');

    // CONTAINER
    let container = document.createElement('div');
    container.id = 'qr-codes';
    container.classList.add('qr-container');
    primaryContainer.appendChild(container);

    // CONTAINER - HEADER
    let header = document.createElement('div');
    header.classList.add('header-container');
    header.classList.add(statusCSS[enrollmentStatus]);
    container.appendChild(header);

    // CONTAINER - HEADER - TITLE
    let title = document.createElement('div');
    header.classList.add('title');
    header.innerHTML = 'QRコード';
    header.appendChild(title);

    // CONTAINER - BODY
    let body = document.createElement('div');
    body.classList.add('card-body');
    container.appendChild(body);

    // CONTAINER - BODY - QR CODE CONTAINER
    let QRCodeContainer = document.createElement('div');
    QRCodeContainer.classList.add('qr-code-container');
    body.appendChild(QRCodeContainer);

    // // CONTAINER - BODY - QR CODE CONTAINER - GENERATE CODE BUTTON - PLUS BUTTON CONTAINER
    // let plusButtonContainer = document.createElement('div');
    // plusButtonContainer.classList.add('plus-button-container');
    // generateCodeButton.appendChild(plusButtonContainer);

    // // CONTAINER - BODY - QR CODE CONTAINER - GENERATE CODE BUTTON - PLUS BUTTON CONTAINER - VERTICAL
    // let plusButtonVertical = document.createElement('div');
    // plusButtonVertical.classList.add('plus-button-vertical');
    // plusButtonContainer.appendChild(plusButtonVertical);

    // // CONTAINER - BODY - QR CODE CONTAINER - GENERATE CODE BUTTON - PLUS BUTTON CONTAINER - HORIZONTAL
    // let plusButtonHorizontal = document.createElement('div');
    // plusButtonHorizontal.classList.add('plus-button-horizontal');
    // plusButtonContainer.appendChild(plusButtonHorizontal);

    // // CONTAINER - BODY - QR CODE CONTAINER - GENERATE CODE BUTTON - TEXT
    // let generateCodeButtonText = document.createElement('div');
    // generateCodeButtonText.classList.add('generate-code-button-text');
    // generateCodeButtonText.innerHTML = 'コード作成';
    // generateCodeButton.appendChild(generateCodeButtonText);

    // CONTAINER - BODY - ALL QR CODES CONTAINER
    let allQRCodesContainer = document.createElement('div');
    allQRCodesContainer.classList.add('all-qr-codes-container');
    body.appendChild(allQRCodesContainer);

    var i;
    for (i = 0; i < data.length; i++) {
        let csrfToken = document.getElementById('page-meta').dataset.csrf; // gets csrf token from body

        // CONTAINER - BODY - QR CODE CONTAINER - QR CODE
        let QRCode = document.createElement('div');
        QRCode.classList.add('qr-code');
        QRCode.style.backgroundImage = `url("/media/game/qr_codes/${data[i].fields.card_identifier}.svg")`;
        QRCode.id = `qr-code-record-${data[i].pk}`;
        QRCodeContainer.appendChild(QRCode);

        // CONTAINER - BODY - ALL QR CODES CONTAINER - CODE RECORD
        let codeRecord = document.createElement('div');
        codeRecord.classList.add('code-record');
        codeRecord.id = `code-record-${data[i].pk}`;
        codeRecord.addEventListener("click", selectQRCode);
        allQRCodesContainer.appendChild(codeRecord);

        if (i == 0) {
            codeRecord.classList.add('selected');
            QRCode.classList.add('visible-code');
        }

        // CONTAINER - BODY - ALL QR CODES CONTAINER - CODE RECORD - UUID
        let identifier = document.createElement('div');
        identifier.classList.add('uuid-identifier');
        identifier.innerHTML = data[i].fields.card_identifier;
        codeRecord.appendChild(identifier);

        // CONTAINER - BODY - ALL QR CODES CONTAINER - CODE RECORD - CREATION DATE/TIME
        let creationDateTime = document.createElement('div');
        creationDateTime.classList.add('uuid-creation');
        let newDate = new Date(data[i].fields.date_time);
        let newMonth = `0${(newDate.getMonth() + 1).toString()}`;
        let newDay = `0${newDate.getDate().toString()}`;
        let newHours = `0${newDate.getHours().toString()}`;
        let newMinutes = `0${newDate.getMinutes().toString()}`;
        let newTime = `${newHours.slice(-2)}:${newMinutes.slice(-2)}`;
        dateFormatted = `${newDate.getFullYear()}-${newMonth.slice(-2)}-${newDay.slice(-2)} ${newTime}`;
        creationDateTime.innerHTML = dateFormatted;
        codeRecord.appendChild(creationDateTime);
    }

    // CONTAINER - FOOTER
    let footer = document.createElement('div');
    footer.classList.add('class-card-footer');
    container.appendChild(footer);

    // CONTAINER - FOOTER - ADD QR CODE
    let newCodeButton = document.createElement('div');
    newCodeButton.classList.add('new-qr-button');
    newCodeButton.addEventListener('click', addNewQRCodeButton);
    footer.appendChild(newCodeButton);

    var i;
    for (i = 0; i < 3; i++) {
        let placeholder = document.createElement('div');
        footer.appendChild(placeholder);
    }

    // add CSS to fade in element
    container.classList.add('fade-to-visible');
}

function selectQRCode() {
    let container = document.getElementById('qr-codes');

    let allRecords = container.getElementsByClassName('code-record');
    let allQRCodes = container.getElementsByClassName('qr-code');

    var i;
    for (i = 0; i < allRecords.length; i++) {
        allRecords[i].classList.remove('selected');
        allQRCodes[i].classList.remove('visible-code');
        if (allRecords[i].id.slice(12) == this.id.slice(12)) {
            allRecords[i].classList.add('selected');
            allQRCodes[i].classList.add('visible-code');
        }
    }
}

function addNewQRCodeButton() {
    this.removeEventListener('click', addNewQRCodeButton); // temporarily remove QR button event listener
    
    let container = document.getElementById('qr-codes').getElementsByClassName('all-qr-codes-container')[0];

    let recordContainer = document.createElement('div');
    recordContainer.classList.add('code-record');
    recordContainer.classList.add('code-submit');
    container.insertBefore(recordContainer, container.getElementsByClassName('code-record')[0]);

    let inputField = document.createElement('input');
    inputField.classList.add('qr-input-field');
    inputField.placeholder = 'データを入力';
    recordContainer.appendChild(inputField);
    inputField.focus();

    let submitButton = document.createElement('div');
    submitButton.classList.add('qr-submit-button');
    submitButton.innerHTML = '追加';
    submitButton.addEventListener('click', submitNewQRCode);
    recordContainer.appendChild(submitButton);
}

function submitNewQRCode() {
    this.parentElement.remove();

    qrCodeValue = this.parentElement.getElementsByClassName('qr-input-field')[0].value;

    let pageMeta = document.getElementById('page-meta'); // gets page meta div
    let studentId = pageMeta.dataset.customer_id; // gets student id
    let csrfToken = pageMeta.dataset.csrf; // gets CSRF token

    parameters = {
        'parameter': 'add_qr_code',
        'csrfmiddlewaretoken': csrfToken,
        'student_id': studentId,
        'qr_code_value': qrCodeValue,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/game/game_api",
        data: parameters,
        success: function (data) {
            if (data.success == true) {
                let cardContainer = document.getElementById('qr-codes');

                let allRecords = cardContainer.getElementsByClassName('code-record');
                let allQRCodes = cardContainer.getElementsByClassName('qr-code');

                var i;
                for (i = 0; i < allRecords.length; i++) {
                    allRecords[i].classList.remove('selected');
                    allQRCodes[i].classList.remove('visible-code');
                }

                let container = document.getElementsByClassName('all-qr-codes-container')[0];

                let codeRecord = document.createElement('div');
                codeRecord.classList.add('code-record');
                codeRecord.classList.add('selected');
                codeRecord.addEventListener('click', selectQRCode);
                codeRecord.id = `code-record-${data.codeID}`;
                if (allRecords.length > 0) {
                    container.insertBefore(codeRecord, allRecords[0]);
                } else {
                    container.appendChild(codeRecord);
                }

                let identifier = document.createElement('div');
                identifier.classList.add('uuid-identifier');
                identifier.innerHTML = data.codeValue;
                codeRecord.appendChild(identifier);

                let creation = document.createElement('div');
                creation.classList.add('uuid-creation');
                let newDate = new Date(data.creation);
                let newMonth = `0${(newDate.getMonth() + 1).toString()}`;
                let newDay = `0${newDate.getDate().toString()}`;
                let newHours = `0${newDate.getHours().toString()}`;
                let newMinutes = `0${newDate.getMinutes().toString()}`;
                let newTime = `${newHours.slice(-2)}:${newMinutes.slice(-2)}`;
                dateFormatted = `${newDate.getFullYear()}-${newMonth.slice(-2)}-${newDay.slice(-2)} ${newTime}`;
                creation.innerHTML = dateFormatted;
                codeRecord.appendChild(creation);

                let imageContainer = cardContainer.getElementsByClassName('qr-code-container')[0];

                let codeImage = document.createElement('div');
                codeImage.classList.add('qr-code');
                codeImage.classList.add('visible-code');
                codeImage.id = `qr-code-record-${data.codeID}`;
                codeImage.style.backgroundImage = `url(/media/game/qr_codes/${data.codeValue}.svg)`;

                if (allQRCodes.length > 0) {
                    imageContainer.insertBefore(codeImage, allQRCodes[0]);
                } else {
                    imageContainer.appendChild(codeImage);
                }
            }
        },
    })

    let footerAddButton = document.getElementById('qr-codes').getElementsByClassName('new-qr-button')[0];
    footerAddButton.addEventListener('click', addNewQRCodeButton);
}

// ======================= ANALYTICS =======================
function fetchStudentAnalyticsData(studentID, csrfToken) {
    parameters = {
        'parameter': 'get_analytics_data_for_student',
        'csrfmiddlewaretoken': csrfToken,
        'student_id': studentID,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/analytics/analytics_api",
        data: parameters,
        success: function (data) {
            buildAnalyticsCard(data);
        },
    })
}

function buildAnalyticsCard(data) {
    if (data.lifetime != null) {
        const statusCSS = [ // enrollment status css classes
            'pre-enrolled',
            'pre-enrolled',
            'enrolled',
            'short-absence',
            'long-absence',
        ]

        let primaryContainer = document.getElementById('primary-container');

        // CONTAINER
        let container = document.createElement('div');
        container.id = 'analytics-container';
        primaryContainer.appendChild(container);

        // CONTAINER - HEADER
        let header = document.createElement('div');
        header.classList.add('header-container');
        header.classList.add(statusCSS[data.enrollmentStatus]);
        container.appendChild(header);

        // CONTAINER - HEADER - TITLE
        let title = document.createElement('div');
        header.classList.add('title');
        header.innerHTML = '分析';
        header.appendChild(title);

        // CONTAINER - BODY
        let body = document.createElement('div');
        body.classList.add('card-body');
        container.appendChild(body);

        // CONTAINER - BODY - TIMELINE
        let timeline = document.createElement('div');
        timeline.classList.add('timeline');
        body.appendChild(timeline);

        // CONTAINER - BODY - TIMELINE - TITLE
        let timelineTitle = document.createElement('div');
        timelineTitle.classList.add('timeline-title');
        timelineTitle.innerHTML = '顧客の生涯';
        timeline.appendChild(timelineTitle);

        // CONTAINER - BODY - TIMELINE - LIFETIME
        let lifetime = document.createElement('div');
        lifetime.classList.add('lifetime');
        lifetime.innerHTML = `${data.lifetime}日`;
        timeline.appendChild(lifetime);

        // CONTAINER - BODY - TIMELINE - DATE CONTAINER
        let dateContainer = document.createElement('div');
        dateContainer.classList.add('date-container');
        timeline.appendChild(dateContainer);

        // CONTAINER - BODY - TIMELINE - DATE CONTAIER - LINE CONTAINER
        let lineContainer = document.createElement('div');
        lineContainer.classList.add('line-container');
        dateContainer.appendChild(lineContainer);

        // CONTAINER - BODY - TIMELINE - DATE CONTAIER - LINE CONTAINER - START
        let lineContainerStart = document.createElement('div');
        lineContainerStart.classList.add('start');
        lineContainer.appendChild(lineContainerStart);

        // CONTAINER - BODY - TIMELINE - DATE CONTAIER - LINE CONTAINER - LINE
        let lineContainerLine = document.createElement('div');
        lineContainerLine.classList.add('line');
        lineContainer.appendChild(lineContainerLine);

        // CONTAINER - BODY - TIMELINE - DATE CONTAIER - LINE CONTAINER - END
        let lineContainerEnd = document.createElement('div');
        lineContainerEnd.classList.add('end');
        lineContainer.appendChild(lineContainerEnd);

        // CONTAINER - BODY - TIMELINE - DATE CONTAIER - FIRST LESSON
        let firstLesson = document.createElement('div');
        firstLesson.classList.add('first-lesson');
        let dateFirst = new Date(data.earliestAttendanceRecord)
        firstLesson.innerHTML = `${dateFirst.getFullYear()}年${dateFirst.getMonth() + 1}月${dateFirst.getDate()}日`;
        dateContainer.appendChild(firstLesson);

        // CONTAINER - BODY - TIMELINE - DATE CONTAINER - LATEST LESSON
        let latestLesson = document.createElement('div');
        latestLesson.classList.add('latest-lesson');
        let dateLast = new Date(data.latestAttendanceRecord)
        latestLesson.innerHTML = `${dateLast.getFullYear()}年${dateLast.getMonth() + 1}月${dateLast.getDate()}日`;
        dateContainer.appendChild(latestLesson);

        // CONTAINER - FOOTER
        let footer = document.createElement('div');
        footer.classList.add('class-card-footer');
        container.appendChild(footer);

        // add CSS to fade in element
        container.classList.add('fade-to-visible');
    }
}