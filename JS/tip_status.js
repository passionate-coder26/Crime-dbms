document.getElementById('statusForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const tipId = document.getElementById('tipId').value.trim();
    const resultsArea = document.getElementById('resultsArea');
    
    if (!tipId) {
        resultsArea.innerHTML = '<p style="color: crimson;">Please enter a valid Tip ID.</p>';
        return;
    }

    resultsArea.innerHTML = '<p style="color: #bbb;"><i class="fa-solid fa-spinner fa-spin"></i> Checking status for ID: ' + tipId + '...</p>';

    try {
        const response = await fetch(`http://localhost:3000/api/tip-status/${tipId}`);
        const result = await response.json();

        if (response.ok) {
            // Success: Display tip details
            resultsArea.innerHTML = `
                <p style="font-size: 1.2rem; font-weight: bold; color: lightgreen;">Status: ${result.status}</p>
                <p><strong>Tip ID:</strong> ${result.tipId}</p>
                <p><strong>Type:</strong> ${result.crimeType}</p>
                <p><strong>Location:</strong> ${result.location}</p>
                <p><strong>Submitted On:</strong> ${new Date(result.submittedAt).toLocaleDateString()}</p>
            `;
        } else {
            // Error: Tip not found or server error
            resultsArea.innerHTML = `<p style="color: crimson;">❌ Error: ${result.message}</p>`;
        }
    } catch (error) {
        console.error('Status check error:', error);
        resultsArea.innerHTML = '<p style="color: crimson;">❌ Network Error: Could not connect to the server.</p>';
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