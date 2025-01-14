from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.utils import IntegrityError
from django.db.models import Count
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json
from .services import WordService
from .models import Word, UserProgress, UserProfile


def home(request):
    return render(request, 'group8.html', {'group_number': '8'})

#saba added this
def add_word_page(request):
    return render(request, 'add_word_page.html', {'group_number': '8'})
    
# def progress(request):
#     return render(request, 'progress.html', {'group_number': '8'})


def Signup8Page(request):
    if request.method == 'POST':
        uname = request.POST.get('username')
        email = request.POST.get('email')
        pass1 = request.POST.get('password')
        pass2 = request.POST.get('confirm_password')

        if not uname or not email or not pass1 or not pass2:
            return render(request, 'signup8.html', {'error': 'All fields are required.'})

        if pass1 != pass2:
            return render(request, 'signup8.html', {'error': 'Passwords do not match.'})

        if User.objects.filter(username=uname).exists():
            return render(request, 'signup8.html', {'error': 'Username already exists.'})

        if User.objects.filter(email=email).exists():
            return render(request, 'signup8.html', {'error': 'Email already exists.'})

        try:
            user = User.objects.create_user(username=uname, email=email, password=pass1)
            user.save()
            login(request, user)
            return redirect('group8:home')
        except IntegrityError:
            return render(request, 'signup8.html', {'error': 'An error occurred while creating your account. Please try again.'})

    return render(request, 'signup8.html')


def Login8Page(request):
    print("salam..............................................")
    if request.method == 'POST':
        username = request.POST.get('username')
        pass1 = request.POST.get('pass')
        print(username)
        print(pass1)
        user = authenticate(request, username=username, password=pass1)
        if user is not None:
            login(request, user)
            return redirect('group8:home')  
        else:
            print(user)
            return HttpResponse(f"Username or Password is incorrect!!!{user}") 
    elif request.method == "GET":
        return render(request, 'login8.html')


def Logout8Page(request):
    logout(request)
    return redirect('group8:login8')  


@login_required
def ProgressReport(request):
    """
    Example if you want to render an HTML page showing aggregated progress (by category/level).
    This is separate from the JSON-based API endpoint (progress_report_view).
    """
    # Get or create the user progress
    progress, _ = request.user.progress, UserProgress.objects.get_or_create(user=request.user)
    total_learned = progress.learned_words.count()

    # Summaries
    category_progress = progress.learned_words.values('category').annotate(learned_words_count=Count('category'))
    level_progress = progress.learned_words.values('level').annotate(learned_words_count=Count('level'))

    context = {
        'total_learned': total_learned,
        'category_progress': category_progress,  # list of dicts
        'level_progress': level_progress,        # list of dicts
    }
    return render(request, 'progress.html', context)


@csrf_exempt
def mark_word_as_learned_view(request, word_id):
    print("trying to mark word as learneddddddddddd")
    if request.method == "POST":
        success = WordService.mark_word_as_learned(request.user, word_id)
        if success:
            return JsonResponse({"message": "Word marked as learned."}, status=200)
        else:
            return JsonResponse({"error": "Failed to mark word as learned."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)


@csrf_exempt
def add_word_view(request):
    print('add word.................')
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

#inam mesle paiini
@csrf_exempt
def delete_word_view(request, word_id):
    if request.method == "DELETE":
        success = WordService.delete_word(request.user, word_id)
        if success:
            return JsonResponse({"message": "Word deleted successfully."}, status=200)
        return JsonResponse({"error": "Failed to delete word."}, status=404)
    return JsonResponse({"error": "Invalid request method."}, status=400)

#in bayad edit beshe va peygham biad ke darkhast shoma ersal gardid baad admin ae khast bere tu jadvale darkhasta negah kone va khodesh dasti pak kone ya hich kar nakone
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

#in bayad edit beshe va tabe betune ba faghat ya category ya level ham filter kone va kalamato bargardune
@csrf_exempt
def get_words_by_category_level_view(request):
    if request.method == "GET":
        category = request.GET.get("category")
        level = request.GET.get("level")
        if not category or not level:
            return JsonResponse({"error": "Category and level are required."}, status=400)
        words = WordService.get_words_by_category_level(category, level)
        words_list = [
            {"id": w.id, "title": w.title, "category": w.category, "level": w.level, "image_url": w.image_url}
            for w in words
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
            {"id": w.id, "title": w.title, "category": w.category, "level": w.level, "image_url": w.image_url}
            for w in words
        ]
        return JsonResponse({"words": words_list}, status=200)
    return JsonResponse({"error": "Invalid request method."}, status=400)


@csrf_exempt
def progress_report_view(request):
    """
    Returns a JSON response matching what the test.py expects:
    {
      "total_words_learned": 2,
      "progress_by_category": { ... },
      "progress_by_level": { ... }
    }
    """
    if request.method == "GET":
        progress_data = WordService.get_user_progress(request.user)
        if progress_data:
            print('progresssssssssssss')
            print(progress_data)
            #return render(request, 'progress.html', {'group_number': '8'})
            #return render(request, 'progress.html', progress_data)
            return JsonResponse({
                "total_words_learned": progress_data["total_learned"],
                "progress_by_category": progress_data["learned_by_category"],
                "progress_by_level": progress_data["learned_by_level"],
            }, status=200)
        return JsonResponse({"error": "Failed to retrieve progress report."}, status=500)
    return JsonResponse({"error": "Invalid request method."}, status=400)

