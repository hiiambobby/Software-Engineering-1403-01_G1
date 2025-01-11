// Mock function simulating backend response
function loadWordsFromBackend(category, level) {
    const mockWords = [
        { title: 'Cat', image: 'yellowblackbear.jpeg', category: 'Animals', level: 'Beginner' },
        { title: 'Dog', image: 'dog.jpg', category: 'Animals', level: 'Beginner' },
        { title: 'Apple', image: 'apple.jpg', category: 'Fruits', level: 'Beginner' },
        { title: 'Table', image: 'table.jpg', category: 'Objects', level: 'Beginner' },
    ];
    return mockWords.filter(word => word.category === category && word.level === level);
}

// Initialize variables
let currentPage = 0;
let allWords = [];

// Toggle sound icon
let isSoundOn = true;
const soundBtn = document.getElementById('sound-btn');
soundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    soundBtn.textContent = isSoundOn ? '🔊' : '🔇';
});

// Search functionality
const searchBar = document.getElementById('search-bar');
searchBar.addEventListener('input', () => {
    const searchText = searchBar.value.toLowerCase();
    const filteredWords = allWords.filter(word =>
        word.title.toLowerCase().includes(searchText) ||
        word.category.toLowerCase().includes(searchText) ||
        word.level.toLowerCase().includes(searchText)
    );
    currentPage = 0; // Reset to the first page
    updateWordDisplay(filteredWords);
});

// Update displayed word and pagination controls
function updateWordDisplay(words = allWords) {
    const wordList = document.getElementById('word-list');
    const paginationControls = document.getElementById('pagination-controls');

    if (words.length === 0) {
        wordList.innerHTML = '<p>No words to display.</p>';
        paginationControls.innerHTML = '';
        return;
    }

    // Display only the current word
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
            alert('Sound: You learned the word!');
        }
    });

    // 'I don't remember' button functionality
    const dontRememberBtn = wordList.querySelector('.dont-remember-btn');
    dontRememberBtn.addEventListener('click', () => {
        if (isSoundOn) {
            alert('فدای سرت');
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
document.getElementById('start-btn').addEventListener('click', () => {
    const category = document.getElementById('category').value;
    const level = document.getElementById('level').value;
    if (category && level) {
        const words = loadWordsFromBackend(category, level);
        allWords = words;
        currentPage = 0; // Reset to the first page
        updateWordDisplay(words);
    } else {
        alert('Please select both category and level.');
    }
});

// Add new word functionality
document.getElementById('add-word-btn').addEventListener('click', () => {
    const title = document.getElementById('word-title').value;
    const category = document.getElementById('word-category').value;
    const level = document.getElementById('word-level').value;
    const fileInput = document.getElementById('word-image');
    const file = fileInput.files[0];

    if (title && category && level && file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newWord = { title, category, level, image: e.target.result };
            allWords.push(newWord);
            fileInput.value = ''; // Clear the file input
            document.getElementById('image-preview').innerHTML = ''; // Clear the image preview
            currentPage = allWords.length - 1; // Show the newly added word
            updateWordDisplay(allWords);
            alert('New word added successfully!');
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please fill out all fields and select an image to add a new word.');
    }
});

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
