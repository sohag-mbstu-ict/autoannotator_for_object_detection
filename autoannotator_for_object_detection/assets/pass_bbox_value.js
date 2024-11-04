
$(document).ready(function() {
    // Set up button click handler
    $('#SendBbox').click(function() {
        // Define the value you want to send
        console.log("currentBbox ======= : ",bboxes)
        const valueToSend = JSON.stringify(bboxes);
        
        // AJAX request
        $.ajax({
            type: "POST",
            url: "ajax-endpoint/",  // URL to send request to
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

