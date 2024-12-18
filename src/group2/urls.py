from django.urls import path
from . import views


app_name = 'group2'
urlpatterns = [
  path('', views.home, name='group2')

] 
