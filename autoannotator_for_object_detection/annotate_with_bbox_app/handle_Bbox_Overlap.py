import cv2
import os
import numpy as np
from shapely.geometry import Polygon

class handle_Bbox_Overlapp_at_Missing_Detections:
    def __init__(self):
        pass

    def get_Relevent_Bbox_at_Missing_detections(self,cropped_bbox,detected_bboxes):
        try:
            # Extract the coordinates of the bounding boxes
            x1, y1, x2, y2 = cropped_bbox
            max_iou = -2
            bbox_index = 0
            for index,detected_bbox in enumerate(detected_bboxes):
                x3, y3, x4, y4 = detected_bbox
                x3 += x1
                y3 += y1
                x4 += x1
                y4 += y1
                
                # Calculate the coordinates of the intersection rectangle
                inter_x1 = max(x1, x3)
                inter_y1 = max(y1, y3)
                inter_x2 = min(x2, x4)
                inter_y2 = min(y2, y4)
                
                # Calculate the width and height of the intersection rectangle
                inter_width = max(0, inter_x2 - inter_x1)
                inter_height = max(0, inter_y2 - inter_y1)
                
                # Compute the area of the intersection
                inter_area = inter_width * inter_height
                
                # Compute the area of both bounding boxes
                bbox1_area = (x2 - x1) * (y2 - y1)
                bbox2_area = (x4 - x3) * (y4 - y3)
                
                # Compute the area of the union
                union_area = bbox1_area + bbox2_area - inter_area
                
                # Compute the Intersection over Union (IoU)
                iou = inter_area / union_area if union_area != 0 else 0
                if(max_iou<iou):
                    max_iou = iou
                    bbox_index = index
                print("iou-------------- : ",iou)
                image = np.zeros((720, 1280, 3), dtype=np.uint8)
                # Draw rectangle on the image
                cv2.rectangle(image, (int(x1), int(y1)), (int(x2), int(y2)), (0,255,0), 2)
                cv2.rectangle(image, (int(x3), int(y3)), (int(x4), int(y4)), (0,0,255), 2)
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        
        return bbox_index

