// TOGGLE DISPLAY FLAGGED PROFILES BUTTON
function toggleFlaggedButton(parameter) {
    let button = document.getElementById('flagged-button'); // gets view flagged button object
    let lazyLoad = document.getElementById('lazy-load');

    if (!parameter) {
        disableMenuClicks('disable'); // disables clicks to menu while content loads
        clearAllResults(); // clears all profiles
        clearTopInformation(); // clears top information text
        lazyLoad.dataset.batch_number = 0; // resets data batch number

        if (button.classList.contains('filtered-flagged')) {
            button.classList.remove('filtered-flagged');
            queryDatabaseAdminProfiles('UPDATE', [['display_only_flagged_profiles', 'False']]); // updates sticky user preferences
            lazyLoad.dataset.display_only_flagged = 'False';
        } else {
            button.classList.add('filtered-flagged');
            queryDatabaseAdminProfiles('UPDATE', [['display_only_flagged_profiles', 'True']]); // updates sticky user preferences
            lazyLoad.dataset.display_only_flagged = 'True';
        }
        queryDatabase('GET');
    }

    // get view flagged profiles value from lazy load div and sets initial button value
    if (parameter == 'Initial') {
        if (lazyLoad.dataset.display_only_flagged == 'True') {
            button.classList.add('filtered-flagged');
        }
    }
}

// SET FLAGGED PROFILES
function getFlags(profilesToCheck) {
    let parameter = 'GET_FLAGGED'

    let csrfToken = document.body.dataset.csrf; // gets csrf token from body

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': parameter,
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "admin_profile_api",
        data: parameters,
        success: function (data) {
            let values = data.values; // flagged profile id array

            let numberLoaded = document.getElementById('lazy-load').dataset.batch_size // gets profiles loaded batch size

            let newProfiles = document.getElementsByClassName('customer-card'); // gets all customer cards
            let newProfilesArray = Array.from(newProfiles); // converts to array
            let latestLoad = newProfilesArray.slice(-numberLoaded); // gets only freshly loaded cards

            var i;
            for (i = 0; i < latestLoad.length; i++) {
                profileId = parseInt(latestLoad[i].id.slice(14));
                if (values.includes(parseInt(profileId))) {
                    let flagIcon = document.getElementById(`flag-${profileId}`);
                    flagIcon.classList.add('flag-true');
                }
            }
        }
    })
}

// ADD/REMOVE FLAGS FROM PROFILES
function handleFlags(parameter, profile_id) {
    let csrfToken = document.body.dataset.csrf; // gets csrf token from body

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': parameter,
        'profile_id': profile_id,
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

// HIGHLIGHT PROFILES WITH FLAGS
function toggleProfileFlag() {
    let flagButton = this; // gets flag button
    let profileId = this.parentNode.parentNode.id.slice(14);
    let viewFlagged = document.getElementById('lazy-load').dataset.display_only_flagged;

    if (flagButton.classList.contains('flag-true')) { // if profile is flagged
        flagButton.classList.remove('flag-true');
        handleFlags('REMOVE_FLAG', profileId);
        if (viewFlagged == 'True') {
            let profile = document.getElementById(`customer-card-${profileId}`);
            profile.remove();
            // IN PROGRESS; UNTESTED CODE
            var resultNumber = document.getElementById('result-number'); // gets result element
            let newValue = parseInt(resultNumber.innerHTML.slice(0,-9)) - 1; // converst to integer and decrements
            resultNumber.innerHTML = `${newValue}件を表示しています`; // updates top information sentence
        }
    } else { // if profile is NOT flagged
        flagButton.classList.add('flag-true');
        handleFlags('ADD_FLAG', profileId);
    }
}

// HIGHLIGHTS PROFILES WITH UNARCHIVED NOTES
function highlightNotes() {
    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "active_notes",
        data: parameters,
        success: function (data) {
            let numberLoaded = document.getElementById('lazy-load').dataset.batch_size // gets profiles loaded batch size

            let allNoteIcons = Array.from(document.getElementsByClassName('notes')); // gets all loaded profiles and converts to array
            let currentIconBatch = allNoteIcons.slice(-numberLoaded); // gets only freshly loaded note icons

            var i;
            for (i = 0; i < currentIconBatch.length; i++) {
                var currentProfileId = parseInt(currentIconBatch[i].id.slice(6))
                if (data.active_notes.includes(currentProfileId)) {
                    currentIconBatch[i].classList.add('notes-true');
                }
            }
        }
    })
}

