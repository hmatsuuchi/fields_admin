function initialization() {
    module001Build();
    module002Build();
    module003Build();
}

// generates DOM elements
function generateNewElement(elementType, elementClass, elementID, elementInnerHTML) {
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

// MODULE 001 - Unenrolled Prospective Students
// unarchived prospective students who took a trial lesson but have not signed up
function module001Build() {
    let modulesContainer = document.getElementById('modules-container'); // get modules container

    // SECTION
    let section = generateNewElement('div', '', 'module-001-section', '');
    modulesContainer.appendChild(section);

    // SECTION -> PRIMARY CONTAINER
    let primaryContainer = generateNewElement('div', 'primary-container', '', '');
    section.appendChild(primaryContainer);

    // SECTION -> PRIMARY CONTAINER -> HEADER
    let header = generateNewElement('div', 'header', '', '');
    primaryContainer.appendChild(header);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> TITLE
    let headerTitle = generateNewElement('div', 'header-title', '', 'Unenrolled Prospective Students');
    header.appendChild(headerTitle);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> SUBTITLE
    let headerSubTitle = generateNewElement('div', 'header-sub-title', '', 'unarchived prospective students who took a trial lesson but have not signed up')
    header.appendChild(headerSubTitle);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> LOAD DATA BUTTON
    let loadDataButton = generateNewElement('div', 'load-data-button', 'module001', '')
    loadDataButton.addEventListener('click', loadData);
    header.appendChild(loadDataButton);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> LAST UPDATED
    let lastUpdated = generateNewElement('div', 'last-updated', 'module001-updated', '')
    header.appendChild(lastUpdated);
}

// MODULE 001 - Populates Data
function module001Populate(data) {
    let section = document.getElementById('module-001-section');
    let primaryContainer = section.getElementsByClassName('primary-container')[0];

    // clears previous data
    if (previousDataContainer = primaryContainer.getElementsByClassName('data')[0]) {
        previousDataContainer.remove();
    }

    // updates last updated text
    let lastUpdated = document.getElementById('module001-updated');
    let current = new Date();
    let currentHour = `0${current.getHours()}`;
    let currentMinute = `0${current.getMinutes()}`;
    let currentSecond = `0${current.getSeconds()}`;
    lastUpdated.innerHTML = `${currentHour.slice(-2)}:${currentMinute.slice(-2)}:${currentSecond.slice(-2)}`;

    // generates data section
    let dataContainer = generateNewElement('div', 'data', '', '');
    primaryContainer.appendChild(dataContainer);

    // generates student list section
    let table = generateNewElement('table', 'table', '', '');
    dataContainer.appendChild(table);

    // generates header row
    let headerRow = generateNewElement('tr', '', '', '');
    table.appendChild(headerRow);
    let headerName = generateNewElement('th', '', '', 'Student');
    let headerLastTrialDate = generateNewElement('th', '', '', 'Trial Date');
    headerRow.appendChild(headerName);
    headerRow.appendChild(headerLastTrialDate);

    // populates student data
    var i;
        for (i = 0; i < data.students.length; i++) {
            let studentCurrent = data.students[i]; // current student

            // generates new row
            let tableRow = generateNewElement('tr', '', '', '');
            table.appendChild(tableRow);

            let tableDataFullName = generateNewElement('td', '', '', `<a href="/customer/detail/${studentCurrent.id}">${studentCurrent.lastNameKanji} ${studentCurrent.firstNameKanji}</a>`);
            let tableDataLastTrialDate = generateNewElement('td', '', '', `<a href="/customer/detail/${studentCurrent.id}">${studentCurrent.lastTrialDate}</a>`);
            tableRow.appendChild(tableDataFullName);
            tableRow.appendChild(tableDataLastTrialDate);
        }

    document.body.classList.remove('disable-all-clicks'); // re-enables all clicks to body and child elements
}

// MODULE 002 - Cold Leads
// unarchived prospective students who contacted us but never came in for a counseling session
function module002Build() {
    let modulesContainer = document.getElementById('modules-container'); // get modules container

    // SECTION
    let section = generateNewElement('div', '', 'module-002-section', '');
    modulesContainer.appendChild(section);

    // SECTION -> PRIMARY CONTAINER
    let primaryContainer = generateNewElement('div', 'primary-container', '', '');
    section.appendChild(primaryContainer);

    // SECTION -> PRIMARY CONTAINER -> HEADER
    let header = generateNewElement('div', 'header', '', '');
    primaryContainer.appendChild(header);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> TITLE
    let headerTitle = generateNewElement('div', 'header-title', '', 'Cold Leads');
    header.appendChild(headerTitle);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> SUBTITLE
    let headerSubTitle = generateNewElement('div', 'header-sub-title', '', 'unarchived prospective students who contacted us but never came in for a counseling session')
    header.appendChild(headerSubTitle);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> LOAD DATA BUTTON
    let loadDataButton = generateNewElement('div', 'load-data-button', 'module002', '')
    loadDataButton.addEventListener('click', loadData);
    header.appendChild(loadDataButton);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> LAST UPDATED
    let lastUpdated = generateNewElement('div', 'last-updated', 'module002-updated', '')
    header.appendChild(lastUpdated);
}

// MODULE 002 - Populates Data
function module002Populate(data) {
    let section = document.getElementById('module-002-section');
    let primaryContainer = section.getElementsByClassName('primary-container')[0];

    // clears previous data
    if (previousDataContainer = primaryContainer.getElementsByClassName('data')[0]) {
        previousDataContainer.remove();
    }

    // updates last updated text
    let lastUpdated = document.getElementById('module002-updated');
    let current = new Date();
    let currentHour = `0${current.getHours()}`;
    let currentMinute = `0${current.getMinutes()}`;
    let currentSecond = `0${current.getSeconds()}`;
    lastUpdated.innerHTML = `${currentHour.slice(-2)}:${currentMinute.slice(-2)}:${currentSecond.slice(-2)}`;

    // generates data section
    let dataContainer = generateNewElement('div', 'data', '', '');
    primaryContainer.appendChild(dataContainer);

    // generates student list section
    let table = generateNewElement('table', 'table', '', '');
    dataContainer.appendChild(table);

    // generates header row
    let headerRow = generateNewElement('tr', '', '', '');
    table.appendChild(headerRow);
    let headerName = generateNewElement('th', '', '', 'Student');
    let headerContactDate = generateNewElement('th', '', '', 'Contact Date');
    headerRow.appendChild(headerName);
    headerRow.appendChild(headerContactDate);

    // populates student data
    var i;
        for (i = 0; i < data.students.length; i++) {
            let studentCurrent = data.students[i]; // current student

            // generates new row
            let tableRow = generateNewElement('tr', '', '', '');
            table.appendChild(tableRow);

            let tableDataFullName = generateNewElement('td', '', '', `<a href="/customer/detail/${studentCurrent.id}">${studentCurrent.lastNameKanji} ${studentCurrent.firstNameKanji}</a>`);
            let tableDataLastContactDate = generateNewElement('td', '', '', `<a href="/customer/detail/${studentCurrent.id}">${studentCurrent.lastContactDate}</a>`);
            tableRow.appendChild(tableDataFullName);
            tableRow.appendChild(tableDataLastContactDate);
        }
    
    document.body.classList.remove('disable-all-clicks'); // re-enables all clicks to body and child elements
}

// MODULE 003
function module003Build() {
    let modulesContainer = document.getElementById('modules-container'); // get modules container

    // SECTION
    let section = generateNewElement('div', '', 'module-003-section', '');
    modulesContainer.appendChild(section);

    // SECTION -> PRIMARY CONTAINER
    let primaryContainer = generateNewElement('div', 'primary-container', '', '');
    section.appendChild(primaryContainer);

    // SECTION -> PRIMARY CONTAINER -> HEADER
    let header = generateNewElement('div', 'header', '', '');
    primaryContainer.appendChild(header);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> TITLE
    let headerTitle = generateNewElement('div', 'header-title', '', 'ATTENDANCE');
    header.appendChild(headerTitle);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> SUBTITLE
    let headerSubTitle = generateNewElement('div', 'header-sub-title', '', 'some analytic regarding attendance')
    header.appendChild(headerSubTitle);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> LOAD DATA BUTTON
    let loadDataButton = generateNewElement('div', 'load-data-button', 'module003', '')
    loadDataButton.addEventListener('click', loadData);
    header.appendChild(loadDataButton);

    // SECTION -> PRIMARY CONTAINER -> HEADER -> LAST UPDATED
    let lastUpdated = generateNewElement('div', 'last-updated', 'module003-updated', '')
    header.appendChild(lastUpdated);
}

// MODULE 003
function module003Populate(data) {
    console.log(data);
    document.body.classList.remove('disable-all-clicks'); // re-enables all clicks to body and child elements
}

// handles clicks to generate data button
function loadData() {
    document.body.classList.add('disable-all-clicks'); // disables all clicks to body and child elements

    let csrfToken = document.getElementById('page-meta').dataset.csrf_token;

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': this.id,
    }

    // queries database
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "analytics_api",
        data: parameters,
        success: function (data) {
            if (data.parameter == 'module001') {
                module001Populate(data);
            } else if (data.parameter == 'module002') {
                module002Populate(data);
            } else if (data.parameter == 'module003') {
                module003Populate(data);
            }
        },
    })
}