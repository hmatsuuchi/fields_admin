function initialization() {
  module001("2022-09-01", "2022-09-07");
  module002("2022-09-01", "2022-09-07");
  module003("2022-09-01", "2022-09-07");
  module004("2022-09-01", "2022-09-07");
  module005("2022-09-01", "2022-09-07");
  module006("2022-09-01", "2022-09-07");
  module007("2022-09-01", "2022-09-07");
  module008("2022-09-01", "2022-09-07");
  module009("2022-09-01", "2022-09-07");
  module010("2022-09-01", "2022-09-07");
  module011("2022-09-01", "2022-09-07");
}

// generates DOM elements
function generateNewElement(
  elementType,
  elementClass,
  elementID,
  elementInnerHTML
) {
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

// MODULE 001 - ATTENDANCE BY WEEK
function module001(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-001",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "出欠（週）");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_001",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      lineGraph001(graph, data);
    },
  });
}

// MODULE 001 - LINE GRAPH
function lineGraph001(targetContainer, data) {
  let thisModule = document.getElementById("module-001"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = `${data.labels[0].slice(5, 7)}月${data.labels[0].slice(
    8,
    10
  )}日`;
  let endDate = `${data.labels[data.labels.length - 1].slice(
    5,
    7
  )}月${data.labels[data.labels.length - 1].slice(8, 10)}日`;

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate} ~ ${endDate}`;
  titleContainer.appendChild(subtitle);

  var shortLabels = [];
  var i;
  for (i = 0; i < data.labels.length; i++) {
    shortLabels.push(data.labels[i].slice(5, 10));
  }

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: shortLabels,
      datasets: [
        {
          label: "出席",
          data: data.present,
          backgroundColor: ["rgba(0, 184, 169, 0.4)"],
          borderColor: ["rgba(0, 184, 169, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
        {
          label: "欠席",
          data: data.absent,
          backgroundColor: ["rgba(246, 65, 108, 0.4)"],
          borderColor: ["rgba(246, 65, 108, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
        {
          label: "未定",
          data: data.pending,
          backgroundColor: ["rgba(255, 222, 125, 0.4)"],
          borderColor: ["rgba(255, 222, 125, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          // beginAtZero: true
        },
      },
      maintainAspectRatio: false,
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}

// MODULE 002 - ATTENDANCE STATS
function module002(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-002",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "出欠率");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_002",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      donutChart001(graph, data);
    },
  });
}

// MODULE 002 - DONUT CHART
function donutChart001(targetContainer, data) {
  let totalRecords =
    data.presentCount + data.absentCount + data.incompleteCount;
  let presentPercentage =
    Math.round((data.presentCount / totalRecords) * 1000) / 10;
  let absentPercentage =
    Math.round((data.absentCount / totalRecords) * 1000) / 10;
  let incompletePercentage =
    Math.round((data.incompleteCount / totalRecords) * 1000) / 10;

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [`出席`, `欠席`, `未定`],
      datasets: [
        {
          label: "present students",
          data: [data.presentCount, data.absentCount, data.incompleteCount],
          backgroundColor: [
            "rgba(0, 184, 169, .8)",
            "rgba(246, 65, 108, .8)",
            "rgba(255, 222, 125, .8)",
          ],
          borderColor: ["rgba(255, 255, 255, .8)"],
          hoverBorderColor: [
            "rgba(0, 184, 169, 1)",
            "rgba(246, 65, 108, 1)",
            "rgba(255, 222, 125, 1)",
          ],
          borderWidth: 2,
          radius: "90%",
        },
      ],
    },
    options: {
      responsive: true,
    },
  });

  let module = document.getElementById("module-002");

  let dataContainer = generateNewElement("div", "data-container", "", "");
  module.appendChild(dataContainer);

  let presentData = generateNewElement(
    "div",
    "attendance-data-item",
    "",
    `${data.presentCount}件<br>(${presentPercentage}%)`
  );
  presentData.classList.add("present-count");
  dataContainer.appendChild(presentData);

  let absentData = generateNewElement(
    "div",
    "attendance-data-item",
    "",
    `${data.absentCount}件<br>(${absentPercentage}%)`
  );
  absentData.classList.add("absent-count");
  dataContainer.appendChild(absentData);

  let incompleteData = generateNewElement(
    "div",
    "attendance-data-item",
    "",
    `${data.incompleteCount}件<br>(${incompletePercentage}%)`
  );
  incompleteData.classList.add("incomplete-count");
  dataContainer.appendChild(incompleteData);
}

// MODULE 003 - ATTENDANCE BY DAY
function module003(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-003",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "出欠(日)");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_003",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      lineGraph003(graph, data);
    },
  });
}

// MODULE 003 - LINE GRAPH
function lineGraph003(targetContainer, data) {
  var total = [];
  var i;
  for (i = 0; i < data.present.length; i++) {
    total.push(data.present[i] + data.absent[i]);
  }

  let thisModule = document.getElementById("module-003"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = `${data.labels[0].slice(5, 7)}月${data.labels[0].slice(
    8,
    10
  )}日`;
  let endDate = `${data.labels[data.labels.length - 1].slice(
    5,
    7
  )}月${data.labels[data.labels.length - 1].slice(8, 10)}日`;

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate} ~ ${endDate}`;
  titleContainer.appendChild(subtitle);

  var shortLabels = [];
  var i;
  for (i = 0; i < data.labels.length; i++) {
    shortLabels.push(data.labels[i].slice(5, 10));
  }

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: shortLabels,
      datasets: [
        {
          label: "出席",
          data: data.present,
          backgroundColor: ["rgba(0, 184, 169, 0.4)"],
          borderColor: ["rgba(0, 184, 169, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
        {
          label: "欠席",
          data: data.absent,
          backgroundColor: ["rgba(246, 65, 108, 0.4)"],
          borderColor: ["rgba(246, 65, 108, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
        // {
        //     label: '合計',
        //     data: total,
        //     backgroundColor: [
        //         'rgba(0, 0, 0, 0.4)',
        //     ],
        //     borderColor: [
        //         'rgba(0, 0, 0, 0.8)',
        //     ],
        //     borderWidth: 1,
        //     radius: 4,
        // },
        {
          label: "未定",
          data: data.pending,
          backgroundColor: ["rgba(255, 222, 125, 0.4)"],
          borderColor: ["rgba(255, 222, 125, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          // beginAtZero: true
        },
      },
      maintainAspectRatio: false,
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}

// MODULE 004 - ABSENT RATE BY WEEK
function module004(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-004",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "欠席率（週）");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_004",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      lineGraph004(graph, data);
    },
  });
}

// MODULE 004 - LINE GRAPH
function lineGraph004(targetContainer, data) {
  let thisModule = document.getElementById("module-004"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = `${data.labels[0].slice(5, 7)}月${data.labels[0].slice(
    8,
    10
  )}日`;
  let endDate = `${data.labels[data.labels.length - 1].slice(
    5,
    7
  )}月${data.labels[data.labels.length - 1].slice(8, 10)}日`;

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate} ~ ${endDate}`;
  titleContainer.appendChild(subtitle);

  var shortLabels = [];
  var i;
  for (i = 0; i < data.labels.length; i++) {
    shortLabels.push(data.labels[i].slice(5, 10));
  }

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: shortLabels,
      datasets: [
        {
          label: "欠席率",
          data: data.absentRate,
          backgroundColor: ["rgba(0, 0, 0, 0.4)"],
          borderColor: ["rgba(0, 0, 0, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          // beginAtZero: true
        },
      },
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += `: ${context.parsed.y}%`;
              }

              return label;
            },
          },
        },
      },
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}

// MODULE 005 - ABSENT RATE BY DAY
function module005(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-005",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "欠席率（日）");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_005",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      lineGraph005(graph, data);
    },
  });
}

// MODULE 005 - LINE GRAPH
function lineGraph005(targetContainer, data) {
  let thisModule = document.getElementById("module-005"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = `${data.labels[0].slice(5, 7)}月${data.labels[0].slice(
    8,
    10
  )}日`;
  let endDate = `${data.labels[data.labels.length - 1].slice(
    5,
    7
  )}月${data.labels[data.labels.length - 1].slice(8, 10)}日`;

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate} ~ ${endDate}`;
  titleContainer.appendChild(subtitle);

  var shortLabels = [];
  var i;
  for (i = 0; i < data.labels.length; i++) {
    shortLabels.push(data.labels[i].slice(5, 10));
  }

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: shortLabels,
      datasets: [
        {
          label: "欠席率",
          data: data.absentRate,
          backgroundColor: ["rgba(0, 0, 0, 0.4)"],
          borderColor: ["rgba(0, 0, 0, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          // beginAtZero: true
        },
      },
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += `: ${context.parsed.y}%`;
              }

              return label;
            },
          },
        },
      },
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}

