from django.urls import path

from . import views

urlpatterns = [
    path("", views.draw_bbox, name="index"),
    path("Save_Bbox/",  views.Save_Bbox,  name="Save_Bbox"),
    path("Save_Bbox_with_Pretrained_Model/",  views.Save_Bbox_with_Pretrained_Model,  name="Save_Bbox_with_Pretrained_Model"),
    path("resetDetection/", views.resetDetection, name="resetDetection"),
    path("Zoom4X/", views.Zoom_4X, name="Zoom4X"),
    path("Zoom2X/", views.Zoom_2X, name="Zoom2X"),
    # path("Zoom4X/", views.Normal, name="Zoom4X"),
    path("DeleteBbox/", views.DeleteBbox, name="DeleteBbox"),
    path('update_image_index/', views.update_image_index, name='update_image_index'),
    path('auto_Annotate_Next_N_Frames/', views.auto_Annotate_Next_N_Frames, name='auto_Annotate_Next_N_Frames'),
]

