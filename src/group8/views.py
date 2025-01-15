import base64
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
from .models import Word, UserProgress, UserProfile, Request
from django.core.files.base import ContentFile
from django.contrib.admin.views.decorators import staff_member_required
import uuid


def home(request):
    words = Word.objects.all()
    return render(request, 'group8.html', {'group_number': '8', 'words': words})

#saba added this
def add_word_page(request):
    return render(request, 'add_word_page.html', {'group_number': '8'})
    
# def progress(request):
#     return render(request, 'progress.html', {'group_number': '8'})
@login_required
def WelcomePage(request):
    return render(request, 'welcome.html')


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
            return redirect('group8:welcome')
        except IntegrityError:
            return render(request, 'signup8.html', {'error': 'An error occurred while creating your account. Please try again.'})

    return render(request, 'signup8.html')


def Login8Page(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        pass1 = request.POST.get('pass')
        user = authenticate(request, username=username, password=pass1)
        if user is not None:
            login(request, user)
            return redirect('group8:welcome')
        else:
            return render(request, 'login8.html', {'error': 'Username or Password is incorrect.'})
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


@login_required
def mark_word_as_learned_view(request, word_id):
    print("trying to mark word as learneddddddddddd")
    print("current user" , request.user)
    if request.method == "POST":
        user_progress, _ = UserProgress.objects.get_or_create(user=request.user)
        word = get_object_or_404(Word, id=word_id)
        sos = user_progress.learned_words.filter(id=word_id).exists()
        print(sos)
        if user_progress.learned_words.filter(id=word_id).exists():
            return JsonResponse({"message": "You have already learned this word."}, status=200)
        else :
            user_progress.learned_words.add(word)
            return JsonResponse({"message": "Word marked as learned."}, status=200)
    return JsonResponse({"error": "Invalid request method."}, status=400)


@csrf_exempt
def add_word_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            title = data.get("title")
            
            # Check if the word with the same title already exists
            if Word.objects.filter(title=title).exists():
                return JsonResponse({"error": f"{title} already exists."}, status=400)
            
            image_data = data.get("image_url")
            
            # Decode and save image
            if image_data and image_data.startswith("data:image"):
                format, imgstr = image_data.split(';base64,')  # Split format and image data
                ext = format.split('/')[-1]  # Get file extension
                unique_filename = f"{uuid.uuid4()}.{ext}"
                image_file = ContentFile(base64.b64decode(imgstr), name=unique_filename)

                # Save image to the media directory
                image_path = f"media/words/{unique_filename}"
                with open(image_path, "wb") as f:
                    f.write(image_file.read())
                data["image_url"] = image_path  # Update with saved path

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
# @csrf_exempt
# def delete_word_view(request, word_id):
#     if request.method == "DELETE":
#         success = WordService.delete_word(request.user, word_id)
#         if success:
#             return JsonResponse({"message": "Word deleted successfully."}, status=200)
#         return JsonResponse({"error": "Failed to delete word."}, status=404)
#     return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def delete_word_view(request, word_id):
    if request.method == "DELETE":
        Request.objects.create(
            user=request.user,
            word_id=word_id,
            request_type='delete'
        )
        return JsonResponse({"message": "Delete request submitted."}, status=200)
    return JsonResponse({"error": "Invalid request method."}, status=400)
#in bayad edit beshe va peygham biad ke darkhast shoma ersal gardid baad admin ae khast bere tu jadvale darkhasta negah kone va khodesh dasti pak kone ya hich kar nakone
# @csrf_exempt
# def edit_word_view(request, word_id):
#     if request.method == "PUT":
#         try:
#             data = json.loads(request.body)
#             image_url = data.get("image_url")
#             if not image_url.startswith("http://") and not image_url.startswith("https://"):
#                 return JsonResponse({"error": "Invalid image URL."}, status=400)
#             word_data = {
#                 "title": data.get("title"),
#                 "category": data.get("category"),
#                 "level": data.get("level"),
#                 "image_url": image_url,
#             }
#             word = WordService.edit_word(request.user, word_id, word_data)
#             if word:
#                 return JsonResponse({"message": "Word updated successfully.", "word_id": word.id}, status=200)
#             return JsonResponse({"error": "Failed to update word."}, status=404)
#         except Exception as e:
#             return JsonResponse({"error": f"Invalid data: {e}"}, status=400)
#     return JsonResponse({"error": "Invalid request method."}, status=400)
@csrf_exempt
def edit_word_view(request, word_id):
    if request.method == "PUT":
        try:
            data = json.loads(request.body)
            Request.objects.create(
                user=request.user,
                word_id=word_id,
                request_type='edit',
                data=data
            )
            return JsonResponse({"message": "Edit request submitted."}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data."}, status=400)
    return JsonResponse({"error": "Invalid request method."}, status=400)


@staff_member_required
def view_requests(request):
    requests = Request.objects.filter(status='pending')
    return render(request, 'group8/view_requests.html', {'requests': requests})

@staff_member_required
def approve_request(request, request_id):
    req = Request.objects.get(id=request_id)
    if req.request_type == 'edit':
        WordService.edit_word(req.user, req.word.id, req.data)
    elif req.request_type == 'delete':
        WordService.delete_word(req.user, req.word.id)
    req.status = 'approved'
    req.save()
    return redirect('group8:view_requests')

@staff_member_required
def reject_request(request, request_id):
    req = Request.objects.get(id=request_id)
    req.status = 'rejected'
    req.save()
    return redirect('group8:view_requests')

#in bayad edit beshe va tabe betune ba faghat ya category ya level ham filter kone va kalamato bargardune
@csrf_exempt
def get_words_by_category_level_view(request):
    if request.method == "GET":
        category = request.GET.get("category")
        level = request.GET.get("level")
        
        # Filter words based on provided category and/or level
        words = Word.objects.all()
        if category:
            words = words.filter(category=category)
        if level:
            words = words.filter(level=level)
        
        words_list = [
            {"id": w.id, "title": w.title, "category": w.category, "level": w.level, "image_url": w.image_url}
            for w in words
        ]
        return JsonResponse({"words": words_list}, status=200)
    return JsonResponse({"error": "Invalid request method."}, status=400)

# @login_required
# def like_word(request, word_id):
#     word = get_object_or_404(Word, id=word_id)
#     like, created = Like.objects.get_or_create(user=request.user, word=word)
#     if created:
#         return JsonResponse({'message': 'Word liked successfully!'}, status=201)
#     else:
#         return JsonResponse({'message': 'You have already liked this word.'}, status=200)
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
    Returns a JSON response with the progress data for each category and level.
    """
    if request.method == "GET":
        # Get or create UserProgress for the current user
        user_progress, _ = UserProgress.objects.get_or_create(user=request.user)
        total_words_learned = user_progress.get_total_learned()

        # Get distinct categories and levels
        categories = ['animals', 'fruits', 'objects']
        levels = ['beginner', 'intermediate', 'advanced']

        # Build the progress_by_category_level dictionary
        progress_by_category_level = {}

        for category in categories:
            progress_by_category_level[category] = {}
            for level in levels:
                # Total words in this category and level
                total_words = Word.objects.filter(category=category, level=level).count()
                print(f"Total words for category '{category}' and level '{level}': {total_words}")

                # Learned words for this category and level
                learned_words = user_progress.learned_words.filter(category=category, level=level).count()
                print(f"Learned words for category '{category}' and level '{level}': {learned_words}")

                progress_by_category_level[category][level] = {
                    "learned": learned_words,
                    "total": total_words
                }

        print("Progress by category level:", progress_by_category_level)
        print("Total words learned:", total_words_learned)

        # Return the JSON response
        return JsonResponse({
            "progress_by_category_level": progress_by_category_level,
            "total_words_learned": total_words_learned
        }, status=200)

    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def fetch_all_words_view(request):
    if request.method == "GET":
        words = Word.objects.all()
        words_list = [
            {"id": w.id, "title": w.title, "category": w.category, "level": w.level, "image_url": w.image_url}
            for w in words
        ]
        return JsonResponse({"words": words_list}, status=200)
    return JsonResponse({"error": "Invalid request method."}, status=400)

