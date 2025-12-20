document.addEventListener('DOMContentLoaded', loadPendingReports);

// NOTE: Use the correct localStorage key for the official's token
const token = localStorage.getItem('userToken');

async function loadPendingReports() {
    const container = document.getElementById('pending-reports-container');
    const messageArea = document.getElementById('message-area');
    
    if (!token) {
        messageArea.textContent = '❌ Access Denied: Please log in as an official (Admin/Analyst).';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/missing/pending', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const reports = await response.json();

        container.innerHTML = '';
        messageArea.textContent = ''; 

        if (response.ok && reports.length > 0) {
            messageArea.textContent = `✅ Successfully loaded ${reports.length} pending reports.`;
            reports.forEach(report => renderReportCard(report, container));
        } else if (response.ok && reports.length === 0) {
             messageArea.textContent = '✅ No pending reports requiring review.';
        } else {
             // This catches the 403 Forbidden error if a public user somehow accesses the page
             messageArea.textContent = `❌ Failed to load reports: ${reports.message}. Please check your credentials.`;
             if (response.status === 403) {
                 messageArea.textContent = '❌ Access Denied. Only officials can view this data.';
             }
        }
    } catch (error) {
        console.error('Network error fetching pending reports:', error);
        messageArea.textContent = '❌ Network Error. Could not connect to the server.';
    }
}

function renderReportCard(report, container) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.id = `report-${report.id}`;
    
    // Path to the uploaded photos from the Multer configuration
    const imageSrc = report.photo_filename 
        ? `http://localhost:3000/uploads/missing_photos/${report.photo_filename}`
        : '../images/placeholder.png'; 

    card.innerHTML = `
        <img src="${imageSrc}" alt="${report.person_name}'s photo" onerror="this.onerror=null;this.src='../images/placeholder.png';">
        <h3>${report.person_name} (ID: ${report.id})</h3>
        <p><strong>Reported By:</strong> ${report.reporter_email}</p>
        <p><strong>Last Seen:</strong> ${report.last_seen_date} at ${report.last_seen_location}</p>
        <p><strong>Details:</strong> ${report.description}</p>
        <p><strong>Submitted:</strong> ${new Date(report.submitted_at).toLocaleString()}</p>
        <div class="action-buttons" style="margin-top: 20px;">
            <button class="scene-btn approve-btn" onclick="reviewReport(${report.id}, 'approve')">Approve & Post</button>
            <button class="scene-btn reject-btn" onclick="reviewReport(${report.id}, 'reject')">Reject</button>
        </div>
    `;
    container.appendChild(card);
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

async function reviewReport(reportId, action) {
    const messageArea = document.getElementById('message-area');
    messageArea.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Report ${reportId} for ${action.toUpperCase()}...`;

    try {
        const response = await fetch(`http://localhost:3000/api/missing/review/${reportId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: action })
        });

        const result = await response.json();

        if (response.ok) {
            messageArea.innerHTML = `✅ Report ${reportId} successfully ${result.message}.`;
            // Remove the card from the view after success
            document.getElementById(`report-${reportId}`).remove();
            
            // Optionally reload the page if container is empty
            if (document.getElementById('pending-reports-container').children.length === 0) {
                 loadPendingReports();
            }
        } else {
            messageArea.innerHTML = `❌ Review Failed: ${result.message}`;
        }
    } catch (error) {
        console.error('Review process error:', error);
        messageArea.textContent = '❌ Network Error during review process.';
    }
}