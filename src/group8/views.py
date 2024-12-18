from django.shortcuts import render

# Create your views here.

def home(request):
    return render (request , 'group8.html' , {'group_number': '8'})

