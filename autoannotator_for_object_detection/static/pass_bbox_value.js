
let image_size_2x = false
let image_size_4x = false
let image_size_normal = true

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
                "image_size_2x": image_size_2x,
                "image_size_4x": image_size_4x,
                "image_size_normal": image_size_normal,
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
                bboxes.forEach(bbox => drawBbox(bbox));
            },
            error: function(error) {
                console.error("Error fetching list:", error);
            }
        });
    });
});

$(document).ready(function() {
    $('#Zoom4X').click(function() {
        // AJAX POST request to Django
        $.ajax({
            type: "POST",
            dataType: 'json', 
            url: "Zoom4X/",  // Django URL to fetch the list
            headers: {
                "X-CSRFToken": "{{ csrf_token }}"  // CSRF token for POST requests
            },
            data: {
                    currentImageIndex: currentImageIndex,
                    csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()  // CSRF token for Django
                    },
            success: function(response) {
                image_size_2x = false;
                handleSize = 12;
                hoverHandleSize = 12;
                image_size_4x = true;
                image_size_normal = false;
                img.src = response.image_path
                imgWidth = 1280*4;
                imgHeight = 720*4;
                console.log("Image Width:", img.naturalWidth);
                console.log("Image Height:", img.naturalHeight);
                bboxes = response.bbox_list;
                bboxes = Object.values(bboxes);
                console.log("zoom4x zoom4x zoom4x zoom4x zoom4x zoom4x zoom4x zoom4x bboxes : ",bboxes);
                bboxes.forEach(bbox => drawBbox(bbox));
            },
            error: function(error) {
                console.error("Error fetching list:", error);
            }
        });
    });
});



$(document).ready(function() {
    $('#Zoom2X').click(function() {
        // AJAX POST request to Django
        $.ajax({
            type: "POST",
            dataType: 'json', 
            url: "Zoom2X/",  // Django URL to fetch the list
            headers: {
                "X-CSRFToken": "{{ csrf_token }}"  // CSRF token for POST requests
            },
            data: {
                    currentImageIndex: currentImageIndex,
                    csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()  // CSRF token for Django
                    },
            success: function(response) {
                handleSize = 4*2;
                hoverHandleSize = 4*2;
                image_size_2x = true;
                image_size_4x = false;
                image_size_normal = false;
                img.src = response.image_path
                imgWidth = 1280*2;
                imgHeight = 720*2;
                console.log("Image Width:", img.naturalWidth);
                console.log("Image Height:", img.naturalHeight);
                console.log("zoom2x zoom2x zoom2x zoom2x zoom2x zoom2x zoom2x zoom2x");
                bboxes = response.bbox_list;
                bboxes = Object.values(bboxes);
                bboxes.forEach(bbox => drawBbox(bbox));
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
        image_size_2x = false;
        image_size_4x = false;
        handleSize = 4;
        hoverHandleSize = 4;
        image_size_normal = true;
        imgWidth = 1280;
        imgHeight = 720;
        has_selected_bbox = false
        currentImageIndex += 1;
        console.log("Next image index:", currentImageIndex);
        sendImageIndexToDjango(currentImageIndex);  // Send updated index to Django
    });
    // Previous Button Click: Decrease the index
    $('#prevBtn').click(function() {
        if (currentImageIndex > 0) {
            handleSize = 4;
            hoverHandleSize = 4;
            image_size_2x = false;
            image_size_4x = false;
            image_size_normal = true;
            imgWidth = 1280;
            imgHeight = 720;
            has_selected_bbox = false;
            currentImageIndex -= 1;
            console.log("Previous image index:", currentImageIndex);
            sendImageIndexToDjango(currentImageIndex);  // Send updated index to Django
        } else {
            console.log("Already at the first image.");
        }
    });

    $('#Normal').click(function() {
        if (currentImageIndex > 0) {
            handleSize = 4;
            hoverHandleSize = 4;
            image_size_2x = false;
            image_size_4x = false;
            image_size_normal = true;
            imgWidth = 1280;
            imgHeight = 720;
            has_selected_bbox = false;
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


