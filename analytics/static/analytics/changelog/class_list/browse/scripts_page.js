// INITIALIZING SCRIPTS
function initialization() {
    console.log('INITIALIZING PAGE');
    console.log('------------------------');
    getChangelogClasslistAll(); // queries database for accesslog records
}

// GET ALL ACCESSLOG RECORDS
function getChangelogClasslistAll() {
    let parameter = "GET_CLASS_CHANGELOG_ALL";

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

        // TABLE SECTION -> TABLE -> ROWS -> CHANGELOG CLASS
        let changelogClass = document.createElement('td');
        changelogClass.innerHTML = data.records[i].changelogClass;
        row.appendChild(changelogClass);

        // TABLE SECTION -> TABLE -> ROWS -> CHANGELOG DATETIME
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

        // TABLE SECTION -> TABLE -> ROWS -> CLASS NAME
        let className = document.createElement('td');
        className.innerHTML = data.records[i].className;
        row.appendChild(className);

        // TABLE SECTION -> TABLE -> ROWS -> PRIMARY INSTRUCTOR
        let primaryInstructor = document.createElement('td');
        primaryInstructor.innerHTML = data.records[i].primaryInstructor;
        row.appendChild(primaryInstructor);

        // TABLE SECTION -> TABLE -> ROWS -> IRREGULAR
        let irregular = document.createElement('td');
        irregular.innerHTML = data.records[i].irregular;
        row.appendChild(irregular);

        // TABLE SECTION -> TABLE -> ROWS -> DAY OF WEEK
        let dayOfWeek = document.createElement('td');
        dayOfWeek.innerHTML = data.records[i].dayOfWeek;
        row.appendChild(dayOfWeek);

        // TABLE SECTION -> TABLE -> ROWS -> START TIME
        let startTime = document.createElement('td');
        startTime.innerHTML = data.records[i].startTime;
        row.appendChild(startTime);

        // TABLE SECTION -> TABLE -> ROWS -> STUDENTS
        let students = document.createElement('td');
        students.innerHTML = data.records[i].students;
        row.appendChild(students);

        // TABLE SECTION -> TABLE -> ROWS -> ARCHIVED
        let archived = document.createElement('td');
        archived.innerHTML = data.records[i].archived;
        row.appendChild(archived);

        // TABLE SECTION -> TABLE -> ROWS -> CLASS TYPE
        let classType = document.createElement('td');
        classType.innerHTML = data.records[i].classType;
        row.appendChild(classType);
    }

    // increments batch counter
    let pageMeta = document.getElementById('page-meta');
    let batchNumber = parseInt(pageMeta.dataset.batch_number);
    pageMeta.dataset.batch_number = batchNumber + 1;
}