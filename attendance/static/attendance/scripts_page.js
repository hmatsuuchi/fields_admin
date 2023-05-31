// =============== GENERAL SCRIPS ===============
// enables/disables clicks to body
function toggleAllClicksToPage(enableDisable) {
  if (enableDisable == "disable") {
    document.body.classList.add("pointer-events-none");
  } else {
    document.body.classList.remove("pointer-events-none");
  }
}

function toggleClicksToInstructorContainer(enableDisable) {
  let instructorSelectContainer = document.getElementById(
    "instructor-select-container"
  );

  if (enableDisable == "disable") {
    instructorSelectContainer.classList.add("pointer-events-none");
  } else {
    instructorSelectContainer.classList.remove("pointer-events-none");
  }
}

function clearAllAttendanceRecords() {
  let attendance = document.getElementById("attendance");
  attendance.innerHTML = "";
}

// runs on body load
function initialization() {
  // fetchInstructorData();
  buildLoadingSpinner();
  toggleLoadingSpinner("ADD");
  buildDateNavigation();
  buildAddNewAttendanceTop();
  fetchAttendanceData();
  buildClassSelect();
  buildStudentSelect();
  buildConfirmationWindow();
  buildProgressTrackingElement();
  buildInstructorFilterMenu();
  buildWebsocketStatus();
  // openWebsocket(); // disabled for developing lesson content functionality; re-enable in production
}

// builds DOM elements
function buildElement(elementType, elementClass, elementID, elementInnerHTML) {
  let newElement = document.createElement(elementType);
  if (elementClass != "") {
    newElement.classList.add(elementClass);
  }
  if (elementID != "") {
    newElement.id = elementID;
  }
  if (elementInnerHTML != "") {
    newElement.innerHTML = elementInnerHTML;
  }
  return newElement;
}

// updates attendance analytics
function refreshAttendanceAnalytics(recordID, increment, date) {
  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "refresh_attendance",
    record_id: recordID,
    increment: increment,
    date: date,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "../analytics/analytics_api",
    data: parameters,
    success: function (data) {},
  });
}

// builds instructor filter menu
function buildInstructorFilterMenu() {
  let buttonGroup = document.getElementById("button-group");

  // button used when menu collapses on smaller screens
  let instructorFilterButton = buildElement(
    "div",
    "toolbar-button",
    "instructor-filter-button",
    ""
  );
  instructorFilterButton.addEventListener("click", toggleInstructorFilterMenu);
  buttonGroup.appendChild(instructorFilterButton);

  let instructorSelectContainer = buildElement(
    "div",
    "",
    "instructor-select-container",
    ""
  );
  buttonGroup.appendChild(instructorSelectContainer);

  let instructorSelectTitle = buildElement(
    "div",
    "button-sub-menu-title",
    "",
    "講師"
  );
  instructorSelectContainer.appendChild(instructorSelectTitle);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "get_teacher_filter_data", // API parameter
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      let instructors = JSON.parse(data.instructors);

      // no teacher filter button
      let button = buildElement(
        "div",
        "instructor-select-button",
        "no-instructor-filter-button",
        ""
      );
      button.dataset.instructor_id = 0;
      button.addEventListener("click", toggleInstructorFilter);
      if (data.activeInstructors && data.activeInstructors.includes("0")) {
        button.classList.add("selected");
      }
      instructorSelectContainer.appendChild(button);

      var i;
      for (i = 0; i < instructors.length; i++) {
        let button = buildElement("div", "instructor-select-button", "", "");
        button.style.backgroundImage = `url('/static/customer/notes/img/instructors/${instructors[i].fields.user}.svg')`;
        button.dataset.instructor_id = instructors[i].fields.user;
        button.addEventListener("click", toggleInstructorFilter);
        if (
          data.activeInstructors &&
          data.activeInstructors.includes(instructors[i].fields.user)
        ) {
          button.classList.add("selected");
        }
        instructorSelectContainer.appendChild(button);
      }

      // adds active class to instructor select button if instructor filter is active
      if (
        instructorSelectContainer.getElementsByClassName("selected").length > 0
      ) {
        instructorFilterButton.classList.add("active");
      }
    },
  });
}

// toggles instructor filters and updates DB
function toggleInstructorFilter() {
  toggleClicksToInstructorContainer("disable"); // disables all clicks to instructor select container

  // clears results
  let attendanceContainer = document.getElementById("attendance");
  attendanceContainer.innerHTML = "";

  toggleLoadingSpinner("ADD"); // adds loading spinner

  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  let button = this;
  button.classList.toggle("selected");
  let instructorID = button.dataset.instructor_id;

  // adds active class to instructor select button if instructor filter is active
  let instructorSelectContainer = document.getElementById(
    "instructor-select-container"
  );
  let instructorFilterButton = document.getElementById(
    "instructor-filter-button"
  );
  if (instructorSelectContainer.getElementsByClassName("selected").length > 0) {
    instructorFilterButton.classList.add("active");
  } else {
    instructorFilterButton.classList.remove("active");
  }

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    preference: "display_attendance_instructors", // API parameter
    value: instructorID, // instructor to add or remove from filter list
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/user_profile/set_user_preference/",
    data: parameters,
    success: function (data) {
      fetchAttendanceData();
    },
  });
}

// toggle loading spinner
function toggleLoadingSpinner(parameter) {
  let loadingContainer = document.getElementById("loading-container");
  if (parameter == "ADD") {
    loadingContainer.classList.add("active");
  } else {
    loadingContainer.classList.remove("active");
  }
}

// build loading spinner
function buildLoadingSpinner() {
  let loadingContainer = document.getElementById("loading-container");

  let spinnerContainer = document.createElement("div");
  spinnerContainer.classList.add("loading-spinner");
  spinnerContainer.innerHTML =
    '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
  loadingContainer.appendChild(spinnerContainer);
}

// toggles instructor filter menu on small screens
function toggleInstructorFilterMenu() {
  let menu = document.getElementById("instructor-select-container");
  menu.classList.toggle("active");
}

// toggles attendance contents section open and closed
function toggleAttendanceContentsOpenClose() {
  this.classList.toggle("flip-square");

  let attendanceContents =
    this.parentElement.getElementsByClassName("content-container")[0];
  attendanceContents.classList.toggle("hide-attendance-contents");
}

function jumpToPreviousDateFromContentLink() {
  // clears results
  let attendanceContainer = document.getElementById("attendance");
  attendanceContainer.innerHTML = "";

  toggleLoadingSpinner("ADD"); // adds loading spinner

  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  // blurs date nav field
  let dateNavField = document.getElementById("date-nav-field");
  dateNavField.value = this.dataset.date;
  dateNavField.blur();

  let dateField = document.getElementById("date-nav-field");
  let dateValue = new Date(dateField.value);
  let year = dateValue.getFullYear();
  let month = "0" + (dateValue.getMonth() + 1);
  let date = "0" + dateValue.getDate();
  let dateString = `${year}-${month.slice(-2)}-${date.slice(-2)}`;

  // updates day of week text
  let dayOfWeek = document.getElementById("day-of-week");
  dayOfWeek.innerHTML = dayOfWeekConvert[dateValue.getDay()];

  // appends 'today' to date
  today = new Date();
  todayYear = today.getFullYear();
  todayMonth = "0" + (today.getMonth() + 1);
  todayDay = "0" + today.getDate();
  todayString = `${todayYear}-${todayMonth.slice(-2)}-${todayDay.slice(-2)}`;
  if (dateString == todayString) {
    dayOfWeek.innerHTML += "(今日)";
  }

  fetchAttendanceData(); // fetches attendance data for date
}

// =============== DATE NAVIGATON ===============

// decrement date by one day
function decrementDate() {
  // clears results
  let attendanceContainer = document.getElementById("attendance");
  attendanceContainer.innerHTML = "";

  toggleLoadingSpinner("ADD"); // adds loading spinner

  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  let dateField = document.getElementById("date-nav-field");
  let dateValue = new Date(dateField.value);
  dateValue.setDate(dateValue.getDate() - 1);
  let year = dateValue.getFullYear();
  let month = "0" + (dateValue.getMonth() + 1);
  let date = "0" + dateValue.getDate();
  let dateString = `${year}-${month.slice(-2)}-${date.slice(-2)}`;
  dateField.value = dateString;

  // updates day of week text
  let dayOfWeek = document.getElementById("day-of-week");
  dayOfWeek.innerHTML = dayOfWeekConvert[dateValue.getDay()];

  // appends 'today' to date
  today = new Date();
  todayYear = today.getFullYear();
  todayMonth = "0" + (today.getMonth() + 1);
  todayDay = "0" + today.getDate();
  todayString = `${todayYear}-${todayMonth.slice(-2)}-${todayDay.slice(-2)}`;
  if (dateString == todayString) {
    dayOfWeek.innerHTML += "(今日)";
  }

  fetchAttendanceData(); // fetches attendance data for date
}

// increment date by one day
function incrementDate() {
  // clears results
  let attendanceContainer = document.getElementById("attendance");
  attendanceContainer.innerHTML = "";

  toggleLoadingSpinner("ADD"); // adds loading spinner

  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  let dateField = document.getElementById("date-nav-field");
  let dateValue = new Date(dateField.value);
  dateValue.setDate(dateValue.getDate() + 1);
  let year = dateValue.getFullYear();
  let month = "0" + (dateValue.getMonth() + 1);
  let date = "0" + dateValue.getDate();
  let dateString = `${year}-${month.slice(-2)}-${date.slice(-2)}`;
  dateField.value = dateString;

  // updates day of week text
  let dayOfWeek = document.getElementById("day-of-week");
  dayOfWeek.innerHTML = dayOfWeekConvert[dateValue.getDay()];

  // appends 'today' to date
  today = new Date();
  todayYear = today.getFullYear();
  todayMonth = "0" + (today.getMonth() + 1);
  todayDay = "0" + today.getDate();
  todayString = `${todayYear}-${todayMonth.slice(-2)}-${todayDay.slice(-2)}`;
  if (dateString == todayString) {
    dayOfWeek.innerHTML += "(今日)";
  }

  fetchAttendanceData(); // fetches attendance data for date
}

// direct date input
function directDateInput() {
  // clears results
  let attendanceContainer = document.getElementById("attendance");
  attendanceContainer.innerHTML = "";

  toggleLoadingSpinner("ADD"); // adds loading spinner

  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  // blurs date nav field
  let dateNavField = document.getElementById("date-nav-field");
  dateNavField.blur();

  let dateField = document.getElementById("date-nav-field");
  let dateValue = new Date(dateField.value);
  let year = dateValue.getFullYear();
  let month = "0" + (dateValue.getMonth() + 1);
  let date = "0" + dateValue.getDate();
  let dateString = `${year}-${month.slice(-2)}-${date.slice(-2)}`;

  // updates day of week text
  let dayOfWeek = document.getElementById("day-of-week");
  dayOfWeek.innerHTML = dayOfWeekConvert[dateValue.getDay()];

  // appends 'today' to date
  today = new Date();
  todayYear = today.getFullYear();
  todayMonth = "0" + (today.getMonth() + 1);
  todayDay = "0" + today.getDate();
  todayString = `${todayYear}-${todayMonth.slice(-2)}-${todayDay.slice(-2)}`;
  if (dateString == todayString) {
    dayOfWeek.innerHTML += "(今日)";
  }

  fetchAttendanceData(); // fetches attendance data for date
}

// convert day integer
const dayOfWeekConvert = [
  "日曜日",
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
];

const dayOfWeekConvertShort = ["日", "月", "火", "水", "木", "金", "土"];

// build date navigation section
function buildDateNavigation() {
  let section = document.getElementById("date-nav"); // get date nav section

  let primaryContainer = buildElement("div", "primary-container", "", "");
  section.appendChild(primaryContainer);

  let previousDateArrow = buildElement(
    "div",
    "date-arrow",
    "previous-date-arrow",
    ""
  );
  previousDateArrow.addEventListener("click", decrementDate);
  primaryContainer.appendChild(previousDateArrow);

  let dateField = buildElement("input", "date-field", "date-nav-field", "");
  dateField.addEventListener("change", directDateInput);
  dateField.type = "date";

  // gets date parameter from URL
  params = new URLSearchParams(location.search); // get all params
  dateParam = params.get("date"); // get date param
  window.history.pushState("", "Attendance", "/attendance/"); // removes date parameter from URL
  var today;
  var year;
  var month;
  var date;
  var dateString;
  var dayOfWeekLabel;
  let actualToday = new Date();
  if (dateParam) {
    year = dateParam.slice(0, 4);
    month = parseInt(dateParam.slice(5, 7)) - 1;
    date = dateParam.slice(8, 10);
    today = new Date(year, month, date);
    dayOfWeekLabel = dayOfWeekConvert[today.getDay()];
    if (
      today.getFullYear() == actualToday.getFullYear() &&
      today.getMonth() == actualToday.getMonth() &&
      today.getDate() == actualToday.getDate()
    ) {
      dayOfWeekLabel += " (今日)";
    }
  } else {
    today = new Date();
    dayOfWeekLabel = `${dayOfWeekConvert[today.getDay()]} (今日)`;
  }

  year = today.getFullYear();
  month = "0" + (today.getMonth() + 1);
  date = "0" + today.getDate();
  dateString = `${year}-${month.slice(-2)}-${date.slice(-2)}`;
  dateField.value = dateString;
  primaryContainer.appendChild(dateField);

  let nextDateArrow = buildElement("div", "date-arrow", "next-date-arrow", "");
  nextDateArrow.addEventListener("click", incrementDate);
  primaryContainer.appendChild(nextDateArrow);

  let dayOfWeek = buildElement("div", "", "day-of-week", dayOfWeekLabel);
  primaryContainer.appendChild(dayOfWeek);
}

