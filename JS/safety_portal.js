document.getElementById('shareLocationBtn').addEventListener('click', shareLocation);

const locationStatus = document.getElementById('location-status');
const coordinatesDisplay = document.getElementById('coordinates-display');
const shareButton = document.getElementById('shareLocationBtn');
const token = localStorage.getItem('userToken'); // Assuming user must be logged in

if (!token) {
    locationStatus.textContent = "Status: Login required to share location.";
    shareButton.disabled = true;
}

function shareLocation() {
    locationStatus.textContent = 'Status: Finding your location...';
    shareButton.disabled = true;

    if (!navigator.geolocation) {
        locationStatus.textContent = 'Status: Geolocation is not supported by your browser.';
        shareButton.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(postPosition, showError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
}


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


function showError(error) {
    locationStatus.textContent = `Status: Location error! (${error.message})`;
    shareButton.disabled = false;
    coordinatesDisplay.textContent = '';
}

async function postPosition(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    coordinatesDisplay.textContent = `LAT: ${lat.toFixed(6)}, LNG: ${lng.toFixed(6)}`;
    locationStatus.textContent = 'Status: Sending coordinates to secure endpoint...';
    
    const formData = {
        latitude: lat,
        longitude: lng
    };

    try {
        const response = await fetch('http://localhost:3000/api/share-location', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            locationStatus.textContent = `✅ Location Shared Successfully! Police have received coordinates.`;
        } else {
            locationStatus.textContent = `❌ Share Failed: ${result.message}`;
        }
    } catch (error) {
        locationStatus.textContent = '❌ Network Error during sharing process.';
        console.error('Location share network error:', error);
    } finally {
        // Re-enable button after 5 seconds to prevent accidental spamming
        setTimeout(() => {
            shareButton.disabled = false;
        }, 5000);
    }
}