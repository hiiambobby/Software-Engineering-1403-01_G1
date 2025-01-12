from django.contrib.auth.models import User
from django.db import models

class Word(models.Model):

    title = models.CharField(max_length=255,default="none")
    level = models.CharField(max_length=50,default="none")
    category = models.CharField(max_length=50, default="none")
    image_url = models.CharField(max_length=255, default="http://example.com/default_image.jpg")

    def get_category(self):
        return self.category

    def get_image_url(self):
        return self.image_url

    def get_level(self):
        return self.level

    def get_title(self):
        return self.title

    def __str__(self):
        return self.title
    
class UserProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='progress')
    learned_words = models.ManyToManyField(Word, related_name='learned_by')

    def get_total_learned(self):
        return self.learned_words.count()

    def get_learned_by_category(self):
        return self.learned_words.values('category').annotate(count=models.Count('category'))

    def get_learned_by_level(self):
        return self.learned_words.values('level').annotate(count=models.Count('level'))

    def __str__(self):
        return f"Progress for {self.user.username}"

########################################karbala   : done 

