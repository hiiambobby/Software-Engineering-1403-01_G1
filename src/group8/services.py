from .models import Word , UserProgress
###############################karbala : done 
class WordService:

    @staticmethod
    def add_word(user, word_data):
        """
        Add a new word to the database.
        :param user: User object (to check permissions if needed)
        :param word_data: Dictionary containing word details
        :return: Word object or None
        """
        try:
            word = Word.objects.create(
                title=word_data['title'],
                category=word_data['category'],
                level=word_data['level'],
                image_url=word_data['image_url']
            )
            return word
        except Exception as e:
            print(f"Error adding word: {e}")
            return None

    @staticmethod
    def delete_word(user, word_id):
        """
        Delete a word from the database.
        :param user: User object (to check permissions if needed)
        :param word_id: ID of the word to delete
        :return: Boolean (True if deleted, False otherwise)
        """
        try:
            word = Word.objects.get(id=word_id)
            word.delete()
            return True
        except Word.DoesNotExist:
            print("Word not found.")
            return False
        except Exception as e:
            print(f"Error deleting word: {e}")
            return False

    @staticmethod
    def edit_word(user, word_id, new_data):
        """
        Edit an existing word in the database.
        :param user: User object (to check permissions if needed)
        :param word_id: ID of the word to edit
        :param new_data: Dictionary containing new word details
        :return: Word object or None
        """
        try:
            word = Word.objects.get(id=word_id)
            word.title = new_data.get('title', word.title)
            word.category = new_data.get('category', word.category)
            word.level = new_data.get('level', word.level)
            word.image_url = new_data.get('image_url', word.image_url)
            word.save()
            return word
        except Word.DoesNotExist:
            print("Word not found.")
            return None
        except Exception as e:
            print(f"Error editing word: {e}")
            return None

    @staticmethod
    def get_words_by_category_level(category, level):
        """
        Retrieve words filtered by category and level.
        :param category: Category ID
        :param level: Level (e.g., Beginner, Intermediate, Advanced)
        :return: QuerySet of words
        """
        return Word.objects.filter(category=category, level=level)

    @staticmethod
    def search_word(title, category=None):
        """
        Search for words by title and optionally by category.
        :param title: Title or part of the title to search for
        :param category: (Optional) Category ID to filter
        :return: QuerySet of words
        """
        query = Word.objects.filter(title__icontains=title)
        if category is not None:
            query = query.filter(category=category)
        return query

    @staticmethod
    def mark_word_as_learned(user, word_id):
        """
        Mark a word as learned for the user.
        :param user: User object
        :param word_id: ID of the word
        :return: Boolean (True if successful, False otherwise)
        """
        try:
            # Retrieve the word object
            word = Word.objects.get(id=word_id)
            
            # Retrieve or create the user's progress object
            progress, created = UserProgress.objects.get_or_create(user=user)
            
            # Check if the word is already in learned_words
            if word in progress.learned_words.all():
                print("Word is already marked as learned.")
                return False  # Word already exists, no action taken
            
            # Add the word to learned_words
            progress.learned_words.add(word)
            return True
        except Word.DoesNotExist:
            print("Word not found.")
            return False
        except Exception as e:
            print(f"Error marking word as learned: {e}")
            return False
        

    @staticmethod
    def get_user_progress(user):
        """
        Retrieve the progress report for the user.
        :param user: User object
        :return: Dictionary with total, category, and level progress
        """
        try:
            # Retrieve or create the user's progress object
            progress, created = UserProgress.objects.get_or_create(user=user)
            
            # Retrieve progress data
            total_learned = progress.get_total_learned()
            learned_by_category = progress.get_learned_by_category()
            learned_by_level = progress.get_learned_by_level()
            
            return {
                "total_learned": total_learned,
                "learned_by_category": list(learned_by_category),
                "learned_by_level": list(learned_by_level),
            }
        except Exception as e:
            print(f"Error retrieving user progress: {e}")
            return None