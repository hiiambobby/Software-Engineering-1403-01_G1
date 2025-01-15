// Mock function simulating backend response
async function loadWordsFromBackend(category = '', level = '') {
    try {
        let url = '/group8/get-words-by-category-level/';
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (level) params.append('level', level);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        return data.words.map(word => ({
            ...word,
            image_url: decodeURIComponent(word.image_url)
        }));
    } catch (error) {
        console.error("Error fetching words:", error);
        return [];
    }
}

// Initialize variables
let currentPage = 0;
let allWords = [];

// Track progress
let progressData = {
    animals: { beginner: 0, intermediate: 0, advanced: 0 },
    fruits: { beginner: 0, intermediate: 0, advanced: 0 },
    objects: { beginner: 0, intermediate: 0, advanced: 0 },
};
let totalWordsLearned = 0; // To track total words learned


// Search functionality
const searchBar = document.getElementById('search-bar');
const categorySelect = document.getElementById('category');
const levelSelect = document.getElementById('level');

searchBar.addEventListener('input', async () => {
  const searchText = searchBar.value;
  // Call the server if you want server-side search:
  const words = await searchWords(searchText);
  currentPage = 0;
  updateWordDisplay(words);
});
async function searchWords(searchText, category = null) {
  let url = `/group8/search-word/?title=${encodeURIComponent(searchText)}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.words;  // array of words from the server
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Update displayed word and pagination controls
function updateWordDisplay(words = allWords) {
    const wordList = document.getElementById('word-list');
    const paginationControls = document.getElementById('pagination-controls');

    if (words.length === 0) {
        wordList.innerHTML = '<p>No words to display.</p>';
        paginationControls.innerHTML = '';
        return;
    }

    // Sort words alphabetically by title
    words.sort((a, b) => a.title.localeCompare(b.title));

    // Ensure currentPage is within bounds
    if (currentPage >= words.length) {
        currentPage = words.length - 1;
    }

    const word = words[currentPage];
    wordList.innerHTML = `
        <li class="word-item" style="text-align: center; width: 500px; margin: auto;">
            <h3>${word.title}</h3>
            <img src="${word.image_url}" alt="${word.title}" class="word-image" style="max-width: 400px; max-height: 400px; display: block; margin: 0 auto;">
            <div class="button-container" style="margin-top: 10px; display: flex; justify-content: center; gap: 10px;">
                <button class="learned-btn" style="padding: 10px; font-size: 16px;">✔️</button>
                <button class="edit-btn" style="padding: 10px; font-size: 16px;">✏️</button>
                <button class="delete-btn" style="padding: 10px; font-size: 16px;">🗑️</button>
            </div>
        </li>
    `;
    
    
    // 'I know this word' button functionality
    document.querySelector('.learned-btn').addEventListener('click', async () => {
        try {
            const response = await fetch(`/group8/mark-word-learned/${word.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
            const data = await response.json();
            //print(data.message);
            alert(data.message);
        } catch (err) {
            console.error('Error:', err);
        }
    });

  
    // 'Edit' button functionality
    document.querySelector('.edit-btn').addEventListener('click', () => {
        const newTitle = prompt("Enter the new title:", word.title);
        const newCategory = prompt("Enter the new category:", word.category);
        const newLevel = prompt("Enter the new level:", word.level);

        if (newTitle && newCategory && newLevel) {
            editWord(word.id, newTitle, newCategory, newLevel, word.image_url);
            words[currentPage] = { ...word, title: newTitle, category: newCategory, level: newLevel };
            //updateWordDisplay(words);
        }
    });

    // 'Delete' button functionality
    document.querySelector('.delete-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this word?')) {
            await deleteWord(word.id);
            words.splice(currentPage, 1);
            currentPage = Math.max(currentPage - 1, 0);
            //updateWordDisplay(words);
        }
    });

    // Update pagination controls
    paginationControls.innerHTML = `
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 25px;">
            <button id="prev-btn" ${currentPage === 0 ? 'disabled' : ''} style="padding: 10px; font-size: 16px;">⬅️</button>
            <span>Word ${currentPage + 1} of ${words.length}</span>
            <button id="next-btn" ${currentPage === words.length - 1 ? 'disabled' : ''} style="padding: 10px; font-size: 16px;">➡️</button>
        </div>
    `;

    // Add event listeners for pagination buttons
    document.getElementById('prev-btn').addEventListener('click', () => {
        currentPage--;
        updateWordDisplay(words);
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        currentPage++;
        updateWordDisplay(words);
    });
}

