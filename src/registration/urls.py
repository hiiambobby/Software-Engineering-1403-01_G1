# registration/urls.py
from django.urls import path
from .views import SignupPage, LoginPage, LogoutPage

urlpatterns = [
    path('signup/', SignupPage, name='signup'),
    path('login/', LoginPage, name='login'),
    path('logout/', LogoutPage, name='logout'),]