// Initialize Telegram WebApp (if needed on profile page)
const tg = window.Telegram.WebApp;
tg.ready();

// Parse user_id from query string
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
if (!userId) {
    console.error('user_id is required');
    // Display an error message on the page
    document.getElementById('user-id').textContent = 'Error: User ID not found.';
    document.getElementById('username').textContent = '';
    document.getElementById('avatar').src = ''; // Clear default avatar
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!userId) return; // Don't fetch if user_id is missing

    try {
        const response = await fetch(`/api/user_profile?user_id=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();

        // Update HTML elements with user data
        document.getElementById('user-id').textContent = userData.user_id || 'N/A';
        document.getElementById('username').textContent = userData.username || 'N/A'; // Assuming backend provides username
        const avatarImg = document.getElementById('avatar');
        if (avatarImg && userData.avatar_url) {
            avatarImg.src = userData.avatar_url;
        } else if (avatarImg) {
            avatarImg.src = '/static/img/default-avatar.png'; // Fallback to default
        }

        // You can add more fields here as your User model grows

    } catch (error) {
        console.error('Error fetching user profile:', error);
        // Display error on page
        document.getElementById('user-id').textContent = 'Error loading profile.';
        document.getElementById('username').textContent = '';
        const avatarImg = document.getElementById('avatar');
         if (avatarImg) {
            avatarImg.src = '/static/img/default-avatar.png'; // Fallback to default
        }
    }
}); 