// =========================================================
// SECTION A: REPORT SUBMISSION LOGIC
// =========================================================

document.getElementById('missingReportForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const form = event.target;
    const feedbackArea = document.getElementById('submission-feedback');
    feedbackArea.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting report...';
    
    const formData = new FormData(form);

    try {
        // Calls the Public: Report Missing Person API
        const response = await fetch('http://localhost:3000/api/missing/report', {
            method: 'POST',
            // CRITICAL: DO NOT set Content-Type header. FormData handles it automatically.
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            feedbackArea.innerHTML = `✅ Report Submitted Successfully! It will be reviewed by officials before being posted publicly.`;
            form.reset();
        } else {
            feedbackArea.innerHTML = `❌ Submission Failed: ${result.message}`;
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


// =========================================================
// SECTION B: PUBLIC DIRECTORY VIEW LOGIC
// =========================================================

document.addEventListener('DOMContentLoaded', loadPublicMissingReports);

async function loadPublicMissingReports() {
    const container = document.getElementById('missing-persons-container');
    
    try {
        // Calls the Public: View Approved Missing Persons API
        const response = await fetch('http://localhost:3000/api/missing/public-view');
        const reports = await response.json();

        container.innerHTML = ''; // Clear loading message

        if (response.ok && reports.length > 0) {
            reports.forEach(report => {
                const card = document.createElement('div');
                card.className = 'report-card';
                
                // Assuming photos are served from http://localhost:3000/uploads/missing_photos/    
                const imageSrc = report.photo_filename 
                    ? `http://localhost:3000/uploads/missing_photos/${report.photo_filename}`
                    : '../images/placeholder.png'; // Use a placeholder image if no photo exists

                card.innerHTML = `
                    <img src="${imageSrc}" alt="${report.person_name}'s photo" onerror="this.onerror=null;this.src='../images/placeholder.png';">
                    <div class="status-tag">ACTIVE ALERT</div>
                    <h3>${report.person_name} (Age: ${report.age || 'N/A'})</h3>
                    <p><strong>Last Seen:</strong> ${report.last_seen_date}</p>
                    <p><strong>Location:</strong> ${report.last_seen_location}</p>
                    <p><strong>Description:</strong> ${report.description.substring(0, 150)}...</p>
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p style="grid-column: 1 / -1; color: #999;">No active missing person reports found at this time.</p>';
        }
    } catch (error) {
        console.error('Network error fetching public reports:', error);
        container.innerHTML = '<p style="grid-column: 1 / -1; color: crimson;">❌ Error connecting to the server to retrieve reports. Please ensure server is running.</p>';
    }
}