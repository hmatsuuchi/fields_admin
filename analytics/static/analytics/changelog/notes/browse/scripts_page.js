// INITIALIZING SCRIPTS
function initialization() {
    console.log('INITIALIZING PAGE');
    console.log('------------------------');
    getChangelogClasslistAll(); // queries database for accesslog records
}

// GET ALL ACCESSLOG RECORDS
function getChangelogClasslistAll() {
    let parameter = "GET_NOTES_CHANGELOG_ALL";

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

        // TABLE SECTION -> TABLE -> ROWS -> CHANGELOG NOTE
        let changelogNote = document.createElement('td');
        changelogNote.innerHTML = data.records[i].changelogNote;
        row.appendChild(changelogNote);

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

        // TABLE SECTION -> TABLE -> ROWS -> CUSTOMER ID
        let customerId = document.createElement('td');
        customerId.innerHTML = data.records[i].customerId;
        row.appendChild(customerId);

        // TABLE SECTION -> TABLE -> ROWS -> DATE
        let date = document.createElement('td');
        date.innerHTML = data.records[i].date;
        row.appendChild(date);

        // TABLE SECTION -> TABLE -> ROWS -> TIME
        let time = document.createElement('td');
        time.innerHTML = data.records[i].time;
        row.appendChild(time);

        // TABLE SECTION -> TABLE -> ROWS -> TYPE
        let type = document.createElement('td');
        type.innerHTML = data.records[i].type;
        row.appendChild(type);

        // TABLE SECTION -> TABLE -> ROWS -> INSTRUCTOR 1
        let instructorOne = document.createElement('td');
        instructorOne.innerHTML = data.records[i].instructorOne;
        row.appendChild(instructorOne);

        // TABLE SECTION -> TABLE -> ROWS -> INSTRUCTOR 2
        let instructorTwo = document.createElement('td');
        instructorTwo.innerHTML = data.records[i].instructorTwo;
        row.appendChild(instructorTwo);

        // TABLE SECTION -> TABLE -> ROWS -> NOTE TEXT
        let noteText = document.createElement('td');
        noteText.innerHTML = data.records[i].noteText;
        row.appendChild(noteText);

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