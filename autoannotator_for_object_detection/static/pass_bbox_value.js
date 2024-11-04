
$(document).ready(function() {
    // Set up button click handler
    $('#SendBbox').click(function() {
        // Define the value you want to send
        console.log("currentBbox ======= : ",bboxes)
        const valueToSend = JSON.stringify(bboxes);
        
        // AJAX request
        $.ajax({
            type: "POST",
            url: "pass_bbox_to_server/",  // URL to send request to
            data: {
                "value": valueToSend,
                "csrfmiddlewaretoken": "{{ csrf_token }}"  // CSRF token for security
            },
            
            success: function(response) {
                // Update the responseMessage div with the server response
                $('#responseMessage').text(response.message);
            },
            error: function(xhr) {
                // Handle error
                $('#responseMessage').text("An error occurred: " + xhr.responseJSON.error);
            }
        });
    });
});


$(document).ready(function() {
    $('#fetchBbox').click(function() {
        // AJAX POST request to Django
        $.ajax({
            type: "GET",
            dataType: 'json', 
            url: "pass_bbox_to_browser/",  // Django URL to fetch the list
            headers: {
                "X-CSRFToken": "{{ csrf_token }}"  // CSRF token for POST requests
            },
            
            success: function(response) {
                // Access the list from the response
                console.log("1111111111111111111111111111111111111111111");
                bboxes = response.my_list;
                bboxes = Object.values(bboxes);
                bboxes.forEach(bbox => drawBbox(bbox));
                console.log("222222222222222222List from Django:", bboxes);

            },
            error: function(error) {
                console.error("Error fetching list:", error);
            }
        });
    });
});



