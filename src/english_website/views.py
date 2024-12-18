
from django.shortcuts import render

def base(request):
    groups = [
        {"id": 1, "url": "group1:group1"},
        {"id": 2, "url": "group2:group2"},
        {"id": 3, "url": "group3:group3"},
        {"id": 4, "url": "group4:group4"},
        {"id": 5, "url": "group5:group5"},
        {"id": 6, "url": "group6:group6"},
        {"id": 7, "url": "group7:group7"},
        {"id": 8, "url": "group8:group8"},
        {"id": 9, "url": "group9:group9"},
    ]
    return render(request, 'base.html', {"groups": groups})
