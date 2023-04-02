function initialization() {
    initializeInput();
    buildSystemStatus();
}

// adds event listener to input field
// focus on input field
function initializeInput() {
    let input = document.getElementById('uuid-input');
    input.addEventListener('keyup', inputParser);
    input.focus();
    // input.value = '07fa4af0-2baf-485e-803f-172f88e86001'; // TESTING PURPOSES ONLY
}

function inputParser(e) {
    if (e.keyCode == 13) {
        let input = document.getElementById('uuid-input');
        input.blur();
        let containers = document.getElementsByClassName('container');
        var i;
        for (i = 0; i < containers.length; i++) {
            containers[i].classList.remove('visible');
        }
        studentSearch();
    }
}

function studentSearch() {
    let csrfToken = document.getElementById('page-meta').dataset.csrf; // get CSRF token

    uuidInput = document.getElementById('uuid-input').value;

    let input = document.getElementById('uuid-input');
    input.value = '';

    let studentSection = document.getElementById('student');
    let studentContainer = studentSection.getElementsByClassName('container')[0];
    studentContainer.innerHTML = '';

    let attendanceSection = document.getElementById('attendance');
    let attendanceContainer = attendanceSection.getElementsByClassName('container')[0];
    attendanceContainer.innerHTML = '';

    parameters = {
        'csrfmiddlewaretoken': csrfToken,
        'parameter': 'student_search',
        'uuid_input': uuidInput,
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "game_api",
        data: parameters,
        success: function (data) {
            if (data.noRecordFound == false) {
                const attendanceRecords = JSON.parse(data.attendanceRecords);
                const studentAttendance = JSON.parse(data.studentAttendance);
                const classList = JSON.parse(data.classList);

                buildStudentCard(data.studentInformation, data.presentRecordCount);
                buildAttendanceCard(attendanceRecords, studentAttendance, classList, data.totalRecordCount);
            } else {
                let input = document.getElementById('uuid-input');
                input.focus();
            }
        },
    })
}

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

// text values for months
const monthConvert = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]
// text values for days of week
const dayOfWeekConvert = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
]

function buildStudentCard(student, presentRecordCount) {
    let section = document.getElementById('student');

    let container = section.getElementsByClassName('container')[0];

    // STUDENT NAME
    let studentName = document.createElement('div');
    studentName.id = 'student-name';
    studentName.innerHTML = `${student.lastNameRomaji}, ${student.firstNameRomaji} (${gradeConvert[student.grade]})`;
    container.appendChild(studentName);

    // EXPERIENCE POINTS TEXT
    let experiencePoints = document.createElement('div');
    experiencePoints.id = 'experience-points';
    experiencePoints.innerHTML = `${(presentRecordCount * 10).toLocaleString()}xp`;
    container.appendChild(experiencePoints);

    // LEVEL TEXT
    let level = document.createElement('div');
    level.id = 'level';
    level.innerHTML = `level ${Math.floor(presentRecordCount / 10)}`;
    container.appendChild(level);

    // EXPERIENCE POINTS METER
    let experiencePointsMeter = document.createElement('div');
    experiencePointsMeter.id = 'experience-points-meter';
    container.appendChild(experiencePointsMeter);

    // EXPERIENCE POINTS METER - PROGRESS
    let experiencePointsMeterProgress = document.createElement('div');
    experiencePointsMeterProgress.id = 'experience-points-meter-progress';
    experiencePointsMeterProgress.style.width = `${presentRecordCount.toString().slice(-1)}0%`;
    experiencePointsMeter.appendChild(experiencePointsMeterProgress);

    // EXPERIENCE POINTS METER - PROGRESS -  LABEL
    if (parseInt(presentRecordCount.toString().slice(-1)) >= 3) {
        let experiencePointsMeterProgressLabel = document.createElement('div');
        experiencePointsMeterProgressLabel.id = 'experience-points-meter-progress-label';
        experiencePointsMeterProgressLabel.innerHTML = `level ${Math.floor(presentRecordCount / 10)}`;
        experiencePointsMeterProgress.appendChild(experiencePointsMeterProgressLabel);
    }

    // sum from x = 0 to x = 8 of x^3/2 + 50
    // 50, 101, 155, 218, 300, 413, 571, 792, 1098

    // RANK CALCULATOR
    var rank;
    var rankPercentage;
    if (presentRecordCount < 50) {
        rank = 0;
        rankPercentage = presentRecordCount / 49 * 100;
    } else if (presentRecordCount < 101) {
        rank = 1;
        rankPercentage = (presentRecordCount - 50) / 50 * 100;
    } else if (presentRecordCount < 155) {
        rank = 2;
        rankPercentage = (presentRecordCount - 101) / 53 * 100;
    } else if (presentRecordCount < 218) {
        rank = 3;
        rankPercentage = (presentRecordCount - 155) / 62 * 100;
    } else if (presentRecordCount < 300) {
        rank = 4;
        rankPercentage = (presentRecordCount - 218) / 81 * 100;
    } else if (presentRecordCount < 413) {
        rank = 5;
        rankPercentage = (presentRecordCount - 300) / 112 * 100;
    } else if (presentRecordCount < 571) {
        rank = 6;
        rankPercentage = (presentRecordCount - 413) / 157 * 100;
    } else if (presentRecordCount < 792) {
        rank = 7;
        rankPercentage = (presentRecordCount - 571) / 221 * 100;
    } else if (presentRecordCount < 1098) {
        rank = 8;
        rankPercentage = (presentRecordCount - 792) / 305 * 100;
    }

    // RANK CONTAINER
    let rankContainer = document.createElement('div');
    rankContainer.id = 'rank-container';
    rankContainer.style.backgroundImage = `url("/static/game/display_one/img/rank/${rank}.svg")`;
    container.appendChild(rankContainer);

    // RANK CONTAINER - RANK TEXT
    const rankTextConverted = [
        'Mercury',
        'Venus',
        'Earth',
        'Mars',
        'Jupiter',
        'Saturn',
        'Uranus',
        'Neptune',
        'Pluto',
    ]
    let rankText = document.createElement('div');
    rankText.id = 'rank-text';
    rankText.innerHTML = `${rankTextConverted[rank]} Rank`;
    container.appendChild(rankText);

    // RANK METER
    let rankMeter = document.createElement('div');
    rankMeter.id = 'rank-meter';
    container.appendChild(rankMeter);

    // RANK METER - PROGRESS
    let rankMeterProgress = document.createElement('div');
    rankMeterProgress.id = 'rank-meter-progress';
    rankMeterProgress.style.width = `${rankPercentage}%`;
    rankMeter.appendChild(rankMeterProgress);

    container.classList.add('visible');
}

