function login(csrfToken, pageRedirect) {
    username = document.getElementById('username').value;
    password = document.getElementById('password').value;

    var user_data = {};
    user_data.csrfmiddlewaretoken = csrfToken;
    user_data.username = username;
    user_data.password = password;

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/user_profile/login_authenticate/",
        data: user_data,
        success: function (data) {
            if ( data['status_response'] == true ) {
                window.location.href = pageRedirect;
            } else {
                window.location.href = "/user_profile/login" + "?next=" + pageRedirect;
            }
        }
    })
}

function enterPress(csrfToken, pageRedirect) {
    var inputUsername = document.getElementById('username');
    var inputPassword = document.getElementById('password');

    inputUsername.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            login(csrfToken, pageRedirect);
        }
    });
    inputPassword.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            login(csrfToken, pageRedirect);
        }
    });
}