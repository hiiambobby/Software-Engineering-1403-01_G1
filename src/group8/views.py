from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .services import WordService
import json
from .models import *



# Create your views here.

def home(request):
    return render (request , 'group8.html' , {'group_number': '8'})

@login_required
def ProgressReport(request):
    user = request.user

    # Count total words learned by the user
    total_learned = user.learned_words.count()

    # Count words learned per category
    category_progress = Category.objects.annotate(
        learned_words_count=Count('word__learned_users')
    )

    # Count words learned per level
    level_progress = Level.objects.annotate(
        learned_words_count=Count('word__learned_users')
    )

    context = {
        'total_learned': total_learned,
        'category_progress': category_progress,
        'level_progress': level_progress,
    }

    return render(request, 'progress_report.html', context)


@login_required
def MarkAsLearned(request, word_id):
    word = get_object_or_404(Word, id=word_id)

    # Add the user to the list of learned users for this word
    word.learned_users.add(request.user)

    return HttpResponse("Word marked as learned!")



@csrf_exempt
def add_word_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            word_data = {
                "title": data.get("title"),
                "category": data.get("category"),
                "level": data.get("level"),
                "image_url": data.get("image_url"),
            }

            word = WordService.add_word(request.user, word_data)
            if word:
                return JsonResponse({"message": "Word added successfully.", "word_id": word.id}, status=201)
            return JsonResponse({"error": "Failed to add word."}, status=500)
        except Exception as e:
            return JsonResponse({"error": f"Invalid data: {e}"}, status=400)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def delete_word_view(request, word_id):
    if request.method == "DELETE":
        success = WordService.delete_word(request.user, word_id)
        if success:
            return JsonResponse({"message": "Word deleted successfully."}, status=200)
        return JsonResponse({"error": "Failed to delete word."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def edit_word_view(request, word_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            word_data = {
                "title": data.get("title"),
                "category": data.get("category"),
                "level": data.get("level"),
                "image_url": data.get("image_url"),
            }
            word = WordService.edit_word(request.user, word_id, word_data)
            if word:
                return JsonResponse({"message": "Word updated successfully.", "word_id": word.id}, status=200)
            return JsonResponse({"error": "Failed to update word."}, status=404)
        except Exception as e:
            return JsonResponse({"error": f"Invalid data: {e}"}, status=400)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def get_words_by_category_level_view(request):
    if request.method == "GET":
        category = request.GET.get("category")
        level = request.GET.get("level")
        if not category or not level:
            return JsonResponse({"error": "Category and level are required."}, status=400)
        words = WordService.get_words_by_category_level(category, level)
        words_list = [
            {"id": word.id, "title": word.title, "category": word.category, "level": word.level, "image_url": word.image_url}
            for word in words
        ]
        return JsonResponse({"words": words_list}, status=200)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def search_word_view(request):
    if request.method == "GET":
        title = request.GET.get("title")
        category = request.GET.get("category", None)
        if not title:
            return JsonResponse({"error": "Title is required."}, status=400)
        words = WordService.search_word(title, category)
        words_list = [
            {"id": word.id, "title": word.title, "category": word.category, "level": word.level, "image_url": word.image_url}
            for word in words
        ]
        return JsonResponse({"words": words_list}, status=200)
    return JsonResponse({"error": "Invalid request method."}, status=400)



@csrf_exempt
def mark_word_as_learned_view(request, word_id):
    if request.method == "POST":
        success = WordService.mark_word_as_learned(request.user, word_id)
        if success:
            return JsonResponse({"message": "Word marked as learned successfully."}, status=200)
        return JsonResponse({"error": "Failed to mark word as learned."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def progress_report_view(request):
    if request.method == "GET":
        progress = WordService.get_user_progress(request.user)
        if progress:
            return JsonResponse({"progress": progress}, status=200)
        return JsonResponse({"error": "Failed to retrieve progress report."}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)