// Start button functionality
const startBtn = document.getElementById('start-btn');
if (startBtn) {
    startBtn.addEventListener('click', async () => {
        const category = document.getElementById('category').value;
        const level = document.getElementById('level').value;
    
        const words = await loadWordsFromBackend(category, level);
        allWords = words;      // your global array
        currentPage = 0;       // reset pagination to page 0
        updateWordDisplay();   // now displays real data from Django
        
        // alert('Please select category or level to start learning.');
        }
    );
}

async function loadAndDisplayWords() {
    const words = await loadWordsFromBackend('', ''); // Fetch all words without filtering by category or level
    allWords = words;
    currentPage = 0;
    updateWordDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayWords();
});

////delete words/////
async function deleteWord(wordId) {
  try {
    const response = await fetch(`/group8/delete-word/${wordId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      }
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      // Optionally remove from your allWords array, etc.
    } else {
      alert('Failed to delete word: ' + data.error);
    }
  } catch (error) {
    console.error('Delete word error:', error);
  }
}
//////edit//////
async function editWord(wordId, title, category, level, imageUrl) {
  const payload = { title, category, level, image_url: imageUrl };
  try {
    const response = await fetch(`/group8/edit-word/${wordId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
    } else {
      alert('Failed to update word: ' + data.error);
    }
  } catch (error) {
    console.error('Edit word error:', error);
  }
}
////////////////////////

async function addWord(wordData) {
    try {
        const response = await fetch('/group8/add-word/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(wordData)
        });
        const data = await response.json();
        if (response.ok) {
            alert('Word added successfully!');
        } else {
            alert('Failed to add word: ' + data.error);
        }
    } catch (error) {
        console.error('Add word error:', error);
    }
}

// Preview uploaded image
const wordImageInput = document.getElementById('word-image');
const imagePreview = document.getElementById('image-preview');
wordImageInput.addEventListener('change', () => {
    const file = wordImageInput.files[0];
    imagePreview.innerHTML = ''; // Clear previous image
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = ''; // Ensure previous image is cleared
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Selected Image';
            img.style.maxWidth = '100px';
            img.style.maxHeight = '100px';
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = '<p>No image selected</p>';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayWords();
});

// Function to fetch and display the progress report
async function fetchProgressReport() {
    try {
        const response = await fetch('/group8/progress-report/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching progress report:", error);
        return null;
    }
}

// Function to update the progress display
function updateProgressDisplay(progressData) {
    const progressSection = document.getElementById('progress');
    const progressContainer = progressSection.querySelector('div') || document.createElement('div');
    progressSection.appendChild(progressContainer);

    const progressByCategoryLevel = progressData.progress_by_category_level;
    const totalWordsLearned = progressData.total_words_learned;

    let progressHTML = '';

    for (const category in progressByCategoryLevel) {
        progressHTML += `<div class="progress-category"><h3>${category}</h3><div class="progress-levels">`;

        for (const level in progressByCategoryLevel[category]) {
            const { learned, total } = progressByCategoryLevel[category][level];
            const percentage = total > 0 ? (learned / total) * 100 : 0;

            progressHTML += `
                <div class="progress-level">
                    <div class="circle" style="background: conic-gradient(#4caf50 ${percentage}%, lightgray 0%);"></div>
                    <span>${level}: ${learned}/${total}</span>
                </div>
            `;
        }

        progressHTML += `</div></div>`;
    }

    progressHTML += `<p>Total Words Learned: ${totalWordsLearned}</p>`;

    progressContainer.innerHTML = progressHTML;
}

// Fetch and display the progress report when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const progressData = await fetchProgressReport();
    if (progressData) {
        updateProgressDisplay(progressData);
    } else {
        alert('Failed to fetch progress report. Please try again later.');
    }
});
