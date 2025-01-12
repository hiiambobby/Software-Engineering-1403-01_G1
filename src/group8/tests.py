from django.test import TestCase
from django.urls import reverse
from .models import Word
from .services import WordService
from django.contrib.auth.models import User
import json

class WordServiceTestCase(TestCase):

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username="testuser", password="password")
        
        # Create test words
        self.word1 = Word.objects.create(
            title="Apple",
            category="Fruit",
            level="Beginner",
            image_url="http://example.com/apple.jpg"
        )
        self.word2 = Word.objects.create(
            title="Carrot",
            category="Vegetable",
            level="Beginner",
            image_url="http://example.com/carrot.jpg"
        )

    def test_add_word(self):
        word_data = {
            "title": "Banana",
            "category": "Fruit",
            "level": "Beginner",
            "image_url": "http://example.com/banana.jpg",
        }
        new_word = WordService.add_word(self.user, word_data)
        self.assertIsNotNone(new_word)
        self.assertEqual(new_word.title, "Banana")
        self.assertEqual(new_word.category, "Fruit")

    def test_delete_word(self):
        success = WordService.delete_word(self.user, self.word1.id)
        self.assertTrue(success)
        with self.assertRaises(Word.DoesNotExist):
            Word.objects.get(id=self.word1.id)

    def test_edit_word(self):
        updated_data = {"title": "Updated Apple"}
        updated_word = WordService.edit_word(self.user, self.word1.id, updated_data)
        self.assertIsNotNone(updated_word)
        self.assertEqual(updated_word.title, "Updated Apple")

    def test_get_words_by_category_level(self):
        words = WordService.get_words_by_category_level("Fruit", "Beginner")
        self.assertEqual(len(words), 1)
        self.assertEqual(words[0].title, "Apple")

    def test_search_word(self):
        words = WordService.search_word("Apple")
        self.assertEqual(len(words), 1)
        self.assertEqual(words[0].title, "Apple")


class ProgressReportTestCase(TestCase):

    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username="testuser", password="password")
        
        # Create test words
        self.word1 = Word.objects.create(
            title="Apple",
            category="Fruit",
            level="Beginner",
            image_url="http://example.com/apple.jpg"
        )
        self.word2 = Word.objects.create(
            title="Carrot",
            category="Vegetable",
            level="Beginner",
            image_url="http://example.com/carrot.jpg"
        )
        self.word3 = Word.objects.create(
            title="Broccoli",
            category="Vegetable",
            level="Intermediate",
            image_url="http://example.com/broccoli.jpg"
        )

    def test_mark_word_as_learned(self):
        response = self.client.post(
            reverse("group8:mark_word_learned", args=[self.word1.id]),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Word marked as learned.")

    def test_get_user_progress_report(self):
        # Mark words as learned
        self.client.post(reverse("group8:mark_word_learned", args=[self.word1.id]), content_type="application/json")
        self.client.post(reverse("group8:mark_word_learned", args=[self.word2.id]), content_type="application/json")
        
        # Get progress report
        response = self.client.get(reverse("group8:get_progress_report"))
        self.assertEqual(response.status_code, 200)

        progress_data = response.json()
        self.assertEqual(progress_data["total_words_learned"], 2)
        self.assertEqual(progress_data["progress_by_category"]["Fruit"], 1)
        self.assertEqual(progress_data["progress_by_category"]["Vegetable"], 1)
        self.assertEqual(progress_data["progress_by_level"]["Beginner"], 2)
        self.assertEqual(progress_data["progress_by_level"]["Intermediate"], 0)

    def test_empty_progress_report(self):
        # Get progress report when no words are marked as learned
        response = self.client.get(reverse("group8:get_progress_report"))
        self.assertEqual(response.status_code, 200)

        progress_data = response.json()
        self.assertEqual(progress_data["total_words_learned"], 0)
        self.assertEqual(progress_data["progress_by_category"], {})
        self.assertEqual(progress_data["progress_by_level"], {})
