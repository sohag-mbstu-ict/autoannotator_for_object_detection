
import os
class get_Data_In_Yolo_Format:
    def __init__(self):
        pass

    def save_BBox_On_Text_File(self,bboxes_handle):
        path = "dataset/"
        file_path=os.path.join(path,"person.txt") 
        with open(file_path, 'w') as file:
            file.write("")  # You can write initial content here if needed
        print(f"{file_path} created successfully.")
        file.close()      
        try:
            with open(file_path, 'a') as file_:
                for index,bbox_handle in enumerate(bboxes_handle):
                    # print("bbox_handle : ",bbox_handle)
                    x1 = bbox_handle['startX'] / 1280
                    y1 = bbox_handle['startY'] / 720
                    x2 = (bbox_handle['width'] + x1) / 1280
                    y2 = (bbox_handle['height'] + y1) / 720
                    file_.write(f"{0} {x1} {y1} {x2} {y2}")
                    if(index+1 < len(bboxes_handle)):
                        file_.write("\n")
                file_.close()
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    def convert_Yolo_Format_To_BBox_Handles(self,bboxes):
        bboxes_dict = {}
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
        # print("bboxes_dict : ",bboxes_dict)
        return bboxes_dict


    def get_BBox_From_Text_File(self):
        bboxes = []
        path = "dataset/"
        file_path=os.path.join(path,"person.txt") 
        try:
            # Open the file and read each line one by one
            with open(file_path, "r") as file:
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

    def main_Function_To_get_Data_In_Yolo_Format(self,bboxes_handle):
        self.save_BBox_On_Text_File(bboxes_handle) # save bbox values on text file
        bboxes = self.get_BBox_From_Text_File()    # get all bboxes
        bboxes = self.convert_Yolo_Format_To_BBox_Handles(bboxes)    # get all bboxes
        


