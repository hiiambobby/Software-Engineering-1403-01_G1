# urls.py
from django.urls import path,include
from . import views
from django.contrib import admin

app_name = 'group8'

urlpatterns = [
    
    path('admin/', admin.site.urls),
    path('accounts/', include('registration.urls')), 
    path('', views.home, name='group8'),
    path("add-word/", views.add_word_view, name="add_word"),

    path("delete-word/<int:word_id>/", views.delete_word_view, name="delete_word"),
    path("edit-word/<int:word_id>/", views.edit_word_view, name="edit_word"),

    path("get-words-by-category-level/", views.get_words_by_category_level_view, name="get_words_by_category_level"),
    path("search-word/", views.search_word_view, name="search_word"),

    # IMPORTANT: match your tests EXACTLY
    path("mark-word-learned/<int:word_id>/", views.mark_word_as_learned_view, name="mark_word_learned"),

    path("get-progress-report/", views.progress_report_view, name="get_progress_report"),
]
