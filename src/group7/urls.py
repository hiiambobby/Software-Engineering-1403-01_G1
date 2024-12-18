from django.urls import path
from . import views


app_name = 'group7'
urlpatterns = [
  path('', views.home, name='group7')

] 