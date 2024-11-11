// const canvas = document.getElementById('myCanvas');
// const ctx = canvas.getContext('2d');
let currentImageIndex = null

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const img = new Image();
// img.src = "/static/13.png"; // Use Django's static tag to load the image

// fetch the images
$(document).ready(function() {
    // Access the image path from the `data-image-path` attribute on the <body> tag
    img.src = $('p').data('image-path');
    currentImageIndex = $('p').data('image-index');
    console.log("currentImageIndex : ",currentImageIndex)
});


let imgWidth = 1280;
let imgHeight = 720;

// Once the image is loaded, draw it on the canvas and set up the event listeners
img.onload = function () {
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    drawImageAndBboxes();  // Draw the image and any existing bounding boxes
};

// Function to re-draw the image and any bounding boxes on the canvas
function drawImageAndBboxes() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Re-draw the image
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

    // Draw existing bounding boxes
    bboxes.forEach(bbox => drawBbox(bbox));
}

// Function to draw a single bounding box
function drawBbox(bbox) {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(bbox.startX, bbox.startY, bbox.width, bbox.height);
}


let mouseX, mouseY;
let x1,x2,y1,y2
let has_selected_bbox = false
let selected_bbox_x = null
let selected_bbox_y = null
let bbox_draw_mode_flag = false;
let startX, startY;
let isDrawing = false;
let isResizing = false;
let currentBbox = null;
let bboxes = []; // Store all bounding boxes
let selectedHandle = null;
let drawMode = false; // To track whether the "Draw BBox" button is active
let hoveredHandle = null; // To track the currently hovered handle
let handleSize = 4;
let hoverHandleSize = 4; // Larger size for hovered handle

// Button to enable drawing bbox
const drawBboxBtn = document.getElementById('drawBboxBtn');
    drawBboxBtn.addEventListener('click', () => {
    console.log("Draw Mode clicked clicked clicked clicked");
    mouseX, mouseY = null,null;
    startX, startY = null,null;
    selectedHandle = null;
    isDrawing = false;
    isResizing = false;
    has_selected_bbox = false
    selectedHandle = null;
    currentBbox = null;
    drawMode = false; // To track whether the "Draw BBox" button is active
    // hoveredHandle = null; // To track the currently hovered handle
    if (!isDrawing && !drawMode) { // Enable drawing only if not already drawing
        drawMode = true; // Enable draw mode
        bbox_draw_mode_flag = true;
        // console.log("Draw Mode Enabled");
    } else if (isDrawing) {
        finalizeBbox(); // Finalize the current bbox
        drawMode = false; // Disable drawing mode after finalizing
        // console.log("Draw Mode Disabled");
    }
});


// Event listener for mouse movement
canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    console.log("has_selected_bbox has_selected_bbox has_selected_bbox : ",has_selected_bbox)
    

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
    // get selected bbox using mouse clicked 
    if(currentBbox!==null){
        x1 = currentBbox.startX
        y1 = currentBbox.startY
        x2 = currentBbox.startX + currentBbox.width
        y2 = currentBbox.startY + currentBbox.height
        console.log("x1,y1,x2,y2 : ",x1,y1,x2,y2)
        if ((mouseX >= x1 && mouseX <= x2) && (mouseY >= y1 && mouseY <= y2)) {
            document.getElementById("myCanvas").addEventListener("click", getSelectedBbox);
            function getSelectedBbox() {
                has_selected_bbox = true;
                selected_bbox_x = x1;
                selected_bbox_y = y1;
                }
        }
    }
    // print selected when user select any bbox using mouse click
    if(has_selected_bbox){
        ctx.font = '16px Arial';
        ctx.fillStyle = 'yellow';
        ctx.fillText('selected', selected_bbox_x, selected_bbox_y-17);
        }
    // console.log("Inside draw_bbox.js  bboxes 87 : ",bboxes)
    // Draw all bboxes
    bboxes.forEach(bbox => drawBbox(bbox));

    if (isDrawing && currentBbox) {
        // Update the dimensions as the user drags to draw the box
        currentBbox.width = mouseX - startX;
        currentBbox.height = mouseY - startY;
        

        // Draw the current bbox being created
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, currentBbox.width, currentBbox.height);
    } else if (isResizing && currentBbox) {
        resizeBbox();
    }

    // Check for hover over handles
    if (!isDrawing) {
        getHandleAtPosition(mouseX, mouseY);
    }

    // Highlight the hovered handle
    if (hoveredHandle) {
        ctx.fillStyle = 'red';
        ctx.fillRect(hoveredHandle.x - hoverHandleSize / 2, hoveredHandle.y - hoverHandleSize / 2, hoverHandleSize, hoverHandleSize);
    }

    // Draw guides (dashed lines)
    drawGuides(mouseX, mouseY);
});

// Event listener for mousedown to start drawing or resizing
canvas.addEventListener('mousedown', function (e) {
    if (drawMode && !isDrawing) { // Allow drawing only if draw mode is active and we are not already drawing
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        // Start drawing a new bbox
        isDrawing = true;
        startX = mouseX;
        startY = mouseY;
        currentBbox = { startX: startX, startY: startY, width: 0, height: 0, handles: [] };
        // console.log("currentBbox currentBbox currentBbox : ",currentBbox)
    } else if (hoveredHandle) {
        // Start resizing the bbox
        isResizing = true;
        selectedHandle = hoveredHandle;
    }
});

// Event listener for mouseup to finalize the bbox or resizing
canvas.addEventListener('mouseup', function () {
    if (isDrawing) {
        finalizeBbox();
    }
    isResizing = false;
    selectedHandle = null;
    hoveredHandle = null; // Reset hovered handle on mouseup
    // console.log("currentBbox inside mouseup : ",currentBbox)
    currentBbox.handles = getBboxHandles(currentBbox)
    // ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
});

