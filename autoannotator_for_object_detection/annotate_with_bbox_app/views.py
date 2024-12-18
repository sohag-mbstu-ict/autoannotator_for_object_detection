from django.http import JsonResponse  # Import JsonResponse
from django.shortcuts import render
import json
import cv2
import base64
from django.conf import settings
from ultralytics import YOLO
import os
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt  # Import csrf_exempt
from annotate_with_bbox_app.yolo_format import get_Data_In_Yolo_Format
from annotate_with_bbox_app.database import database_For_BBox_Annotation

from rest_framework import viewsets
from .models import Video
from .serializers import VideoSerializer

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer


yolo_data_obj = get_Data_In_Yolo_Format()
model_detection = YOLO('yolov8x.pt')
database_obj = database_For_BBox_Annotation()

def upload_page(request):
    return render(request, 'upload.html')  # Assumes `upload.html` is in your templates folder

def upload_video(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        video_file = request.FILES.get('video_file')

        if title and video_file:
            # Create and save a new Video instance
            video = Video(title=title, video_file=video_file)
            video.save()
            return HttpResponse("Video uploaded successfully!")
        else:
            return HttpResponse("Failed to upload video. Please provide all required fields.")
    return render(request, 'upload.html')  # 'upload.html' is the template containing the form

def draw_bbox(request):
    # last_video = Video.objects.order_by('-id').first()
    # last_video.video_file.name
    # if last_video:
    #     # Construct the full path to the video file
    #     video_path = last_video.video_file.name
    # print("video_path : ",video_path)
    video_path = "media/voleyball.mp4"
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    while True:
        ret, frame = cap.read()
        frame_count=frame_count+1
        # if(frame_count<=15):
        #     continue 
        # if(frame_count>2):
        break 
    image_path = "media/images/" + str(frame_count) + ".png"
    success = cv2.imwrite(image_path, frame)
    cv2.imshow("s",frame)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    # Encode the image to bytes and then to Base64
    _, buffer = cv2.imencode('.jpg', frame)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    return render(request, 'draw_bbox.html', {'image': image_base64,'image_index': frame_count})


@csrf_exempt  # You may want to configure CSRF token handling for production
def Save_Bbox(request):
    yolo_data_obj = get_Data_In_Yolo_Format()
    if request.method == "POST":
        # Get the value sent via AJAX
        bboxes_handle = request.POST.get("value")
        currentImageIndex = request.POST.get("currentImageIndex")
        image_size_2x = request.POST.get("image_size_2x")
        image_size_4x = request.POST.get("image_size_4x")
        image_size_normal = request.POST.get("image_size_normal")

        txt_file_path = "media/labels/" + currentImageIndex + ".txt"
        # Process the value (optional)
        bboxes_handle = json.loads(bboxes_handle)
        yolo_data_obj.save_BBox_On_Text_File(txt_file_path,bboxes_handle,image_size_2x,image_size_4x)
        bboxes = yolo_data_obj.get_BBox_From_Text_File(txt_file_path)
        bboxes = yolo_data_obj.convert_Yolo_Format_To_BBox_Handles(bboxes)
        return JsonResponse({"bbox_list": bboxes})
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt  # You may want to configure CSRF token handling for production
def Save_Bbox_with_Pretrained_Model(request):
    yolo_data_obj = get_Data_In_Yolo_Format()
    if request.method == "POST":
        # Get the value sent via AJAX
        bboxes_handle = request.POST.get("value")
        currentImageIndex = request.POST.get("currentImageIndex")
        bbox_draw_mode_flag = request.POST.get("bbox_draw_mode_flag")
        currentBbox = request.POST.get("currentBbox")

        txt_file_path = "media/labels/" + currentImageIndex + ".txt"
        image_path    = "media/images/" + currentImageIndex + ".png"
        # Process the value (optional)
        bboxes_handle = json.loads(bboxes_handle)
        # print("bboxes_handle : ",bboxes_handle)
        if(bbox_draw_mode_flag=='true' and len(currentBbox)>0):
            yolo_data_obj.detect_Missing_Object(image_path,model_detection,bboxes_handle)
        yolo_data_obj.save_BBox_On_Text_File(txt_file_path,bboxes_handle)
        bboxes = yolo_data_obj.get_BBox_From_Text_File(txt_file_path)
        bboxes = yolo_data_obj.convert_Yolo_Format_To_BBox_Handles(bboxes)
        return JsonResponse({"bbox_list": bboxes})
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt  # Only for testing without CSRF; remove in production if possible
def resetDetection(request):
    if request.method == 'POST':
        # Get the `currentImageIndex` from the AJAX request
        current_image_index = int(request.POST.get('currentImageIndex', 0))
        print("update_image_index  current_image_index : ",current_image_index)
        current_image_index
        image_path    = "media/images/" + str(current_image_index) + ".png"
        txt_file_path = "media/labels/" + str(current_image_index) + ".txt"
        results = yolo_data_obj.get_Detections(image_path,model_detection)
        # cv2.imshow("s",results[0].plot())
        # cv2.waitKey(0)
        # cv2.destroyAllWindows()
        bboxes = results[0].boxes.xyxy.tolist()
        bboxes = yolo_data_obj.remove_Detections_Based_On_Court_Coordinates(bboxes)
        yolo_data_obj.save_Bbox_From_YOLO_model(bboxes,txt_file_path)
        bboxes = yolo_data_obj.get_BBox_From_Text_File(txt_file_path)
        bboxes = yolo_data_obj.convert_Yolo_Format_To_BBox_Handles(bboxes)
        return JsonResponse({'image_path': image_path, 'bbox_list': bboxes})
    return JsonResponse({'error': 'Invalid request method'}, status=400)
    

@csrf_exempt  # Only for testing without CSRF; remove in production if possible
def Zoom_4X(request):
    if request.method == 'POST':
        # Get the `currentImageIndex` from the AJAX request
        current_image_index = int(request.POST.get('currentImageIndex', 0))
        print("update_image_index  current_image_index : ",current_image_index)
        current_image_index
        image_path    = "media/images/" + str(current_image_index) + ".png"
        txt_file_path = "media/labels/" + str(current_image_index) + ".txt"
        bboxes = yolo_data_obj.get_BBox_From_Text_File(txt_file_path)
        for index,bbox in enumerate(bboxes):
            bboxes[index][0] *= 4
            bboxes[index][1] *= 4
            bboxes[index][2] *= 4
            bboxes[index][3] *= 4
        bboxes = yolo_data_obj.convert_Yolo_Format_To_BBox_Handles(bboxes)
        return JsonResponse({'image_path': image_path, 'bbox_list': bboxes})
    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt  # Only for testing without CSRF; remove in production if possible
def Zoom_2X(request):
    if request.method == 'POST':
        # Get the `currentImageIndex` from the AJAX request
        current_image_index = int(request.POST.get('currentImageIndex', 0))
        print("update_image_index  current_image_index : ",current_image_index)
        current_image_index
        image_path    = "media/images/" + str(current_image_index) + ".png"
        txt_file_path = "media/labels/" + str(current_image_index) + ".txt"
        bboxes = yolo_data_obj.get_BBox_From_Text_File(txt_file_path)
        for index,bbox in enumerate(bboxes):
            bboxes[index][0] *= 2
            bboxes[index][1] *= 2
            bboxes[index][2] *= 2
            bboxes[index][3] *= 2
        bboxes = yolo_data_obj.convert_Yolo_Format_To_BBox_Handles(bboxes)
        return JsonResponse({'image_path': image_path, 'bbox_list': bboxes})
    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt  # Only for testing without CSRF; remove in production if possible
def DeleteBbox(request):
    if request.method == 'POST':
        # Get the `currentImageIndex` from the AJAX request
        current_image_index = int(request.POST.get('currentImageIndex', 0))
        selected_bbox_x     = int(request.POST.get('selected_bbox_x', 0))/1280
        selected_bbox_y     = int(request.POST.get('selected_bbox_y', 0))/720
        selected_bbox_x1_y1 = (selected_bbox_x,selected_bbox_y)
        print("selected_bbox_x, selected_bbox_x : ",selected_bbox_x,selected_bbox_y)
        print("update_image_index  current_image_index : ",current_image_index)
        current_image_index
        image_path    = "media/images/" + str(current_image_index) + ".png"
        txt_file_path = "media/labels/" + str(current_image_index) + ".txt"
        yolo_data_obj.delete_Selected_Bbox(selected_bbox_x1_y1, txt_file_path)
        bboxes = yolo_data_obj.get_BBox_From_Text_File(txt_file_path)
        bboxes = yolo_data_obj.convert_Yolo_Format_To_BBox_Handles(bboxes)
        has_selected_bbox = 'false'
        # cv2.imshow("s",results[0].plot())
        # cv2.waitKey(0)
        # cv2.destroyAllWindows()
        return JsonResponse({'image_path': image_path, 'bbox_list': bboxes, 'has_selected_bbox':has_selected_bbox})
    return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt 
def update_image_index(request):
    if request.method == 'POST':
        # Get the `currentImageIndex` from the AJAX request
        current_image_index = int(request.POST.get('currentImageIndex', 0))
        print("update_image_index  current_image_index : ",current_image_index)
        image_path    = "media/images/" + str(current_image_index) + ".png"
        txt_file_path = "media/labels/" + str(current_image_index) + ".txt"
        bboxes = yolo_data_obj.get_BBox_From_Text_File(txt_file_path)
        bboxes = yolo_data_obj.convert_Yolo_Format_To_BBox_Handles(bboxes)
        return JsonResponse({'image_path': image_path, 'bbox_list': bboxes, 'current_image_index':current_image_index})
    return JsonResponse({'error': 'Invalid request method'}, status=400)



@csrf_exempt 
def auto_Annotate_Next_N_Frames(request):
    if request.method == 'POST':
        # Get the `currentImageIndex` from the AJAX request
        current_image_index = int(request.POST.get('currentImageIndex', 0))
        current_image_index_batch = current_image_index + 7
        cap = cv2.VideoCapture("media/voleyball.mp4")
        frame_count = 0
        write_current_image_index = current_image_index
        image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp')
        folder_path = "media/images/"
        # List all files in the directory and filter for image files
        image_names = [f for f in os.listdir(folder_path) if f.lower().endswith(image_extensions)]
        # database_obj.delete_database()
        database_obj.create_table() 
        while True:
            ret, frame = cap.read()
            frame_count=frame_count+1 
            cv2.putText(frame, "frame: " + str(write_current_image_index), (7, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 1)
            write_current_image_index+=1
            if(frame_count>current_image_index_batch):
                break 
            # if(frame_count%10==0):
            print("--------------- frame_count ------------------ : ",frame_count)
            # image_path    = "media/images/" + str(frame_count) + ".png"
            # txt_file_path = "media/labels/" + str(frame_count) + ".txt"

            image_path    = "media/images/" + "ref.png"
            txt_file_path = "media/labels/" + "ref.txt"
            image_to_check = str(frame_count) + ".png"
            # if image_to_check in image_names:
            #     continue
            # success = cv2.imwrite(image_path, frame)
            results = yolo_data_obj.get_Detections(frame,model_detection)
            # cv2.imshow("s",results[0].plot())
            # cv2.waitKey(0)
            # cv2.destroyAllWindows()
            bboxes = results[0].boxes.xyxy.tolist()
            bboxes = yolo_data_obj.remove_Detections_Based_On_Court_Coordinates(bboxes)
            yolo_data_obj.save_Bbox_From_YOLO_model(bboxes,txt_file_path)
            # # Convert the image to bytes using OpenCV and numpy
            _, buffer = cv2.imencode(str(frame_count) + '.png', frame)  # Use .png, .jpg, etc., as needed
            image_bytes = buffer.tobytes()  # Convert the buffer to bytes
            with open(txt_file_path, 'rb') as text_file:
                text_data = text_file.read()
            # Prepare sample data, of images, from local drive 
            database_obj.write_blob(frame_count,image_bytes,text_data) 
            bboxes
        return JsonResponse({'message': 'Index received', 'current_image_index': current_image_index})
    return JsonResponse({'error': 'Invalid request method'}, status=400)


