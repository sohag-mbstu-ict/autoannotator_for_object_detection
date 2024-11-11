import cv2
import os
from shapely.geometry import Polygon
from annotate_with_bbox_app.handle_Bbox_Overlap import handle_Bbox_Overlapp_at_Missing_Detections


class get_Data_In_Yolo_Format:
    def __init__(self):
        pass

    def save_BBox_On_Text_File(self,txt_file_path,bboxes_handle,image_size_2x,image_size_4x): # when we click saveBbox from browser    
        try:
            if(image_size_2x=='true'):
                with open(txt_file_path, 'w') as file_:
                    for index,bbox_handle in enumerate(bboxes_handle):
                        x1 = (bbox_handle['startX']/2) / 1280
                        y1 = (bbox_handle['startY']/2) / 720
                        x2 = (bbox_handle['width']/2) / 1280
                        y2 = (bbox_handle['height']/2) / 720
                        file_.write(f"{0} {x1} {y1} {x2} {y2}")
                        if(index+1 < len(bboxes_handle)):
                            file_.write("\n")
                    file_.close()

            elif(image_size_4x=='true'):
                with open(txt_file_path, 'w') as file_:
                    for index,bbox_handle in enumerate(bboxes_handle):
                        x1 = (bbox_handle['startX']/4) / 1280
                        y1 = (bbox_handle['startY']/4) / 720
                        x2 = (bbox_handle['width']/4) / 1280
                        y2 = (bbox_handle['height']/4) / 720
                        file_.write(f"{0} {x1} {y1} {x2} {y2}")
                        if(index+1 < len(bboxes_handle)):
                            file_.write("\n")
                    file_.close()
            else:
                with open(txt_file_path, 'w') as file_:
                    for index,bbox_handle in enumerate(bboxes_handle):
                        x1 = bbox_handle['startX'] / 1280
                        y1 = bbox_handle['startY'] / 720
                        x2 = bbox_handle['width'] / 1280
                        y2 = bbox_handle['height'] / 720
                        file_.write(f"{0} {x1} {y1} {x2} {y2}")
                        if(index+1 < len(bboxes_handle)):
                            file_.write("\n")
                    file_.close()
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    def convert_Yolo_Format_To_BBox_Handles(self,bboxes):
        bboxes_dict = {}
        try:
            for index, bbox in enumerate(bboxes):
                startX  = int(bbox[0])
                startY  = int(bbox[1])
                width   = int(bbox[2]) 
                height  = int(bbox[3]) 
                handles = [
                        { 'x': startX, 'y': startY },                             # Top-left          
                        { 'x': startX + width, 'y': startY },                     # Top-right         
                        { 'x': startX, 'y': startY + height },                    # Bottom-left       
                        { 'x': startX + width, 'y': startY + height },            # Bottom-right      
                        { 'x': int(startX + width / 2), 'y': startY },            # Top-middle        
                        { 'x': startX + width, 'y': int(startY + height / 2) },   # Right-middle      
                        { 'x': int(startX + width / 2), 'y': startY + height },   # Bottom-middle     
                        { 'x': startX, 'y': int(startY + height / 2) }            # Left-middle       
                    ]
                
                # dict = {startX:startX, startY:startY, width:width, height:height,handles: handles}
                dict = {'startX':startX, 'startY':startY, 'width':width, 'height':height,'handles': handles}
                bboxes_dict[index] = dict
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        # print("bboxes_dict : ",bboxes_dict)
        return bboxes_dict


    def get_BBox_From_Text_File(self,yolo_txt_path):
        bboxes = [] 
        try:
            # Open the file and read each line one by one
            with open(yolo_txt_path, "r") as file:
                for line in file:
                    # Remove any trailing whitespace, like newline characters
                    line = line.strip()
                    bbox = [float(value) for value in line.split()]
                    bbox[1] = int(bbox[1]*1280)
                    bbox[2] = int(bbox[2]*720)
                    bbox[3] = int(bbox[3]*1280) 
                    bbox[4] = int(bbox[4]*720) 
                    bboxes.append(bbox[1:])
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        return bboxes
    
    
    def get_Detections(self, image_path,model_detection):  # object detection using yolov8x
        try:
            frame = cv2.imread(image_path)
            results = model_detection.predict(frame,   
                                save=False,
                                conf=0.5,
                                iou=0.8,
                                classes=[32],
                                imgsz=1280)
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        return results
    
    def remove_Detections_Based_On_Court_Coordinates(self,detected_bboxes):
        try:
            court = Polygon([(359,215), (917,215), (1076,553), (205,551)])
            bboxes=[]
            for i,bbox in enumerate(detected_bboxes):
                x1,y1,x2,y2=bbox[0],bbox[1],bbox[2],bbox[3]
                bbox_polygon=Polygon([(x1,y1),(x2,y1),(x2,y2),(x1,y2)])
                is_overlap = court.intersects(bbox_polygon) # Check if polygons overlap
                if is_overlap:
                    bbox[2] = bbox[2] - bbox[0]
                    bbox[3] = bbox[3] - bbox[1]
                    bboxes.append(bbox)
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        return bboxes

    def save_Bbox_From_YOLO_model(self,bboxes,txt_file_path):
        with open(txt_file_path, 'w') as file:
            file.write("")  # You can write initial content here if needed
        file.close()      
        try:
            with open(txt_file_path, 'a') as file_:
                for index,bbox in enumerate(bboxes):
                    # print("bbox_handle : ",bbox_handle)
                    x1 = bbox[0] / 1280
                    y1 = bbox[1] / 720
                    x2 = (bbox[2] - x1) / 1280
                    y2 = (bbox[3] - x2) / 720
                    file_.write(f"{0} {x1} {y1} {x2} {y2}")
                    if(index+1 < len(bboxes)):
                        file_.write("\n")
                file_.close()
        except Exception as e:
            print(f"An unexpected error occurred: {e}")


    def detect_Missing_Object(self, image_path,model_detection,bboxes_handle):  # object detection using yolov8x
        # print("bboxes_handle : ",bboxes_handle)
        try:
            frame = cv2.imread(image_path)
            bbox_index = len(bboxes_handle)-1
            startX  = int(bboxes_handle[bbox_index]['startX'])
            startY  = int(bboxes_handle[bbox_index]['startY'])
            width   = int(bboxes_handle[bbox_index]['width']) 
            height  = int(bboxes_handle[bbox_index]['height']) 
            print("startX, startY, width, height : ",startX, startY, width, height)
            # Calculate the ending coordinates
            endX = startX + width
            endY = startY + height
            # Crop the image
            cropped_image = frame[startY:endY, startX:endX]
            cv2.imwrite('img.png', cropped_image)
            results = model_detection.predict(cropped_image,   
                                save=False,
                                conf=0.10,
                                iou=0.8,
                                classes=[32])
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        # cv2.imshow('Cropped Image', results[0].plot())       # Display the cropped image
        # cv2.waitKey(0)
        # cv2.destroyAllWindows()
        try:
            bboxes = results[0].boxes.xyxy.tolist()
            if(results):
                cropped_bbox = [startX, startY, width + startX, height + startY]
                handle_missing_obj = handle_Bbox_Overlapp_at_Missing_Detections()
                index = handle_missing_obj.get_Relevent_Bbox_at_Missing_detections(cropped_bbox,bboxes)
                print("bboxes[0] 111111111111111111111 : ",bboxes)
                bbox=bboxes[index]
                print("bbox[0] 222222222222222222222 : ",bbox)
                bboxes_handle[bbox_index]['startX'] = bbox[0] + startX
                bboxes_handle[bbox_index]['startY'] = bbox[1] + startY
                bboxes_handle[bbox_index]['width']  = bbox[2] - bbox[0]
                bboxes_handle[bbox_index]['height'] = bbox[3] - bbox[1]
                # print("bboxes_handle ttttt  : ",bboxes_handle)
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        return bboxes_handle

    def delete_Selected_Bbox(self,seleted_bbox_x1_y1, txt_file_path):
        try:
            # Read the file and filter lines
            with open(txt_file_path, 'r') as file:
                lines = file.readlines()
                file.close()
            # Remove lines containing the input pair
            with open(txt_file_path, 'w') as file:
                for line in lines:
                    # Convert line to a list of integers for comparison
                    values = list(map(float, line.split()))
                    values = values[1:3]
                    if round(values[0],2)==round(seleted_bbox_x1_y1[1],2) and round(values[1],2)==round(seleted_bbox_x1_y1[1],2):  # Only keep lines that do not match the input pair
                        print("line : ",line,"  values : ",values,"  list(seleted_bbox_x1_y1) : ",list(seleted_bbox_x1_y1))
                        file.write(line)
                file.close()
        except Exception as e:
            print(f"An unexpected error occurred: {e}")


    def main_Function_To_get_Data_In_Yolo_Format(self,bboxes_handle):
        self.save_BBox_On_Text_File(bboxes_handle) # save bbox values on text file
        bboxes = self.get_BBox_From_Text_File()    # get all bboxes
        bboxes = self.convert_Yolo_Format_To_BBox_Handles(bboxes)    # get all bboxes
        