var timeout;
function buildAttendanceCard(attendance, record, classList, recordCount) {
    let section = document.getElementById('attendance');
    let container = section.getElementsByClassName('container')[0];

    var i;
    for (i = 0; i < record.length; i++) {
        let associatedAttendance    = attendance.find(o => o.pk === record[i].fields.attendance_record);
        let associatedClass         = classList.find(o => o.pk === associatedAttendance.fields.linked_class);

        let row = document.createElement('div');
        row.classList.add('attendance-row');
        container.appendChild(row);

        let instructor = document.createElement('div');
        instructor.classList.add('instructor');
        instructor.style.backgroundImage = `url("/static/customer/notes/img/instructors/${associatedAttendance.fields.instructor}.svg")`
        row.appendChild(instructor);

        let dateTime = document.createElement('div');
        dateTime.classList.add('date-time');
        let date = new Date(associatedAttendance.fields.date);
        dateTime.innerHTML = `${monthConvert[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} (${dayOfWeekConvert[date.getDay()]})`;
        row.appendChild(dateTime);

        let className = document.createElement('div');
        className.classList.add('class-name');
        className.innerHTML = associatedClass.fields.class_name;
        row.appendChild(className);

        let attendanceStatus = document.createElement('div');
        attendanceStatus.classList.add('attendance-status');
        if (record[i].fields.attendance_status == 1) {
            attendanceStatus.classList.add('present');
        } else {
            attendanceStatus.classList.add('absent');
        }
        row.appendChild(attendanceStatus);
    }

    if (recordCount - 13 > 0) {
        let additionalRecords = document.createElement('div');
        additionalRecords.id = 'additional-records';
        additionalRecords.innerHTML = `+ ${recordCount - 13} records`
        container.appendChild(additionalRecords);
    }

    container.classList.add('visible');

    let input = document.getElementById('uuid-input');
    input.focus();

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        clearDataSlow();
    }, 60000);
}

function clearDataSlow() {
    let student = document.getElementById('student');
    let studentContainer = student.getElementsByClassName('container')[0];
    studentContainer.classList.add('smooth-fade-out');
    studentContainer.classList.remove('visible');

    let attendance = document.getElementById('attendance');
    let attendanceContainer = attendance.getElementsByClassName('container')[0];
    attendanceContainer.classList.add('smooth-fade-out');
    attendanceContainer.classList.remove('visible');

    setTimeout(() => {
        attendanceContainer.innerHTML = '';
        studentContainer.innerHTML = '';
        studentContainer.classList.remove('smooth-fade-out');
        attendanceContainer.classList.remove('smooth-fade-out');
    }, 500);
}

function buildSystemStatus() {
    let container = document.getElementById('system-status-container');

    // input event listeners
    let UUIDinput = document.getElementById('uuid-input');
    UUIDinput.addEventListener("focus", systemActive);
    UUIDinput.addEventListener("blur", systemInactive);

    // STATUS TEXT
    let statusText = document.createElement('div');
    statusText.id = 'status-text';
    statusText.innerHTML = 'active';
    container.appendChild(statusText);

    // STATUS LIGHT
    let statusLight = document.createElement('div');
    statusLight.id = 'status-light';
    statusLight.classList.add('active');
    container.appendChild(statusLight);
}

function systemActive() {
    let statusLight = document.getElementById('status-light');
    statusLight.classList.add('active');
    let statusText = document.getElementById('status-text');
    statusText.innerHTML = 'active';
}

function systemInactive() {
    let statusLight = document.getElementById('status-light');
    statusLight.classList.remove('active');
    let statusText = document.getElementById('status-text');
    statusText.innerHTML = 'standby';
}