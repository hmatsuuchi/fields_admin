function deleteCustomer(csrfToken, customerId) {
    var post_data = {};
    post_data.csrfmiddlewaretoken = csrfToken;
    post_data.customer_id = customerId;

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "/customer/delete_confirmed",
        data: post_data,
        success: function () {
            window.location.href = "/customer/browse";
        }
    })
}