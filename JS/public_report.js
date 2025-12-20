// Function to get the value safely, returning null for empty strings
const getInputValue = (id) => {
    const element = document.getElementById(id);
    const value = element ? element.value.trim() : null;
    return value === '' ? null : value;
};

document.getElementById('tipForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const feedbackArea = document.getElementById('submission-feedback');
    feedbackArea.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting tip...';
    
    // 1. --- Authentication Check ---
    const token = localStorage.getItem('userToken');
    
    if (!token) {
        feedbackArea.textContent = '❌ Error: You must be logged in to submit a tip.';
        // Optionally redirect the user to login
        // window.location.href = 'login.html'; 
        return;
    }

    // 2. --- Collect Form Data ---
    const formData = {
        // Collect data specific to the tips table
        crimeType: getInputValue('crimeType'),
        location: getInputValue('location'), // maps to location_detail on backend
        description: getInputValue('description'),
        contactEmail: getInputValue('contactEmail'), 
        
        // Pass dummy/placeholder values required by the Smart Adder logic for the 'public' user
        severity: getInputValue('severity'), 
        datetime: getInputValue('datetime'), // Uses the hidden field value
        latitude: null, // Always null for public tip
        longitude: null // Always null for public tip
    };

    // 3. --- Send Data to API ---
    try {
        const response = await fetch('http://localhost:3000/api/tips', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        // 4. --- Handle Response ---
        if (response.ok) {
            feedbackArea.innerHTML = `✅ Tip Submitted! Your Tip ID is: <strong>${result.tipId}</strong>. Use this ID to check the status later.`;
            document.getElementById('tipForm').reset(); // Clear form
        } else {
            feedbackArea.innerHTML = `❌ Submission Failed: ${result.message}. Please try again.`;
            console.error('API Error:', result.message);
        }
    } catch (error) {
        console.error('Network error:', error);
        feedbackArea.textContent = '❌ Network Error. Could not connect to the server.';
    }
});

// --- Hamburger Menu Toggle ---
function toggleMenu() {
    const menu = document.getElementById('menu-panel');
    menu.classList.toggle('open');

    if (menu.classList.contains('open')) {
        document.body.addEventListener('click', closeMenuOutside);
    } else {
        document.body.removeEventListener('click', closeMenuOutside);
    }
}

function closeMenuOutside(event) {
    const menu = document.getElementById('menu-panel');
    const icon = document.getElementById('hamburger-icon');
    
    if (menu.classList.contains('open') && !menu.contains(event.target) && !icon.contains(event.target)) {
        menu.classList.remove('open');
        document.body.removeEventListener('click', closeMenuOutside);
    }
}

// --- Event listener for hamburger icon ---
document.getElementById('hamburger-icon').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent immediate close when clicking
    toggleMenu();
});

// --- Optional: Role-based filtering (official links) ---
function filterMenuByRole() {
    const role = localStorage.getItem('userRole'); 
    const officialLinks = document.querySelectorAll('.official-link');
    const officialHeading = document.getElementById('official-heading');
    const officialHr = document.getElementById('official-hr');
    
    const isOfficial = (role === 'admin' || role === 'analyst');

    if (officialHeading) officialHeading.style.display = isOfficial ? 'block' : 'none';
    if (officialHr) officialHr.style.display = isOfficial ? 'block' : 'none';

    officialLinks.forEach(link => {
        link.style.display = isOfficial ? 'block' : 'none';
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', filterMenuByRole);

// --- Optional: Logout link ---
document.getElementById('link-logout')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.setItem('isLoggedIn', 'false');
    alert("Logged out successfully!");
    window.location.href = "homepage.html";
});