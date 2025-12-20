const validStatuses = ['New', 'Reviewed', 'Actioned', 'Archived'];

document.addEventListener('DOMContentLoaded', () => {
    loadTipsForManagement();
});

async function loadTipsForManagement() {
    const token = localStorage.getItem('userToken');
    const tipsList = document.getElementById('tips-list');
    const messageArea = document.getElementById('message-area');
    
    if (!token) {
        messageArea.textContent = '❌ Error: Officials must log in to access this page.';
        return;
    }
    
    messageArea.textContent = 'Loading tips...';
    tipsList.innerHTML = '';

    try {
        const response = await fetch('http://localhost:3000/api/tips/all', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const tips = await response.json();

        if (response.ok) {
            messageArea.textContent = `✅ Successfully loaded ${tips.length} tips.`;
            tips.forEach(tip => renderTipRow(tip, tipsList));
        } else {
            // This catches the 403 Forbidden error if a public user somehow accesses the page
            messageArea.textContent = `❌ Failed to load: ${tips.message}`;
            if (response.status === 403) {
                 messageArea.textContent = '❌ Access Denied. Only officials can view this data.';
            }
        }
    } catch (error) {
        console.error('Network error fetching tips:', error);
        messageArea.textContent = '❌ Network Error. Could not connect to the server.';
    }
}

function renderTipRow(tip, container) {
    const row = document.createElement('tr');
    
    // Create status dropdown
    const statusSelect = document.createElement('select');
    statusSelect.className = 'status-select';
    statusSelect.id = `status-${tip.id}`;
    
    validStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (status === tip.tip_status) {
            option.selected = true;
        }
        statusSelect.appendChild(option);
    });

    // Attach event listener to handle status change
    statusSelect.addEventListener('change', (event) => updateTipStatus(tip.id, event.target.value));

    // Populate the row
    row.innerHTML = `
        <td>${tip.id}</td>
        <td>${new Date(tip.submitted_at).toLocaleString()}</td>
        <td><strong>${tip.crime_type}</strong><br><small>${tip.location_detail}</small></td>
        <td>${tip.description.substring(0, 100)}...</td>
        <td id="status-cell-${tip.id}"></td>
        <td>Update</td>
    `;
    
    // Insert the dynamically created select element
    row.querySelector(`#status-cell-${tip.id}`).appendChild(statusSelect);

    // Final Action column placeholder—we insert the select element in the current status cell
    row.lastElementChild.innerHTML = `<button onclick="updateTipStatus(${tip.id}, document.getElementById('status-${tip.id}').value)" class="scene-btn" style="padding: 5px 10px;">Save</button>`;
    
    container.appendChild(row);
}

async function updateTipStatus(tipId, newStatus) {
    const token = localStorage.getItem('userToken');
    const messageArea = document.getElementById('message-area');

    if (!token) {
        alert('Session expired. Please log in again.');
        return;
    }
    
    messageArea.textContent = `Updating Tip ${tipId} to ${newStatus}...`;

    try {
        const response = await fetch(`http://localhost:3000/api/tips/${tipId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newStatus })
        });

        const result = await response.json();

        if (response.ok) {
            messageArea.innerHTML = `✅ Tip ${tipId} status successfully set to <strong>${result.newStatus}</strong>.`;
            // Optional: Visually update the row if needed, though a full reload is safer for complex tables.
        } else {
            messageArea.innerHTML = `❌ Failed to update Tip ${tipId}: ${result.message}`;
        }
    } catch (error) {
        console.error('Update error:', error);
        messageArea.textContent = '❌ Network Error during status update.';
    }
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