// fetches attendance data for date specified in date navigation
function fetchAttendanceData() {
  toggleAllClicksToPage("disable"); // disables all clicks to page
  clearAllAttendanceRecords(); // clears all currently loaded attendance records

  let csrfToken = document.getElementById("page-meta").dataset.csrf; // CSRF token pulled from DOM element

  let date_value = document.getElementById("date-nav-field").value; // date value from date navigation field

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "get_attendance_data_for_date", // API parameter
    date: date_value,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      let expandedViewActive =
        document.getElementById("page-meta").dataset.expanded_view_active;

      if (expandedViewActive == "True") {
        dataBuildRecordsExpanded(
          JSON.parse(data.allRecords),
          JSON.parse(data.allClasses),
          data.classTypeLookupList,
          JSON.parse(data.allInstructors),
          JSON.parse(data.allStudents),
          JSON.parse(data.allAttendance),
          data.allInstructorChoices
        );
      } else {
        dataBuildRecordsCompact(
          JSON.parse(data.allRecords),
          JSON.parse(data.allClasses),
          JSON.parse(data.allAttendance),
          JSON.parse(data.allStudents),
          data.currentContent,
          data.previousContent,
          data.previousDate,
          data.date
        );
      }

      toggleLoadingSpinner(); // remove loading spinner
      toggleAllClicksToPage("enable"); // enables all clicks to page
      toggleClicksToInstructorContainer(); // enables clicks to instructor select container
    },
  });
}

// =============== ATTENDANCE RECORD ===============

// builds add new attendance div and inserts into attendance section
function buildAddNewAttendanceTop() {
  let newAttendanceSection = document.getElementById("new-attendance"); // get attendance container

  // builds button container
  let addNewAttendanceContainer = buildElement(
    "div",
    "add-new-attendance-container",
    "",
    ""
  );
  addNewAttendanceContainer.addEventListener("click", addNewAttendanceRecord);
  newAttendanceSection.appendChild(addNewAttendanceContainer);

  // builds line one
  let lineOne = buildElement("div", "add-new-attendance-line", "", "");
  addNewAttendanceContainer.appendChild(lineOne);

  // builds central plus icon container
  let plusContainer = buildElement("div", "plus-button-container", "", "");
  addNewAttendanceContainer.appendChild(plusContainer);

  // plus icon vertical bar
  let plusIconVertical = buildElement("div", "plus-icon-vertical", "", "");
  plusIconVertical.classList.add("plus-icon-bar");
  plusContainer.appendChild(plusIconVertical);

  // plus icon horizontal bar
  let plusIconHorizontal = buildElement("div", "plus-icon-horizontal", "", "");
  plusIconHorizontal.classList.add("plus-icon-bar");
  plusContainer.appendChild(plusIconHorizontal);

  // builds line two
  let lineTwo = buildElement("div", "add-new-attendance-line", "", "");
  addNewAttendanceContainer.appendChild(lineTwo);
}

// adds new attendance record
function addNewAttendanceRecord() {
  let csrfToken = document.getElementById("page-meta").dataset.csrf;

  let attendanceSection = document.getElementById("attendance"); // gets attendance section

  // PRIMARY CONTAINER
  let newAttendanceContainer = buildElement(
    "div",
    "attendance-container",
    "",
    ""
  );

  let allAttendanceCards = attendanceSection.getElementsByClassName(
    "attendance-container"
  );
  if (allAttendanceCards.length == 0) {
    attendanceSection.appendChild(newAttendanceContainer);
  } else {
    attendanceSection.insertBefore(
      newAttendanceContainer,
      allAttendanceCards[0]
    );
  }

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER
  let addClassContainer = buildElement("div", "add-class-container", "", "");
  newAttendanceContainer.appendChild(addClassContainer);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> TITLE
  let addClassSectionTitle = buildElement("div", "section-title", "", "クラス");
  addClassContainer.appendChild(addClassSectionTitle);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> ADD NEW CLASS BUTTON
  let addNewClassButton = buildElement("div", "add-new-class-button", "", "");
  addNewClassButton.addEventListener("click", newClassButtonClick);
  addClassContainer.appendChild(addNewClassButton);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> ADDED CLASS CARD
  let addedClassCard = buildElement("div", "added-class-card", "", "");
  addClassContainer.appendChild(addedClassCard);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> ADD NEW CLASS BUTTON -> PLUS CONTAINER
  let plusContainer = buildElement("div", "plus-button-container", "", "");
  addNewClassButton.appendChild(plusContainer);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> ADD NEW CLASS BUTTON -> PLUS CONTAINER -> PLUS ICON
  let plusIconVertical = buildElement("div", "plus-icon-vertical", "", "");
  plusIconVertical.classList.add("plus-icon-bar");
  plusContainer.appendChild(plusIconVertical);
  let plusIconHorizontal = buildElement("div", "plus-icon-horizontal", "", "");
  plusIconHorizontal.classList.add("plus-icon-bar");
  plusContainer.appendChild(plusIconHorizontal);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> ADD NEW CLASS BUTTON -> PLUS CONTAINER -> ADD CLASS TEXT
  let addClassText = buildElement("div", "add-class-text", "", "クラス追加");
  addNewClassButton.appendChild(addClassText);

  // PRIMARY CONTAINER -> DATE & TIME
  let dateTimeContainer = buildElement("div", "date-time-container", "", "");
  newAttendanceContainer.appendChild(dateTimeContainer);

  // PRIMARY CONTAINER -> DATE & TIME -> TITLE
  let dateTimeTitle = buildElement("div", "section-title", "", "日時");
  dateTimeContainer.appendChild(dateTimeTitle);

  // PRIMARY CONTAINER -> DATE & TIME -> DATE
  let attendanceDateBrowse = document.getElementById("date-nav-field").value; // date being browsed
  let attendanceDateAsDate = new Date(attendanceDateBrowse);

  let attendanceDate = buildElement(
    "div",
    "attendance-date",
    "",
    `${attendanceDateBrowse}（${
      dayOfWeekConvertShort[attendanceDateAsDate.getDay()]
    }）`
  );
  dateTimeContainer.appendChild(attendanceDate);

  // PRIMARY CONTAINER -> TIME -> TITLE
  let timeTitle = buildElement("div", "section-title", "", "時間");
  dateTimeContainer.appendChild(timeTitle);

  // PRIMARY CONTAINER -> DATE & TIME -> TIME
  let classTimeInput = buildElement("input", "class-time-input", "", "");
  classTimeInput.type = "time";
  classTimeInput.addEventListener("blur", updateAttendanceStartTime);
  dateTimeContainer.appendChild(classTimeInput);

  // PRIMARY CONTAINER -> INSTRUCTOR
  let instructorContainer = buildElement("div", "instructor-container", "", "");
  newAttendanceContainer.appendChild(instructorContainer);

  // PRIMARY CONTAINER -> INSTRUCTOR -> TITLE
  let instructorTitle = buildElement("div", "section-title", "", "講師");
  instructorContainer.appendChild(instructorTitle);

  // PRIMARY CONTAINER -> INSTRUCTOR -> INSTRUCTOR INPUT
  let instructorInput = buildElement("select", "instructor-input", "", "");
  instructorInput.addEventListener("blur", updateAttendanceInstructor);
  instructorContainer.appendChild(instructorInput);

  // PRIMARY CONTAINER -> INSTRUCTOR -> INSTRUCTOR INPUT -> CHOICES (DEFAULT FIRST CHOICE)
  let option = document.createElement("option");
  option.classList.add("instructor-choice");
  option.value = 0;
  option.innerHTML = "-------";
  instructorInput.appendChild(option);

  // PRIMARY CONTAINER -> INSTRUCTOR -> INSTRUCTOR INPUT -> CHOICES
  // let instructorTemplate = document.getElementById('instructor-list-template');
  // instructorInput.innerHTML = instructorTemplate.innerHTML;

  // fetches instructor list and populates instructor dropdown
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "get_all_active_instructors",
  };

  // queries database for classes
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      var y;
      for (y = 0; y < data.instructors.length; y++) {
        option = document.createElement("option");
        option.classList.add("instructor-choice");
        option.value = data.instructors[y].id;
        option.innerHTML = `${data.instructors[y].last_name_kanji}${data.instructors[y].first_name_kanji}`;
        instructorInput.appendChild(option);
      }
    },
  });

  // PRIMARY CONTAINER -> STUDENT ATTENDANCE CONTAINER
  let studentAttendanceContainer = buildElement(
    "div",
    "student-attendance-container",
    "",
    ""
  );
  newAttendanceContainer.appendChild(studentAttendanceContainer);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> TITLE
  let studentAttendanceTitle = buildElement("div", "section-title", "", "出席");
  studentAttendanceContainer.appendChild(studentAttendanceTitle);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER
  let attendanceRecordContainer = buildElement(
    "div",
    "attendance-record-container",
    "",
    ""
  );
  studentAttendanceContainer.appendChild(attendanceRecordContainer);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM
  let attendanceRecordItem = buildElement(
    "div",
    "attendance-record-item",
    "",
    ""
  );
  attendanceRecordItem.classList.add("add-student-container");
  attendanceRecordItem.addEventListener("click", newStudentButtonClick);
  attendanceRecordContainer.appendChild(attendanceRecordItem);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM -> ADD STUDENT BUTTON CONTAINER
  let addNewStudentButton = buildElement(
    "div",
    "plus-button-container",
    "",
    ""
  );
  attendanceRecordItem.appendChild(addNewStudentButton);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM -> ADD STUDENT BUTTON CONTAINER -> VERTICAL LINE
  let addNewStudentButtonVertical = buildElement(
    "div",
    "plus-icon-bar",
    "",
    ""
  );
  addNewStudentButtonVertical.classList.add("plus-icon-vertical");
  addNewStudentButton.appendChild(addNewStudentButtonVertical);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM -> ADD STUDENT BUTTON CONTAINER -> HORIZONTAL LINE
  let addNewStudentButtonHorizontal = buildElement(
    "div",
    "plus-icon-bar",
    "",
    ""
  );
  addNewStudentButtonHorizontal.classList.add("plus-icon-horizontal");
  addNewStudentButton.appendChild(addNewStudentButtonHorizontal);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM -> ADD STUDENT BUTTON TEXT
  let addNewStudentButtonText = buildElement(
    "div",
    "add-new-student-button",
    "",
    "生徒追加"
  );
  attendanceRecordItem.appendChild(addNewStudentButtonText);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> FOOTER CONTAINER
  let footerContainer = buildElement("div", "footer-container", "", "");
  newAttendanceContainer.appendChild(footerContainer);

  // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> FOOTER CONTAINER -> DELETE RECORD BUTTON
  let deleteRecordButton = buildElement("div", "footer-button", "", "");
  deleteRecordButton.classList.add("delete-record-button");
  deleteRecordButton.addEventListener("click", deleteConfirmation);
  footerContainer.appendChild(deleteRecordButton);

  // AJAX
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "attendance_record_create",
    date: attendanceDateBrowse,
  };

  // queries database for classes
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      // newAttendanceContainer.id = `attendance-record-${data.recordID}`;
      newAttendanceContainer.dataset.record_id = data.recordID;
    },
  });
}

// pulls up delete confirmation
function deleteConfirmation() {
  let recordsToDelete = document.getElementsByClassName("delete-this-record");
  var i;
  for (i = 0; i < recordsToDelete.length; i++) {
    recordsToDelete[i].classList.remove("delete-this-record");
  }

  let currentRecord = this.parentElement.parentElement;
  currentRecord.classList.add("delete-this-record");

  let confirmationText = document.getElementById("confirmation-text");
  confirmationText.innerHTML = "このレコードを削除しますか？";

  let confirmationConfirm = document.getElementById("confirmation-confirm");
  confirmationConfirm.innerHTML = "はい、大丈夫です";

  let confirmationReject = document.getElementById("confirmation-reject");
  confirmationReject.innerHTML = "戻る";

  let confirmationContainer = document.getElementById("confirmation-container");
  confirmationContainer.classList.add("confirmation-container-active");

  let confirmationOverlay = document.getElementById("confirmation-overlay");
  confirmationOverlay.classList.add("confirmation-overlay-active");
}

// deletes attendance record
function deleteThisRecord() {
  let record = document.getElementsByClassName("delete-this-record")[0];
  record.remove();

  // updates progress meter
  progressCalculate();

  let confirmationContainer = document.getElementById("confirmation-container");
  confirmationContainer.classList.remove("confirmation-container-active");

  let confirmationOverlay = document.getElementById("confirmation-overlay");
  confirmationOverlay.classList.remove("confirmation-overlay-active");

  let recordID = record.dataset.record_id;

  let csrfToken = document.getElementById("page-meta").dataset.csrf;
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "record_delete",
    record_id: recordID,
  };

  // queries database for classes
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      // updates attendance analytics
      let dateValue = document.getElementById("date-nav-field").value;
      // refreshAttendanceAnalytics('', 'day', dateValue);
      // refreshAttendanceAnalytics('', 'week', dateValue);
      refreshAttendanceAnalytics("", "all", dateValue);
    },
  });
}

// does not delete attendance record
function dontDeleteThisRecord() {
  let confirmationContainer = document.getElementById("confirmation-container");
  confirmationContainer.classList.remove("confirmation-container-active");

  let confirmationOverlay = document.getElementById("confirmation-overlay");
  confirmationOverlay.classList.remove("confirmation-overlay-active");
}

