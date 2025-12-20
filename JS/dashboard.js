document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. Mobile Menu Logic ---
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const nav = document.querySelector(".nav");

    if (mobileBtn && nav) {
        mobileBtn.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }

    // Initialize map
const map = L.map("map").setView([40.7133, -73.9969], 12);

L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);


// This forces the map to recalculate its container size after a short delay
setTimeout(() => {
    map.invalidateSize();
}, 200);

    // --- 3. Fetch Summary Data ---
    fetch("http://localhost:3000/api/summary")
        .then(res => res.json())
        .then(data => {
            document.getElementById("total-crimes").textContent = data.total_crimes || "0";
            document.getElementById("common-crime").textContent = data.most_common || "N/A";
            document.getElementById("safest-city").textContent = data.safest_city || "N/A";
        })
        .catch(err => console.error("Error fetching summary:", err));

    // --- 4. Fetch Chart Data ---
    fetch("http://localhost:3000/api/chart")
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById("crimeChart").getContext("2d");
            
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: data.map(d => d.crime_type),
                    datasets: [{
                        label: "Number of Crimes",
                        data: data.map(d => d.count),
                        backgroundColor: ["#e74c3c", "#f39c12", "#3498db", "#9b59b6", "#2ecc71"],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Prevents distortion
                    plugins: { 
                        legend: { labels: { color: "#fff" } } 
                    },
                    scales: {
                        x: { 
                            ticks: { color: "#fff" },
                            grid: { color: "rgba(255,255,255,0.1)" }
                        },
                        y: { 
                            ticks: { color: "#fff" },
                            grid: { color: "rgba(255,255,255,0.1)" }
                        }
                    }
                }
            });
        })
        .catch(err => console.error("Error fetching chart:", err));

    // --- 5. Fetch Map Data ---
fetch("http://localhost:3000/api/map")
    .then(res => res.json())
    .then(points => {
        if (points && points.length > 0) {
            const group = new L.featureGroup();
            
            points.forEach(p => {
                // 🛡️ SAFETY CHECK: Try 'latitude' first, then 'lat'
                // This handles both your database name AND the API nickname
                const rawLat = p.latitude || p.lat;
                const rawLng = p.longitude || p.lng;
                
                // Convert to numbers
                const lat = parseFloat(rawLat);
                const lng = parseFloat(rawLng);

                // Only add if we have valid numbers
                if (!isNaN(lat) && !isNaN(lng)) {
                    // Use 'crime_type' (from API) or 'type' (from DB)
                    const cType = p.crime_type || p.type || "Unknown";
                    
                    const marker = L.marker([lat, lng])
                        .bindPopup(`<b>${cType}</b><br>${p.location || p.city}<br>Status: ${p.status}`);
                    
                    marker.addTo(map);
                    marker.addTo(group);
                } 
            });
            
            // Zoom map to fit points
            if (group.getLayers().length > 0) {
                map.fitBounds(group.getBounds());
            }
        }
    })
    .catch(err => console.error("Error fetching map points:", err));
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