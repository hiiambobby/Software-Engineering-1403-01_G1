from django.shortcuts import render

# Create your views here.
def home(request):
    return render (request , 'group5.html' , {'group_number': '5'})