// MODULE 006 - ATTENDANCE BY MONTH
function module006(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-006",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "出欠（月）");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_006",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      lineGraph006(graph, data);
    },
  });
}

// MODULE 006 - LINE GRAPH
function lineGraph006(targetContainer, data) {
  let thisModule = document.getElementById("module-006"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = `${data.labels[0].slice(2, 4)}年${data.labels[0].slice(
    5,
    7
  )}月`;
  let endDate = `${data.labels[0].slice(2, 4)}年${data.labels[
    data.labels.length - 1
  ].slice(5, 7)}月`;

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate} ~ ${endDate}`;
  titleContainer.appendChild(subtitle);

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labelsShort,
      datasets: [
        {
          label: "出席",
          data: data.present,
          backgroundColor: ["rgba(0, 184, 169, 0.4)"],
          borderColor: ["rgba(0, 184, 169, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
        {
          label: "欠席",
          data: data.absent,
          backgroundColor: ["rgba(246, 65, 108, 0.4)"],
          borderColor: ["rgba(246, 65, 108, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
        {
          label: "未定",
          data: data.pending,
          backgroundColor: ["rgba(255, 222, 125, 0.4)"],
          borderColor: ["rgba(255, 222, 125, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          // beginAtZero: true
        },
      },
      maintainAspectRatio: false,
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}

// MODULE 007 - ABSENT RATE BY MONTH
function module007(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-007",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "欠席率（月）");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_007",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      lineGraph007(graph, data);
    },
  });
}

// MODULE 007 - LINE GRAPH
function lineGraph007(targetContainer, data) {
  let thisModule = document.getElementById("module-007"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = `${data.labels[0].slice(2, 4)}年${data.labels[0].slice(
    5,
    7
  )}月`;
  let endDate = `${data.labels[0].slice(2, 4)}年${data.labels[
    data.labels.length - 1
  ].slice(5, 7)}月`;

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate} ~ ${endDate}`;
  titleContainer.appendChild(subtitle);

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labelsShort,
      datasets: [
        {
          label: "欠席率",
          data: data.absentRate,
          backgroundColor: ["rgba(0, 0, 0, 0.4)"],
          borderColor: ["rgba(0, 0, 0, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          // beginAtZero: true
        },
      },
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += `: ${context.parsed.y}%`;
              }

              return label;
            },
          },
        },
      },
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}

