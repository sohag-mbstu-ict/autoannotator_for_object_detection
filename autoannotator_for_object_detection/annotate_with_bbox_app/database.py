# Import the required library 
import psycopg2 
import numpy as np
import cv2

class database_For_BBox_Annotation:
    def __init__(self):
        pass

    # Method to create a connection object 
    # It creates a pointer cursor to the database 
    # and returns it along with Connection object 
    def create_connection(self): 
        # Connect to the database 
        # using the psycopg2 adapter. 
        # Pass your database name ,# username , password , 
        # hostname and port number 
        conn = psycopg2.connect(dbname='Auto_Annotator', 
                                user='postgres', 
                                password='1234', 
                                host='localhost', 
                                port='5432') 
        # Get the cursor object from the connection object 
        curr = conn.cursor() 
        return conn, curr 

    def create_table(self): 
        # Get the cursor object from the connection object 
        conn, curr = self.create_connection() 
        try: 
            # Fire the CREATE query 
            curr.execute("CREATE TABLE IF NOT EXISTS Bbox_Annotation(ID INTEGER, text_data BYTEA, Img BYTEA)") 
            
        except(Exception, psycopg2.Error) as error: 
            # Print exception 
            print("Error while creating Bbox_Annotation table", error) 
        finally: 
            # Close the connection object 
            conn.commit() 
            conn.close() 

    def write_blob(self,id,image_bytes,text_data): 
        try: 
            conn, cursor = self.create_connection() 
            conn.commit() 
            try:	
                insert_query = """
                                INSERT INTO Bbox_Annotation (id, text_data,img)
                                VALUES (%s, %s, %s)
                               """
                cursor.execute(insert_query, (id, psycopg2.Binary(text_data), psycopg2.Binary(image_bytes)))
                conn.commit()
            except (Exception, psycopg2.DatabaseError) as error: 
                print("Error while inserting data in Bbox_Annotation table", error) 
            finally: 
                # Close the connection object 
                conn.close() 
        finally: 
            # Since we do not have to do 
            # anything here we will pass 
            pass

    def retrieve_data(self):
        conn, cursor = self.create_connection()

        # Retrieve data from the table
        select_query = "SELECT id, text_data, img FROM Bbox_Annotation;"
        cursor.execute(select_query)
        rows = cursor.fetchall()

        for row in rows:
            # Extract data
            iD = row[0]
            text_data = row[1]  # This is binary data for the text file
            image_data = row[2]  # This is binary data for the image
            # Convert text_data and image_data from memoryview to bytes
            text_bytes = bytes(text_data)
            image_bytes = bytes(image_data)
            # Decode and display text data
            text_content = text_bytes.decode('utf-8')
            print(f"ID: {iD}, Description: {text_content}")

            # Convert image data from bytes to a numpy array and display it using OpenCV
            image_array = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            
            # Display the image (optional)
            cv2.imshow(f"Image for ID {iD}", img)
            cv2.waitKey(0)  # Wait for a key press to close the image window
            cv2.destroyAllWindows()

        cursor.close()
        conn.close()

    def delete_database(self):
        try:
            conn, cursor = self.create_connection()
            conn.autocommit = True  # This is required for database-level operations

            # SQL query to drop the database
            drop_query = "DROP TABLE IF EXISTS Bbox_Annotation;"

            # Execute the drop query
            cursor.execute(drop_query)

            print("Database deleted successfully.")
            
        except Exception as error:
            print(f"Error deleting database: {error}")
        finally:
            # Close the connection
            if conn:
                cursor.close()
                conn.close()


            

# database_obj = database_For_BBox_Annotation()
# # Call the create table method	 
# # database_obj.create_table() 
# img = cv2.imread("D:/Annotator/autoannotator_bbox/media/images/3.png")
# # Convert the image to bytes using OpenCV and numpy
# _, buffer = cv2.imencode('.png', img)  # Use .png, .jpg, etc., as needed
# image_bytes = buffer.tobytes()  # Convert the buffer to bytes
# txt = "D:/Annotator/autoannotator_bbox/media/labels/3.txt"
# with open(txt, 'rb') as text_file:
#         text_data = text_file.read()
# Prepare sample data, of images, from local drive 
# database_obj.write_blob(1,image_bytes,text_data) 
# database_obj.retrieve_data()
# database_obj.delete_database()
a=4


