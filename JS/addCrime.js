// --- Global Configuration ---
const CRIME_API_URL = 'http://localhost:3000/api/crimes';
const crimeForm = document.getElementById('crimeForm');
const successModal = document.getElementById('successModal');
const recordIdSpan = document.getElementById('recordId');

// ==============================
// Initialize the application
// ==============================
document.addEventListener('DOMContentLoaded', function () {
    // 🚨 SECURITY CHECK: Ensure the user is logged in and authorized
    if (!checkAccessAndRedirect()) {
        return; // Stop initialization if user is unauthorized
    }

    initializeForm();
    setupFileUpload();
    setupFormValidation();
    setupCoordinatesValidation();
    setCurrentDateTime();
    
    // Add additional listeners
    setupMobileMenu(); // Setup mobile menu if the button exists
    setupCrimeTypeSuggestions(); // Setup the suggestion functionality
});

// ==============================
// 🚨 NEW: Access Control Check 🚨
// ==============================
function checkAccessAndRedirect() {
    const token = localStorage.getItem('userToken');
    const userRole = localStorage.getItem('userRole');
    
    // Check 1: Must be logged in
    if (!token) {
        window.location.href = 'Homepage.html';
        return false;
    }
    
    // Check 2: Must be Admin or Analyst
    if (userRole !== 'admin' && userRole !== 'analyst') {
        alert('Access Denied: You must be an official to add a crime record.');
        window.location.href = 'Homepage.html';
        return false;
    }
    return true;
}


// ==============================
// Form Initialization
// ==============================
function initializeForm() {
    const form = document.getElementById('crimeForm');
    form.addEventListener('submit', handleFormSubmit);

    // Mobile menu setup (moved logic here for consolidation)
    setupMobileMenu(); 
}

// Helper to consolidate mobile menu setup
function setupMobileMenu() {
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
// File Upload Functionality (Kept mostly intact, moved functions inside)
// ==============================
function setupFileUpload() {
    const fileInput = document.getElementById('evidence');
    const fileList = document.getElementById('fileList');
    const fileLabel = document.querySelector('.file-label');
    let selectedFiles = []; // This array is local to file upload setup

    // Handle selection
    fileInput.addEventListener('change', e => addFilesToList(Array.from(e.target.files)));

    // Drag & Drop (Logic remains the same)
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

    // This function must be globally accessible or handled differently if we want to reset the form later.
    // For now, keeping it globally accessible:
    window.removeFile = function (name, size) {
        selectedFiles = selectedFiles.filter(f => !(f.name === name && f.size === size));
        fileList.innerHTML = '';
        selectedFiles.forEach(f => renderFileItem(f));
    };
}


// ==============================
// File Size Formatter (Kept intact)
// ==============================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


// ==============================
// Form Validation (Kept intact)
// ==============================
function setupFormValidation() {
    const form = document.getElementById('crimeForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidationError);
    });
}
function validateField(e) { /* ... intact ... */ }
function clearValidationError(e) { /* ... intact ... */ }
function showFieldError(field, msg) { /* ... intact ... */ }


// ==============================
// Coordinates Auto-populate (Kept intact)
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
// 🚨 NEW: Form Submission (API Call) 🚨
// ==============================
async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    // Check validation
    inputs.forEach(input => { 
        if (!validateField({ target: input })) {
            isValid = false; 
        }
    });
    if (!isValid) return showNotification('Please correct the errors', 'error');

    // Get auth token and UI elements
    const token = localStorage.getItem('userToken');
    const submitBtn = form.querySelector('button[type="submit"]');
    const origText = submitBtn.innerHTML;
    
    // 1. Prepare UI for submission
    submitBtn.innerHTML = 'Saving...';
    submitBtn.disabled = true;

    // 2. Collect Data
    const formData = {
        crimeType: document.getElementById('crimeType').value,
        description: document.getElementById('description').value,
        severity: document.getElementById('severity').value,
        location: document.getElementById('location').value,
        // Send NULL if coordinates are empty
        latitude: document.getElementById('latitude').value ? parseFloat(document.getElementById('latitude').value) : null,
        longitude: document.getElementById('longitude').value ? parseFloat(document.getElementById('longitude').value) : null,
        datetime: document.getElementById('datetime').value,
        
        // ⚠️ Officer details are not sent as they are not in the crimes_new table
        // You would only send file data separately (not implemented here)
    };

    try {
        const response = await fetch(CRIME_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();

        // 3. Handle Response
        if (response.ok) { // Status 201 Created
            form.reset();
            resetFileState(); // Clean up file list
            setCurrentDateTime(); // Reset current time
            
            showSuccessModal(result.recordId);
            showNotification('Crime record saved successfully!', 'success');
        } else if (response.status === 403) {
             // Catch RBAC/Token errors specifically
            showNotification(`Access Denied. Please re-login or check your privileges.`, 'error');
            // If token is bad, force logout
            window.location.href = 'Homepage.html'; 
        } else {
            showNotification(`Error: ${result.message || 'Failed to submit the record.'}`, 'error');
        }

    } catch (error) {
        console.error('Network Error during submission:', error);
        showNotification('A network error occurred. Check the backend server.', 'error');
    } finally {
        // 4. Restore UI state
        submitBtn.innerHTML = origText;
        submitBtn.disabled = false;
    }
}


// ==============================
// Success Modal (Kept intact)
// ==============================
function showSuccessModal(recordId) { /* ... intact ... */ }
function closeModal() { /* ... intact ... */ }
function addAnother() { /* ... intact ... */ }


// ==============================
// File State Reset Helper
// ==============================
function resetFileState() {
    const fileList = document.getElementById('fileList');
    if (fileList) fileList.innerHTML = '';
    // NOTE: You would need to update the logic if 'selectedFiles' was a global variable
    // For now, form.reset() handles the input field reset.
}

// ==============================
// Reset Form (Kept intact, added file reset helper)
// ==============================
function resetForm() { /* ... intact, but ensure it calls resetFileState() */ }


// ==============================
// Mobile Menu Toggle (Kept intact)
// ==============================
function toggleMobileMenu() { /* ... intact ... */ }


// ==============================
// Notifications (Kept intact)
// ==============================
function showNotification(msg, type = 'info') { /* ... intact ... */ }
function getNotificationColor(type) { /* ... intact ... */ }
// ... style definitions ...


// ==============================
// Crime Type Suggestions (Renamed and Kept intact)
// ==============================
const crimeTypeDescriptions = { /* ... intact ... */ };
function setupCrimeTypeSuggestions() {
    document.getElementById('crimeType').addEventListener('change', function () {
        const desc = document.getElementById('description');
        const selected = this.value;
        if (selected && crimeTypeDescriptions[selected] && !desc.value) {
            desc.placeholder = `Suggested: ${crimeTypeDescriptions[selected]}`;
        }
    });
}