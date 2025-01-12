# from django.shortcuts import render
# from django.contrib.auth import authenticate,login,logout
# from django.shortcuts import render, redirect, HttpResponse
# from django.contrib.auth.models import User
# from django.db import IntegrityError
# from .secret import DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
# from database.query import *
# # Create your views here.




# def SignupPage(request):
#     if request.method == 'POST':
#         uname = request.POST.get('username')
#         email = request.POST.get('email')
#         pass1 = request.POST.get('password1')
#         pass2 = request.POST.get('password2')
#         name = request.POST.get('name')  # استخراج نام
#         age = request.POST.get('age')    # استخراج سن

#         if pass1 != pass2:
#             return HttpResponse("Your password and confirm password are not the same!")
#         else:
#             # بررسی نام کاربری برای جلوگیری از تکرار
#             if User.objects.filter(username=uname).exists():
#                 return HttpResponse("This username is already taken. Please choose another one.")
#             try:
#                 my_user = User.objects.create_user(uname, email, pass1)
#                 # اینجا می‌توانید اطلاعات اضافی مانند 'name' و 'age' را در پروفایل کاربر ذخیره کنید
#                 print('User created:', my_user)
#                 print('Name:', name)  # چاپ نام
#                 print('Age:', age)    # چاپ سن
#                 my_user.save()
#                 mydb = create_db_connection(DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
#                 save_user(mydb, name, uname, pass1, email, age)
#                 return redirect('login')
#             except IntegrityError:
#                 return HttpResponse("An error occurred while creating your account. Please try again.")
    
#     return render(request, 'registration/signup.html')


# def LoginPage(request):
#     if request.method=='POST':
#         username=request.POST.get('username')
#         pass1=request.POST.get('pass')
#         user=authenticate(request,username=username,password=pass1)
#         print(user)
#         print(username)
#         print(pass1)
#         if user is not None:
#             login(request,user)
#             return redirect('home')
#         else:
#             return HttpResponse ("Username or Password is incorrect!!!")

#     return render (request,'registration/login.html')

# def LogoutPage(request):
#     logout(request)
#     return redirect('login')

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from django.http import HttpResponse
from .models import UserProfile  # Make sure this import points to wherever you defined UserProfile

def SignupPage(request):
    if request.method == 'POST':
        uname = request.POST.get('username')
        email = request.POST.get('email')
        pass1 = request.POST.get('password1')
        pass2 = request.POST.get('password2')
        name = request.POST.get('name')  # extra field from the form
        age = request.POST.get('age')    # extra field from the form

        if pass1 != pass2:
            return HttpResponse("Your password and confirm password do not match!")
       
        # Check if username is taken
        if User.objects.filter(username=uname).exists():
            return HttpResponse("This username is already taken. Please choose another one.")
       
        try:
            # Create the user via Django's ORM
            my_user = User.objects.create_user(username=uname, email=email, password=pass1)
           
            # Create UserProfile to store name and age
            user_profile = UserProfile.objects.create(
                user=my_user,
                name=name,
                age=age if age else None
            )
            # (Optional) You could also do:
            # user_profile.name = name
            # user_profile.age = age
            # user_profile.save()

            # Automatically log the user in if desired:
            login(request, my_user)
            return redirect('home')  # or wherever you want to redirect after signup

        except IntegrityError:
            return HttpResponse("An error occurred while creating your account. Please try again.")
   
    return render(request, 'registration/signup.html')


def LoginPage(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        pass1 = request.POST.get('password')
        user = authenticate(request, username=username, password=pass1)
        if user is not None:
            login(request, user)
            return redirect('home')  # or any other page
        else:
            return HttpResponse("Username or Password is incorrect!!!")

    return render(request, 'registration/login.html')


def LogoutPage(request):
    logout(request)
    return redirect('login')  # redirect to login after logout