// updates attendance record start time
function updateAttendanceStartTime() {
  // let recordID = this.parentElement.parentElement.id.slice(18);
  let recordID = this.parentElement.parentElement.dataset.record_id;
  let startTime = this.value;

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf;
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "attendance_record_update_time",
    record_id: recordID,
    start_time: startTime,
  };

  // queries database for classes
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {},
  });
}

// updates attendance record instructor
function updateAttendanceInstructor() {
  // let recordID = this.parentElement.parentElement.id.slice(18);
  let recordID = this.parentElement.parentElement.dataset.record_id;
  let instructorID = this.value;

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf;
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "attendance_record_update_instructor",
    record_id: recordID,
    instructor_id: instructorID,
  };

  // queries database for classes
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {},
  });
}

// =============== CLASS SELECT ===============
function buildClassSelect() {
  let newClassSelectContainer = document.getElementById(
    "new-class-select-container"
  );

  // SEARCH INPUT CONTAINER
  let searchInputContainer = buildElement(
    "div",
    "",
    "class-search-input-container",
    ""
  );
  searchInputContainer.classList.add("search-input-container");
  newClassSelectContainer.appendChild(searchInputContainer);

  // SEARCH INPUT CONTAINER -> MAGNIFYING GLASS
  let magnifyingGlass = buildElement("div", "", "magnifying-glass", "");
  magnifyingGlass.classList.add("magnifying-glass");
  searchInputContainer.appendChild(magnifyingGlass);

  // SEARCH INPUT CONTAINER -> SEARCH INPUT
  let searchInput = buildElement(
    "input",
    "search-input-field",
    "class-search-input",
    ""
  );
  searchInput.addEventListener("keyup", searchInputKeyUp);
  searchInputContainer.appendChild(searchInput);

  // SEARCH INPUT CONTAINER -> CLOSE CONTAINER
  let closeContainer = buildElement("div", "close-container", "", "");
  closeContainer.addEventListener("click", newClassOverlayClose);
  searchInputContainer.appendChild(closeContainer);

  // SEARCH INPUT CONTAINER -> CLOSE CONTAINER -> CROSS LINES
  let closeCrossLineOne = buildElement("div", "close-cross-line", "", "");
  closeCrossLineOne.classList.add("close-cross-line-one");
  closeContainer.appendChild(closeCrossLineOne);
  let closeCrossLineTwo = buildElement("div", "close-cross-line", "", "");
  closeCrossLineTwo.classList.add("close-cross-line-two");
  closeContainer.appendChild(closeCrossLineTwo);

  // SEARCH INPUT CONTAINER -> RESULTS CONTAINER
  let resultsContainer = buildElement(
    "div",
    "results-container",
    "class-results-container",
    ""
  );
  newClassSelectContainer.appendChild(resultsContainer);

  let csrfToken = document.getElementById("page-meta").dataset.csrf;
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "get_all_active_classes",
  };

  // queries database for classes
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      buildClassCards(data.classes);
    },
  });
}

// builds class cards for class select menu
function buildClassCards(classes) {
  let resultsContainer = document.getElementById("class-results-container");
  var i;
  for (i = 0; i < classes.length; i++) {
    let currentClass = classes[i]; // current class in iteration

    // CLASS CONTAINER
    let currentClassContainer = buildElement(
      "div",
      "class-container",
      `class-${currentClass.id}`,
      ""
    );
    currentClassContainer.classList.add("class-container-active");
    currentClassContainer.addEventListener("click", addClassToAttendance);
    resultsContainer.appendChild(currentClassContainer);

    // CLASS CONTAINER META
    currentClassContainer.dataset.class_name = currentClass.className;
    currentClassContainer.dataset.instructor = currentClass.instructorMeta;
    currentClassContainer.dataset.students = currentClass.studentMeta;
    currentClassContainer.dataset.instructor_id = currentClass.instructorID;

    // CLASS CONTAINER -> HEADER
    let currentClassHeader = buildElement(
      "div",
      "class-header",
      "",
      currentClass.className
    );
    currentClassContainer.appendChild(currentClassHeader);

    // CLASS CONTAINER -> BODY
    let currentClassBody = buildElement("div", "class-body", "", "");
    currentClassContainer.appendChild(currentClassBody);

    // CLASS CONTAINER -> BODY -> DAY OF WEEK CONTAINER
    let currentClassDayOfWeekContainer = buildElement(
      "div",
      "day-of-week-container",
      "",
      ""
    );
    currentClassBody.appendChild(currentClassDayOfWeekContainer);

    // CLASS CONTAINER -> BODY -> DAY OF WEEK CONTAINER -> DAY
    const dayOfWeekText = ["日", "月", "火", "水", "木", "金", "土"];
    var n;
    for (n = 0; n < 7; n++) {
      let currentClassDay = buildElement(
        "div",
        "day",
        "",
        `${dayOfWeekText[n]}`
      );
      if (classes[i].dayOfWeek == n) {
        currentClassDay.classList.add("day-active");
      }
      currentClassDayOfWeekContainer.appendChild(currentClassDay);
    }

    // CLASS CONTAINER -> BODY -> TIME CONTAINER
    let currentClassTimeContainer = buildElement(
      "div",
      "time-container",
      "",
      ""
    );
    currentClassBody.appendChild(currentClassTimeContainer);

    // CLASS CONTAINER -> BODY -> DAY OF WEEK CONTAINER -> TIME
    var n;
    for (n = 0; n < 7; n++) {
      let currentClassTime = buildElement("div", "time", "", "");
      if (classes[i].dayOfWeek == n && classes[i].starTime != "") {
        currentClassTime.classList.add("time-active");
        currentClassTime.innerHTML = classes[i].startTime;
      }
      currentClassTimeContainer.appendChild(currentClassTime);
    }
    // CLASS CONTAINER -> BODY -> PRIMARY INSTRUCTOR CONTAINER
    let primaryInstructorIcon = buildElement(
      "div",
      "primary-instructor-icon",
      "",
      ""
    );
    primaryInstructorIcon.style.backgroundImage = `url('../static/customer/notes/img/instructors/${classes[i].primaryInstructor}.svg')`;
    currentClassBody.appendChild(primaryInstructorIcon);

    // CLASS CONTAINER -> BODY -> CLASS DESCRIPTION CONTAINER
    let classDescriptionContainer = buildElement(
      "div",
      "class-description-container",
      "",
      ""
    );
    currentClassBody.appendChild(classDescriptionContainer);

    // CLASS CONTAINER -> BODY -> CLASS DESCRIPTION CONTAINER -> CLASS TYPE
    let classType = buildElement("div", "class-type", "", classes[i].classType);
    classDescriptionContainer.appendChild(classType);

    // CLASS CONTAINER -> BODY -> CLASS DESCRIPTION CONTAINER -> PRIMARY INSTRUCTOR
    let primaryInstructor = buildElement(
      "div",
      "instructor",
      "",
      `${classes[i].primaryInstructorLastName}先生`
    );
    classDescriptionContainer.appendChild(primaryInstructor);

    // CLASS CONTAINER -> BODY -> CLASS DESCRIPTION CONTAINER -> REGULARITY
    var regularityText = "定期";
    if (classes[i].irregular == true) {
      regularityText = "不定期";
    }
    let regularity = buildElement("div", "regularity", "", regularityText);
    classDescriptionContainer.appendChild(regularity);

    // CLASS CONTAINER -> BODY -> SEPARATOR
    let separator = buildElement("div", "separator", "", "");
    currentClassBody.appendChild(separator);

    // CLASS CONTAINER -> BODY -> STUDENTS CONTAINER
    let studentsContainer = buildElement("div", "students-container", "", "");
    currentClassBody.appendChild(studentsContainer);

    // CLASS CONTAINER -> BODY -> STUDENTS CONTAINER -> STUDENT NAME CONTAINER
    var x;
    for (x = 0; x < classes[i].students.length; x++) {
      // STUDENTS NAME CONTAINER
      let studentNameContainer = buildElement(
        "a",
        "student-name-container",
        "",
        ""
      );
      studentNameContainer.dataset.student_id = classes[i].students[x].id;
      studentsContainer.appendChild(studentNameContainer);

      // STUDENTS NAME CONTAINER -> INDICATOR
      let indicator = buildElement("a", "enrollment-status-indicator", "", "");
      indicator.style.backgroundImage = `url('../static/class_list/img/enrollment_status_icons/${classes[i].students[x].status}.svg')`;
      indicator.classList.add(classes[i].students[x].statusCSS);
      studentNameContainer.appendChild(indicator);

      // STUDENTS NAME CONTAINER -> STUDENT NAME KANJI
      let studentNameKanji = buildElement(
        "a",
        "student-name-kanji",
        "",
        `${classes[i].students[x].lastNameKanji} ${classes[i].students[x].firstNameKanji}`
      );
      if (classes[i].students[x].grade != "-------") {
        studentNameKanji.innerHTML += `（${classes[i].students[x].grade}）`;
      }
      studentNameContainer.appendChild(studentNameKanji);

      // STUDENTS NAME CONTAINER -> STUDENT NAME KATAKANA
      let studentNameKatakana = buildElement(
        "a",
        "student-name-katakana",
        "",
        `${classes[i].students[x].lastNameKatakana} ${classes[i].students[x].firstNameKatakana}`
      );
      studentNameContainer.appendChild(studentNameKatakana);
    }
  }
}

// handles clicks to the new class button
function newClassButtonClick() {
  // clears target class from all attendance containers
  let allAttendanceContainers = document.getElementsByClassName(
    "attendance-container"
  );
  var n;
  for (n = 0; n < allAttendanceContainers.length; n++) {
    allAttendanceContainers[n].classList.remove("target-attendance-container");
  }

  // sets the target attendance container
  if (
    this.parentElement.parentElement.classList.contains("attendance-container")
  ) {
    let targetAttendanceContainer = this.parentElement.parentElement;
    targetAttendanceContainer.classList.add("target-attendance-container");
  } else {
    let targetAttendanceContainer =
      this.parentElement.parentElement.parentElement;
    targetAttendanceContainer.classList.add("target-attendance-container");
  }

  let newClassOverlay = document.getElementById("new-class-overlay");
  newClassOverlay.classList.toggle("new-class-overlay-active");
  newClassOverlay.addEventListener("click", newClassOverlayClose);

  let newClassSelectContainer = document.getElementById(
    "new-class-select-container"
  );
  newClassSelectContainer.classList.toggle("new-class-select-container-active");

  // scrolls class list results container to top
  let classResultsContainer = document.getElementById(
    "class-results-container"
  );
  classResultsContainer.scrollTop = 0;

  // resets class list search results
  var input = document.getElementById("class-search-input");
  input.value = "";
  // input.focus();

  let resultsContainer = document.getElementById("class-results-container"); // class results container
  let allResults = resultsContainer.getElementsByClassName("class-container"); // gets all results

  var i;
  for (i = 0; i < allResults.length; i++) {
    let currentClass = allResults[i];
    currentClass.classList.add("class-container-active");
  }
}

// handles clicks to the new class button overlay
function newClassOverlayClose() {
  let newClassOverlay = document.getElementById("new-class-overlay");
  newClassOverlay.classList.toggle("new-class-overlay-active");

  let newClassSelectContainer = document.getElementById(
    "new-class-select-container"
  );
  newClassSelectContainer.classList.toggle("new-class-select-container-active");
}

function searchInputKeyUp() {
  let inputRaw = document.getElementById("class-search-input").value; // raw input
  let inputLower = inputRaw.toLowerCase(); // lower case input

  let resultsContainer = document.getElementById("class-results-container"); // class results container
  let allResults = resultsContainer.getElementsByClassName("class-container"); // gets all results

  var i;
  for (i = 0; i < allResults.length; i++) {
    let currentClass = allResults[i];

    let classNameMeta = currentClass.dataset.class_name; // class name
    let classNameLower = classNameMeta.toLowerCase(); // lower case class name

    let instructorMeta = currentClass.dataset.instructor; // instructor
    let instructorLower = instructorMeta.toLowerCase(); // lower case instructor

    let studentMeta = currentClass.dataset.students; // student
    let studentLower = studentMeta.toLowerCase(); // lower case student

    if (inputRaw.length == 0) {
      currentClass.classList.add("class-container-active");
    } else if (
      (classNameLower.indexOf(inputLower) != -1) |
      (instructorLower.indexOf(inputLower) != -1) |
      (studentLower.indexOf(inputLower) != -1)
    ) {
      currentClass.classList.add("class-container-active");
    } else if (inputRaw.length != 0) {
      currentClass.classList.remove("class-container-active");
    }
  }
}

