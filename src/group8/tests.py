# tests.py
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from .models import Word
from .services import WordService
import json

class WordServiceTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        self.word1 = Word.objects.create(title="Apple", category="Fruit", level="Beginner",
                                         image_url="http://example.com/apple.jpg")
        self.word2 = Word.objects.create(title="Carrot", category="Vegetable", level="Beginner",
                                         image_url="http://example.com/carrot.jpg")

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
        self.client = Client()
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.login(username="testuser", password="password")

        self.word1 = Word.objects.create(
            title="Apple", category="Fruit", level="Beginner",
            image_url="http://example.com/apple.jpg"
        )
        self.word2 = Word.objects.create(
            title="Carrot", category="Vegetable", level="Beginner",
            image_url="http://example.com/carrot.jpg"
        )
        self.word3 = Word.objects.create(
            title="Broccoli", category="Vegetable", level="Intermediate",
            image_url="http://example.com/broccoli.jpg"
        )

    def test_mark_word_as_learned(self):
        """Mark a word as learned and verify the response."""
        url = reverse("group8:mark_word_learned", args=[self.word1.id])
        response = self.client.post(url, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("message"), "Word marked as learned.")

    def test_get_user_progress_report(self):
        """Check if the progress report matches the correct counts."""
        # Mark word1 and word2 as learned
        self.client.post(reverse("group8:mark_word_learned", args=[self.word1.id]), content_type="application/json")
        self.client.post(reverse("group8:mark_word_learned", args=[self.word2.id]), content_type="application/json")

        # Retrieve progress report
        response = self.client.get(reverse("group8:get_progress_report"))
        self.assertEqual(response.status_code, 200)

        progress_data = response.json()
        self.assertEqual(progress_data["total_words_learned"], 2)
        self.assertEqual(progress_data["progress_by_category"]["Fruit"], 1)
        self.assertEqual(progress_data["progress_by_category"]["Vegetable"], 1)
        self.assertEqual(progress_data["progress_by_level"]["Beginner"], 2)
        # We didn't learn "Intermediate" yet
        self.assertEqual(progress_data["progress_by_level"].get("Intermediate", 0), 0)

    def test_empty_progress_report(self):
        """If no words are learned, everything should be zero or empty."""
        response = self.client.get(reverse("group8:get_progress_report"))
        self.assertEqual(response.status_code, 200)

        progress_data = response.json()
        self.assertEqual(progress_data["total_words_learned"], 0)
        self.assertEqual(progress_data["progress_by_category"], {})
        self.assertEqual(progress_data["progress_by_level"], {})


class WordEndpointsTestCase(TestCase):
    """
    Extra test class to check the CRUD endpoints (add, edit, delete, search)
    via HTTP requests rather than calling services directly.
    """
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.login(username="testuser", password="password")

        self.word = Word.objects.create(
            title="Orange", category="Fruit", level="Beginner",
            image_url="http://example.com/orange.jpg"
        )

    def test_add_word_endpoint(self):
        url = reverse("group8:add_word")
        payload = {
            "title": "Strawberry",
            "category": "Fruit",
            "level": "Intermediate",
            "image_url": "http://example.com/strawberry.jpg"
        }
        response = self.client.post(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 201, response.content)
        self.assertIn("Word added successfully.", response.json()["message"])

    def test_edit_word_endpoint(self):
        url = reverse("group8:edit_word", args=[self.word.id])
        payload = {
            "title": "Orange (Edited)",
            "image_url": "http://example.com/new-orange.jpg"
        }
        response = self.client.put(url, data=json.dumps(payload), content_type="application/json")
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()["message"], "Word updated successfully.")

        # Check if the object actually got updated
        self.word.refresh_from_db()
        self.assertEqual(self.word.title, "Orange (Edited)")
        self.assertEqual(self.word.image_url, "http://example.com/new-orange.jpg")

    def test_search_word_endpoint(self):
        # Searching for "Orange" which already exists
        url = reverse("group8:search_word")
        response = self.client.get(url + "?title=orange")
        self.assertEqual(response.status_code, 200)
        words = response.json().get("words", [])
        self.assertEqual(len(words), 1)
        self.assertEqual(words[0]["title"], "Orange")

    def test_delete_word_endpoint(self):
        url = reverse("group8:delete_word", args=[self.word.id])
        response = self.client.delete(url, content_type="application/json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Word deleted successfully.")
        with self.assertRaises(Word.DoesNotExist):
            Word.objects.get(id=self.word.id)

