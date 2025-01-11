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

// Track progress
let progressData = {
    animals: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
    },
    fruits: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
    },
    objects: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
    },
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

        // Save the progress data when the word is marked as known
        const currentWord = allWords[currentPage];
        progressData[currentWord.category][currentWord.level] += 1;
        totalWordsLearned += 1;

        // Hide the word from the list
        wordList.querySelector('li').style.display = 'none';

        // Update the progress display
        updateProgressDisplay();

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

// Function to update the progress display
function updateProgressDisplay() {
    const progressSection = document.getElementById('progress');
    const progressContainer = progressSection.querySelector('div') || document.createElement('div');
    progressSection.appendChild(progressContainer);

    // Display progress with levels and total words for each category
    progressContainer.innerHTML = `
        <div class="progress-category">
            <h3>Animals</h3>
            <div class="progress-levels">
                <div class="circle" style="background: conic-gradient(#4caf50 ${progressData.animals.beginner * 100 / 10}%, lightgray 0%);"></div>
                <span>Beginner: ${progressData.animals.beginner}/10</span>
                <div class="circle" style="background: conic-gradient(#ff9800 ${progressData.animals.intermediate * 100 / 10}%, lightgray 0%);"></div>
                <span>Intermediate: ${progressData.animals.intermediate}/10</span>
                <div class="circle" style="background: conic-gradient(#f44336 ${progressData.animals.advanced * 100 / 10}%, lightgray 0%);"></div>
                <span>Advanced: ${progressData.animals.advanced}/10</span>
            </div>
            <p>Total Words: ${progressData.animals.beginner + progressData.animals.intermediate + progressData.animals.advanced}</p> <!-- Added total words -->
        </div>
        <div class="progress-category">
            <h3>Fruits</h3>
            <div class="progress-levels">
                <div class="circle" style="background: conic-gradient(#4caf50 ${progressData.fruits.beginner * 100 / 10}%, lightgray 0%);"></div>
                <span>Beginner: ${progressData.fruits.beginner}/10</span>
                <div class="circle" style="background: conic-gradient(#ff9800 ${progressData.fruits.intermediate * 100 / 10}%, lightgray 0%);"></div>
                <span>Intermediate: ${progressData.fruits.intermediate}/10</span>
                <div class="circle" style="background: conic-gradient(#f44336 ${progressData.fruits.advanced * 100 / 10}%, lightgray 0%);"></div>
                <span>Advanced: ${progressData.fruits.advanced}/10</span>
            </div>
            <p>Total Words: ${progressData.fruits.beginner + progressData.fruits.intermediate + progressData.fruits.advanced}</p> <!-- Added total words -->
        </div>
        <div class="progress-category">
            <h3>Objects</h3>
            <div class="progress-levels">
                <div class="circle" style="background: conic-gradient(#4caf50 ${progressData.objects.beginner * 100 / 10}%, lightgray 0%);"></div>
                <span>Beginner: ${progressData.objects.beginner}/10</span>
                <div class="circle" style="background: conic-gradient(#ff9800 ${progressData.objects.intermediate * 100 / 10}%, lightgray 0%);"></div>
                <span>Intermediate: ${progressData.objects.intermediate}/10</span>
                <div class="circle" style="background: conic-gradient(#f44336 ${progressData.objects.advanced * 100 / 10}%, lightgray 0%);"></div>
                <span>Advanced: ${progressData.objects.advanced}/10</span>
            </div>
            <p>Total Words: ${progressData.objects.beginner + progressData.objects.intermediate + progressData.objects.advanced}</p> <!-- Added total words -->
        </div>
    `;
}
