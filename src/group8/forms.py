from django import forms
from .models import Word

class WordForm(forms.ModelForm):
    class Meta:
        model = Word
        fields = ['title', 'level', 'category', 'image']  # Include the fields you want in the form
