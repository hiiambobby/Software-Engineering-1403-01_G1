document.getElementById('signup-form').addEventListener('submit', function(event) {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const errorMessage = document.getElementById('error-message');

    if (!username || !email || !password || !confirmPassword) {
        errorMessage.textContent = 'All fields are required.';
        event.preventDefault();
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match.';
        event.preventDefault();
        return;
    }

    errorMessage.textContent = ''; // Clear any previous error messages
});