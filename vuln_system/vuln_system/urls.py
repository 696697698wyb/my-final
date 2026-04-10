from django.urls import path,include

from vulnerability import views

urlpatterns=[
    path("vulnerability/", include("vulnerability.urls")),
    path("vulnerability/stats/", views.stats),
]