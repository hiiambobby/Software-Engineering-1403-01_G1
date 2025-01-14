// Mock function simulating backend response
async function loadWordsFromBackend(category, level) {
  try {
    const response = await fetch(`/group8/get-words-by-category-level/?category=${category}&level=${level}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
     , 'X-CSRFToken': getCookie('csrftoken')// if CSRF is enforced
      }
    });
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const data = await response.json();  // data = { "words": [...] }
    return data.words.map(word => ({
        ...word,
        image_url: decodeURIComponent(word.image_url) // Ensure URL is decoded
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

// Toggle sound icon
let isSoundOn = true;
const soundBtn = document.getElementById('sound-btn');
soundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    soundBtn.textContent = isSoundOn ? '🔊' : '🔇';
});

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

    // Ensure currentPage is within bounds
    if (currentPage >= words.length) {
        currentPage = words.length - 1;
    }

    const word = words[currentPage];
    wordList.innerHTML = `
        <li class="word-item">
            <h3>${word.title}</h3>
            <img src="${word.image_url}" alt="${word.title}" class="word-image">
            <div class="button-container">
                <button class="learned-btn">I know this word!</button>
                <button class="dont-remember-btn">I don't remember</button>
                <button class="favorite-btn">Like</button>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
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
            if (response.ok) {
                alert('Word marked as learned!');
            } else {
                alert('Failed to mark word as learned: ' + data.error);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    });

    // 'I don't remember' button functionality
    document.querySelector('.dont-remember-btn').addEventListener('click', () => {
        if (isSoundOn) alert('Keep trying!');
    });

    // 'Favorite' button functionality
    document.querySelector('.favorite-btn').addEventListener('click', (event) => {
        event.target.textContent = 'Liked';
        event.target.disabled = true;
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
        <button id="prev-btn" ${currentPage === 0 ? 'disabled' : ''}>Previous</button>
        <span>Word ${currentPage + 1} of ${words.length}</span>
        <button id="next-btn" ${currentPage === words.length - 1 ? 'disabled' : ''}>Next</button>
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
document.getElementById('start-btn').addEventListener('click', async () => {
  const category = document.getElementById('category').value;
  const level = document.getElementById('level').value;
  if (category || level) {
    const words = await loadWordsFromBackend(category, level);
    allWords = words;      // your global array
    currentPage = 0;       // reset pagination to page 0
    updateWordDisplay();   // now displays real data from Django
  } else {
    alert('Please select category or level to start learning.');
  }
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



// Preview uploaded image
const wordImageInput = document.getElementById('word-image');
const imagePreview = document.getElementById('image-preview');
wordImageInput.addEventListener('change', () => {
    const file = wordImageInput.files[0];
    imagePreview.innerHTML = '';
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
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




// //Fetch and display the progress report when the page loads
// document.addEventListener('DOMContentLoaded', async () => {
//     const progress = await fetchProgressReport();
//     if (progress) {
//         updateProgressDisplay(progress);
//     } else {
//         alert('Failed to fetch progress report. Please try again later.');
//     }
// });

// // Function to update the progress display
// function updateProgressDisplay() {
//     const progressSection = document.getElementById('progress');
//     const progressContainer = progressSection.querySelector('div') || document.createElement('div');
//     progressSection.appendChild(progressContainer);

//     const getTotalWords = (category) => (
//         progressData[category].beginner +
//         progressData[category].intermediate +
//         progressData[category].advanced
//     );

//     progressContainer.innerHTML = `
//         <div class="progress-category">
//             <h3>Animals</h3>
//             <div class="progress-levels">
//                 <div class="circle" style="background: conic-gradient(#4caf50 ${progressData.animals.beginner * 100 / getTotalWords('animals')}%, lightgray 0%);"></div>
//                 <span>Beginner: ${progressData.animals.beginner}/${getTotalWords('animals')}</span>
//                 <div class="circle" style="background: conic-gradient(#ff9800 ${progressData.animals.intermediate * 100 / getTotalWords('animals')}%, lightgray 0%);"></div>
//                 <span>Intermediate: ${progressData.animals.intermediate}/${getTotalWords('animals')}</span>
//                 <div class="circle" style="background: conic-gradient(#f44336 ${progressData.animals.advanced * 100 / getTotalWords('animals')}%, lightgray 0%);"></div>
//                 <span>Advanced: ${progressData.animals.advanced}/${getTotalWords('animals')}</span>
//             </div>
//             <p>Total Words: ${getTotalWords('animals')}</p>
//         </div>
//         <div class="progress-category">
//             <h3>Fruits</h3>
//             <div class="progress-levels">
//                 <div class="circle" style="background: conic-gradient(#4caf50 ${progressData.fruits.beginner * 100 / getTotalWords('fruits')}%, lightgray 0%);"></div>
//                 <span>Beginner: ${progressData.fruits.beginner}/${getTotalWords('fruits')}</span>
//                 <div class="circle" style="background: conic-gradient(#ff9800 ${progressData.fruits.intermediate * 100 / getTotalWords('fruits')}%, lightgray 0%);"></div>
//                 <span>Intermediate: ${progressData.fruits.intermediate}/${getTotalWords('fruits')}</span>
//                 <div class="circle" style="background: conic-gradient(#f44336 ${progressData.fruits.advanced * 100 / getTotalWords('fruits')}%, lightgray 0%);"></div>
//                 <span>Advanced: ${progressData.fruits.advanced}/${getTotalWords('fruits')}</span>
//             </div>
//             <p>Total Words: ${getTotalWords('fruits')}</p>
//         </div>
//         <div class="progress-category">
//             <h3>Objects</h3>
//             <div class="progress-levels">
//                 <div class="circle" style="background: conic-gradient(#4caf50 ${progressData.objects.beginner * 100 / getTotalWords('objects')}%, lightgray 0%);"></div>
//                 <span>Beginner: ${progressData.objects.beginner}/${getTotalWords('objects')}</span>
//                 <div class="circle" style="background: conic-gradient(#ff9800 ${progressData.objects.intermediate * 100 / getTotalWords('objects')}%, lightgray 0%);"></div>
//                 <span>Intermediate: ${progressData.objects.intermediate}/${getTotalWords('objects')}</span>
//                 <div class="circle" style="background: conic-gradient(#f44336 ${progressData.objects.advanced * 100 / getTotalWords('objects')}%, lightgray 0%);"></div>
//                 <span>Advanced: ${progressData.objects.advanced}/${getTotalWords('objects')}</span>
//             </div>
//             <p>Total Words: ${getTotalWords('objects')}</p>
//         </div>
//     `;

//     // Update the total progress count
//     const totalWordsLearnedElement = document.getElementById('total-words-learned');
//     totalWordsLearnedElement.textContent = `Total Words Learned: ${totalWordsLearned}`;
// }
