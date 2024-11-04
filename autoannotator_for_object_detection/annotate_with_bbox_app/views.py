from django.http import JsonResponse  # Import JsonResponse
from django.shortcuts import render
import json
import pickle
import os
from django.views.decorators.csrf import csrf_exempt  # Import csrf_exempt
from annotate_with_bbox_app.yolo_format import get_Data_In_Yolo_Format


# def index(request):
#     return HttpResponse("Hello, world. You're at the polls index.")

def draw_bbox(request):
    return render(request, 'draw_bbox.html')

@csrf_exempt  # You may want to configure CSRF token handling for production
def pass_bbox_value_to_server(request):
    yolo_data_obj = get_Data_In_Yolo_Format()
    if request.method == "POST":
        # Get the value sent via AJAX
        bboxes_handle = request.POST.get("value")
        # Process the value (optional)
        bboxes_handle = json.loads(bboxes_handle)
        # with open("dataset/person.txt", "w") as file:
        #     json.dump(bboxes_handle, file)
        # bboxes_handle
        # print("bboxes_handle : ",bboxes_handle)
        yolo_data_obj.save_BBox_On_Text_File(bboxes_handle)
        # for response in response_message:
        #     print("response : ",response.startX)
        # Return a JSON response
        return JsonResponse({"message": bboxes_handle})
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt  # Only for testing without CSRF; remove in production if possible
def pass_bbox_value_to_browser(request):
    if request.method == 'GET':
        yolo_data_obj = get_Data_In_Yolo_Format()
        bboxes = yolo_data_obj.get_BBox_From_Text_File()
        bboxes = yolo_data_obj.convert_Yolo_Format_To_BBox_Handles(bboxes)
        
        return JsonResponse({'my_list': bboxes})