// handles clicks to the class card and adds data to attendance record
function addClassToAttendance() {
  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  let classCard = this.cloneNode(true); // clones class card
  classCard.addEventListener("click", newClassButtonClick); // adds event listener to cloned class card

  let targetAttendanceContainer = document.getElementsByClassName(
    "target-attendance-container"
  )[0]; // target class container

  // adds cloned class card to attendance
  let addedClassCardContainer =
    targetAttendanceContainer.getElementsByClassName("added-class-card")[0];
  addedClassCardContainer.innerHTML = ""; // clears content (if any) of target class card container
  addedClassCardContainer.appendChild(classCard);

  // removes add new class button
  let addClassButton = targetAttendanceContainer.getElementsByClassName(
    "add-new-class-button"
  )[0];
  if (addClassButton) {
    addClassButton.remove();
  }

  // closes class select overlay
  newClassOverlayClose();

  // populate attendance record with data from class card
  let classTime = classCard.getElementsByClassName("time-active")[0].innerHTML; // class time
  let attendanceTimeInput =
    targetAttendanceContainer.getElementsByClassName("class-time-input")[0]; // attendance record input
  attendanceTimeInput.value = classTime; // sets input to time pulled from class card

  // populates instructor data
  let instructorID = classCard.dataset.instructor_id; // instructor id from selected class
  let allChoices =
    targetAttendanceContainer.getElementsByClassName("instructor-input")[0]
      .children;
  var i;
  for (i = 0; i < allChoices.length; i++) {
    if (allChoices[i].value == instructorID) {
      allChoices[i].selected = true;
    }
  }

  // builds attendance list from class card data
  let allStudentsContainer =
    classCard.getElementsByClassName("students-container")[0]; // get all student container
  let allStudents = allStudentsContainer.children; // gets individual student records

  let attendanceRecordContainer =
    targetAttendanceContainer.getElementsByClassName(
      "attendance-record-container"
    )[0]; // attendance record container

  // removes incompleted attendance records
  var removedRecords = [];
  const elements =
    attendanceRecordContainer.getElementsByClassName("incomplete-record");
  while (elements.length > 0) {
    removedRecords.push(elements[0].dataset.record_id);
    elements[0].parentNode.removeChild(elements[0]);
  }

  // creates list of ids still in attendance record section
  let presentRecordsIDList = [];
  let recordsList = attendanceRecordContainer.children;
  var i;
  for (i = 0; i < recordsList.length; i++) {
    presentRecordsIDList.push(recordsList[i].dataset.student_id);
  }

  for (i = 0; i < allStudents.length; i++) {
    if (!presentRecordsIDList.includes(allStudents[i].dataset.student_id)) {
      // checks to see if record already exists
      // ATTENDANCE RECORD CONTAINER
      let newStudentAttendanceRecord = buildElement(
        "div",
        "attendance-record-item",
        "",
        ""
      );
      newStudentAttendanceRecord.classList.add("added-student");
      newStudentAttendanceRecord.classList.add("incomplete-record");
      newStudentAttendanceRecord.dataset.student_id =
        allStudents[i].dataset.student_id;
      let addStudentButton = attendanceRecordContainer.getElementsByClassName(
        "add-student-container"
      )[0];
      newStudentAttendanceRecord.classList.add("pointer-events-none"); // disables pointer events while DB is updated
      attendanceRecordContainer.insertBefore(
        newStudentAttendanceRecord,
        addStudentButton
      );

      // ATTENDANCE RECORD CONTAINER -> REMOVE STUDENT BUTTON CONTAINER
      let removeStudentButtonContainer = buildElement(
        "div",
        "remove-student-button-container",
        "",
        ""
      );
      removeStudentButtonContainer.addEventListener(
        "click",
        removeStudentAttendanceRecord
      );
      newStudentAttendanceRecord.appendChild(removeStudentButtonContainer);

      // ATTENDANCE RECORD CONTAINER -> REMOVE STUDENT BUTTON CONTAINER -> CENTER BAR
      let removeStudentButtonBar = buildElement(
        "div",
        "remove-student-button-bar",
        "",
        ""
      );
      removeStudentButtonContainer.appendChild(removeStudentButtonBar);

      // ATTENDANCE RECORD CONTAINER -> NAME (KANJI)
      let nameKanji = buildElement("div", "student-name-kanji", "", "");
      nameKanji.innerHTML =
        allStudents[i].getElementsByClassName(
          "student-name-kanji"
        )[0].innerHTML;
      newStudentAttendanceRecord.appendChild(nameKanji);

      // ATTENDANCE RECORD CONTAINER -> NAME (KATAKANA)
      let nameKatakana = buildElement("div", "student-name-katakana", "", "");
      nameKatakana.innerHTML = allStudents[i].getElementsByClassName(
        "student-name-katakana"
      )[0].innerHTML;
      newStudentAttendanceRecord.appendChild(nameKatakana);

      // ATTENDANCE RECORD CONTAINER -> ATTENDANCE STATUS CONTAINER
      let attendanceStatusContainer = buildElement(
        "div",
        "attendance-status-container",
        "",
        ""
      );
      attendanceStatusContainer.addEventListener(
        "click",
        toggleAttendanceStatus
      );
      newStudentAttendanceRecord.appendChild(attendanceStatusContainer);
    }
  }

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf;

  // AJAX - adds class
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "attendance_record_add_class",
    record_id: targetAttendanceContainer.dataset.record_id,
    class_id: this.id.slice(6),
    start_time: classTime,
    instructor: instructorID,
  };

  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {},
  });

  // AJAX - adds individual student attendance records
  let allStudentsAttendance = classCard.getElementsByClassName(
    "student-name-container"
  );
  let studentIDList = [];

  var i;
  for (i = 0; i < allStudentsAttendance.length; i++) {
    studentIDList.push(`[${allStudentsAttendance[i].dataset.student_id}, 0]`);
  }

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "attendance_record_add_student_attendance_multiple",
    record_id: targetAttendanceContainer.dataset.record_id,
    attendance_list: JSON.stringify(studentIDList),
  };

  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      let newStudentAttendanceRecordsAll =
        targetAttendanceContainer.getElementsByClassName("incomplete-record");
      var i;
      for (i = 0; i < newStudentAttendanceRecordsAll.length; i++) {
        newStudentAttendanceRecordsAll[i].dataset.record_id =
          data.studentAttendanceIDList[i];
        newStudentAttendanceRecordsAll[i].classList.remove(
          "pointer-events-none"
        ); // enables pointer events after DB is updated

        // updates attendance analytics
        let dateValue = document.getElementById("date-nav-field").value;
        // refreshAttendanceAnalytics('', 'day', dateValue);
        // refreshAttendanceAnalytics('', 'week', dateValue);
        refreshAttendanceAnalytics("", "all", dateValue);
      }
    },
  });

  // AJAX - removes previous pending student attendance records
  if (removedRecords.length != 0) {
    parameters = {
      csrfmiddlewaretoken: csrfToken,
      parameter: "record_delete_multiple",
      record_id_list: JSON.stringify(removedRecords),
    };

    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/attendance/attendance_api",
      data: parameters,
      success: function (data) {
        // updates attendance analytics
        let dateValue = document.getElementById("date-nav-field").value;
        // refreshAttendanceAnalytics('', 'day', dateValue);
        // refreshAttendanceAnalytics('', 'week', dateValue);
        refreshAttendanceAnalytics("", "all", dateValue);
      },
    });
  }

  // PROGRESS METER
  progressCalculate();
}

// =============== INSTRUCTOR SELECT ===============
// function fetchInstructorData() {
//     let csrfToken = document.getElementById('page-meta').dataset.csrf;
//     parameters = {
//         'csrfmiddlewaretoken': csrfToken,
//         'parameter': 'get_all_active_instructors',
//     }

//     // queries database for classes
//     $.ajax({
//         type: "POST",
//         dataType: "json",
//         url: "/attendance/attendance_api",
//         data: parameters,
//         success: function (data) {
//             let instructorListTemplate = buildElement('div', '', 'instructor-list-template', '');

//             let instructorChoice = buildElement('option', 'instructor-choice', '', '-------');
//             instructorChoice.value = 0;
//             instructorListTemplate.appendChild(instructorChoice);

//             var i;
//             for (i = 0; i < data.instructors.length; i++) {
//                 let instructorChoice = buildElement('option', 'instructor-choice', '', `${data.instructors[i].last_name_kanji}${data.instructors[i].first_name_kanji}`);
//                 instructorChoice.value = data.instructors[i].id;
//                 instructorListTemplate.appendChild(instructorChoice);

//             }

//             document.getElementById('page-meta').appendChild(instructorListTemplate);
//         },
//     })
// }

// =============== STUDENT ATTENDANCE ===============
// handles clicks to the new student button
function newStudentButtonClick() {
  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  let attendanceContainer = this.parentElement.parentElement.parentElement; // current attendance container

  let allContainers = document.getElementsByClassName("attendance-container"); // all attendance containers

  var i;
  for (i = 0; i < allContainers.length; i++) {
    // removes 'target-attendance-container' class from all attendance containers on page
    allContainers[i].classList.remove("target-attendance-container");
  }
  attendanceContainer.classList.add("target-attendance-container"); // adds 'target-attendance-class' to selected container

  let studentSelectContainer = document.getElementById(
    "new-student-select-container"
  ); // student select container
  studentSelectContainer.classList.add("new-student-select-container-active"); // adds class to display container and contents

  let searchField = document.getElementById("student-search-input"); // get search field
  searchField.value = ""; // clears search input
  studentSearchInputKeyUp(); // runs search to reset results

  let studentsResultsContainer = document.getElementById(
    "student-results-container"
  );
  studentsResultsContainer.scrollTop = 0; // scrolls class list results container to top

  // adds transparent grey background overlay
  let overlay = document.getElementById("new-student-overlay");
  overlay.classList.add("new-student-overlay-active");
  overlay.addEventListener("click", newStudentOverlayClose);

  // PROGRESS METER
  progressCalculate();
}

function toggleAttendanceStatus() {
  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  let studentRecord = this.parentElement;
  studentRecord.classList.add("pointer-events-none"); // disables clicks until DB updates

  var attendanceStatus = 0;

  if (studentRecord.classList.contains("incomplete-record")) {
    studentRecord.classList.remove("incomplete-record");
    studentRecord.classList.add("present-record");
    attendanceStatus = 1;
  } else if (studentRecord.classList.contains("present-record")) {
    studentRecord.classList.remove("present-record");
    studentRecord.classList.add("absent-record");
    attendanceStatus = 2;
  } else {
    studentRecord.classList.remove("absent-record");
    studentRecord.classList.add("incomplete-record");
  }

  let recordID = studentRecord.dataset.record_id;

  let csrfToken = document.getElementById("page-meta").dataset.csrf;
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "attendance_record_toggle_attendance_status",
    record_id: recordID,
    attendance_status: attendanceStatus,
  };

  // queries database for classes
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      studentRecord.classList.remove("pointer-events-none"); // enables clicks after DB updates

      // REFRESH ANALYTICS
      // refreshAttendanceAnalytics(recordID, 'week');
      // refreshAttendanceAnalytics(recordID, 'day');
      refreshAttendanceAnalytics(recordID, "all");
    },
  });

  // PROGRESS METER
  progressCalculate();
}

function removeStudentAttendanceRecord() {
  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  let studentRecord = this.parentElement;
  studentRecord.remove();

  // UPDATES ANALYTICS
  // refreshAttendanceAnalytics(this.parentElement.dataset.record_id, 'day');
  // refreshAttendanceAnalytics(this.parentElement.dataset.record_id, 'week');
  refreshAttendanceAnalytics(this.parentElement.dataset.record_id, "all");

  // AJAX to update database
  let csrfToken = document.getElementById("page-meta").dataset.csrf;
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "attendance_record_remove_attendance_status",
    record_id: this.parentElement.dataset.record_id,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {},
  });

  // PROGRESS METER
  progressCalculate();
}

// =============== STUDENT SELECT ===============

function buildStudentSelect() {
  let newStudentSelectContainer = document.getElementById(
    "new-student-select-container"
  );

  // SEARCH INPUT CONTAINER
  let searchInputContainer = buildElement(
    "div",
    "search-input-container",
    "student-search-input-container",
    ""
  );
  newStudentSelectContainer.appendChild(searchInputContainer);

  // SEARCH INPUT CONTAINER -> MAGNIFYING GLASS
  let magnifyingGlass = buildElement(
    "div",
    "magnifying-glass",
    "magnifying-glass",
    ""
  );
  searchInputContainer.appendChild(magnifyingGlass);

  // SEARCH INPUT CONTAINER -> SEARCH INPUT
  let searchInput = buildElement(
    "input",
    "search-input-field",
    "student-search-input",
    ""
  );
  searchInput.addEventListener("keyup", studentSearchInputKeyUp);
  searchInputContainer.appendChild(searchInput);

  // SEARCH INPUT CONTAINER -> CLOSE CONTAINER
  let closeContainer = buildElement("div", "close-container", "", "");
  closeContainer.addEventListener("click", newStudentOverlayClose);
  searchInputContainer.appendChild(closeContainer);

  // SEARCH INPUT CONTAINER -> CLOSE CONTAINER -> CROSS LINES
  let closeCrossLineOne = buildElement("div", "close-cross-line", "", "");
  closeCrossLineOne.classList.add("close-cross-line-one");
  closeContainer.appendChild(closeCrossLineOne);
  let closeCrossLineTwo = buildElement("div", "close-cross-line", "", "");
  closeCrossLineTwo.classList.add("close-cross-line-two");
  closeContainer.appendChild(closeCrossLineTwo);

  // SEARCH INPUT CONTAINER -> RESULTS CONTAINER
  let resultsContainer = buildElement(
    "div",
    "results-container",
    "student-results-container",
    ""
  );
  newStudentSelectContainer.appendChild(resultsContainer);

  let csrfToken = document.getElementById("page-meta").dataset.csrf;
  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "get_all_active_students",
  };

  // queries database for classes
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      buildStudentCards(resultsContainer, data.students);
    },
  });
}

function studentSearchInputKeyUp() {
  let allStudents = document.getElementById(
    "student-results-container"
  ).children; // all choices

  let rawInput = document.getElementById("student-search-input").value;
  let lowerCaseInput = rawInput.toLowerCase();

  var i;
  if (rawInput.length == 0) {
    for (i = 0; i < allStudents.length; i++) {
      allStudents[i].classList.add("display-student-item");
    }
  } else {
    for (i = 0; i < allStudents.length; i++) {
      let meta = allStudents[i].dataset.meta;
      if (meta.toLowerCase().indexOf(lowerCaseInput) == -1) {
        allStudents[i].classList.remove("display-student-item");
      } else {
        allStudents[i].classList.add("display-student-item");
      }
    }
  }
}

