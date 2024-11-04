from django.urls import path

from . import views

urlpatterns = [
    path("", views.draw_bbox, name="index"),
    path("pass_bbox_to_server/",  views.pass_bbox_value_to_server,  name="pass_bbox_to_server"),
    path("pass_bbox_to_browser/", views.pass_bbox_value_to_browser, name="pass_bbox_to_browser"),
]

