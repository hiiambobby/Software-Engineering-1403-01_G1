from django.shortcuts import render

# Create your views here.
def home(request):
    return render (request , 'group6.html' , {'group_number': '6'})

