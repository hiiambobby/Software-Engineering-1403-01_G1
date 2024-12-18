from django.urls import path
from . import views

app_name = 'group3'
urlpatterns = [
  path('', views.home, name='group3')

] 
