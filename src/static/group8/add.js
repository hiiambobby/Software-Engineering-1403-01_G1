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

document.getElementById('add-word-btn').addEventListener('click', async () => {
    const title = document.getElementById('word-title').value;
    const category = document.getElementById('word-category').value;
    const level = document.getElementById('word-level').value;
    const fileInput = document.getElementById('word-image');
    const file = fileInput.files[0];

    if (title && category && level && file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            console.log('File read successfully:', e.target.result); // Check Base64 data

            const imageDataURL = e.target.result;

            // Prepare the payload
            const payload = {
                title: title,
                category: category,
                level: level,
                image_url: imageDataURL,
            };

            try {
                // Send the POST request
                const response = await fetch('/group8/add-word/', {  // Ensure the URL path matches the pattern in urls.py
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken') // Include CSRF token
                    },
                    body: JSON.stringify(payload),
                });

                // Log the response for debugging
                console.log('Response:', response);

                // Check if the response is not OK
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Add word error:', errorText);
                    alert('Failed to add word: ' + errorText);
                    return;
                }

                const data = await response.json();
                alert('New word added successfully!');
                // Optionally update your UI
            } catch (error) {
                console.error('Fetch error:', error);
                console.log(file); // Check the file object
            }
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please fill out all fields and select an image to add a new word.');
    }
});