function performNoteSearch() {
    document.removeEventListener("keydown", searchFieldReturnKey); // removes event listener
    document.removeEventListener("scroll", lazyLoad); // removes lazy load event listener

    clearAllResults(); // clears all profiles

    clearTopInformation(); // clears top information text

    document.getElementById('lazy-load').dataset.batch_number = '0'; // resets batch number
    
    queryDatabase('GET'); // queries database

    addRemoveLoading('ADD', 'customer-all'); // adds loading element
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

// CLEARS PROFILES
function clearAllResults() {
    let customerCardContainer = document.getElementById('customer-card-container');
    customerCardContainer.innerHTML = '';
}

// QUERY DATABASE - ADMIN PROFILES
function queryDatabaseAdminProfiles(parameter, field_value) {
    let csrfToken = document.body.dataset.csrf; // gets csrf token from body

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
        success: function (data) {},
    })
}

// ARCHIVE BUTTON TOGGLE
function archiveButtonToggle() {
    let archiveButton = document.getElementById('archive-button');
    let lazyLoadMeta = document.getElementById('lazy-load');

    if (archiveButton.classList.contains('archive-button-active')) {
        archiveButton.classList.remove('archive-button-active'); // updates button styling
        clearAllResults(); // clears all profiles
        clearTopInformation(); // clears top information text
        addRemoveLoading('ADD', 'customer-all'); // adds loading spinner
        lazyLoadMeta.dataset.display_archived = 'False'; // sets lazy load metadata
        lazyLoadMeta.dataset.batch_number = '0'; // resets meta data batch number
        queryDatabase('GET'); // queries DB, builds notes, inserts into DOM
        queryDatabaseAdminProfiles('UPDATE', [['display_archived_profiles', 'False']]); // updates sticky user preferences
    } else {
        archiveButton.classList.add('archive-button-active');
        clearAllResults();
        clearTopInformation();
        addRemoveLoading('ADD', 'customer-all');
        lazyLoadMeta.dataset.display_archived = 'True';
        lazyLoadMeta.dataset.batch_number = '0';
        queryDatabase('GET');
        queryDatabaseAdminProfiles('UPDATE', [['display_archived_profiles', 'True']]);
    }
}

// SET MENU STICKY PREFERNCES
function setMenuSelections(value) {
    if (value == 'True') {
        let displayArchivedButton = document.getElementById('archive-button');
        displayArchivedButton.classList.add('archive-button-active');
    }
}

// DISABLES CLICKS TO MENU
function disableMenuClicks(toggle) {
    let header = document.getElementById('toolbar-container');
    if (toggle == 'disable') {
        header.style.pointerEvents = 'none';
    } else {
        header.style.pointerEvents = 'auto';
    }
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
        // gets CSRF token from body data attribute
        csrfToken = document.body.dataset.csrf;

        // disables clicks to menu while content loads
        disableMenuClicks('disable');

        document.removeEventListener("keydown", searchFieldReturnKey); // disables search field event listener

        document.removeEventListener("scroll", lazyLoad); // temporarily removes lazy load event listener
        addRemoveLoading('ADD', 'customer-all'); // adds loading spinner
        clearTopInformation(); // clears top information text
        queryDatabase('GET');
    }
}

// INITIALIZING FUNCTIONS
function initializingFunctions() {
    // performs initial query
    queryDatabase('GET');
    // adds search field return key detection
    document.addEventListener("keydown", searchFieldReturnKey);
    // sets flagged profile button status
    toggleFlaggedButton('Initial');
}