function newStudentOverlayClose() {
  // adds transparent grey background overlay
  let overlay = document.getElementById("new-student-overlay");
  overlay.classList.remove("new-student-overlay-active");

  let studentSelectContainer = document.getElementById(
    "new-student-select-container"
  ); // student select container
  studentSelectContainer.classList.remove(
    "new-student-select-container-active"
  ); // removes class to display container and contents
}

function buildStudentCards(resultsContainer, students) {
  var i;
  for (i = 0; i < students.length; i++) {
    // STUDENT ITEM CONTAINER
    let studentItemContainer = buildElement(
      "div",
      "student-item-container",
      `student-item-${students[i].id}`,
      ""
    );
    studentItemContainer.classList.add("display-student-item");
    studentItemContainer.dataset.meta = `${students[i].lastNameKanji}${students[i].firstNameKanji}${students[i].lastNameKatakana}${students[i].firstNameKatakana}${students[i].lastNameRomaji}${students[i].firstNameRomaji}`;
    studentItemContainer.dataset.student_id = students[i].id;
    studentItemContainer.dataset.grade = students[i].grade;
    studentItemContainer.addEventListener("click", selectStudent);
    resultsContainer.appendChild(studentItemContainer);

    // STUDENT ITEM CONTAINER -> KANJI
    let studentItemKanji = buildElement(
      "div",
      "student-item-kanji",
      "",
      `${students[i].lastNameKanji} ${students[i].firstNameKanji}`
    );
    studentItemContainer.appendChild(studentItemKanji);

    // STUDENT ITEM CONTAINER -> KATAKANA
    let studentItemKatakana = buildElement(
      "div",
      "student-item-katakana",
      "",
      `${students[i].lastNameKatakana} ${students[i].firstNameKatakana}`
    );
    studentItemContainer.appendChild(studentItemKatakana);

    // STUDENT ITEM CONTAINER -> ROMAJI
    // let studentItemRomaji = buildElement('div', 'student-item-romaji', '', `${students[i].lastNameRomaji}, ${students[i].firstNameRomaji}`);
    // studentItemContainer.appendChild(studentItemRomaji);
  }
}

function selectStudent() {
  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  let attendanceContainer = document.getElementsByClassName(
    "target-attendance-container"
  )[0];
  let recordContainer = attendanceContainer.getElementsByClassName(
    "attendance-record-container"
  )[0];
  let addStudentContainer = attendanceContainer.getElementsByClassName(
    "add-student-container"
  )[0];

  let studentID = this.dataset.student_id;

  let allCurrentRecords =
    recordContainer.getElementsByClassName("added-student");
  var i;
  var noMatch = true;
  for (i = 0; i < allCurrentRecords.length; i++) {
    if (studentID == allCurrentRecords[i].dataset.student_id) {
      noMatch = false;
      break;
    }
  }

  if (noMatch) {
    let nameKanji =
      this.getElementsByClassName("student-item-kanji")[0].innerHTML;
    if (this.dataset.grade != "") {
      nameKanji += `（${this.dataset.grade}）`;
    }
    let nameKatakana = this.getElementsByClassName("student-item-katakana")[0]
      .innerHTML;

    // ATTENDANCE RECORD CONTAINER
    let recordItem = buildElement("div", "attendance-record-item", "", "");
    recordItem.dataset.student_id = studentID;
    recordItem.classList.add("added-student");
    recordItem.classList.add("incomplete-record");

    recordContainer.insertBefore(recordItem, addStudentContainer);

    // ATTENDANCE RECORD CONTAINER -> REMOVE STUDENT BUTTON CONTAINER
    let removeStudentButtonContainer = buildElement(
      "div",
      "remove-student-button-container",
      "",
      ""
    );
    removeStudentButtonContainer.addEventListener(
      "click",
      removeStudentAttendanceRecord
    );
    recordItem.appendChild(removeStudentButtonContainer);

    // ATTENDANCE RECORD CONTAINER -> REMOVE STUDENT BUTTON CONTAINER -> CENTER BAR
    let removeStudentButtonBar = buildElement(
      "div",
      "remove-student-button-bar",
      "",
      ""
    );
    removeStudentButtonContainer.appendChild(removeStudentButtonBar);

    // ATTENDANCE RECORD CONTAINER -> REMOVE STUDENT BUTTON CONTAINER -> KANJI
    let studentNameKanji = buildElement(
      "div",
      "student-name-kanji",
      "",
      nameKanji
    );
    recordItem.appendChild(studentNameKanji);

    // ATTENDANCE RECORD CONTAINER -> REMOVE STUDENT BUTTON CONTAINER -> KATAKANA
    let studentNameKatakana = buildElement(
      "div",
      "student-name-katakana",
      "",
      nameKatakana
    );
    recordItem.appendChild(studentNameKatakana);

    // ATTENDANCE RECORD CONTAINER -> REMOVE STUDENT BUTTON CONTAINER -> ATTENDANCE STATUS
    let attendanceStatusContainer = buildElement(
      "div",
      "attendance-status-container",
      "",
      ""
    );
    attendanceStatusContainer.addEventListener("click", toggleAttendanceStatus);
    recordItem.appendChild(attendanceStatusContainer);

    // AJAX - adds student attendance records
    let recordID = attendanceContainer.dataset.record_id;

    let csrfToken = document.getElementById("page-meta").dataset.csrf;
    parameters = {
      csrfmiddlewaretoken: csrfToken,
      parameter: "attendance_record_add_student_attendance_single",
      record_id: recordID,
      student_id: studentID,
    };

    $.ajax({
      type: "POST",
      dataType: "json",
      url: "/attendance/attendance_api",
      data: parameters,
      success: function (data) {
        recordItem.dataset.record_id = data.studentAttendanceIDList;
        // UPDATES ANALYTICS
        // refreshAttendanceAnalytics(data.studentAttendanceIDList, 'day');
        // refreshAttendanceAnalytics(data.studentAttendanceIDList, 'week');
        refreshAttendanceAnalytics(data.studentAttendanceIDList, "all");
      },
    });
  }

  let studentSelectContainer = document.getElementById(
    "new-student-select-container"
  );
  studentSelectContainer.classList.remove(
    "new-student-select-container-active"
  );

  // adds transparent grey background overlay
  let overlay = document.getElementById("new-student-overlay");
  overlay.classList.remove("new-student-overlay-active");

  // PROGRESS METER
  progressCalculate();
}

// =============== DELETE CONFIRMATION ===============

function buildConfirmationWindow() {
  let confirmationContainer = document.getElementById("confirmation-container"); // get confirmation container
  confirmationContainer.addEventListener("click", dontDeleteThisRecord);

  // CONFIRMATION BOX
  let confirmationBox = buildElement("div", "", "confirmation-box", "");
  confirmationContainer.appendChild(confirmationBox);

  // CONFIRMATION BOX -> TEXT
  let confirmationText = buildElement(
    "div",
    "",
    "confirmation-text",
    "このレコードを削除しますか？"
  );
  confirmationBox.appendChild(confirmationText);

  // CONFIRMATION BOX -> CONFIRM
  let confirmationConfirm = buildElement(
    "div",
    "confirmation-box-button",
    "confirmation-confirm",
    "はい、大丈夫です"
  );
  confirmationConfirm.addEventListener("click", deleteThisRecord);
  confirmationBox.appendChild(confirmationConfirm);

  // CONFIRMATION BOX -> REJECT
  let confirmationReject = buildElement(
    "div",
    "confirmation-box-button",
    "confirmation-reject",
    "戻る"
  );
  confirmationReject.addEventListener("click", dontDeleteThisRecord);
  confirmationBox.appendChild(confirmationReject);
}

