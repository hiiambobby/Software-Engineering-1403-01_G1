// Mock function simulating backend response
async function loadWordsFromBackend(category, level) {
  try {
    const response = await fetch(`/get-words-by-category-level/?category=${encodeURIComponent(category)}&level=${encodeURIComponent(level)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // Include 'X-CSRFToken': getCookie('csrftoken') if CSRF is enforced
      }
    });
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const data = await response.json();  // data = { "words": [...] }
    return data.words;
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
  let url = `/search-word/?title=${encodeURIComponent(searchText)}`;
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  try {
    const encodedUrl = `/search-word/?title=${encodeURIComponent(searchText)}`;
    if (category) {
        encodedUrl += `&category=${encodeURIComponent(category)}`;
    }
    const response = await fetch(encodedUrl);
    const data = await response.json();
    return data.words;  // array of words from the server
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

// Update displayed word and pagination controls
function updateWordDisplay(words = allWords) {
    const wordList = document.getElementById('word-list');
    const paginationControls = document.getElementById('pagination-controls');

    if (words.length === 0) {
        wordList.innerHTML = '<p>No words to display.</p>';
        paginationControls.innerHTML = '';
        return; // Add return to exit the function if no words are available
    }

    // Ensure currentPage is within bounds
    if (currentPage >= words.length) {
        currentPage = words.length - 1;
    } else if (currentPage < 0) {
        currentPage = 0;
    }

    const word = words[currentPage];
    wordList.innerHTML = `
        <li>
            <h3>${word.title}</h3>
            <img src="${word.image}" alt="${word.title}">
            <button class="learned-btn">I know this word!</button>
            <button class="dont-remember-btn">I don't remember</button>
            <button class="favorite-btn">Like</button>
        </li>
    `;

    // 'I know this word' button functionality
    const learnedBtn = wordList.querySelector('.learned-btn');
    learnedBtn.addEventListener('click', () => {
        learnedBtn.disabled = true;
        if (isSoundOn) {
            const learnedSound = document.getElementById('learned-sound');
            learnedSound.play();
        }
    });

    // 'I don't remember' button functionality
    const dontRememberBtn = wordList.querySelector('.dont-remember-btn');
    dontRememberBtn.addEventListener('click', () => {
        if (isSoundOn) {
            const dontRememberSound = document.getElementById('dont-remember-sound');
            dontRememberSound.play();
        }
    });

    // 'Favorite' button functionality
    const favoriteBtn = wordList.querySelector('.favorite-btn');
    favoriteBtn.addEventListener('click', () => {
        favoriteBtn.textContent = 'Liked';
        favoriteBtn.disabled = true;
    });

    // Update pagination controls
    paginationControls.innerHTML = `
        <button ${currentPage === 0 ? 'disabled' : ''} id="prev-btn">Previous</button>
        <button ${currentPage === words.length - 1 ? 'disabled' : ''} id="next-btn">Next</button>
    `;

    // Pagination button functionality
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                updateWordDisplay(words);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < words.length - 1) {
                currentPage++;
                updateWordDisplay(words);
            }
        });
    }
}

// Start button functionality
document.getElementById('start-btn').addEventListener('click', async () => {
  const category = document.getElementById('category').value;
  const level = document.getElementById('level').value;
  if (category && level) {
    const words = await loadWordsFromBackend(category, level);
    allWords = words;      // your global array
    currentPage = 0;       // reset pagination to page 0
    updateWordDisplay();   // now displays real data from Django
  } else {
    alert('Please select both category and level.');
  }
});

// Add new word functionality
document.getElementById('add-word-btn').addEventListener('click', async () => {
  const title = document.getElementById('word-title').value;
  const category = document.getElementById('word-category').value;
  const level = document.getElementById('word-level').value;
  const fileInput = document.getElementById('word-image');
  const file = fileInput.files[0];

  if (title && category && level && file) {
    // Convert the file to a Base64 data URL (like you do now)
    const reader = new FileReader();
    reader.onload = async (e) => {
      // e.target.result is a base64 string representing the image
      const imageDataURL = e.target.result;

      // 1. Send data to the server
      const payload = {
        title: title,
        category: category,
        level: level,
        // On the server side, you might store the image differently.
        // If your backend expects a regular URL, you must handle file uploads differently (multipart form data).
        image_url: imageDataURL
      };

      try {
        const response = await fetch('/add-word/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
          alert('New word added successfully!');
          // Optionally push the new word into allWords or re-fetch from the server
          // allWords.push({ ...payload, id: data.word_id });
          // updateWordDisplay(allWords);
        } else {
          console.error('Add word error:', data.error);
          alert('Failed to add word: ' + data.error);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    reader.readAsDataURL(file);
  } else {
    alert('Please fill out all fields and select an image to add a new word.');
  }
});
////delete words/////
async function deleteWord(wordId) {
  try {
    const response = await fetch(`/delete-word/${wordId}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      }
    });
    const data = await response.json();
    if (response.ok) {
      alert('Word deleted successfully!');
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
    const response = await fetch(`/edit-word/${wordId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.ok) {
      alert('Word updated successfully.');
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

async function fetchProgressReport() {
  try {
    const response = await fetch('/get-progress-report/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      }
    });
    const data = await response.json(); // e.g. { total_words_learned, progress_by_category, progress_by_level }
    if (response.ok) {
      return data;
    } else {
      console.error('Progress report error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Fetch progress error:', error);
    return null;
  }
}

document.getElementById('show-progress-btn').addEventListener('click', async () => {
    const progress = await fetchProgressReport();

    if (progress) {
        updateProgressDisplay(progress); // Update the display with the fetched progress
    } else {
        alert('Failed to fetch progress report. Please try again later.');
    }
});

 function updateProgressDisplay(progress) {
    const progressSection = document.getElementById('progress');
    progressSection.innerHTML = ''; // Clear previous content

    const totalWordsLearned = progress.total_words_learned || 0;
    const progressByCategory = progress.progress_by_category || {};
    const progressByLevel = progress.progress_by_level || {};

    // Display total words learned
    const totalWordsLearnedElement = document.createElement('h3');
    totalWordsLearnedElement.textContent = `Total Words Learned: ${totalWordsLearned}`;
    progressSection.appendChild(totalWordsLearnedElement);

    // Create progress for each category
    for (const [category, count] of Object.entries(progressByCategory)) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'progress-category';
        categoryElement.innerHTML = `
            <h4>${category}</h4>
            <p>Words Learned: ${count}</p>
        `;
        progressSection.appendChild(categoryElement);
    }

    // Create progress for each level
    for (const [level, count] of Object.entries(progressByLevel)) {
        const levelElement = document.createElement('div');
        levelElement.className = 'progress-level';
        levelElement.innerHTML = `
            <h4>${level}</h4>
            <p>Words Learned: ${count}</p>
        `;
        progressSection.appendChild(levelElement);
    }
}

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
