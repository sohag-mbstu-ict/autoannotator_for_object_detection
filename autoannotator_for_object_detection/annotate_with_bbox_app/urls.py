from django.urls import path

from . import views

urlpatterns = [
    path("", views.draw_bbox, name="index"),
    path("Save_Bbox/",  views.Save_Bbox,  name="Save_Bbox"),
    path("pass_bbox_to_browser/", views.pass_bbox_value_to_browser, name="pass_bbox_to_browser"),
    path('update_image_index/', views.update_image_index, name='update_image_index'),
    path('auto_Annotate_Next_N_Frames/', views.auto_Annotate_Next_N_Frames, name='auto_Annotate_Next_N_Frames'),
]

