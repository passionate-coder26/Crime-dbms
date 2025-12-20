document.getElementById('noticePostForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const form = event.target;
    const feedbackArea = document.getElementById('submission-feedback');
    feedbackArea.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing notice...';
    
    // 1. Authentication Check
    const token = localStorage.getItem('userToken'); // Use your correct token key
    if (!token) {
        feedbackArea.textContent = '❌ Error: Session expired. Please log in as an official.';
        return;
    }

    // 2. CRITICAL: Use FormData to handle text fields AND the file
    const formData = new FormData(form);

    try {
        const response = await fetch('http://localhost:3000/api/notices/post', {
            method: 'POST',
            headers: { 
                // CRITICAL: DO NOT set Content-Type; FormData handles it
                'Authorization': `Bearer ${token}` 
            },
            body: formData // Sends both file and text data
        });

        const result = await response.json();

        if (response.ok) {
            const category = formData.get('category');
            feedbackArea.innerHTML = `✅ ${category} successfully published!`;
            form.reset();
            // Reset required attribute for photo if needed
            document.getElementById('wantedPhoto').removeAttribute('required'); 
        } else {
            feedbackArea.innerHTML = `❌ Publication Failed: ${result.message}`;
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