from django.urls import path
from . import views


app_name = 'group8'
urlpatterns = [
  path('', views.home, name='group8')

] 