// --- Global Configuration ---
const CRIME_API_URL = 'http://localhost:3000/api/crimes';

// ==========================================================
// 🚨 NEW: Security and Initialization Logic 🚨
// ==========================================================

// Access Control Check (Needed for the final DOMContentLoaded block)
function checkAccessAndRedirect() {
    const token = localStorage.getItem('userToken');
    const userRole = localStorage.getItem('userRole');
    
    // Check 1: Must be logged in
    if (!token) {
        window.location.href = 'Homepage.html';
        return false;
    }
    
    // Check 2: Must be Admin or Analyst (RBAC)
    if (userRole !== 'admin' && userRole !== 'analyst') {
        window.location.href = 'Homepage.html';
        return false;
    }
    return true;
}


// ==============================
// Initialize the application
// ==============================
document.addEventListener('DOMContentLoaded', function () {
    // 🚨 FIX 1: Run security check immediately
    if (!checkAccessAndRedirect()) {
        return; // Stop initialization if user is unauthorized
    }

    initializeForm();
    setupFileUpload();
    setupFormValidation();
    setupCoordinatesValidation();
    setCurrentDateTime();
});

// ==============================
// Form Initialization
// ==============================
function initializeForm() {
    const form = document.getElementById('crimeForm');
    form.addEventListener('submit', handleFormSubmit);

    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
}

// ==============================
// Set Current Date and Time
// ==============================
function setCurrentDateTime() {
    const datetimeInput = document.getElementById('datetime');
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localTime = new Date(now.getTime() - offset * 60 * 1000);
    datetimeInput.value = localTime.toISOString().slice(0, 16);
}

// ==============================
// File Upload Functionality
// ==============================
function setupFileUpload() {
    const fileInput = document.getElementById('evidence');
    const fileList = document.getElementById('fileList');
    const fileLabel = document.querySelector('.file-label');
    let selectedFiles = [];

    // Handle selection
    fileInput.addEventListener('change', e => addFilesToList(Array.from(e.target.files)));

    // Drag & Drop
    fileLabel.addEventListener('dragover', e => {
        e.preventDefault();
        fileLabel.style.borderColor = '#dc2626';
        fileLabel.style.background = 'rgba(220, 38, 38, 0.2)';
    });

    fileLabel.addEventListener('dragleave', e => {
        e.preventDefault();
        fileLabel.style.borderColor = '#4b5563';
        fileLabel.style.background = 'rgba(55, 65, 81, 0.3)';
    });

    fileLabel.addEventListener('drop', e => {
        e.preventDefault();
        fileLabel.style.borderColor = '#4b5563';
        fileLabel.style.background = 'rgba(55, 65, 81, 0.3)';
        addFilesToList(Array.from(e.dataTransfer.files));
    });

    function addFilesToList(files) {
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                showNotification('File size must be < 10MB: ' + file.name, 'error');
                return;
            }
            if (selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
                showNotification('File already selected: ' + file.name, 'warning');
                return;
            }
            selectedFiles.push(file);
            renderFileItem(file);
        });
    }

    function renderFileItem(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <span>${file.name}</span>
            <span>${formatFileSize(file.size)}</span>
            <button type="button" onclick="removeFile('${file.name}', ${file.size})">×</button>
        `;
        fileList.appendChild(item);
    }

    window.removeFile = function (name, size) {
        selectedFiles = selectedFiles.filter(f => !(f.name === name && f.size === size));
        fileList.innerHTML = '';
        selectedFiles.forEach(f => renderFileItem(f));
    };
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


// ==============================
// File Size Formatter
// ==============================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ==============================
// Form Validation
// ==============================
function setupFormValidation() {
    const form = document.getElementById('crimeForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidationError);
    });
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    clearValidationError(e);

    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    switch (field.id) {
        case 'badgeNumber':
            if (value && !/^\d{4,6}$/.test(value)) showFieldError(field, 'Badge number must be 4-6 digits');
            break;
        case 'latitude':
            if (value && (isNaN(value) || value < -90 || value > 90)) showFieldError(field, 'Latitude must be -90 to 90');
            break;
        case 'longitude':
            if (value && (isNaN(value) || value < -180 || value > 180)) showFieldError(field, 'Longitude must be -180 to 180');
            break;
    }
    return true;
}

function clearValidationError(e) {
    const field = e.target;
    const error = field.parentNode.querySelector('.error-message');
    if (error) error.remove();
    field.style.borderColor = '';
    field.style.background = '';
}

function showFieldError(field, msg) {
    clearValidationError({ target: field });
    field.style.borderColor = '#dc2626';
    field.style.background = 'rgba(220,38,38,0.1)';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#f87171';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = msg;
    field.parentNode.appendChild(errorDiv);
}

// ==============================
// Coordinates Auto-populate
// ==============================
function setupCoordinatesValidation() {
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');
    const locationInput = document.getElementById('location');

    function updateLocation() {
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);
        if (!isNaN(lat) && !isNaN(lng)) locationInput.placeholder = `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    latInput.addEventListener('input', updateLocation);
    lngInput.addEventListener('input', updateLocation);
}

