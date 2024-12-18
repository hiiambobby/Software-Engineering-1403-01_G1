from django.urls import path
from . import views


app_name = 'group1' 
urlpatterns = [
  path('', views.home, name='group1')

] 
