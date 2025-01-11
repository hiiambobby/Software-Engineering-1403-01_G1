from django.urls import path
from . import views


app_name = 'group8'

urlpatterns = [
    path('', views.home, name='group8'),
    path('progress_report/', views.ProgressReport, name='progress_report'),
    path('mark_as_learned/<int:word_id>/', views.MarkAsLearned, name='mark_as_learned'),
]