// =============== BUILD RECORDS FROM DATA ===============
function dataBuildRecordsExpanded(
  recordsAll,
  classesAll,
  classTypeLookupList,
  instructorsAll,
  studentsAll,
  attendanceAll,
  allInstructorChoices
) {
  let csrfToken = document.getElementById("page-meta").dataset.csrf;

  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  // STATUS TEXT CONVERSION
  enrollmentStatusText = [
    "unknown",
    "pre-enrolled",
    "enrolled",
    "short-absence",
    "long-absence",
  ];

  // GRADE TEXT CONVERSION
  gradeText = [
    "-------",
    "0才",
    "1才",
    "2才",
    "3才",
    "年小",
    "年中",
    "年長",
    "小1",
    "小2",
    "小3",
    "小4",
    "小5",
    "小6",
    "中1",
    "中2",
    "中3",
    "高1",
    "高2",
    "高3",
    "大人",
  ];

  // ATTENDANCE STATUS CSS
  statusCSS = ["incomplete-record", "present-record", "absent-record"];

  var i;
  for (i = 0; i < recordsAll.length; i++) {
    // PRE BUILD
    let attendanceSection = document.getElementById("attendance"); // gets attendance section

    // PRIMARY CONTAINER
    let newAttendanceContainer = buildElement(
      "div",
      "attendance-container",
      "",
      ""
    );
    newAttendanceContainer.dataset.record_id = recordsAll[i].pk;
    attendanceSection.appendChild(newAttendanceContainer);

    // PRIMARY CONTAINER -> ADD CLASS CONTAINER
    let addClassContainer = buildElement("div", "add-class-container", "", "");
    newAttendanceContainer.appendChild(addClassContainer);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> SECTION TITLE
    let addClassSectionTitle = buildElement(
      "div",
      "section-title",
      "",
      "クラス"
    );
    addClassContainer.appendChild(addClassSectionTitle);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD DATA
    let classData = classesAll.find(
      (o) => o.pk === recordsAll[i].fields.linked_class
    ); // get associated class data

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD
    let addedClassCard = buildElement("div", "added-class-card", "", "");
    addClassContainer.appendChild(addedClassCard);

    if (classData) {
      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD
      let classCardContainer = buildElement(
        "div",
        "class-container",
        `class-${classData.pk}`,
        ""
      );
      classCardContainer.classList.add("class-container-active");
      classCardContainer.id = `class-${classData.pk}`;
      classCardContainer.addEventListener("click", newClassButtonClick);
      addedClassCard.appendChild(classCardContainer);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS HEADER
      let classHeader = buildElement(
        "div",
        "class-header",
        "",
        classData.fields.class_name
      );
      classCardContainer.appendChild(classHeader);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY
      let classBody = buildElement("div", "class-body", "", "");
      classCardContainer.appendChild(classBody);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> DAY OF WEEK CONTAINER
      let dayOfWeekContainer = buildElement(
        "div",
        "day-of-week-container",
        "",
        ""
      );
      classBody.appendChild(dayOfWeekContainer);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> DAY OF WEEK CONTAINER -> DAYS OF WEEK
      const dayOfWeekText = ["日", "月", "火", "水", "木", "金", "土"];
      var n;
      for (n = 0; n < 7; n++) {
        let currentClassDay = buildElement(
          "div",
          "day",
          "",
          `${dayOfWeekText[n]}`
        );
        if (classData.fields.day_of_week == n) {
          currentClassDay.classList.add("day-active");
        }
        dayOfWeekContainer.appendChild(currentClassDay);
      }

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> TIME CONTAINER
      let timeContainer = buildElement("div", "time-container", "", "");
      classBody.appendChild(timeContainer);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> TIME CONTAINER -> TIMES
      var n;
      for (n = 0; n < 7; n++) {
        let currentClassTime = buildElement("div", "time", "", "");
        if (
          classData.fields.day_of_week == n &&
          classData.fields.start_time != ""
        ) {
          currentClassTime.classList.add("time-active");
          currentClassTime.innerHTML = classData.fields.start_time.slice(0, -3);
        }
        timeContainer.appendChild(currentClassTime);
      }

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> PRIMARY INSTRUCTOR ICON
      let primaryInstructorIcon = buildElement(
        "div",
        "primary-instructor-icon",
        "",
        ""
      );
      primaryInstructorIcon.style.backgroundImage = `url('../static/customer/notes/img/instructors/${classData.fields.primary_instructor}.svg')`;
      classBody.appendChild(primaryInstructorIcon);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> CLASS DESCRIPTION CONTAINER
      let classDescriptionContainer = buildElement(
        "div",
        "class-description-container",
        "",
        ""
      );
      classBody.appendChild(classDescriptionContainer);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> CLASS DESCRIPTION CONTAINER -> CLASS TYPE
      classTypeText = "";
      var n;
      for (n = 0; n < classTypeLookupList.length; n++) {
        if (classTypeLookupList[n][0] == classData.fields.class_type) {
          classTypeText = classTypeLookupList[n][1];
          break;
        }
      }
      let classType = buildElement("div", "class-type", "", classTypeText);
      classDescriptionContainer.appendChild(classType);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> CLASS DESCRIPTION CONTAINER -> INSTRUCTOR
      let insructorData = instructorsAll.find(
        (o) => o.fields.user === classData.fields.primary_instructor
      ); // finds instructor in instructor list
      let instructorName = insructorData.fields.last_name_kanji; // gets instructor last name in kanji
      let instructor = buildElement(
        "div",
        "instructor",
        "",
        `${instructorName}先生`
      );
      classDescriptionContainer.appendChild(instructor);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> CLASS DESCRIPTION CONTAINER -> REGULARITY
      var regularityText = "定期";
      if (classData.fields.irregular) {
        regularityText = "不定期";
      }
      let regularity = buildElement("div", "regularity", "", regularityText);
      classDescriptionContainer.appendChild(regularity);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> SEPARATOR
      let separator = buildElement("div", "separator", "", "");
      classBody.appendChild(separator);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADDED CLASS CARD -> CLASS BODY -> STUDENT CONTAINER
      let studentsContainer = buildElement("div", "students-container", "", "");
      classBody.appendChild(studentsContainer);

      // SORT STUDENTS - create list of student id and last name objects
      let studentList = [];
      var y;
      for (y = 0; y < classData.fields.students.length; y++) {
        studentData = studentsAll.find(
          (o) => o.pk === classData.fields.students[y]
        );
        studentObject = {
          id: classData.fields.students[y],
          last_first_name: `${studentData.fields.last_name_katakana}${studentData.fields.first_name_katakan}`,
        };
        studentList.push(studentObject);
      }
      // SORT STUDENTS - performs sort
      studentList.sort((a, b) => {
        let fa = a.last_first_name,
          fb = b.last_first_name;
        if (fa < fb) {
          return -1;
        }
        if (fa > fb) {
          return 1;
        }
        return 0;
      });

      // SORT STUDENTS - creates new student list
      let studentListSorted = [];
      for (y = 0; y < studentList.length; y++) {
        studentListSorted.push(studentList[y].id);
      }

      // SORT STUDENTS - replaces unsorted list with sorted list
      classData.fields.students = studentListSorted;

      var p;
      for (p = 0; p < classData.fields.students.length; p++) {
        // STUDENT OBJECT
        let student = studentsAll.find(
          (o) => o.pk === classData.fields.students[p]
        );

        // STUDENT NAME CONTAINER
        let studentNameContainer = buildElement(
          "div",
          "student-name-container",
          "",
          ""
        );
        studentsContainer.appendChild(studentNameContainer);

        // STUDENT NAME CONTAINER -> ENROLLMENT STATUS INDICATOR
        let enrollmentStatusIndicator = buildElement(
          "a",
          "enrollment-status-indicator",
          "",
          ""
        );
        enrollmentStatusIndicator.classList.add(
          enrollmentStatusText[student.fields.status]
        );
        enrollmentStatusIndicator.style.backgroundImage = `url('../static/class_list/img/enrollment_status_icons/${student.fields.status}.svg')`;
        studentNameContainer.appendChild(enrollmentStatusIndicator);

        // STUDENT NAME CONTAINER -> STUDENT NAME KANJI
        let studentNameKanjiFormatted = `${student.fields.last_name_kanji} ${student.fields.first_name_kanji}`;
        if (student.fields.grade != 0) {
          studentNameKanjiFormatted += `（${gradeText[student.fields.grade]}）`;
        }

        let studentNameKanji = buildElement(
          "a",
          "student-name-kanji",
          "",
          studentNameKanjiFormatted
        );
        studentNameContainer.appendChild(studentNameKanji);

        // STUDENT NAME CONTAINER -> STUDENT NAME KATAKANA
        let studentNameKatakanaFormatted = `${student.fields.last_name_katakana} ${student.fields.first_name_katakana}`;

        let studentNameKatakana = buildElement(
          "a",
          "student-name-katakana",
          "",
          studentNameKatakanaFormatted
        );
        studentNameContainer.appendChild(studentNameKatakana);
      }
    } else {
      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADD NEW CLASS BUTTON
      let addNewClassButton = buildElement(
        "div",
        "add-new-class-button",
        "",
        ""
      );
      addNewClassButton.addEventListener("click", newClassButtonClick);
      addedClassCard.appendChild(addNewClassButton);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADD NEW CLASS BUTTON -> PLUS CONTAINER
      let plusContainer = buildElement("div", "plus-button-container", "", "");
      addNewClassButton.appendChild(plusContainer);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADD NEW CLASS BUTTON -> PLUS CONTAINER -> PLUS ICON
      let plusIconVertical = buildElement("div", "plus-icon-vertical", "", "");
      plusIconVertical.classList.add("plus-icon-bar");
      plusContainer.appendChild(plusIconVertical);
      let plusIconHorizontal = buildElement(
        "div",
        "plus-icon-horizontal",
        "",
        ""
      );
      plusIconHorizontal.classList.add("plus-icon-bar");
      plusContainer.appendChild(plusIconHorizontal);

      // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> CLASS CARD -> ADD NEW CLASS BUTTON -> PLUS CONTAINER -> ADD CLASS TEXT
      let addClassText = buildElement(
        "div",
        "add-class-text",
        "",
        "クラス追加"
      );
      addNewClassButton.appendChild(addClassText);
    }

    // PRIMARY CONTAINER -> DATE & TIME
    let dateTimeContainer = buildElement("div", "date-time-container", "", "");
    newAttendanceContainer.appendChild(dateTimeContainer);

    // PRIMARY CONTAINER -> DATE & TIME -> TITLE
    let dateTimeTitle = buildElement("div", "section-title", "", "日時");
    dateTimeContainer.appendChild(dateTimeTitle);

    // PRIMARY CONTAINER -> DATE & TIME -> DATE
    let attendanceDateAsDate = new Date(recordsAll[i].fields.date);

    attendanceYear = attendanceDateAsDate.getFullYear();
    attendanceMonth = "0" + (attendanceDateAsDate.getMonth() + 1);
    attendanceDay = "0" + attendanceDateAsDate.getDate();
    attendanceString = `${attendanceYear}-${attendanceMonth.slice(
      -2
    )}-${attendanceDay.slice(-2)}`;

    let attendanceDate = buildElement(
      "div",
      "attendance-date",
      "",
      `${attendanceString}（${
        dayOfWeekConvertShort[attendanceDateAsDate.getDay()]
      }）`
    );
    dateTimeContainer.appendChild(attendanceDate);

    // PRIMARY CONTAINER -> TIME -> TITLE
    let timeTitle = buildElement("div", "section-title", "", "時間");
    dateTimeContainer.appendChild(timeTitle);

    // PRIMARY CONTAINER -> DATE & TIME -> TIME
    let classTimeInput = buildElement("input", "class-time-input", "", "");
    classTimeInput.type = "time";
    classTimeInput.addEventListener("blur", updateAttendanceStartTime);
    classTimeInput.value = recordsAll[i].fields.start_time;
    dateTimeContainer.appendChild(classTimeInput);

    // PRIMARY CONTAINER -> INSTRUCTOR
    let instructorContainer = buildElement(
      "div",
      "instructor-container",
      "",
      ""
    );
    newAttendanceContainer.appendChild(instructorContainer);

    // PRIMARY CONTAINER -> INSTRUCTOR -> TITLE
    let instructorTitle = buildElement("div", "section-title", "", "講師");
    instructorContainer.appendChild(instructorTitle);

    // PRIMARY CONTAINER -> INSTRUCTOR -> INSTRUCTOR INPUT
    let instructorInput = buildElement("select", "instructor-input", "", "");
    instructorInput.addEventListener("blur", updateAttendanceInstructor);
    instructorContainer.appendChild(instructorInput);

    // PRIMARY CONTAINER -> INSTRUCTOR -> INSTRUCTOR INPUT -> CHOICES
    // let instructorTemplate = document.getElementById('instructor-list-template');
    // instructorInput.innerHTML = instructorTemplate.innerHTML;

    let option = document.createElement("option");
    option.classList.add("instructor-choice");
    option.value = 0;
    option.innerHTML = "-------";
    instructorInput.appendChild(option);

    var y;
    for (y = 0; y < allInstructorChoices.length; y++) {
      let option = document.createElement("option");
      option.classList.add("instructor-choice");
      option.value = allInstructorChoices[y].id;
      option.innerHTML = `${allInstructorChoices[y].last_name_kanji}${allInstructorChoices[y].first_name_kanji}`;
      instructorInput.appendChild(option);
    }

    // PRIMARY CONTAINER -> INSTRUCTOR -> INSTRUCTOR INPUT -> SETS INSTRUCTOR VALUE
    instructorInput.value = recordsAll[i].fields.instructor;

    // PRIMARY CONTAINER -> STUDENT ATTENDANCE CONTAINER
    let studentAttendanceContainer = buildElement(
      "div",
      "student-attendance-container",
      "",
      ""
    );
    newAttendanceContainer.appendChild(studentAttendanceContainer);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> TITLE
    let studentAttendanceTitle = buildElement(
      "div",
      "section-title",
      "",
      "出席"
    );
    studentAttendanceContainer.appendChild(studentAttendanceTitle);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER
    let attendanceRecordContainer = buildElement(
      "div",
      "attendance-record-container",
      "",
      ""
    );
    studentAttendanceContainer.appendChild(attendanceRecordContainer);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ASSOCIATED STUDENTS
    let relatedAttendance = attendanceAll.filter(
      (o) => o.fields.attendance_record === recordsAll[i].pk
    );

    // ATTENDANCE SORT
    relatedAttendance.sort((a, b) => {
      let aLastName = studentsAll.find((o) => o.pk === a.fields.student).fields
        .last_name_katakana;
      let aFirstName = studentsAll.find((o) => o.pk === a.fields.student).fields
        .first_name_katakana;
      let bLastName = studentsAll.find((o) => o.pk === b.fields.student).fields
        .last_name_katakana;
      let bFirstName = studentsAll.find((o) => o.pk === b.fields.student).fields
        .first_name_katakana;
      let fa = `${aLastName}${aFirstName}`;
      fb = `${bLastName}${bFirstName}`;
      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    var x;
    for (x = 0; x < relatedAttendance.length; x++) {
      // STUDENT ATTENDANCE CONTAINER -> ASSOCIATED STUDENT OBJECT
      let associatedStudent = studentsAll.find(
        (o) => o.pk === relatedAttendance[x].fields.student
      );

      // STUDENT ATTENDANCE CONTAINER
      let attendanceRecordItem = buildElement(
        "div",
        "attendance-record-item",
        "",
        ""
      );
      attendanceRecordItem.classList.add("added-student");
      attendanceRecordItem.classList.add(
        statusCSS[relatedAttendance[x].fields.attendance_status]
      );
      attendanceRecordItem.dataset.student_id = associatedStudent.pk;
      attendanceRecordItem.dataset.record_id = relatedAttendance[x].pk;
      attendanceRecordContainer.appendChild(attendanceRecordItem);

      // STUDENT ATTENDANCE CONTAINER -> REMOVE STUDENT BUTTON CONTAINER
      let removeStudentButtonContainer = buildElement(
        "div",
        "remove-student-button-container",
        "",
        ""
      );
      removeStudentButtonContainer.addEventListener(
        "click",
        removeStudentAttendanceRecord
      );
      attendanceRecordItem.appendChild(removeStudentButtonContainer);

      // STUDENT ATTENDANCE CONTAINER -> REMOVE STUDENT BUTTON CONTAINER - REMOVE STUDENT BUTTON BAR
      let removeStudentButtonBar = buildElement(
        "div",
        "remove-student-button-bar",
        "",
        ""
      );
      removeStudentButtonContainer.appendChild(removeStudentButtonBar);

      // STUDENT ATTENDANCE CONTAINER -> STUDENT NAME KANJI
      let studentNameKanjiFormatted = `${associatedStudent.fields.last_name_kanji} ${associatedStudent.fields.first_name_kanji}`;
      if (associatedStudent.fields.grade != 0) {
        studentNameKanjiFormatted += `（${
          gradeText[associatedStudent.fields.grade]
        }）`;
      }

      let studentNameKanji = buildElement(
        "a",
        "student-name-kanji",
        "",
        studentNameKanjiFormatted
      );
      studentNameKanji.href = `/customer/detail/${associatedStudent.pk}`;
      attendanceRecordItem.appendChild(studentNameKanji);

      // STUDENT ATTENDANCE CONTAINER -> STUDENT NAME KATAKANA
      let studentNameKatakanaFormatted = `${associatedStudent.fields.last_name_katakana} ${associatedStudent.fields.first_name_katakana}`;

      let studentNameKatakana = buildElement(
        "a",
        "student-name-katakana",
        "",
        studentNameKatakanaFormatted
      );
      studentNameKatakana.href = `/customer/detail/${associatedStudent.pk}`;
      attendanceRecordItem.appendChild(studentNameKatakana);

      // STUDENT ATTENDANCE CONTAINER -> ATTENDANCE STATUS CONTAINER
      let attendanceStatusContainer = buildElement(
        "div",
        "attendance-status-container",
        "",
        ""
      );
      attendanceStatusContainer.addEventListener(
        "click",
        toggleAttendanceStatus
      );
      attendanceRecordItem.appendChild(attendanceStatusContainer);
    }

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM
    let attendanceRecordItem = buildElement(
      "div",
      "attendance-record-item",
      "",
      ""
    );
    attendanceRecordItem.classList.add("add-student-container");
    attendanceRecordItem.addEventListener("click", newStudentButtonClick);
    attendanceRecordContainer.appendChild(attendanceRecordItem);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM -> ADD STUDENT BUTTON CONTAINER
    let addNewStudentButton = buildElement(
      "div",
      "plus-button-container",
      "",
      ""
    );
    attendanceRecordItem.appendChild(addNewStudentButton);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM -> ADD STUDENT BUTTON CONTAINER -> VERTICAL LINE
    let addNewStudentButtonVertical = buildElement(
      "div",
      "plus-icon-bar",
      "",
      ""
    );
    addNewStudentButtonVertical.classList.add("plus-icon-vertical");
    addNewStudentButton.appendChild(addNewStudentButtonVertical);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM -> ADD STUDENT BUTTON CONTAINER -> HORIZONTAL LINE
    let addNewStudentButtonHorizontal = buildElement(
      "div",
      "plus-icon-bar",
      "",
      ""
    );
    addNewStudentButtonHorizontal.classList.add("plus-icon-horizontal");
    addNewStudentButton.appendChild(addNewStudentButtonHorizontal);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> STUDENT ATTENDANCE -> ATTENDANCE RECORD CONTAINTER -> ATTENDANCE ITEM -> ADD STUDENT BUTTON TEXT
    let addNewStudentButtonText = buildElement(
      "div",
      "add-new-student-button",
      "",
      "生徒追加"
    );
    attendanceRecordItem.appendChild(addNewStudentButtonText);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> FOOTER CONTAINER
    let footerContainer = buildElement("div", "footer-container", "", "");
    newAttendanceContainer.appendChild(footerContainer);

    // PRIMARY CONTAINER -> NEW CLASS CONTAINER -> FOOTER CONTAINER -> DELETE RECORD BUTTON
    let deleteRecordButton = buildElement("div", "footer-button", "", "");
    deleteRecordButton.classList.add("delete-record-button");
    deleteRecordButton.addEventListener("click", deleteConfirmation);
    footerContainer.appendChild(deleteRecordButton);
  }

  // PROGRESS METER
  progressCalculate();

  // UPDATES ANALYTICS
  if (attendanceAll.length > 0) {
    // refreshAttendanceAnalytics(attendanceAll[0].pk, 'day');
    // refreshAttendanceAnalytics(attendanceAll[0].pk, 'week');
    refreshAttendanceAnalytics(attendanceAll[0].pk, "all");
  }
  // ADD WEBSOCKET EVENT LISTENER
  addWSEventListeners();
}

function dataBuildRecordsCompact(
  recordsAll,
  classesAll,
  attendanceAll,
  studentsAll,
  currentContent,
  previousContent,
  previousDate,
  currentDate
) {
  let csrfToken = document.getElementById("page-meta").dataset.csrf;

  // temporarily sets the progress percentage while new data is loaded and calculated
  resetProgressPercentage();

  // GRADE TEXT CONVERSION
  gradeText = [
    "-------",
    "0才",
    "1才",
    "2才",
    "3才",
    "年小",
    "年中",
    "年長",
    "小1",
    "小2",
    "小3",
    "小4",
    "小5",
    "小6",
    "中1",
    "中2",
    "中3",
    "高1",
    "高2",
    "高3",
    "大人",
  ];

  // ATTENDANCE STATUS CSS
  statusCSS = ["incomplete-record", "present-record", "absent-record"];

  // ATTENDANCE SECTION
  let section = document.getElementById("attendance");

  // iterates through list and generates all attendance records
  var i;
  for (i = 0; i < recordsAll.length; i++) {
    // CLASS DATA
    let classData = classesAll.find(
      (o) => o.pk === recordsAll[i].fields.linked_class
    ); // get associated class data

    // CONTAINER
    let attendanceContainer = buildElement(
      "div",
      "attendance-container",
      "",
      ""
    );
    attendanceContainer.dataset.record_id = recordsAll[i].pk;
    section.appendChild(attendanceContainer);

    // CONTAINER - CLASS CONTAINER (used only for script used to auto-generate attendance records)
    if (classData) {
      let classContainer = buildElement(
        "div",
        "class-container",
        `class-${classData.pk}`,
        ""
      );
      attendanceContainer.appendChild(classContainer);
    }

    // CONTAINER - INSTRUCTOR ICON
    if (recordsAll[i].fields.instructor) {
      let instructorIcon = buildElement(
        "div",
        "primary-instructor-icon",
        "",
        ""
      );
      instructorIcon.style.backgroundImage = `url('../static/customer/notes/img/instructors/${recordsAll[i].fields.instructor}.svg')`;
      attendanceContainer.appendChild(instructorIcon);
    }

    if (recordsAll[i].fields.start_time || classData) {
      // CONTAINER - TITLE CONTAINER
      let titleContainer = buildElement("div", "section-title", "", "");
      attendanceContainer.appendChild(titleContainer);

      // CONTAINER - TITLE CONTAINER - TIME
      if (recordsAll[i].fields.start_time) {
        let time = buildElement(
          "div",
          "section-time",
          "",
          `${recordsAll[i].fields.start_time.slice(0, 5)}`
        );
        titleContainer.appendChild(time);
      }

      // CONTAINER - TITLE CONTAINER - TIME
      if (classData) {
        let className = buildElement(
          "div",
          "class-name",
          "",
          classData.fields.class_name
        );
        titleContainer.appendChild(className);
      }
    }

    // CONTAINER - ATTENDANCE RECORD DATA
    let attendanceRecordData = attendanceAll.filter(
      (o) => o.fields.attendance_record === recordsAll[i].pk
    );

    // CONTAINER - ATTENDANCE RECORD CONTAINER
    let attendanceRecordContainer = buildElement(
      "div",
      "attendance-record-container",
      "",
      ""
    );
    attendanceContainer.appendChild(attendanceRecordContainer);

    // ATTENDANCE SORT
    attendanceRecordData.sort((a, b) => {
      let aLastName = studentsAll.find((o) => o.pk === a.fields.student).fields
        .last_name_katakana;
      let aFirstName = studentsAll.find((o) => o.pk === a.fields.student).fields
        .first_name_katakana;
      let bLastName = studentsAll.find((o) => o.pk === b.fields.student).fields
        .last_name_katakana;
      let bFirstName = studentsAll.find((o) => o.pk === b.fields.student).fields
        .first_name_katakana;
      let fa = `${aLastName}${aFirstName}`;
      fb = `${bLastName}${bFirstName}`;
      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    // CONTAINER - ATTENDANCE RECORD CONTAINER - RECORD ITEMS
    var n;
    for (n = 0; n < attendanceRecordData.length; n++) {
      // CONTAINER
      let recordItem = buildElement("div", "attendance-record-item", "", "");
      recordItem.classList.add("added-student");
      recordItem.classList.add(
        statusCSS[attendanceRecordData[n].fields.attendance_status]
      );
      recordItem.dataset.record_id = attendanceRecordData[n].pk;
      recordItem.dataset.student_id = attendanceRecordData[n].fields.student;
      attendanceRecordContainer.appendChild(recordItem);

      // CONTAINER - STUDENT DATA
      let studentData = studentsAll.find(
        (o) => o.pk === attendanceRecordData[n].fields.student
      );

      // CONTAINER - STUDENT NAME KANJI
      let formattedText = `${studentData.fields.last_name_kanji} ${studentData.fields.first_name_kanji}`;
      if (studentData.fields.grade != 0) {
        formattedText = formattedText.concat(
          `（${gradeText[studentData.fields.grade]}）`
        );
      }
      let studentNameKanji = buildElement(
        "a",
        "student-name-kanji",
        "",
        formattedText
      );
      studentNameKanji.href = `/customer/detail/${studentData.pk}`;
      recordItem.appendChild(studentNameKanji);

      // CONTAINER - STUDENT NAME KATAKANA
      let studentNameKatakana = buildElement(
        "a",
        "student-name-katakana",
        "",
        `${studentData.fields.last_name_katakana} ${studentData.fields.first_name_katakana}`
      );
      studentNameKatakana.href = `/customer/detail/${studentData.pk}`;
      recordItem.appendChild(studentNameKatakana);

      // CONTAINER - ATTENDANCE STATUS CONTAINER
      let attendanceStatusContainer = buildElement(
        "div",
        "attendance-status-container",
        "",
        ""
      );
      attendanceStatusContainer.addEventListener(
        "click",
        toggleAttendanceStatus
      );
      recordItem.appendChild(attendanceStatusContainer);
    }

    // CONTAINER - ATTENDANCE RECORD CONTAINER - OPEN CLOSE TAB
    let openCloseTab = document.createElement("div");
    openCloseTab.classList.add("open-close-tab");
    openCloseTab.addEventListener("click", toggleAttendanceContentsOpenClose);
    attendanceContainer.appendChild(openCloseTab);

    // CONTAINER - ATTENDANCE RECORD CONTAINER - OPEN CLOSE TAB - LEFT LINE
    let leftLine = document.createElement("div");
    leftLine.classList.add("content-divider-line");
    openCloseTab.appendChild(leftLine);

    // CONTAINER - ATTENDANCE RECORD CONTAINER - OPEN CLOSE TAB - ICON CONTAINER
    let openCloseTabIconContainer = document.createElement("div");
    openCloseTabIconContainer.classList.add("open-close-tab-icon-container");
    openCloseTab.appendChild(openCloseTabIconContainer);

    // CONTAINER - ATTENDANCE RECORD CONTAINER - OPEN CLOSE TAB - RIGHT LINE
    let rightLine = document.createElement("div");
    rightLine.classList.add("content-divider-line");
    openCloseTab.appendChild(rightLine);

    // CONTAINER - ATTENDANCE RECORD CONTAINER - OPEN CLOSE TAB - ICON CONTAINER - SQUARE
    let openCloseTabIconSquare = document.createElement("div");
    openCloseTabIconSquare.classList.add("open-close-tab-icon-square");
    openCloseTabIconContainer.appendChild(openCloseTabIconSquare);

    // CONTAINER - ATTENDANCE RECORD CONTAINER - CONTENT CONTAINER
    // this container will be empty for records that do not have associated content
    let contentContainer = document.createElement("div");
    contentContainer.classList.add(
      "content-container",
      "hide-attendance-contents"
    );
    attendanceContainer.appendChild(contentContainer);

    // CONTAINER - ATTENDANCE RECORD CONTAINER - CONTENT CONTAINER
    let contentDataCurrent = currentContent[i];
    let contentDataPrevious = previousContent[i];
    if ((contentDataPrevious.length > 0) | (contentDataCurrent.length > 0)) {
      // PREVIOUS ATTENDANCE CONTENT
      if (contentDataPrevious.length > 0) {
        // CONTENT CONTAINER - PREVIOUS CONTENT HEADING
        let previousContentHeading = document.createElement("div");
        previousContentHeading.classList.add("lesson-content-heading");
        previousContentHeading.dataset.date = previousDate[i];
        previousContentHeading.addEventListener(
          "click",
          jumpToPreviousDateFromContentLink
        );
        let newDate = new Date(previousDate[i]);
        let dateText = dayOfWeekConvertShort[newDate.getDay()];
        if (previousDate[i]) {
          let dateFormatted = `${previousDate[i].slice(0, 4)}年${previousDate[
            i
          ].slice(5, 7)}月${previousDate[i].slice(8, 10)}日（${dateText}）`;
          previousContentHeading.innerHTML = dateFormatted;
        }
        contentContainer.appendChild(previousContentHeading);

        // CONTENT CONTAINER - UNORDERED LIST PREVIOUS
        let contentListPrevious = document.createElement("ul");
        contentListPrevious.classList.add("content-list", "previous-content");
        contentContainer.appendChild(contentListPrevious);

        // CONTENT CONTAINER - UNORDERED LIST PREVIOUS - CONTENT
        for (var p = 0; p < contentDataPrevious.length; p++) {
          let contentItem = document.createElement("li");
          contentItem.id = `content-${contentDataPrevious[p].id}`;
          contentItem.classList.add("content-item");

          let title = document.createElement("div");
          title.innerHTML = contentDataPrevious[p].material;
          contentItem.appendChild(title);

          let toFromContainer = document.createElement("div");
          toFromContainer.classList.add("to-from-container");
          contentItem.appendChild(toFromContainer);

          // checks to see if there is only one digit and appends class
          if (contentDataPrevious[p].start && !contentDataPrevious[p].end) {
            toFromContainer.classList.add("single-digit");
          } else if (
            !contentDataPrevious[p].start &&
            contentDataPrevious[p].end
          ) {
            toFromContainer.classList.add("single-digit");
          }

          let start = document.createElement("div");
          start.classList.add("start-page");
          let middle = document.createElement("div");
          let end = document.createElement("div");
          end.classList.add("end-page");
          start.innerHTML = contentDataPrevious[p].start;
          middle.innerHTML = "~";
          end.innerHTML = contentDataPrevious[p].end;
          toFromContainer.appendChild(start);
          if (contentDataPrevious[p].start && contentDataPrevious[p].end) {
            toFromContainer.appendChild(middle);
          }
          toFromContainer.appendChild(end);

          contentListPrevious.appendChild(contentItem);
        }
      }
      // CURRENT ATTENDANCE CONTENT
      if (contentDataCurrent.length > 0) {
        // CONTENT CONTAINER - CURRENT CONTENT HEADING
        let currentContentHeading = document.createElement("div");
        currentContentHeading.classList.add(
          "lesson-content-heading",
          "current-content-heading"
        );
        let newDate = new Date(currentDate);
        let dateText = dayOfWeekConvertShort[newDate.getDay()];
        let dateFormatted = `${currentDate.slice(0, 4)}年${currentDate.slice(
          5,
          7
        )}月${currentDate.slice(8, 10)}日（${dateText}）`;
        currentContentHeading.innerHTML = dateFormatted;
        contentContainer.appendChild(currentContentHeading);

        // CONTENT CONTAINER - UNORDERED LIST CURRENT
        let contentListCurrent = document.createElement("ul");
        contentListCurrent.classList.add("content-list", "current-content");
        contentContainer.appendChild(contentListCurrent);

        // CONTENT CONTEINER - UNORDERED LIST CURRENT - CONTENT
        for (var p = 0; p < contentDataCurrent.length; p++) {
          let contentItem = document.createElement("li");
          contentItem.id = `content-${contentDataCurrent[p].id}`;
          contentItem.classList.add("content-item");

          let title = document.createElement("div");
          title.innerHTML = contentDataCurrent[p].material;
          contentItem.appendChild(title);

          let toFromContainer = document.createElement("div");
          toFromContainer.classList.add("to-from-container");
          contentItem.appendChild(toFromContainer);

          let start = document.createElement("div");
          start.classList.add("start-page");
          let middle = document.createElement("div");
          let end = document.createElement("div");
          end.classList.add("end-page");
          start.innerHTML = contentDataCurrent[p].start;
          middle.innerHTML = "~";
          end.innerHTML = contentDataCurrent[p].end;
          toFromContainer.appendChild(start);
          if (contentDataCurrent[p].start && contentDataCurrent[p].end) {
            toFromContainer.appendChild(middle);
          }
          toFromContainer.appendChild(end);

          contentListCurrent.appendChild(contentItem);
        }
      }
    }

    if (recordsAll[i].fields.note) {
      // CONTENT COTAINER - NOTE CONTAINER
      let noteContainer = document.createElement("div");
      noteContainer.classList.add("note-container");
      contentContainer.appendChild(noteContainer);

      // CONTENT COTAINER - NOTE CONTAINER - HEADER
      let noteHeader = document.createElement("div");
      noteHeader.classList.add("note-header");
      noteHeader.innerHTML = "Notes";
      noteContainer.appendChild(noteHeader);

      // CONTENT CONTAINER - NOTE CONTAINER - NOTE CONTENTS
      let noteContents = document.createElement("div");
      noteContents.classList.add("note-contents");
      noteContents.innerHTML = recordsAll[i].fields.note;
      noteContainer.appendChild(noteContents);
    }
  }

  // PROGRESS METER
  progressCalculate();

  // UPDATES ANALYTICS
  if (attendanceAll.length > 0) {
    // refreshAttendanceAnalytics(attendanceAll[0].pk, 'day');
    // refreshAttendanceAnalytics(attendanceAll[0].pk, 'week');
    refreshAttendanceAnalytics(attendanceAll[0].pk, "all");
  }

  // ADD WEBSOCKET EVENT LISTENER
  addWSEventListeners();
}

// =============== POPULATES ATTENDANCE RECORDS BASED ON CLASS LIST ===============
function populateAttendance() {
  toggleAllClicksToPage("disable"); // enables all clicks to page

  let csrfToken = document.getElementById("page-meta").dataset.csrf; // CSRF token pulled from DOM element
  let date_value = document.getElementById("date-nav-field").value; // date value from date navigation field

  // let loadedClassList = [];
  // let attendanceAll = document.getElementsByClassName('attendance-container');
  // var i;
  // for (i = 0; i < attendanceAll.length; i++) {
  //     var loadedClass = attendanceAll[i].getElementsByClassName('class-container')[0];
  //     var classID = parseInt(loadedClass.id.slice(6));
  //     loadedClassList.push(classID);
  // }

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "populate_for_date", // API parameter
    date: date_value,
    // 'loaded_classes': JSON.stringify(loadedClassList),
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/attendance/attendance_api",
    data: parameters,
    success: function (data) {
      fetchAttendanceData();
    },
  });
}

// =============== TOGGLES EXPANDED VIEW PREFERENCE ===============
function toggleExpandedView() {
  let expandedViewActive =
    document.getElementById("page-meta").dataset.expanded_view_active; // expanded view active meta data
  let expandedViewButton = document.getElementById(
    "toggle-expanded-view-button"
  ); // button
  let attendanceSection = document.getElementById("attendance"); // attendance section
  let addAttendance = document.getElementById("new-attendance"); // add new attendance section
  var value = false;

  if (expandedViewActive == "False") {
    document.getElementById("page-meta").dataset.expanded_view_active = "True";
    expandedViewButton.classList.add("active");
    attendanceSection.classList.remove("compact");
    addAttendance.classList.remove("display-none");
    fetchAttendanceData();
    value = true;
  } else {
    document.getElementById("page-meta").dataset.expanded_view_active = "False";
    expandedViewButton.classList.remove("active");
    attendanceSection.classList.add("compact");
    addAttendance.classList.add("display-none");
    fetchAttendanceData();
    value = false;
  }

  // AJAX - update sticky user preference
  let csrfToken = document.getElementById("page-meta").dataset.csrf;

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    preference: "attendance_expanded_view",
    value: value,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/user_profile/set_user_preference/",
    data: parameters,
    success: function (data) {},
  });
}

