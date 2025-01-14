from django.contrib.auth.models import User
from django.db import models
from django.db.models import Count


# class UserProfile(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
#     name = models.CharField(max_length=100, blank=True)
#     age = models.PositiveIntegerField(null=True, blank=True)

#     def __str__(self):
#         return f"{self.user.username}'s Profile"

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    name = models.CharField(max_length=100, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Word(models.Model):
    title = models.CharField(max_length=255, default="none")
    level = models.CharField(max_length=50, default="none")
    category = models.CharField(max_length=50, default="none")
    image_url = models.CharField(max_length=255, default="images/default_image.jpg")

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
        """
        Returns a dictionary like {"Fruit": 5, "Vegetable": 2, ...}
        """
        from django.db.models import Count
        qs = self.learned_words.values('category').annotate(count=Count('category'))
        result = {}
        for row in qs:
            cat = row['category']
            cnt = row['count']
            result[cat] = cnt
        return result

    def get_learned_by_level(self):
        """
        Returns a dictionary like {"Beginner": 3, "Intermediate": 1, ...}
        """
        from django.db.models import Count
        qs = self.learned_words.values('level').annotate(count=Count('level'))
        result = {}
        for row in qs:
            lvl = row['level']
            cnt = row['count']
            result[lvl] = cnt
        return result

    def __str__(self):
        return f"Progress for {self.user.username}"
