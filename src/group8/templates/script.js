// Mock function simulating backend response
function loadWordsFromBackend(category, level) {
    const mockWords = [
        { title: 'Cat', image: 'cat.jpg', category: 'Animals', level: 'Beginner' },
        { title: 'Dog', image: 'dog.jpg', category: 'Animals', level: 'Beginner' },
        { title: 'Apple', image: 'apple.jpg', category: 'Fruits', level: 'Beginner' },
        { title: 'Table', image: 'table.jpg', category: 'Objects', level: 'Beginner' },
    ];
    return mockWords.filter(word => word.category === category && word.level === level);
}

// Initialize variables
let wordsLearned = 0;
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
    updateWordList(filteredWords);
});

// Update word list and progress
function updateWordList(words = allWords) {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    words.forEach(word => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${word.title}</h3>
            <img src="${word.image}" alt="${word.title}">
            <button class="learned-btn">I know this word</button>
            <button class="favorite-btn">Favorite</button>
        `;
        wordList.appendChild(li);

        // 'I know this word' button functionality
        li.querySelector('.learned-btn').addEventListener('click', () => {
            wordsLearned++;
            document.getElementById('words-learned').textContent = wordsLearned;
            li.querySelector('.learned-btn').disabled = true;
            if (isSoundOn) {
                alert('Sound: You learned the word!');
            }
        });

        // 'Favorite' button functionality
        li.querySelector('.favorite-btn').addEventListener('click', () => {
            li.querySelector('.favorite-btn').textContent = 'Favorited';
            li.querySelector('.favorite-btn').disabled = true;
        });
    });
}

// Start button functionality
document.getElementById('start-btn').addEventListener('click', () => {
    const category = document.getElementById('category').value;
    const level = document.getElementById('level').value;
    if (category && level) {
        const words = loadWordsFromBackend(category, level);
        allWords = words;
        updateWordList(words);
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
            updateWordList(allWords);
            alert('New word added successfully!');
        };
        reader.readAsDataURL(file); // Convert file to Base64
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