// =============== PROGRESS TRACKING ===============
function buildProgressTrackingElement() {
  // SECTION
  let section = document.getElementById("progress");

  // PRIMARY CONTAINER
  let primaryContainer = buildElement("div", "primary-container", "", "");
  primaryContainer.addEventListener("click", toggleProgressTrackingElement);
  section.appendChild(primaryContainer);

  // PRIMARY CONTAINER -> INCOMPLETE RECORD COUNT
  let incompleteCount = buildElement(
    "div",
    "record-count-bubble",
    "incomplete-record-count",
    "0"
  );
  primaryContainer.appendChild(incompleteCount);

  // PRIMARY CONTAINER -> PRESENT RECORD COUNT
  let presentCount = buildElement(
    "div",
    "record-count-bubble",
    "present-record-count",
    "0"
  );
  primaryContainer.appendChild(presentCount);

  // PRIMARY CONTAINER -> ABSENT RECORD COUNT
  let absentCount = buildElement(
    "div",
    "record-count-bubble",
    "absent-record-count",
    "0"
  );
  primaryContainer.appendChild(absentCount);

  // PRIMARY CONTAINER -> PERCENTAGE TEXT
  let percentage = buildElement("div", "percentage", "", "--");
  primaryContainer.appendChild(percentage);

  // PRIMARY CONTAINER -> PERCENTAGE COMPLETE TEXT
  let complete = buildElement("div", "complete", "", "完成率");
  primaryContainer.appendChild(complete);
}