// MODULE 008 - CUSTOMER LIFETIME
function module008(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-008",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "顧客の生涯（日）");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_008",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      lineGraph008(graph, data);
    },
  });
}

// MODULE 008 - LINE GRAPH
function lineGraph008(targetContainer, data) {
  let thisModule = document.getElementById("module-008"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = `${data.labels[0].slice(5, 7)}月${data.labels[0].slice(
    8,
    10
  )}日`;
  let endDate = `${data.labels[data.labels.length - 1].slice(
    5,
    7
  )}月${data.labels[data.labels.length - 1].slice(8, 10)}日`;

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate} ~ ${endDate}`;
  titleContainer.appendChild(subtitle);

  var shortLabels = [];
  var i;
  for (i = 0; i < data.labels.length; i++) {
    shortLabels.push(data.labels[i].slice(5, 10));
  }

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: shortLabels,
      datasets: [
        {
          label: "平均",
          data: data.lifetimeAllMean,
          backgroundColor: ["rgba(116, 185, 255, 0.4)"],
          borderColor: ["rgba(116, 185, 255, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
        {
          label: "中央値",
          data: data.lifetimeAllMed,
          backgroundColor: ["rgba(0, 184, 169, 0.4)"],
          borderColor: ["rgba(0, 184, 169, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          // beginAtZero: true
        },
      },
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label += `: ${context.parsed.y}日`;
              }

              return label;
            },
          },
        },
      },
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}

// MODULE 009 - GRADE DISTRIBUTION
function module009(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-009",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "顧客層(月)");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_009",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      barGraph009(graph, data);
    },
  });
}

// MODULE 009 - STACKED BAR GRAPH
function barGraph009(targetContainer, data) {
  let thisModule = document.getElementById("module-009"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = data.labels[0].slice(0, 5);
  let endDate = data.labels[data.labels.length - 1].slice(0, 5);

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate.slice(0, 2)}年${startDate.slice(
    3,
    5
  )}月 ~ ${endDate.slice(0, 2)}年${endDate.slice(3, 5)}月`;
  titleContainer.appendChild(subtitle);

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                let groupPercentage = Math.round(
                  (context.parsed.y / data.totals[context.dataIndex]) * 100
                );
                label += `: ${context.parsed.y}人 / 計: ${
                  data.totals[context.dataIndex]
                }人 (${groupPercentage}%)`;
              }

              return label;
            },
          },
        },
      },
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}

// MODULE 010 - AVERAGE NUMBER OF LESSONS PER STUDENT
function module010(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-010",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "レッスン数 / 生徒（月）");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_010",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      lineGraph010(graph, data);
    },
  });
}

