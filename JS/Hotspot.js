// Crime data for the chart
const crimeData = [
    { name: 'Robbery', value: 342, color: '#ef4444' },
    { name: 'Assault', value: 289, color: '#f97316' },
    { name: 'Vandalism', value: 156, color: '#3b82f6' },
    { name: 'Burglary', value: 298, color: '#22c55e' },
    { name: 'Theft', value: 445, color: '#a855f7' },
    { name: 'Shooting', value: 67, color: '#dc2626' },
    { name: 'Fraud', value: 234, color: '#eab308' },
    { name: 'Cybercrime', value: 123, color: '#06b6d4' },
    { name: 'Drug Offense', value: 387, color: '#10b981' },
    { name: 'Homicide', value: 23, color: '#7c2d12' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeChart();
    updateTotalCases();
    createChartLegend();
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

// Tab functionality
function initializeTabs() {
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetTab = trigger.getAttribute('data-tab');
            
            // Remove active class from all triggers and contents
            tabTriggers.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked trigger and corresponding content
            trigger.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Initialize pie chart using Chart.js
function initializeChart() {
    const ctx = document.getElementById('crimeChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: crimeData.map(item => item.name),
            datasets: [{
                data: crimeData.map(item => item.value),
                backgroundColor: crimeData.map(item => item.color),
                borderColor: '#374151',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We'll create a custom legend
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#f87171',
                    borderColor: '#6b7280',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = crimeData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `Cases: ${value} (${percentage}%)`;
                        },
                        afterLabel: function(context) {
                            const total = crimeData.reduce((sum, item) => sum + item.value, 0);
                            return `${((context.parsed / total) * 100).toFixed(1)}% of total`;
                        }
                    }
                }
            }
        }
    });
}

// Update total cases display
function updateTotalCases() {
    const total = crimeData.reduce((sum, item) => sum + item.value, 0);
    const totalCasesElement = document.getElementById('total-cases');
    if (totalCasesElement) {
        totalCasesElement.textContent = total.toLocaleString();
    }
}

// Create custom chart legend
function createChartLegend() {
    const legendContainer = document.getElementById('chartLegend');
    if (!legendContainer) return;

    legendContainer.innerHTML = '';
    
    crimeData.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${item.color}"></div>
            <span>${item.name}</span>
            <span class="legend-count">${item.value}</span>
        `;
        
        legendContainer.appendChild(legendItem);
    });
}

// Mobile menu functionality
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
}

// Add click event to mobile menu button
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
});

// Alert animation
function animateAlerts() {
    const alertItems = document.querySelectorAll('.alert-item');
    alertItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'translateX(0)';
            item.style.opacity = '1';
        }, index * 200);
    });
}

// Initialize alert animations
document.addEventListener('DOMContentLoaded', function() {
    const alertItems = document.querySelectorAll('.alert-item');
    alertItems.forEach(item => {
        item.style.transform = 'translateX(-20px)';
        item.style.opacity = '0';
        item.style.transition = 'all 0.3s ease';
    });
    
    setTimeout(animateAlerts, 500);
});

// Simulate real-time updates
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Update random stat values slightly
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(stat => {
            const currentValue = parseInt(stat.textContent.replace(',', ''));
            const randomChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const newValue = Math.max(0, currentValue + randomChange);
            stat.textContent = newValue.toLocaleString();
        });

        // Update timestamps
        const timestamps = document.querySelectorAll('.alert-content time');
        timestamps.forEach((time, index) => {
            const minutes = [2, 15, 60][index] + Math.floor(Math.random() * 5);
            if (minutes < 60) {
                time.textContent = `${minutes} minutes ago`;
            } else {
                const hours = Math.floor(minutes / 60);
                time.textContent = `${hours} hour${hours > 1 ? 's' : ''} ago`;
            }
        });
    }, 30000); // Update every 30 seconds
}

// Start real-time updates
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(simulateRealTimeUpdates, 5000); // Start after 5 seconds
});

// Action button click handlers
document.addEventListener('DOMContentLoaded', function() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            console.log(`Action clicked: ${action}`);
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // You can add actual functionality here
            switch(action) {
                case 'Report New Incident':
                    window.location.href = 'addCrime.html'; 
                    break;
                case 'Search Database':
                    window.location.href = 'advanced_search.html'; 
                    break;
                case 'Generate Report':
                    // ⚠️ NEW: Call the PDF generation function
                    generatePDFReport(); 
                    break;
            }
        });
    });
});

// Learn More button handler
document.addEventListener('DOMContentLoaded', function() {
    const learnMoreBtn = document.querySelector('.banner-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            alert('More information about the Crime Analytics Platform would be displayed here');
        });
    }
});

// Smooth scrolling for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth transitions to cards
    const cards = document.querySelectorAll('.card, .stat-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Handle window resize for responsive chart
window.addEventListener('resize', function() {
    // Chart.js automatically handles resize, but we can add custom logic here if needed
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer && window.innerWidth < 768) {
        chartContainer.style.height = '300px';
    } else if (chartContainer) {
        chartContainer.style.height = '400px';
    }
});

// Keyboard accessibility
document.addEventListener('keydown', function(e) {
    // Tab navigation enhancement
    if (e.key === 'Tab') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('tab-trigger')) {
            // Add visual focus indicator
            focusedElement.style.outline = '2px solid #dc2626';
        }
    }
    
    // Enter key activation for buttons
    if (e.key === 'Enter' && document.activeElement.classList.contains('tab-trigger')) {
        document.activeElement.click();
    }
});

// Remove custom focus styles when not using keyboard
document.addEventListener('mousedown', function() {
    document.querySelectorAll('.tab-trigger').forEach(trigger => {
        trigger.style.outline = 'none';
    });
});

/**
 * Captures the main dashboard area and generates a PDF report.
 */
function generatePDFReport() {
    // Target the main content area to be included in the PDF
    const mainContent = document.querySelector('.main'); 

    // Optional: Hide parts that shouldn't be in the PDF (like buttons/navigation)
    // You might want to hide the header/footer if they are not part of the report content
    const header = document.querySelector('.header');
    if (header) header.style.display = 'none'; 

    const reportTitle = "CrimeScope Analysis Report";
    
    // Use html2canvas to capture the DOM element as an image
    html2canvas(mainContent, { 
        // Use a higher scale for better resolution in the PDF
        scale: 2,
        useCORS: true 
    }).then(canvas => {
        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' (portrait), 'mm' units, A4 size

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add the title (optional, but good practice)
        pdf.text(reportTitle, 10, 10);
        position += 15; // Move starting position down

        // Logic to handle images/content spanning multiple PDF pages
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save the PDF file
        pdf.save("CrimeScope_Hotspot_Report.pdf");

        // Restore hidden elements
        if (header) header.style.display = 'flex'; // Restore based on your CSS
    });
}