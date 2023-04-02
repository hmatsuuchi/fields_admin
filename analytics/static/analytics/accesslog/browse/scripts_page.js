// INITIALIZING SCRIPTS
function initialization() {
    console.log('INITIALIZING PAGE');
    console.log('------------------------');
    getAccesslogAll(); // queries database for accesslog records
}

// GET ALL ACCESSLOG RECORDS
function getAccesslogAll() {
    let parameter = "GET_ACCESSLOG_ALL";

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
        url: "../analytics_api",
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

        // TABLE SECTION -> TABLE -> ROWS -> URL
        let url = document.createElement('td');
        url.innerHTML = data.records[i].url;
        row.appendChild(url);

        // TABLE SECTION -> TABLE -> ROWS -> DATETIME
        let dateTime = document.createElement('td');
        dateTime.innerHTML = data.records[i].dateTime;
        row.appendChild(dateTime);

        // TABLE SECTION -> TABLE -> ROWS -> USER
        let user = document.createElement('td');
        user.innerHTML = data.records[i].user;
        row.appendChild(user);

        // TABLE SECTION -> TABLE -> ROWS -> POST PARAMETER
        let postParameters = document.createElement('td');
        postParameters.innerHTML = data.records[i].postParameters;
        row.appendChild(postParameters);

        // TABLE SECTION -> TABLE -> ROWS -> GET PARAMETER
        let getParameters = document.createElement('td');
        getParameters.innerHTML = data.records[i].getParameters;
        row.appendChild(getParameters);
    }

    // increments batch counter
    let pageMeta = document.getElementById('page-meta');
    let batchNumber = parseInt(pageMeta.dataset.batch_number);
    pageMeta.dataset.batch_number = batchNumber + 1;
}