// MODULE 010 - LINE GRAPH
function lineGraph010(targetContainer, data) {
  let thisModule = document.getElementById("module-010"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = `${data.year[0].slice(2, 4)}年${data.month[0]}月`;
  let endDate = `${data.year[data.year.length - 1].slice(2, 4)}年${
    data.month[data.month.length - 1]
  }月`;

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate} ~ ${endDate}`;
  titleContainer.appendChild(subtitle);

  var shortLabels = [];
  var i;
  for (i = 0; i < data.year.length; i++) {
    shortLabels.push(`${data.year[i].slice(2, 4)}-${data.month[i]}`);
  }

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: shortLabels,
      datasets: [
        {
          label: "平均",
          data: data.lessonsPerStudent,
          backgroundColor: ["rgba(116, 185, 255, 0.4)"],
          borderColor: ["rgba(116, 185, 255, 0.8)"],
          borderWidth: 1,
          radius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          // beginAtZero: true
        },
      },
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";

              if (label) {
                label +=
                  `: ${context.parsed.y}`.slice(0, 6) +
                  ` (${data.studentCount[context.dataIndex]}人)`;
              }

              return label;
            },
          },
        },
      },
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}

// MODULE 011 - STUDENTS IN/OUT
function module011(startDate, endDate) {
  document.body.classList.add("disable-all-clicks"); // disables all clicks to body and child elements

  let modulesContainer = document.getElementById("modules-container"); // container for all modules

  // PRIMARY CONTAINER
  let primaryContainer = generateNewElement(
    "div",
    "module-primary-container",
    "module-011",
    ""
  );
  modulesContainer.appendChild(primaryContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER
  let titleContainer = generateNewElement("div", "title-container", "", "");
  primaryContainer.appendChild(titleContainer);

  // PRIMARY CONTAINER - TITLE CONTAINER - TITLE
  let title = generateNewElement("div", "title", "", "入学・退学（月）");
  titleContainer.appendChild(title);

  // PRIMARY CONTAINER - GRAPH CONTAINER
  let graphContainer = generateNewElement("div", "graph-container", "", "");
  primaryContainer.appendChild(graphContainer);

  // PRIMARY CONTAINER - GRAPH CONTAINER - GRAPH
  let graph = generateNewElement("canvas", "graph", "", "");
  graphContainer.appendChild(graph);

  // AJAX
  let csrfToken = document.getElementById("page-meta").dataset.csrf_token; // get CSRF token

  parameters = {
    csrfmiddlewaretoken: csrfToken,
    parameter: "module_011",
    start_date: startDate,
    end_date: endDate,
  };

  // queries database
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "analytics_api",
    data: parameters,
    success: function (data) {
      barChart011(graph, data);
    },
  });
}

// MODULE 011 - BAR CHART
function barChart011(targetContainer, data) {
  let thisModule = document.getElementById("module-011"); // get module container
  let titleContainer = thisModule.getElementsByClassName("title-container")[0]; // get title container

  let startDate = `${data.year[0].slice(2, 4)}年${data.month[0]}月`;
  let endDate = `${data.year[data.month.length - 1].slice(2, 4)}年${
    data.month[data.month.length - 1]
  }月`;

  let subtitle = generateNewElement("div", "subtitle", "", "");
  subtitle.innerHTML += `${startDate} ~ ${endDate}`;
  titleContainer.appendChild(subtitle);

  let shortDates = [];
  var i;
  for (i = 0; i < data.year.length; i++) {
    let monthWithZero = 0 + data.month[i];
    shortDates.push(`${data.year[i].slice(2, 4)}-${monthWithZero.slice(-2)}`);
  }

  const ctx = targetContainer.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: shortDates,
      datasets: [
        {
          label: "入学",
          identifier: "positive",
          data: data.studentsInCount,
          backgroundColor: ["rgba(0, 184, 169, .8)"],
          borderColor: ["rgba(255, 255, 255, .8)"],
          hoverBorderColor: ["rgba(0, 184, 169, 1)"],
          borderWidth: 1,
          radius: 4,
        },
        {
          label: "退学",
          identifier: "negative",
          data: data.studentsOutCount,
          backgroundColor: ["rgba(246, 65, 108, .8)"],
          borderColor: ["rgba(255, 255, 255, .8)"],
          hoverBorderColor: ["rgba(246, 65, 108, 1)"],
          borderWidth: 1,
          radius: 4,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              let identifier = context.dataset.identifier;

              if (label && identifier == "positive") {
                label = data.studentsIn[context.dataIndex].map((x) => {
                  return ` ${x[0]}, ${x[1]}`;
                });
              } else {
                label = data.studentsOut[context.dataIndex].map((x) => {
                  return ` ${x[0]}, ${x[1]}`;
                });
              }

              return label;
            },
          },
        },
      },
    },
  });

  document.body.classList.remove("disable-all-clicks"); // re-enables all clicks to body and child elements
}
