// const canvas = document.getElementById('myCanvas');
// const ctx = canvas.getContext('2d');

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const img = new Image();
img.src = "/static/13.png"; // Use Django's static tag to load the image

const imgWidth = 1280;
const imgHeight = 700;

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
let startX, startY;
let isDrawing = false;
let isResizing = false;
let currentBbox = null;
let bboxes = []; // Store all bounding boxes
let selectedHandle = null;
let drawMode = false; // To track whether the "Draw BBox" button is active
let hoveredHandle = null; // To track the currently hovered handle
const handleSize = 10;
const hoverHandleSize = 15; // Larger size for hovered handle

// Button to enable drawing bbox
const drawBboxBtn = document.getElementById('drawBboxBtn');
drawBboxBtn.addEventListener('click', () => {
    isDrawing = false;
    isResizing = false;
    // currentBbox = null;
    bboxes = []; // Store all bounding boxes
    selectedHandle = null;
    drawMode = false; // To track whether the "Draw BBox" button is active
    hoveredHandle = null; // To track the currently hovered handle
    if (!isDrawing && !drawMode) { // Enable drawing only if not already drawing
        drawMode = true; // Enable draw mode
        // console.log("Draw Mode Enabled");
    } else if (isDrawing) {
        finalizeBbox(); // Finalize the current bbox
        drawMode = false; // Disable drawing mode after finalizing
        // console.log("Draw Mode Disabled");
    }
});


