from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
import base64
import json

from .models import Word, UserProgress, Request
from .services import WordService

class SignupViewTestCase(TestCase):
    def test_signup_success(self):
        url = reverse("group8:signup8")
        data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "testpassword",
            "confirm_password": "testpassword"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 302)  # Redirect after successful signup
        self.assertTrue(User.objects.filter(username="testuser").exists())

    def test_signup_failure_password_mismatch(self):
        url = reverse("group8:signup8")
        data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "testpassword",
            "confirm_password": "wrongpassword"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Passwords do not match.")

class LoginViewTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="testuser@example.com", password="testpassword"
        )

    def test_login_success(self):
        url = reverse("group8:login8")
        data = {"username": "testuser", "pass": "testpassword"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 302)  # Redirect to home after login

    def test_login_failure_invalid_credentials(self):
        url = reverse("group8:login8")
        data = {"username": "testuser", "pass": "wrongpassword"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Username or Password is incorrect.")        
class LogoutViewTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="testuser@example.com", password="testpassword"
        )
        self.client.login(username="testuser", password="testpassword")

    def test_logout(self):
        url = reverse("group8:logout8")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)  # Redirect to login
        self.assertNotIn("_auth_user_id", self.client.session)


class WordViewsTestCase(TestCase):
    def setUp(self):
        """
        Create test data and a test user.
        """
        # Create a test user
        self.user = User.objects.create_user(username="testuser", password="12345")
        self.client = Client()

        # Log the user in
        self.client.login(username="testuser", password="12345")

        # Create initial words
        self.word1 = Word.objects.create(
            title="Cat",
            category="animals",
            level="beginner",
            image_url="http://example.com/cat.jpg"
        )
        self.word2 = Word.objects.create(
            title="Dog",
            category="animals",
            level="beginner",
            image_url="http://example.com/dog.jpg"
        )

    def test_add_word_view(self):
        """
        Test that we can add a new word via the add_word_view
        and that duplicate titles fail properly.
        """
        url = reverse("group8:add_word")
        # Simulate a base64-encoded image (very small, just for test)
        fake_image_data = base64.b64encode(b"fake_image_content").decode('utf-8')
        payload = {
            "title": "Lion",
            "category": "animals",
            "level": "beginner",
            "image_url": f"data:image/png;base64,{fake_image_data}",
        }
        response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("Word added successfully.", response.json()["message"])

        # Attempt to add the same word again (duplicate title)
        duplicate_response = self.client.post(
            url,
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(duplicate_response.status_code, 400)
        self.assertIn("already exists", duplicate_response.json()["error"])

    def test_mark_word_as_learned_view(self):
        """
        Test marking a word as learned.
        """
        # Word that the user will learn
        word_id = self.word1.id
        url = reverse("group8:mark_word_learned", args=[word_id])

        # Make POST request to mark word as learned
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Word marked as learned.", response.json()["message"])

        # Try learning the same word again
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("You have already learned this word.", response.json()["message"])

        # Check that the word is indeed in the user's progress
        user_progress = UserProgress.objects.get(user=self.user)
        self.assertIn(self.word1, user_progress.learned_words.all())

    def test_search_word_view(self):
        """
        Test searching for a word by title.
        """
        url = reverse("group8:search_word")
        # Search for "Cat"
        response = self.client.get(f"{url}?title=Cat")
        self.assertEqual(response.status_code, 200)
        words = response.json()["words"]
        self.assertEqual(len(words), 1)
        self.assertEqual(words[0]["title"], "Cat")

        # Search for something that doesn't exist
        response = self.client.get(f"{url}?title=Elephant")
        self.assertEqual(response.status_code, 200)
        words = response.json()["words"]
        self.assertEqual(len(words), 0)

    def test_get_progress_report_view(self):
        """
        Test fetching the JSON-based progress report.
        """
        # Mark word1 as learned
        user_progress, _ = UserProgress.objects.get_or_create(user=self.user)
        user_progress.learned_words.add(self.word1)

        url = reverse("group8:get_progress_report")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("progress_by_category_level", data)
        self.assertIn("total_words_learned", data)
        self.assertEqual(data["total_words_learned"], 1)

class ProgressReportTestCase(TestCase):
    def setUp(self):
        # Create a user and associated UserProgress
        self.user = User.objects.create_user(
            username="testuser", email="testuser@example.com", password="testpassword"
        )
        self.user_progress = UserProgress.objects.create(user=self.user)

        # Create words
        self.word1 = Word.objects.create(title="Word1", category="animals", level="beginner")
        self.word2 = Word.objects.create(title="Word2", category="animals", level="intermediate")

        # Mark one word as learned for the user
        self.user_progress.learned_words.add(self.word1)

        # Log the user in
        self.client.login(username="testuser", password="testpassword")

    def test_progress_report_view(self):
        # Get the URL for the progress report view
        url = reverse("group8:get_progress_report")

        # Send a GET request to the view
        response = self.client.get(url)

        # Check the response status code
        self.assertEqual(response.status_code, 200)

        # Parse the JSON response
        data = response.json()

        # Validate the total words learned
        self.assertEqual(data["total_words_learned"], 1)

        # Validate that the "animals" category is present in the progress report
        self.assertIn("animals", data["progress_by_category_level"])

        # Validate the progress for the "Beginner" level in "animals"
        self.assertEqual(
            data["progress_by_category_level"]["animals"]["beginner"]["learned"], 1
        )
        self.assertEqual(
            data["progress_by_category_level"]["animals"]["beginner"]["total"], 1
        )

        # Validate the progress for the "Intermediate" level in "animals"
        self.assertEqual(
            data["progress_by_category_level"]["animals"]["intermediate"]["learned"], 0
        )
        self.assertEqual(
            data["progress_by_category_level"]["animals"]["intermediate"]["total"], 1
        )

class AddWordViewTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="testuser@example.com", password="testpassword"
        )
        self.client.login(username="testuser", password="testpassword")

    def test_add_word(self):
        url = reverse("group8:add_word")
        data = {
            "title": "TestWord",
            "category": "fruits",
            "level": "beginner",
            "image_url": "http://example.com/image.jpg"
        }
        response = self.client.post(url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(Word.objects.filter(title="TestWord").exists())

    def test_add_word_duplicate(self):
        Word.objects.create(title="TestWord", category="fruits", level="beginner")
        url = reverse("group8:add_word")
        data = {
            "title": "TestWord",
            "category": "fruits",
            "level": "beginner",
            "image_url": "http://example.com/image.jpg"
        }
        response = self.client.post(url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertContains(response, f"{data["title"]} already exists.", status_code=400)
