from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Word, Category, Level
from django.db.models import Count
from django.http import HttpResponse



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