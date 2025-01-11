from django.test import TestCase
from django.contrib.auth.models import User
from .models import Category, Level, Word
from django.db import IntegrityError
from django.db import transaction

class WordLearningProgressTest(TestCase):
    
    def setUp(self):
        """
        Set up initial data for tests.
        """
        # Create test categories and levels
        self.category1 = Category.objects.create(name="Animals")
        self.category2 = Category.objects.create(name="Fruits")
        self.level1 = Level.objects.create(name="Beginner")
        self.level2 = Level.objects.create(name="Intermediate")
        
        # Create test words
        self.word1 = Word.objects.create(word="Cat", category=self.category1, level=self.level1)
        self.word2 = Word.objects.create(word="Apple", category=self.category2, level=self.level1)
        self.word3 = Word.objects.create(word="Elephant", category=self.category1, level=self.level2)

        # Create test users
        self.user1 = User.objects.create_user(username="user1", password="password")
        self.user2 = User.objects.create_user(username="user2", password="password")
    
    def test_user_can_mark_word_as_learned(self):
        """
        Test that a user can mark a word as learned.
        """
        # Mark the word as learned for user1
        self.word1.learned_users.add(self.user1)
        self.assertIn(self.user1, self.word1.learned_users.all())
        
        # Ensure that the word is not marked as learned for user2
        self.assertNotIn(self.user2, self.word1.learned_users.all())
    
    def test_user_can_learn_multiple_words(self):
        """
        Test that a user can mark multiple words as learned.
        """
        # Mark words as learned for user1
        self.word1.learned_users.add(self.user1)
        self.word2.learned_users.add(self.user1)
        
        # Check that the words are marked correctly
        self.assertIn(self.user1, self.word1.learned_users.all())
        self.assertIn(self.user1, self.word2.learned_users.all())
    
    def test_calculate_user_progress(self):
        """
        Test the calculation of user progress (how many words they have learned).
        """
        # Mark words as learned for user1
        self.word1.learned_users.add(self.user1)
        self.word3.learned_users.add(self.user1)

        # Calculate the number of words user1 has learned
        learned_words = self.user1.learned_words.all()
        
        self.assertEqual(learned_words.count(), 2)
    
    def test_user_progress_by_category(self):
        """
        Test that user progress can be tracked by category.
        """
        # Mark words as learned for user1
        self.word1.learned_users.add(self.user1)
        self.word2.learned_users.add(self.user1)

        # Check learned words in 'Animals' category
        animals_progress = self.user1.learned_words.filter(category=self.category1)
        self.assertEqual(animals_progress.count(), 1)  # user1 has learned 1 word in Animals category
        
        # Check learned words in 'Fruits' category
        fruits_progress = self.user1.learned_words.filter(category=self.category2)
        self.assertEqual(fruits_progress.count(), 1)  # user1 has learned 1 word in Fruits category
    
    def test_user_progress_by_level(self):
        """
        Test that user progress can be tracked by level.
        """
        # Mark words as learned for user1
        self.word1.learned_users.add(self.user1)
        self.word3.learned_users.add(self.user1)

        # Check learned words in 'Beginner' level
        beginner_progress = self.user1.learned_words.filter(level=self.level1)
        self.assertEqual(beginner_progress.count(), 1)  # user1 has learned 1 word in Beginner level
        
        # Check learned words in 'Intermediate' level
        intermediate_progress = self.user1.learned_words.filter(level=self.level2)
        self.assertEqual(intermediate_progress.count(), 1)  # user1 has learned 1 word in Intermediate level
    
    def test_word_creation_without_category_or_level(self):
        """
        Ensure that a word cannot be created without a category or level.
        """
        with self.assertRaises(IntegrityError):
            Word.objects.create(word="Unknown")
 

    def tearDown(self):
        """
        Clean up after tests.
            """
        # Ensure that we are handling the database cleanup properly within a transaction block.
        try:
            with transaction.atomic():
                # Delete learned relationships first
                self.word1.learned_users.clear()
                self.word2.learned_users.clear()
                self.word3.learned_users.clear()
                
                # Now delete words
                self.word1.delete()
                self.word2.delete()
                self.word3.delete()
                
                # Finally delete categories and levels
                self.category1.delete()
                self.category2.delete()
                self.level1.delete()
                self.level2.delete()
                
                # Delete users
                self.user1.delete()
                self.user2.delete()
        except Exception as e:
            # Print out any error for debugging purposes
            print(f"Error in tearDown: {e}")
