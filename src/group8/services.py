from django.db.models import Count
from .models import Word, UserProgress

class WordService:

    @staticmethod
    def add_word(user, word_data):
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
        return Word.objects.filter(category=category, level=level)

    @staticmethod
    def search_word(title, category=None):
        query = Word.objects.filter(title__icontains=title)
        if category is not None:
            query = query.filter(category=category)
        return query

    @staticmethod
    def mark_word_as_learned(user, word_id):
        try:
            word = Word.objects.get(id=word_id)
            progress, _ = UserProgress.objects.get_or_create(user=user)
            # If already learned, do nothing
            if word in progress.learned_words.all():
                print("Word is already marked as learned.")
                return False
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
        try:
            progress, _ = UserProgress.objects.get_or_create(user=user)
            return {
                "total_learned": progress.get_total_learned(),
                "learned_by_category": progress.get_learned_by_category(),
                "learned_by_level": progress.get_learned_by_level(),
            }
        except Exception as e:
            print(f"Error retrieving user progress: {e}")
            return None