// CLEARS TOP INFORMATION
function clearTopInformation() {
    let previousTopInformation = document.getElementsByClassName('top-information');
    var i;
    for (i = 0; i < previousTopInformation.length; i++) {
        previousTopInformation[i].remove();
    }
}

// BUILDS TOP INFORMATION
function buildTopInformation(resultCount, showArchive) {
    let displayOnlyFlagged = document.getElementById('lazy-load').dataset.display_only_flagged; // display only flagged parameter
    let topInformation = document.createElement('div');
    topInformation.id = 'top-information';
    topInformation.classList.add('top-information');
    topInformation.innerHTML = '<span id="result-number">'+ resultCount + '件を表示しています';

    if (showArchive == 'True' && displayOnlyFlagged == 'False') { // SHOW ARCHIVE, HIDE FLAGGED
        topInformation.innerHTML += '<br>アーカイブされた件も表示しています';
    } else if (showArchive == 'False' && displayOnlyFlagged == 'False') { // HIDE ARCHIVED, HIDE FLAGGED
        topInformation.innerHTML += '<br>アーカイブされた件は非表示です';
    } else if (showArchive == 'True' && displayOnlyFlagged == 'True') { // SHOW ARCHIVE, SHOW FLAGGED
        topInformation.innerHTML += '<br>フラグされた件だけ表示しています';
    } else { // HIDE ARVHIED, SHOW FLAGGED
        topInformation.innerHTML += '<br>フラグされた件だけ表示しています';
    }

    if (document.getElementById('search-input').value != '') {
        topInformation.innerHTML += `<br>「${document.getElementById('search-input').value}」で検索しました`;
    }

    let customerAllContainer = document.getElementById('customer-all');
    let customerCardContainer = document.getElementById('customer-card-container');

    customerAllContainer.insertBefore(topInformation, customerCardContainer);
}

