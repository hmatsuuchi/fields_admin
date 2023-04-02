function deleteNote(csrfToken, noteId) {
    parameters = {
        'csrfmiddlewaretoken': csrfToken, // CSRF token
        'parameter': 'DELETE', // delete API call
        'note_id' : noteId, // id of note to be deleted
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "../notes_api",
        data: parameters,
        success: function (data) {
            let urlParams = window.location.search; // gets search parameters
            let urlParamsAll = new URLSearchParams(urlParams); // parses search parameters
            let returnLink = urlParamsAll.get('return_link'); // gets return link
            window.location.replace(returnLink); // redirects to return link
        }
    })
}