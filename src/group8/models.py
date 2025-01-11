from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)

class Level(models.Model):
    name = models.CharField(max_length=100)

class Word(models.Model):
    word = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    level = models.ForeignKey(Level, on_delete=models.CASCADE)
    learned_users = models.ManyToManyField(User, related_name='learned_words')

    def __str__(self):
        return self.word
