document.addEventListener('DOMContentLoaded', loadPoliceNotices);

async function loadPoliceNotices() {
    const container = document.getElementById('notice-container');
    
    try {
        // Calls the unprotected GET /api/notices/all endpoint
        const response = await fetch('http://localhost:3000/api/notices/all');
        const notices = await response.json();

        container.innerHTML = ''; 

        if (response.ok && notices.length > 0) {
            notices.forEach(notice => renderNoticeCard(notice, container));
        } else {
            container.innerHTML = '<p style="text-align: center; color: #999;">No active announcements or notices at this time.</p>';
        }
    } catch (error) {
        console.error('Network error fetching notices:', error);
        container.innerHTML = '<p style="text-align: center; color: crimson;">❌ Error connecting to the server to retrieve notices.</p>';
    }
}

function renderNoticeCard(notice, container) {
    const card = document.createElement('div');
    card.className = 'notice-card';
    
    let bountyHtml = '';
    let imageHtml = '';
    
    if (notice.category === 'Most Wanted') {
        card.classList.add('most-wanted');
        
        if (notice.bounty) {
            // Format bounty with two decimal places and locale string
            bountyHtml = `<div class="bounty"><i class="fa-solid fa-dollar-sign"></i> ${parseFloat(notice.bounty).toLocaleString('en-US', { minimumFractionDigits: 2 })} BOUNTY</div>`;
        }
        
        if (notice.photo_filename) {
            // CRITICAL: Construct full path using the static /uploads route
            const imageSrc = `http://localhost:3000/uploads/wanted/${notice.photo_filename}`;
            imageHtml = `<img src="${imageSrc}" alt="${notice.title}" onerror="this.onerror=null;this.src='../images/placeholder.png';">`;
        }
    }
    
    card.innerHTML = `
        <span class="notice-category">${notice.category}</span>
        <p style="font-size: 0.8rem; color: #999;">Posted: ${new Date(notice.date_posted).toLocaleDateString()}</p>
        
        ${notice.category === 'Most Wanted' ? 
            `<div class="wanted-info">
                ${imageHtml}
                <div>
                    <h3>WANTED: ${notice.title}</h3>
                    <p>${notice.content}</p>
                    ${bountyHtml}
                </div>
            </div>`
            : `<h3>${notice.title}</h3><p>${notice.content}</p>`
        }
        
        ${notice.location_specific ? `<p style="color: #ccc;"><i class="fa-solid fa-map-pin"></i> Location: ${notice.location_specific}</p>` : ''}
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