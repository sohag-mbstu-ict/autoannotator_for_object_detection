
$(document).ready(function() {
    // Set up button click handler
    $('#SaveBbox').click(function() {
        // Define the value you want to send
        console.log("currentBbox ======= : ",typeof(currentBbox),currentBbox)
        const valueToSend = JSON.stringify(bboxes);
        
        // AJAX request
        $.ajax({
            type: "POST",
            url: "Save_Bbox/",  // URL to send request to
            data: {
                "value": valueToSend,
                "currentImageIndex":currentImageIndex,
                "currentBbox":JSON.stringify(currentBbox),
                "bbox_draw_mode_flag":bbox_draw_mode_flag,
                "csrfmiddlewaretoken": "{{ csrf_token }}"  // CSRF token for security
            },
            success: function(response) {
                bboxes = response.bbox_list;
                bboxes = Object.values(bboxes);
                bboxes.forEach(bbox => drawBbox(bbox));
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


$(document).ready(function() {
    currentImageIndex = $('p').data('image-index');
    function sendImageIndexToDjango(index) {
        $.ajax({
            url: '/update_image_index/',  // URL configured in urls.py
            method: 'POST',
            data: {
                currentImageIndex: index,
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()  // CSRF token for Django
            },
            success: function(response) {
                console.log("Response from Django:", response.image_path);
                img.src = response.image_path
                bboxes = response.bbox_list;
                bboxes = Object.values(bboxes);
                bboxes.forEach(bbox => drawBbox(bbox));
            },
            error: function(xhr, status, error) {
                console.error("Error:", error);
            }
        });
    }
    // Next Button Click: Increase the index
    $('#nextBtn').click(function() {
        currentImageIndex += 1;
        console.log("Next image index:", currentImageIndex);
        sendImageIndexToDjango(currentImageIndex);  // Send updated index to Django
    });
    // Previous Button Click: Decrease the index
    $('#prevBtn').click(function() {
        if (currentImageIndex > 0) {
            currentImageIndex -= 1;
            console.log("Previous image index:", currentImageIndex);
            sendImageIndexToDjango(currentImageIndex);  // Send updated index to Django
        } else {
            console.log("Already at the first image.");
        }
    });
});


$(document).ready(function() {
    // Function to send `currentImageIndex` to Django
    function sendCurrentImageIndexForAutoAnnotation(index) {
        $.ajax({
            url: '/auto_Annotate_Next_N_Frames/',  // URL of the Django view handling the AJAX request
            method: 'POST',
            data: {
                currentImageIndex: index,  // Send currentImageIndex as POST data
                csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()  // CSRF token for security
            },
            success: function(response) {
                console.log("Response from Django:", response);  // Handle success response
            },
            error: function(xhr, status, error) {
                console.error("Error:", error);  // Handle error response
            }
        });
    }
    // Annotate Batch Button Click: Send currentImageIndex to Django
    $('#Annotate_Batch_Img').click(function() {
        console.log("Sending currentImageIndex:", currentImageIndex);
        sendCurrentImageIndexForAutoAnnotation(currentImageIndex);  // Call the function with currentImageIndex
    });
});