// ==============================
// Form Submission
// ==============================
// ==============================
// 🚨 FINAL FORM SUBMISSION (API Call) 🚨
// ==============================
async function handleFormSubmit(e) {
    e.preventDefault(); 
    
    const form = e.target;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    // 1. Run Validation
    inputs.forEach(input => { 
        if (!validateField({ target: input })) {
            isValid = false; 
        }
    });
    if (!isValid) return showNotification('Please correct the errors', 'error');

    // 2. Prepare UI and Token
    const token = localStorage.getItem('userToken');
    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = 'Saving...';
    submitBtn.disabled = true;

    // 3. Collect Data
    const formData = {
        // These keys MUST match the variables expected by your server.js route
        crimeType: document.getElementById('crimeType').value,
        description: document.getElementById('description').value,
        severity: document.getElementById('severity').value,
        location: document.getElementById('location').value,
        latitude: document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : null,
        longitude: document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : null,
        datetime: document.getElementById('datetime').value, // Maps to incident_datetime in DB
    };

    try {
        // 4. Secure API Call
        const response = await fetch(CRIME_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();

        // 5. Handle Response
        if (response.ok) { // Status 201 Created
            form.reset();
            // Since file list cleanup is not in the original form, manually run the logic:
            document.getElementById('fileList').innerHTML = ''; 
            setCurrentDateTime(); 
            
            showSuccessModal(result.recordId);
            showNotification('Crime record saved successfully!', 'success');
        } else if (response.status === 403 || response.status === 401) {
             // Catch Auth/RBAC errors
            showNotification(`Access Denied. Check privileges/token.`, 'error');
        } else {
            // General 400 or 500 error from the server
            showNotification(`Error: ${result.message || 'Failed to submit the record.'}`, 'error');
        }

    } catch (error) {
        console.error('Network Error during submission:', error);
        showNotification('A network error occurred. Check the backend server.', 'error');
    } finally {
        // 6. Restore UI state
        submitBtn.innerHTML = origText;
        submitBtn.disabled = false;
    }
}


// ==============================
// Success Modal (FIXED FOR NULL CHECK)
// ==============================
function showSuccessModal(recordId) {
    const modal = document.getElementById('successModal');
    const recordIdSpan = document.getElementById('recordId'); // ⬅️ Get the element here

    if (!modal) return;
    
    // 🚨 FIX: Only attempt to set textContent if the element exists
    if (recordIdSpan) {
        recordIdSpan.textContent = recordId;
    } else {
        // Log an error if the element is missing, but don't crash the script
        console.error("FATAL UI ERROR: Could not find element with ID 'recordId'.");
    }
    
    modal.classList.add('show');
}

// ==============================
// Reset Form
// ==============================
function resetForm() {
    if (confirm('All data will be lost. Reset?')) {
        const form = document.getElementById('crimeForm');
        form.reset();
        document.getElementById('fileList').innerHTML = '';
        setCurrentDateTime();
        form.querySelectorAll('.error-message').forEach(e => e.remove());
        form.querySelectorAll('input, select, textarea').forEach(f => {
            f.style.borderColor = '';
            f.style.background = '';
        });
        showNotification('Form has been reset', 'info');
    }
}

// ==============================
// Mobile Menu Toggle
// ==============================
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    if (nav.style.display === 'flex') nav.style.display = 'none';
    else {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '100%';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.background = 'rgba(0,0,0,0.95)';
        nav.style.padding = '16px';
        nav.style.borderTop = '1px solid #374151';
    }
}

// ==============================
// Notifications
// ==============================
function showNotification(msg, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    n.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
        <span>${msg}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;">×</button>
    </div>`;
    n.style.cssText = `position:fixed;top:80px;right:24px;z-index:1001;padding:16px;border-radius:8px;background:${getNotificationColor(type)};color:white;max-width:400px;animation:slideIn 0.3s ease-out;`;
    document.body.appendChild(n);
    setTimeout(() => { if (n.parentElement) n.remove(); }, 5000);
}
function getNotificationColor(type) {
    return type === 'success' ? '#10b981' : type === 'error' ? '#dc2626' : type === 'warning' ? '#f59e0b' : '#3b82f6';
}
const style = document.createElement('style');
style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }`;
document.head.appendChild(style);

// ==============================
// Crime Type Suggestions
// ==============================
const crimeTypeDescriptions = {
    'robbery': 'Theft involving force or threat of force',
    'assault': 'Physical attack or threat of physical harm',
    'vandalism': 'Intentional destruction or defacement of property',
    'burglary': 'Unlawful entry with intent to commit theft',
    'theft': 'Taking of property without consent',
    'shooting': 'Discharge of firearm with intent to harm',
    'fraud': 'Deception for financial or personal gain',
    'cybercrime': 'Criminal activity involving computers or internet',
    'drug-offense': 'Violations of controlled substance laws',
    'homicide': 'Unlawful killing of another person'
};
document.getElementById('crimeType').addEventListener('change', function () {
    const desc = document.getElementById('description');
    const selected = this.value;
    if (selected && crimeTypeDescriptions[selected] && !desc.value) {
        desc.placeholder = `Suggested: ${crimeTypeDescriptions[selected]}`;
    }
});
