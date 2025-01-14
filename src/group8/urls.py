# urls.py
from django.urls import path,include
from . import views
from django.contrib import admin
from .views import Signup8Page, Login8Page, Logout8Page
from django.conf import settings
from django.conf.urls.static import static

app_name = 'group8'

urlpatterns = [
    
    path('admin/', admin.site.urls),
    path('accounts/', include('registration.urls')), 
    path('', views.home, name='home'),
    #saba added this
    path("add_word_page/", views.add_word_page, name="add_word_page"),
    path("progress/", views.ProgressReport, name="progress"),

    path("add-word/", views.add_word_view, name="add_word"),

    path("delete-word/<int:word_id>/", views.delete_word_view, name="delete_word"),
    path("edit-word/<int:word_id>/", views.edit_word_view, name="edit_word"),

    path("get-words-by-category-level/", views.get_words_by_category_level_view, name="get_words_by_category_level"),
    path("search-word/", views.search_word_view, name="search_word"),

    # IMPORTANT: match your tests EXACTLY
    path("mark-word-learned/<int:word_id>/", views.mark_word_as_learned_view, name="mark_word_learned"),

    path("get-progress-report/", views.progress_report_view, name="get_progress_report"),
    path('signup8/', views.Signup8Page, name='signup8'),
    path('login8/', views.Login8Page, name='login8'),
    path('logout8/', views.Logout8Page, name='logout8'),
    
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