// Function to finalize the bbox and store it
function finalizeBbox() {
    isDrawing = false;
    if (currentBbox) {
        currentBbox.handles = getBboxHandles(currentBbox); // Store the handles of the new bbox
        // console.log("11111111111111111111111111111 currentBbox : ",currentBbox)
        bboxes.push(currentBbox); // Add the new bbox to the list of bboxes
        

    }
    currentBbox = null;
    drawMode = false; // Disable drawing mode after finishing
    // console.log("drawMode inside finalizeBbox : ", drawMode);
}


// Function to draw the bounding box
function drawBbox(bbox) {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.strokeRect(bbox.startX, bbox.startY, bbox.width, bbox.height);

    // Draw the resize handles
    // currentBbox = bbox //####################################  asume
    drawResizeHandles(bbox);
}

// Function to draw resize handles (corner + middle handles)
function drawResizeHandles(bbox) {
    ctx.fillStyle = 'green';
    bbox.handles.forEach(handle => {
        ctx.fillStyle = (handle === hoveredHandle) ? 'red' : 'green';
        ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        // currentBbox = bbox
    });
    

    // console.log("selectedHandle ------- : ",selectedHandle)
    // resizeBbox()
}

// Function to get the corner and middle points (resize handles)
function getBboxHandles(bbox) {
    // console.log("inside getBboxHandles   ------- : ",bbox)
    const { startX, startY, width, height } = bbox;
    // drawResizeHandles(bbox);
    return [
        { x: startX, y: startY },                           // Top-left
        { x: startX + width, y: startY },                   // Top-right
        { x: startX, y: startY + height },                  // Bottom-left
        { x: startX + width, y: startY + height },          // Bottom-right
        { x: startX + width / 2, y: startY },               // Top-middle
        { x: startX + width, y: startY + height / 2 },      // Right-middle
        { x: startX + width / 2, y: startY + height },      // Bottom-middle
        { x: startX, y: startY + height / 2 }               // Left-middle
    ];
}

// Function to check if mouse is over a handle
function getHandleAtPosition(x, y) {
    hoveredHandle = null; // Reset hovered handle before checking
    // Check currentBbox if it's being drawn or resized
    if (currentBbox) {
        for (let handle of currentBbox.handles) {
            if (x >= handle.x - handleSize / 2 && x <= handle.x + handleSize / 2 &&
                y >= handle.y - handleSize / 2 && y <= handle.y + handleSize / 2) {
                hoveredHandle = handle;
                return handle;
            }
        }
    }

    // Check if mouse is over any of the handles of existing bboxes
    for (let bbox of bboxes) {
        for (let handle of bbox.handles) {
            if (x >= handle.x - handleSize / 2 && x <= handle.x + handleSize / 2 &&
                y >= handle.y - handleSize / 2 && y <= handle.y + handleSize / 2) {
                hoveredHandle = handle;
                currentBbox = bbox
                // console.log("Inside getHandleAtPosition hoveredHandle : ",hoveredHandle)
                return handle;
            }
        }
    }
    return null;
}

function resizeBbox() {
    if (!selectedHandle || !currentBbox) return;

    const { startX, startY, width, height } = currentBbox;

    // Depending on which handle is selected, adjust the bbox dimensions and position
    if (selectedHandle === currentBbox.handles[0]) { // Top-left handle
        currentBbox.startX = mouseX;
        currentBbox.startY = mouseY;
        currentBbox.width = width + (startX - mouseX);
        currentBbox.height = height + (startY - mouseY);

    } else if (selectedHandle === currentBbox.handles[1]) { // Top-right handle
        currentBbox.startY = mouseY;
        currentBbox.width = mouseX - startX;
        currentBbox.height = height + (startY - mouseY);
    } else if (selectedHandle === currentBbox.handles[2]) { // Bottom-left handle
        currentBbox.startX = mouseX;
        currentBbox.width = width + (startX - mouseX);
        currentBbox.height = mouseY - startY;
    } else if (selectedHandle === currentBbox.handles[3]) { // Bottom-right handle
        currentBbox.width = mouseX - startX;
        currentBbox.height = mouseY - startY;
    } else if (selectedHandle === currentBbox.handles[4]) { // Top-middle handle
        currentBbox.startY = mouseY;
        currentBbox.height = height + (startY - mouseY);
    } else if (selectedHandle === currentBbox.handles[5]) { // Right-middle handle
        currentBbox.width = mouseX - startX;
    } else if (selectedHandle === currentBbox.handles[6]) { // Bottom-middle handle
        currentBbox.height = mouseY - startY;
    } else if (selectedHandle === currentBbox.handles[7]) { // Left-middle handle
        currentBbox.startX = mouseX;
        currentBbox.width = width + (startX - mouseX);
    }
    // console.log("currentBbox ======= : ",currentBbox)
    
    // Update the bbox handles after resizing
    // currentBbox.handles = getBboxHandles(currentBbox);
}

ctx.font = '16px Arial';
ctx.fillStyle = 'red';
ctx.fillText('draw_bbox', 10, 10);


// Function to draw guides (optional dashed lines for precision)
function drawGuides(x, y) {
    // Display the "draw_bbox" text near the cursor
    if(drawMode){
        ctx.font = '16px Arial';
        ctx.fillStyle = 'blue';
        ctx.fillText('draw_bbox', mouseX + 10, mouseY - 10);  // Position text offset from cursor
        }
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'gray';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
    ctx.setLineDash([]);
}
