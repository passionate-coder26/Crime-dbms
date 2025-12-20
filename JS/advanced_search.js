document.getElementById('searchForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('userToken');
    const form = event.target;
    const resultsBody = document.getElementById('resultsBody');
    const messageArea = document.getElementById('message-area');
    const resultsSummary = document.getElementById('resultsSummary');
    
    if (!token) {
        messageArea.textContent = '❌ Access Denied: Please log in as an official (Admin/Analyst).';
        return;
    }

    messageArea.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Searching database...';
    resultsBody.innerHTML = '';
    resultsSummary.textContent = '';

    // 1. Build Query Parameters
    const formData = new FormData(form);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
        if (value) { // Only append parameters that have a value
            params.append(key, value);
        }
    }

    try {
        // 2. Fetch data from the new Advanced Search API
        const response = await fetch(`http://localhost:3000/api/search/crimes?${params.toString()}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const results = await response.json();

        // 3. Render Results
        if (response.ok) {
            if (results.length > 0) {
                resultsSummary.textContent = `Found ${results.length} matching record(s).`;
                results.forEach(crime => {
                    const row = resultsBody.insertRow();
                    row.innerHTML = `
                        <td>${crime.id}</td>
                        <td>${new Date(crime.incident_datetime).toLocaleString()}</td>
                        <td>${crime.type}</td>
                        <td>${crime.severity}</td>
                        <td>${crime.location}</td>
                        <td>${crime.status}</td>
                        <td>${crime.description.substring(0, 50)}...</td>
                    `;
                });
            } else {
                resultsSummary.textContent = `No records matched your search criteria.`;
                resultsBody.innerHTML = '<tr><td colspan="7">No records found. Try broadening your search.</td></tr>';
            }
            messageArea.textContent = 'Search complete.';
        } else {
            messageArea.textContent = `❌ Search Failed: ${results.message}`;
            resultsBody.innerHTML = '<tr><td colspan="7">Error retrieving data from the server.</td></tr>';
        }
    } catch (error) {
        console.error('Advanced search error:', error);
        messageArea.textContent = '❌ Network Error. Could not connect to the server.';
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