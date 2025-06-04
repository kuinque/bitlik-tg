// Initialize Telegram WebApp (if needed on profile page)
const tg = window.Telegram.WebApp;
tg.ready();

// Parse user_id from query string (or hardcode for testing)
// const urlParams = new URLSearchParams(window.location.search);
// const userId = urlParams.get('user_id');
const userId = "fake_user_123"; // Hardcoded for testing fake profile

// Always display hardcoded user ID and username for now
document.getElementById('user-id').textContent = '3243241943';
document.getElementById('username').textContent = 'nefedov';
document.getElementById('avatar').src = '/static/img/default-avatar.png'; // Keep default avatar for now

// Remove the initial conditional logic and placeholder setting
/*
if (!userId) {
    console.error('user_id is required');
    // Display an error message on the page
    document.getElementById('user-id').textContent = 'Error: User ID not found.';
    document.getElementById('username').textContent = '';
    document.getElementById('avatar').src = ''; // Clear default avatar
} else {
     // Clear the error message if userId is hardcoded
    // Display temporary placeholder values
    document.getElementById('user-id').textContent = 'Loading... (Attempting fetch)'; // Indicate fetch is happening
    document.getElementById('username').textContent = 'foxbel'; // Temporary placeholder
    document.getElementById('avatar').src = '/static/img/default-avatar.png'; // Show default while loading
}
*/

// Function to load user profile and update avatar
async function loadUserProfile() {
    const avatarImg = document.getElementById('avatar');
    // We will still attempt to fetch, but the display will be overridden initially
    if (!userId) {
        console.error('profile.js: user_id is required to load profile');
         if (avatarImg) {
            avatarImg.src = '/static/img/default-avatar.png'; // Ensure default is shown if no userId
        }
        // Keep hardcoded display below, do not set error text here
        // document.getElementById('user-id').textContent = 'Error: User ID not available.';
        // document.getElementById('username').textContent = '';
        return;
    }

    console.log(`profile.js: Attempting to fetch user profile for user_id: ${userId}`);

    try {
        const response = await fetch(`/api/user_profile?user_id=${userId}`);
        console.log(`profile.js: Received response status: ${response.status}`);

        if (!response.ok) {
             console.error(`profile.js: HTTP error fetching profile: ${response.status}`, await response.text());
             // Keep hardcoded display below, do not set error text here
             // document.getElementById('user-id').textContent = `Error: HTTP status ${response.status}`; // Display specific error
             // document.getElementById('username').textContent = '';
              if (avatarImg) {
                    avatarImg.src = '/static/img/default-avatar.png'; // Fallback on fetch failure
                }
            return;
        }

        const userData = await response.json();
        console.log('profile.js: Received user data:', userData);

        // Update HTML elements with fetched user data if successful
        document.getElementById('user-id').textContent = `User ID: ${userData.user_id || 'N/A'}`; // Display fetched ID with label
        // Display the name if available, otherwise 'N/A' for username with label
        document.getElementById('username').textContent = `Username: ${userData.name || 'N/A'}`; 
        
        if (avatarImg && userData.avatar_url) {
            avatarImg.src = userData.avatar_url;
        } else if (avatarImg) {
            avatarImg.src = '/static/img/default-avatar.png'; // Fallback if avatar_url is missing in data
        }

        // You can add more fields here as your User model grows

    } catch (error) {
        console.error('profile.js: Error fetching user profile:', error);
        // Keep hardcoded display below, do not set error text here
        // document.getElementById('user-id').textContent = 'Error loading profile.';
        // document.getElementById('username').textContent = '';
        // Optionally, keep the default avatar or show an error state
         if (avatarImg) {
            avatarImg.src = '/static/img/default-avatar.png'; // Fallback on general error
        }
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // The initial display is now hardcoded above, but we still attempt to load the profile
    if (userId) { // Only attempt fetch if userId is defined (even if hardcoded)
         await loadUserProfile();
    }
}); 