function buildProfileCards(profileCards) {
    // DEFINES CONVERSION VALUES
    // values for css classes
    const statusCSSClassConvert = [
        'pre-enrolled',
        'pre-enrolled',
        'enrolled',
        'short-absence',
        'long-absence',
    ]
    // text values for display in DOM
    const statusConvert = [
        '-------',
        '入学希望',
        '在学',
        '休校',
        '退校',
    ]

    // text values for grade
    const gradeConvert = [
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

    // text values for phone type
    const phoneTypeConvert = [
        '-------',
        '自身',
        '母',
        '父',
        '祖母',
        '祖父',
        '叔父',
        '叔母',
    ]

    const prefectureConvert = [
        '-------',
        '徳島県',
        '香川県',
    ]

    const paymentMethodConvert = [
        '-------',
        '月謝袋',
        '引き落とし',
    ]

    // FORMATTING FUNCTIONS
    function formatNameGrade(lastNameKanji, firstNameKanji, grade) {
        var nameGradeFormat = ''; // declares output
        if (lastNameKanji != '') { // adds last name
            nameGradeFormat += lastNameKanji;
        }
        if (firstNameKanji != '' && nameGradeFormat.length == 0) { // adds first name
            nameGradeFormat += firstNameKanji;
        } else if (firstNameKanji != '') {
            nameGradeFormat += ' ' + firstNameKanji;
        }
        if (grade != 0 && nameGradeFormat.length == 0) { // adds grade
            nameGradeFormat += '(' + gradeConvert[grade] + ')';
        } else if (grade != 0) {
            nameGradeFormat += ' (' + gradeConvert[grade] + ')';
        }

        return nameGradeFormat
    }

    function formatNameKatakana(lastName, firstName) {
        fullName = '';
        if (lastName != '') {
            fullName += lastName
        }
        if (fullName.length != 0 && firstName != '') {
            fullName += ' ' + firstName;
        } else {
            fullName += firstName;
        }

        return fullName;
    }

    function formatNameRomaji(lastName, firstName) {
        fullName = '';
        if (lastName != '') {
            fullName += lastName
        }
        if (fullName.length != 0 && firstName != '') {
            fullName += ', ' + firstName;
        } else {
            fullName += firstName;
        }

        return fullName;
    }

    function formatPhone(phoneNumber, type) {
        var phoneFormat = '';
        if (phoneNumber != '') {
            phoneFormat += '<a href="tel:' + phoneNumber + '">' + phoneNumber + '</a>';
        }
        if (type != 0 && phoneFormat.length != 0) {
            phoneFormat += ' (' + phoneTypeConvert[type] + ')';
        } else if (type != 0) {
            phoneFormat += '(' + phoneTypeConvert[type] + ')'
        }

        return phoneFormat
    }

    let customerCardContainer = document.getElementById('customer-card-container');

    var i;
    for (i = 0; i < profileCards.length; i++) {
        card = profileCards[i];
        
        // CARD CONTAINER
        let customerCard = document.createElement('div');
        customerCard.id = "customer-card-" + card.profile_id;
        customerCard.classList.add('customer-card');

        // CARD CONTAINER -> METADATA CONTAINER
        let metadata = document.createElement('div');
        metadata.id = "profile-metadata";
        metadata.classList.add('display-none');
        customerCard.appendChild(metadata);

        // CARD CONTAINER -> METADATA CONTAINER -> STATUS
        let status = document.createElement('div');
        status.classList.add('status-hidden');
        status.innerHTML = card.status;
        metadata.appendChild(status);

        // CARD CONTAINER -> METADATA CONTAINER -> GRADE
        let grade = document.createElement('div');
        grade.classList.add('grade-hidden');
        grade.innerHTML = card.grade;
        metadata.appendChild(grade);

        // CARD CONTAINER -> METADATA CONTAINER -> BIRTHDAY MONTH
        let birthdayMonth = document.createElement('div');
        birthdayMonth.classList.add('birthday-month-hidden');
        birthdayMonth.innerHTML = card.birthdayMonth;
        metadata.appendChild(birthdayMonth);

        // CARD CONTAINER -> METADATA CONTAINER -> BIRTHDAY DAY
        let birthdayDay = document.createElement('div');
        birthdayDay.classList.add('birthday-day-hidden');
        birthdayDay.innerHTML = card.birthdayDay;
        metadata.appendChild(birthdayDay);

        // CARD CONTAINER -> METADATA CONTAINER -> PAYMENT
        let payment = document.createElement('div');
        payment.classList.add('payment-hidden');
        payment.innerHTML = card.payment;
        metadata.appendChild(payment);

        // CARD CONTAINER -> METADATA CONTAINER -> CUSTOMER ID
        let customerId = document.createElement('div');
        customerId.classList.add('customer-id-hidden');
        customerId.innerHTML = card.profile_id;
        metadata.appendChild(customerId);

        // CARD CONTAINER -> CARD HEADER
        let cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');
        cardHeader.classList.add(statusCSSClassConvert[card.status]);
        customerCard.appendChild(cardHeader);

        // CARD CONTAINER -> CARD HEADER -> ARCHIVED ICON
        if (card.archived == true) {
            let archivedIcon = document.createElement('div');
            archivedIcon.classList.add('archived-icon');
            cardHeader.appendChild(archivedIcon);
            customerCard.classList.add('archived'); // appends archived class to profile card container
        }

        // CARD CONTAINER -> CARD HEADER -> STATUS
        let cardHeaderStatus = document.createElement('div');
        cardHeaderStatus.classList.add('status');
        cardHeaderStatus.innerHTML = statusConvert[card.status];
        cardHeader.appendChild(cardHeaderStatus);

        // CARD CONTAINER -> CARD BODY
        let cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        customerCard.appendChild(cardBody);

        // CARD CONTAINER -> CARD BODY -> NAME CONTAINER
        let nameContainer = document.createElement('div');
        nameContainer.classList.add('name-container');
        cardBody.appendChild(nameContainer);

        // CARD CONTAINER -> CARD BODY -> NAME CONTAINER -> FULL NAME (JAPANESE)
        let fullNameJapanese = document.createElement('div');
        fullNameJapanese.classList.add('full-name-ja');
        fullNameJapanese.innerHTML = formatNameGrade(card.last_name_kanji, card.first_name_kanji, card.grade);
        nameContainer.appendChild(fullNameJapanese);

        // CARD CONTAINER -> CARD BODY -> NAME CONTAINER -> SUB NAME (KATAKANA)
        let subNameKatakana = document.createElement('div');
        subNameKatakana.classList.add('sub-name');
        subNameKatakana.innerHTML = formatNameKatakana(card.last_name_katakana, card.first_name_katakana);
        nameContainer.appendChild(subNameKatakana);

        // CARD CONTAINER -> CARD BODY -> NAME CONTAINER -> SUB NAME (ROMAJI)
        let subNameRomaji = document.createElement('div');
        subNameRomaji.classList.add('sub-name');
        subNameRomaji.innerHTML = formatNameRomaji(card.last_name_romaji, card.first_name_romaji);
        nameContainer.appendChild(subNameRomaji);

        // CARD CONTAINER -> CARD BODY -> PHONE CONTAINER
        let phoneContainer = document.createElement('div');
        phoneContainer.classList.add('phone-container');
        phoneContainer.classList.add('bottom-separator');
        cardBody.appendChild(phoneContainer);

        // CARD CONTAINER -> CARD BODY -> PHONE CONTAINER -> PHONE ONE
        if (card.phone_1 != '' | card.phone_1_type != 0) {
            let phoneOne = document.createElement('div');
            phoneOne.classList.add('phone-1');
            phoneOne.innerHTML = formatPhone(card.phone_1, card.phone_1_type);
            phoneContainer.appendChild(phoneOne);
        }

        // CARD CONTAINER -> CARD BODY -> PHONE CONTAINER -> PHONE TWO
        if (card.phone_2 != '' | card.phone_2_type != 0) {
            let phoneTwo = document.createElement('div');
            phoneTwo.classList.add('phone-2');
            phoneTwo.innerHTML = formatPhone(card.phone_2, card.phone_2_type);
            phoneContainer.appendChild(phoneTwo);
        }

        // CARD CONTAINER -> CARD BODY -> ADDRESS CONTAINER
        if (card.post_code != '' | card.prefecture != '' | card.city != '' | card.address_1 != '' | card.address_2 != '') {
            let addressContainer = document.createElement('div');
            addressContainer.classList.add('address-container');
            addressContainer.classList.add('bottom-separator');
            cardBody.appendChild(addressContainer);

            // CARD CONTAINER -> CARD BODY -> ADDRESS CONTAINER -> ADDRESS ONE
            if (card.post_code != '') {
                let addressOne = document.createElement('div');
                addressOne.classList.add('address-1');
                addressOne.innerHTML = `〒 ${card.post_code}`;
                addressContainer.appendChild(addressOne);
            }

            // CARD CONTAINER -> CARD BODY -> ADDRESS CONTAINER -> ADDRESS TWO
            if (card.prefecture != '' | card.city != '' | card.address_1 != '') {
                let addressTwo = document.createElement('div');
                addressTwo.classList.add('address-2');
                addressTwo.innerHTML = `${prefectureConvert[card.prefecture]}${card.city}${card.address_1}`;
                addressContainer.appendChild(addressTwo);
            }

            // CARD CONTAINER -> CARD BODY -> ADDRESS CONTAINER -> ADDRESS THREE
            if (card.address_2 != '') {
                let addressThree = document.createElement('div');
                addressThree.classList.add('address-3');
                addressThree.innerHTML = `${card.address_2}`;
                addressContainer.appendChild(addressThree);
            }
        }

        // CARD CONTAINER -> CARD BODY -> BIRTHDAY CONTAINER
        if (card.birthday != null) {
            let birthday = document.createElement('div');
            birthday.classList.add('birthday');
            birthday.classList.add('bottom-separator');
            birthday.innerHTML = card.birthday;
            cardBody.appendChild(birthday);

            birthday.innerHTML += ` (${card.age}才)`;
        }

        // CARD CONTAINER -> CARD BODY -> PAYMENT METHOD CONTAINER
        if (card.payment != '') {
            let paymentMethod = document.createElement('div');
            paymentMethod.classList.add('payment-method');
            paymentMethod.classList.add('bottom-container');
            paymentMethod.innerHTML = paymentMethodConvert[card.payment];
            cardBody.appendChild(paymentMethod);
        }

        // CARD CONTAINER -> CARD FOOTER
        let cardFooterContainer = document.createElement('div');
        cardFooterContainer.classList.add('card-footer');
        customerCard.appendChild(cardFooterContainer);

        // CARD CONTAINER -> CARD FOOTER -> EDIT BUTTON
        let editButton = document.createElement('a');
        editButton.classList.add('edit');
        editButton.href = `/customer/edit/${card.profile_id}?return_link=/customer/browse`;
        cardFooterContainer.appendChild(editButton);
        
        // CARD CONTAINER -> CARD FOOTER -> EDIT BUTTON
        let detailButton = document.createElement('a');
        detailButton.classList.add('details');
        detailButton.href = `/customer/detail/${card.profile_id}`;
        cardFooterContainer.appendChild(detailButton);

        // CARD CONTAINER -> CARD FOOTER -> NOTES BUTTON
        let notesButton = document.createElement('div');
        notesButton.classList.add('notes');
        notesButton.id = `notes-${card.profile_id}`;
        cardFooterContainer.appendChild(notesButton);

        // CARD CONTAINER -> CARD FOOTER -> FLAG BUTTON
        let flagButton = document.createElement('a');
        flagButton.classList.add('flag');
        flagButton.id = `flag-${card.profile_id}`;
        flagButton.addEventListener("click", toggleProfileFlag);
        cardFooterContainer.appendChild(flagButton); 

        customerCardContainer.appendChild(customerCard); // adds populated cutomer card container to DOM
    }

    if (profileCards.length == 0) {
    } else {
        document.addEventListener("scroll", lazyLoad);

        // increments lazy load batch number
        let lazyLoadContainer = document.getElementById('lazy-load');
        let batchNumber = lazyLoadContainer.dataset.batch_number;
        lazyLoadContainer.dataset.batch_number = parseInt(batchNumber) + 1;
    }

    addRemoveLoading('REMOVE', 'customer-all');

    // re-enables clicks to menu
    disableMenuClicks('enable');

    document.addEventListener("keydown", searchFieldReturnKey); // re-adds keyup search field event listener

    highlightNotes(); // highlights profiles with unarchived notes

    getFlags(25); // checks flagged profile status for the 25 newly loaded profiles

    // checks page hight and performs lazy load if insufficient page height
    lazyLoadPageHeightCheck(profileCards.length);
}

function queryDatabase(parameter) {
    csrfToken = document.body.dataset.csrf; // gets csrf token from body data attribute

    let lazyLoadData        = document.getElementById('lazy-load');
    batchNumber             = lazyLoadData.dataset.batch_number;
    batchSize               = lazyLoadData.dataset.batch_size;
    displayArchived         = lazyLoadData.dataset.display_archived;
    displayUnarchived       = lazyLoadData.dataset.display_unarchived;
    sort                    = lazyLoadData.dataset.sort;
    searchParameter         = document.getElementById('search-input').value;
    display_only_flagged    = lazyLoadData.dataset.display_only_flagged;

    setMenuSelections(displayArchived);

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': parameter,
        'batch_number': batchNumber,
        'batch_size': batchSize,
        'display_archived': displayArchived,
        'display_unarchived': displayUnarchived,
        'sort': sort,
        'search_parameter': searchParameter,
        'display_only_flagged': display_only_flagged,
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "customer_profiles_api",
        data: parameters,
        success: function (data) {
            // builds top information before generating profile cards
            clearTopInformation();
            buildTopInformation(data.resultCount, data.parameters.display_archived);
            buildProfileCards(data.profiles);
        },
    })
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