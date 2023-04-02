// function accessLog(csrfToken, currentUrl) {
//     $.ajax({
//         type: "POST",
//         dataType: "json",
//         url: "/customer/customer_access_log",
//         data: {
//             'csrfmiddlewaretoken': csrfToken,
//             'current_url': currentUrl,
//         },
//         success: function (data) {}
//     })
// }

function jumpToClass() {
    let params = new URLSearchParams(location.search);
    jumpToId = params.get('jump_to_class');

    if (jumpToId) {
        let element = document.getElementById(`class-${jumpToId}`);
        if (element) {
            element.classList.add('jump-to');

            element.scrollIntoView(); // scrolls the element into view
            const windowScrollPosition = window.scrollY;
            window.scroll(0, windowScrollPosition - 200); // offsets the scroll positon to account for the navigation bars.
        }
    }
}