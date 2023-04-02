// INITIALIZING SCRIPTS
function initialization() {
    console.log('INITIALIZING PAGE');
    console.log('------------------------');
    getChangelogClasslistAll(); // queries database for accesslog records
}

// GET ALL ACCESSLOG RECORDS
function getChangelogClasslistAll() {
    let parameter = "GET_CUSTOMER_CHANGELOG_ALL";

    let pageMeta = document.getElementById('page-meta');
    let csrfToken = pageMeta.dataset.csrf_token; // get csrf token
    let batchNumber = pageMeta.dataset.batch_number; // get batch number

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': parameter,

        'batch_number': batchNumber,
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "../../analytics_api",
        data: parameters,
        success: function (data) {
            console.log('DATABASE QUERY SUCCESSFUL');
            addTableRows(data, document.getElementById('table')); // generates rows and data for subsequent loads
            console.log('------------------------');
        },
    })
}

// GENERATES TABLE ROWS & DATA
function addTableRows(data, table) {
    var i;
    for (i = 0; i < data.records.length; i++) {
        // TABLE SECTION -> TABLE -> ROWS
        let row = document.createElement('tr');
        row.id = `log-${data.records[i].id}`;
        table.appendChild(row);

        // TABLE SECTION -> TABLE -> ROWS -> ID
        let id = document.createElement('td');
        id.innerHTML = data.records[i].id;
        row.appendChild(id);

        // TABLE SECTION -> TABLE -> ROWS -> CHANGELOG CUSTOMER PROFILE
        let changelogCustomerProfile = document.createElement('td');
        changelogCustomerProfile.innerHTML = data.records[i].changelogCustomerProfile;
        row.appendChild(changelogCustomerProfile);

        // TABLE SECTION -> TABLE -> ROWS -> CHANGELOG DATE TIME
        let changelogDateTime = document.createElement('td');
        changelogDateTime.innerHTML = data.records[i].changelogDateTime;
        row.appendChild(changelogDateTime);

        // TABLE SECTION -> TABLE -> ROWS -> CHANGELOG USER
        let changelogUser = document.createElement('td');
        changelogUser.innerHTML = data.records[i].changelogUser;
        row.appendChild(changelogUser);

        // TABLE SECTION -> TABLE -> ROWS -> CHANGELOG TYPE
        let changelogType = document.createElement('td');
        changelogType.innerHTML = data.records[i].changelogType;
        row.appendChild(changelogType);

        // TABLE SECTION -> TABLE -> ROWS -> LAST NAME ROMAJI
        let lastNameRomaji = document.createElement('td');
        lastNameRomaji.innerHTML = data.records[i].lastNameRomaji;
        row.appendChild(lastNameRomaji);

        // TABLE SECTION -> TABLE -> ROWS -> FIRST NAME ROMAJI
        let firstNameRomaji = document.createElement('td');
        firstNameRomaji.innerHTML = data.records[i].firstNameRomaji;
        row.appendChild(firstNameRomaji);

        // TABLE SECTION -> TABLE -> ROWS -> LAST NAME KANJI
        let lastNameKanji = document.createElement('td');
        lastNameKanji.innerHTML = data.records[i].lastNameKanji;
        row.appendChild(lastNameKanji);

        // TABLE SECTION -> TABLE -> ROWS -> FIRST NAME KANJI
        let firstNameKanji = document.createElement('td');
        firstNameKanji.innerHTML = data.records[i].firstNameKanji;
        row.appendChild(firstNameKanji);

        // TABLE SECTION -> TABLE -> ROWS -> LAST NAME KATAKANA
        let lastNameKatakana = document.createElement('td');
        lastNameKatakana.innerHTML = data.records[i].lastNameKatakana;
        row.appendChild(lastNameKatakana);

        // TABLE SECTION -> TABLE -> ROWS -> FIRST NAME KATAKANA
        let firstNameKatakana = document.createElement('td');
        firstNameKatakana.innerHTML = data.records[i].firstNameKatakana;
        row.appendChild(firstNameKatakana);

        // TABLE SECTION -> TABLE -> ROWS -> POST CODE
        let postCode = document.createElement('td');
        postCode.innerHTML = data.records[i].postCode;
        row.appendChild(postCode);

        // TABLE SECTION -> TABLE -> ROWS -> PREFECTURE
        let prefecture = document.createElement('td');
        prefecture.innerHTML = data.records[i].prefecture;
        row.appendChild(prefecture);

        // TABLE SECTION -> TABLE -> ROWS -> CITY
        let city = document.createElement('td');
        city.innerHTML = data.records[i].city;
        row.appendChild(city);

        // TABLE SECTION -> TABLE -> ROWS -> ADDRESS 1
        let addressOne = document.createElement('td');
        addressOne.innerHTML = data.records[i].addressOne;
        row.appendChild(addressOne);

        // TABLE SECTION -> TABLE -> ROWS -> ADDRESS 2
        let addressTwo = document.createElement('td');
        addressTwo.innerHTML = data.records[i].addressTwo;
        row.appendChild(addressTwo);

        // TABLE SECTION -> TABLE -> ROWS -> PHONE 1
        let phoneOne = document.createElement('td');
        phoneOne.innerHTML = data.records[i].phoneOne;
        row.appendChild(phoneOne);

        // TABLE SECTION -> TABLE -> ROWS -> PHONE 1 TYPE
        let phoneOneType = document.createElement('td');
        phoneOneType.innerHTML = data.records[i].phoneOneType;
        row.appendChild(phoneOneType);

        // TABLE SECTION -> TABLE -> ROWS -> PHONE 2
        let phoneTwo = document.createElement('td');
        phoneTwo.innerHTML = data.records[i].phoneTwo;
        row.appendChild(phoneTwo);

        // TABLE SECTION -> TABLE -> ROWS -> PHONE 1 TYPE
        let phoneTwoType = document.createElement('td');
        phoneTwoType.innerHTML = data.records[i].phoneTwoType;
        row.appendChild(phoneTwoType);

        // TABLE SECTION -> TABLE -> ROWS -> BIRTHDAY
        let birthday = document.createElement('td');
        birthday.innerHTML = data.records[i].birthday;
        row.appendChild(birthday);

        // TABLE SECTION -> TABLE -> ROWS -> GRADE
        let grade = document.createElement('td');
        grade.innerHTML = data.records[i].grade;
        row.appendChild(grade);

        // TABLE SECTION -> TABLE -> ROWS -> STATUS
        let status = document.createElement('td');
        status.innerHTML = data.records[i].status;
        row.appendChild(status);

        // TABLE SECTION -> TABLE -> ROWS -> PAYMENT METHOD
        let paymentMethod = document.createElement('td');
        paymentMethod.innerHTML = data.records[i].paymentMethod;
        row.appendChild(paymentMethod);

        // TABLE SECTION -> TABLE -> ROWS -> ARCHIVED
        let archived = document.createElement('td');
        archived.innerHTML = data.records[i].archived;
        row.appendChild(archived);
    }

    // increments batch counter
    let pageMeta = document.getElementById('page-meta');
    let batchNumber = parseInt(pageMeta.dataset.batch_number);
    pageMeta.dataset.batch_number = batchNumber + 1;
}