function toggleProgressTrackingElement() {
  let section = document.getElementById("progress");
  section.classList.toggle("expand");
}

// temporarily sets the percentage to dashes while new data is loaded and calculated
function resetProgressPercentage() {
  let section = document.getElementById("progress"); // gets progress section

  let percentageText = section.getElementsByClassName("percentage")[0]; // finds percentage complete element
  percentageText.innerHTML = "--";

  let incompleteCountText = document.getElementById("incomplete-record-count");
  let presentCountText = document.getElementById("present-record-count");
  let absentCountText = document.getElementById("absent-record-count");

  incompleteCountText.innerHTML = "-";
  presentCountText.innerHTML = "-";
  absentCountText.innerHTML = "-";
}

function progressCalculate() {
  let incompleteRecords = document.getElementsByClassName("incomplete-record"); // all incomplete records
  let presentRecords = document.getElementsByClassName("present-record"); // all present records
  let absentRecords = document.getElementsByClassName("absent-record"); // all absent records

  let totalRecords =
    incompleteRecords.length + presentRecords.length + absentRecords.length; // total records present on page

  let section = document.getElementById("progress"); // gets progress section
  let percentageText = section.getElementsByClassName("percentage")[0]; // finds percentage complete element

  var percentageComplete;
  if (totalRecords > 0) {
    percentageComplete =
      ((presentRecords.length + absentRecords.length) / totalRecords) * 100; // calculates completion percentage
    percentageText.innerHTML = `${percentageComplete.toFixed(0)}%`; // sets percentage completion value
  } else {
    percentageText.innerHTML = "--";
  }

  // sets percentage complete tag color to green when all records complete
  if (percentageComplete == 100) {
    section
      .getElementsByClassName("primary-container")[0]
      .classList.add("attendance-completed");
  } else {
    section
      .getElementsByClassName("primary-container")[0]
      .classList.remove("attendance-completed");
  }

  let incompleteText = document.getElementById("incomplete-record-count");
  let presentText = document.getElementById("present-record-count");
  let absentText = document.getElementById("absent-record-count");
  incompleteText.innerHTML = incompleteRecords.length;
  presentText.innerHTML = presentRecords.length;
  absentText.innerHTML = absentRecords.length;
}

// =============== WEBSOCKETS ===============
function buildWebsocketStatus() {
  // SECTION
  let section = buildElement("section", "", "ws-status-section", "");
  document.body.appendChild(section);

  // SECTION - CONTAINER
  let container = buildElement("div", "", "ws-status-container", "");
  section.appendChild(container);

  // SECTION - CONTAINER - STATUS TEXT
  let statusText = buildElement("div", "", "ws-status-text", "接続中");
  container.appendChild(statusText);

  // SECTION - CONTAINER - LOADING DOTS CONTAINER
  let loadingDotsContainer = buildElement(
    "div",
    "loading-dots",
    "ws-loading-dots-container",
    ""
  );
  container.appendChild(loadingDotsContainer);

  // SECTION - CONTAINER - LOADING DOTS CONTAINER - DOTS
  var i;
  for (i = 0; i < 3; i++) {
    let dot = buildElement("div", "ws-status-loading-dot", `ws-dot-${i}`, ".");
    loadingDotsContainer.appendChild(dot);
  }
}

// event listener for clicks to attendance status
function addWSEventListeners() {
  let attendanceButtonsAll = document.getElementsByClassName(
    "attendance-status-container"
  );
  var i;
  for (i = 0; i < attendanceButtonsAll.length; i++) {
    attendanceButtonsAll[i].addEventListener("click", transmitWSAction);
  }
}

let WSfirstConnection = true;
var retryDelay = 1000;
function openWebsocket() {
  var daemonRunning;

  let attendanceWebSocket = new WebSocket(
    "wss://" + window.location.host + "/ws/"
  );

  // WS OPEN
  attendanceWebSocket.onopen = function (e) {
    retryDelay = 1000;
    window.attendanceWebSocket = attendanceWebSocket;
    daemonRunning = true;
    websocketConnectionDaemon(attendanceWebSocket, retryDelay);

    if (!WSfirstConnection) {
      toggleLoadingSpinner("ADD");
      fetchAttendanceData();
    } else {
      WSfirstConnection = false;
    }

    setTimeout(() => {
      let loadingDots = document.getElementById("ws-loading-dots-container");
      loadingDots.classList.remove("loading-dots");
      let statusText = document.getElementById("ws-status-text");
      statusText.innerHTML = "接続完了";
    }, 8000);
  };

  // WS CLOSE
  attendanceWebSocket.onclose = function (e) {
    if (!daemonRunning) {
      if (retryDelay < 10000) {
        retryDelay += 1000;
      }
      websocketConnectionDaemon(attendanceWebSocket, retryDelay);
    }
  };

  // WS MESSAGE
  var resetStatusTimeout;
  attendanceWebSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);

    // changes status text
    let statusText = document.getElementById("ws-status-text");
    statusText.innerHTML = "入力中";

    let loadingDots = document.getElementById("ws-loading-dots-container");
    loadingDots.classList.add("loading-dots");

    window.clearTimeout(resetStatusTimeout);
    // resets status text and dots
    resetStatusTimeout = window.setTimeout(() => {
      loadingDots.classList.remove("loading-dots");
      statusText.innerHTML = "接続完了";
    }, 10000);

    function removeAttendanceStatusClasses(attendanceRecord) {
      attendanceRecord.classList.remove(
        "incomplete-record",
        "present-record",
        "absent-record"
      );
    }

    let allItems = document.getElementsByClassName("attendance-record-item");
    var i;
    for (i = 0; i < allItems.length; i++) {
      if (
        allItems[i].dataset.record_id == data.attendanceID &&
        data.attendanceStatus == 0
      ) {
        removeAttendanceStatusClasses(allItems[i]);
        allItems[i].classList.add("incomplete-record");
      } else if (
        allItems[i].dataset.record_id == data.attendanceID &&
        data.attendanceStatus == 1
      ) {
        removeAttendanceStatusClasses(allItems[i]);
        allItems[i].classList.add("present-record");
      } else if (
        allItems[i].dataset.record_id == data.attendanceID &&
        data.attendanceStatus == 2
      ) {
        removeAttendanceStatusClasses(allItems[i]);
        allItems[i].classList.add("absent-record");
      }
    }

    // resets and recalculates progress percentage
    resetProgressPercentage();
    progressCalculate();
  };
}

function websocketConnectionDaemon(attendanceWebSocket, retryDelay) {
  setTimeout(() => {
    if (attendanceWebSocket.readyState == 1) {
      // console.log(`connection stable; next check in ${retryDelay} milliseconds`);
      if (retryDelay < 10000) {
        retryDelay += 1000;
      }
      websocketConnectionDaemon(attendanceWebSocket, retryDelay);
    } else if (attendanceWebSocket.readyState == 3) {
      // console.log(`attempt reconnect in ${retryDelay} milliseconds`);
      if (retryDelay < 10000) {
        retryDelay += 1000;
      }
      openWebsocket();

      let loadingDots = document.getElementById("ws-loading-dots-container");
      loadingDots.classList.add("loading-dots");
      let statusText = document.getElementById("ws-status-text");
      statusText.innerHTML = "接続中";
    }
  }, retryDelay);
}

// WS TRANSMIT
function transmitWSAction() {
  let attendanceRecordItem = this.parentElement;

  let attendanceID = attendanceRecordItem.dataset.record_id;

  var attendanceStatus;
  if (attendanceRecordItem.classList.contains("incomplete-record")) {
    attendanceStatus = 0;
  } else if (attendanceRecordItem.classList.contains("present-record")) {
    attendanceStatus = 1;
  } else {
    attendanceStatus = 2;
  }

  attendanceWebSocket.send(
    JSON.stringify({
      attendanceID: attendanceID,
      attendanceStatus: attendanceStatus,
    })
  );
}
