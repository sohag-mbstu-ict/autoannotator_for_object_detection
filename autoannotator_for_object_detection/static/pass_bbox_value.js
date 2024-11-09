
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
    // Set up button click handler
    $('#Save_Bbox_with_Pretrained_Model').click(function() {
        // Define the value you want to send
        console.log("currentBbox ======= : ",typeof(currentBbox),currentBbox)
        const valueToSend = JSON.stringify(bboxes);
        
        // AJAX request
        $.ajax({
            type: "POST",
            url: "Save_Bbox_with_Pretrained_Model/",  // URL to send request to
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
    $('#resetDetection').click(function() {
        // AJAX POST request to Django
        $.ajax({
            type: "POST",
            dataType: 'json', 
            url: "resetDetection/",  // Django URL to fetch the list
            headers: {
                "X-CSRFToken": "{{ csrf_token }}"  // CSRF token for POST requests
            },
            data: {
                    currentImageIndex: currentImageIndex,
                    csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()  // CSRF token for Django
                    },
            success: function(response) {
                // Access the list from the response
                bboxes = response.bbox_list;
                bboxes = Object.values(bboxes);
                console.log("111111111111111111List from Django:", bboxes,"currentImageIndex : ",currentImageIndex);
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
                currentImageIndex = response.current_image_index;
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
        has_selected_bbox = false
        currentImageIndex += 1;
        console.log("Next image index:", currentImageIndex);
        sendImageIndexToDjango(currentImageIndex);  // Send updated index to Django
    });
    // Previous Button Click: Decrease the index
    $('#prevBtn').click(function() {
        if (currentImageIndex > 0) {
            has_selected_bbox = false
            currentImageIndex -= 1;
            console.log("Previous image index:", currentImageIndex);
            sendImageIndexToDjango(currentImageIndex);  // Send updated index to Django
        } else {
            console.log("Already at the first image.");
        }
    });
});

//                              For refresh the page
// $(document).ready(function() {
//     // Send a message to the server when the page is refreshed
//     console.log("refreeeeeeeeeeeeeeeeeeeeeeeeeeeesh")
//     $.ajax({
//         url: '/update_image_index/',  // URL configured in urls.py
//             method: 'POST',
//             data: {
//                 currentImageIndex: currentImageIndex,
//                 csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()  // CSRF token for Django
//             },
//             success: function(response) {
//                 console.log("Response from Djangoooooooooo:", response.image_path);
//                 img.src = response.image_path;
//                 current_image_index = response.current_image_index;
//                 console.log("Response from current_image_index:", current_image_index);
//                 bboxes = response.bbox_list;
//                 bboxes = Object.values(bboxes);
//                 bboxes.forEach(bbox => drawBbox(bbox));
//             },
//         error: function(xhr, status, error) {
//             console.error("Error sending message:", error);
//         }
//     });
// });


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


$(document).ready(function() {
    $('#DeleteBbox').click(function() {
        // AJAX POST request to Django
        $.ajax({
            type: "POST",
            dataType: 'json', 
            url: "DeleteBbox/",  // Django URL to fetch the list
            headers: {
                "X-CSRFToken": "{{ csrf_token }}"  // CSRF token for POST requests
            },
            data: {
                    currentImageIndex: currentImageIndex,
                    selected_bbox_x : selected_bbox_x,
                    selected_bbox_y:selected_bbox_y,
                    csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()  // CSRF token for Django
                    },
            success: function(response) {
                // Access the list from the response
                has_selected_bbox = response.has_selected_bbox
                bboxes = response.bbox_list;
                bboxes = Object.values(bboxes);
                console.log("111111111111111111List from Django:", bboxes,"currentImageIndex : ",currentImageIndex);
                bboxes.forEach(bbox => drawBbox(bbox));
                console.log("222222222222222222List from Django:", bboxes);
            },
            error: function(error) {
                console.error("Error fetching list:", error);
            }
        });
    });
});



// jQuery to change button color on click
$('nav button').click(function() {
    $(this).css('background-color', 'lightblue');
    
    // Optional: Revert color after a short delay
    setTimeout(() => {
        $(this).css('background-color', '');
    }, 200); // 200ms delay
});


