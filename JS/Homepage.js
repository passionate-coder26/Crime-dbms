// Animate numbers
function animateValue(id, start, end, duration) {
    let obj = document.getElementById(id);
    if (!obj) return;
    let range = end - start;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = Math.min((timestamp - startTime) / duration, 1);
        obj.textContent = Math.floor(progress * range + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    }
    window.requestAnimationFrame(step);
}

// Reveal on scroll + hide on scroll up
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Staggered reveal for feature cards
            if (entry.target.classList.contains("feature-card")) {
                let index = [...document.querySelectorAll(".feature-card")].indexOf(entry.target);
                setTimeout(() => entry.target.classList.add("show"), index * 300);
            } else {
                entry.target.classList.add("show");
            }

            // Start counters only when stats appear
            if (entry.target.classList.contains('stats-card') && !entry.target.classList.contains('counting')) {
                entry.target.classList.add('counting'); // mark currently counting
                if (entry.target.querySelector("#total-crimes")) {
                    animateValue("total-crimes", 0, 640, 2000);
                }
                if (entry.target.querySelector("#predicted-crimes")) {
                    animateValue("predicted-crimes", 0, 25, 2500);
                }
                if (entry.target.querySelector("#high-risk")) {
                    animateValue("high-risk", 0, 5, 3000);
                }
            }
        } else {
            entry.target.classList.remove("show");
            // Reset stats when out of view
            if (entry.target.classList.contains('stats-card')) {
                entry.target.classList.remove("counting");
                let p = entry.target.querySelector("p");
                if (p) p.textContent = "0"; // reset to 0
            }
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));

// --- 3. Login/Signup Modal Logic & Access Control (CUSTOM AUTH) ---

const signupBtn = document.getElementById("signup-btn"); // Selects the Sign up button
const loginBtn = document.getElementById("login-btn"); 

// Check local storage for persistent login status
let isUserLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; 

const popup = document.getElementById("auth-popup");
const closeBtn = document.querySelector(".close-btn");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

// Select the inputs needed for submission handlers
const loginInputs = {
    email: loginForm.querySelector('.input-group input[type="text"]'), // Assuming first input is username/email
    password: loginForm.querySelector('.input-group input[type="password"]')
};
const signupInputs = {
    name: signupForm.querySelector('.input-group:nth-child(2) input'),
    email: signupForm.querySelector('.input-group:nth-child(3) input'),
    password: signupForm.querySelector('.input-group:nth-child(4) input')
};


const showSignup = document.getElementById("show-signup");
const showLogin = document.getElementById("show-login");


/**
 * Updates the visibility and text of the login/signup buttons based on login status.
 */

// Add this function near the existing UTILITY FUNCTIONS block:
function updateNavForRole() {

}

// Function to retrieve the user role from localStorage
function getRoleFromLocalStorage() {
    return localStorage.getItem('userRole'); 
}
// Function to retrieve the token for the login check
function getTokenFromLocalStorage() {
    return localStorage.getItem('userToken'); 
}

/**
 * Dynamically filters the menu links based on the user's role.
 */
function filterMenuByRole() {
    const role = getRoleFromLocalStorage();
    const officialLinks = document.querySelectorAll('.official-link');
    const officialHeading = document.getElementById('official-heading');
    const officialHr = document.getElementById('official-hr');
    
    // An official is 'admin' or 'analyst'
    const isOfficial = (role === 'admin' || role === 'analyst');

    // Set visibility for the Official section elements
    if (officialHeading) officialHeading.style.display = isOfficial ? 'block' : 'none';
    if (officialHr) officialHr.style.display = isOfficial ? 'block' : 'none';

    // Loop through and set visibility for individual official links
    officialLinks.forEach(link => {
        link.style.display = isOfficial ? 'block' : 'none';
    });
}

/**
 * Toggles the menu and implements the login protection gate.
 */
function toggleMenu() {
    const token = getTokenFromLocalStorage();
    const menu = document.getElementById('menu-panel');

    // --- 1. LOGIN PROTECTION GATE ---
    if (!token) {
        alert("Please log in to access the full features menu.");
        window.location.href = 'login.html'; 
        return; 
    }

    // --- 2. MENU TOGGLE and ROLE FILTERING (Only runs if logged in) ---
    filterMenuByRole(); 
    menu.classList.toggle('open');

    // Add/remove listener for closing the menu when clicking outside
    if (menu.classList.contains('open')) {
        document.body.addEventListener('click', closeMenuOutside);
    } else {
        document.body.removeEventListener('click', closeMenuOutside);
    }
}

// Function to close the menu when clicking outside (for better UX)
function closeMenuOutside(event) {
    const menu = document.getElementById('menu-panel');
    const icon = document.getElementById('hamburger-icon');
    
    if (menu.classList.contains('open') && !menu.contains(event.target) && !icon.contains(event.target)) {
        menu.classList.remove('open');
        document.body.removeEventListener('click', closeMenuOutside);
    }
}

function updateAuthUI() {
    if (isUserLoggedIn) {
        // Logged In: Hide Signup, change Login to Logout
        if (signupBtn) signupBtn.style.display = 'none';
        
        if (loginBtn) {
            loginBtn.textContent = 'Log out';
            loginBtn.style.display = 'block';   
        }
    } else {
        // Logged Out: Show Signup, change to Login
        if (signupBtn) {
             signupBtn.style.display = 'block';
             signupBtn.textContent = 'Sign up';
        }
        if (loginBtn) {
             loginBtn.textContent = 'Log in';
             loginBtn.style.display = 'block';
        }
    }
    // 🚨 NEW: Call the role checker after updating the auth buttons
    updateNavForRole(); 
}


function switchForm(formToShow) {
    const formToHide = (formToShow === loginForm) ? signupForm : loginForm;
    
    formToHide.classList.remove("active");
    formToShow.classList.add("active");
    
    // Focus the first input of the newly active form
    formToShow.querySelector('input').focus();
}

function openPopup(mode) {
    popup.classList.remove("hidden_info");
    const formToActivate = (mode === 'signup') ? signupForm : loginForm;
    switchForm(formToActivate);
    
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent scrolling underneath
}

function closePopup() {
    popup.classList.add("hidden_info");
    popup.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scrolling
}


/**
 * Updates the global login state and persists it in localStorage.
 */
function setLoginState(state, role = 'public') { // 👈 Added optional 'role' parameter
    isUserLoggedIn = state;
    localStorage.setItem('isLoggedIn', state);
    localStorage.setItem('userRole', role); // 👈 CRITICAL: Save the role
    console.log(`User login state set to: ${state} (${role})`);

    updateAuthUI(); 
    // updateNavForRole is called inside updateAuthUI()
}


// --- ACCESS CONTROL FUNCTION ---

/**
 * Checks login status and either opens the popup or allows navigation.
 */
function handleProtectedClick(e) {
    if (!isUserLoggedIn) {
        e.preventDefault(); // STOP the navigation
        openPopup('login'); // SHOW the login popup
    } 
    // If logged in, the link will follow its default href.
}


// --- EVENT LISTENERS ---

// 1. Authentication buttons (Sign up / Log in) - Handles the explicit Log in/Log out action
document.querySelectorAll(".scene-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const btnText = btn.textContent.trim();

        // ---------------------------------------------------------------------
        // ⚠️ IMPLEMENTED LOGOUT LOGIC:
        // ---------------------------------------------------------------------
        if (btnText === 'Log out') {
            // 1. Reset client-side state
            setLoginState(false); 
            localStorage.removeItem('userToken'); // Clean up the stored token
            localStorage.removeItem('userRole'); // Clean up the stored role
            
            alert("You have been successfully logged out.");
            return; // Stop the function here
        }
        
        // ---------------------------------------------------------------------
        // EXISTING LOGIC: Handles opening the modal (when logged out or signing up)
        // ---------------------------------------------------------------------
        
        // This handles protected links opening the login modal, OR explicitly clicking Sign Up.
        const mode = btnText.includes("Sign") ? 'signup' : 'login';
        
        // Only open the popup if the user is explicitly clicking 'Sign up'
        // OR if they click 'Log in' while already logged out (which shouldn't happen 
        // if the UI is updated correctly, but it's a safe fallback).
        if (btnText === 'Sign up' || btnText === 'Log in') {
             openPopup(mode);
        }
    });
});

// 2. Navigation links: Protect specific links
const protectedLinks = document.querySelectorAll('.nav ul li a');

// protectedLinks.forEach(link => {
//     const href = link.getAttribute('href');
//     // Only protect Crime hotspot, Add Crime, and Cases
//     if (href !== '#' && href !== '#about' && href !== '#contact') {
//         link.addEventListener('click', handleProtectedClick);
//     }
// });


// 3. Popup switching and closing
closeBtn.addEventListener("click", closePopup);

// Close popup on click outside (overlay)
popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        closePopup();
    }
});

showSignup.addEventListener("click", (e) => {
    e.preventDefault();
    switchForm(signupForm);
});

showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    switchForm(loginForm);
});


// 4. Form submission handlers (Using real API calls to Node/Express Backend)

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Assuming loginInputs object was correctly defined earlier in the JS file
    const email = loginInputs.email.value;
    const password = loginInputs.password.value;
    
    try {
        const response = await fetch('http://localhost:3000/api/login', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();

        if (response.ok) { // Status code 200 (OK)
            // SUCCESS: Set login state and store the token for future authenticated requests
            setLoginState(true, data.userRole);
            localStorage.setItem('userToken', data.token); // Store the token
            localStorage.setItem('userRole', data.userRole); // Store user role
            closePopup();
        } else {
            // FAILURE: Status code 401, 400, or 500
            alert(`Login failed: ${data.message || 'Invalid credentials.'}`);
        }
    } catch (error) {
        console.error('Network error during login:', error);
        alert('Could not connect to the backend server (Is Node/Express running?).');
    }
});


signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Assuming signupInputs object was correctly defined earlier in the JS file
    const fullName = signupInputs.name.value;
    const email = signupInputs.email.value;
    const password = signupInputs.password.value;
    
    try {
        const response = await fetch('http://localhost:3000/api/signup', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password })
        });
        
        const data = await response.json();

        if (response.ok) { // Status code 201 (Created)
            // SUCCESS: Assume successful signup logs the user in immediately
            setLoginState(true, 'public'); 
            localStorage.setItem('userToken', data.token);
            closePopup();
        } else {
            // FAILURE (e.g., Status code 409 for existing email)
            alert(`Sign Up failed: ${data.message || 'Please try a different email.'}`);
        }
    } catch (error) {
        console.error('Network error during signup:', error);
        alert('Could not connect to the backend server (Is Node/Express running?).');
    }
});

    // ✅ Handle logout inside hamburger menu
document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('link-logout');

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();

            // --- Reuse your existing logout logic ---
            setLoginState(false);
            localStorage.removeItem('userToken');
            localStorage.removeItem('userRole');
            
            alert("You have been successfully logged out.");

            // Optional redirect
            window.location.href = "homepage.html";
        });
    }
});

// Run UI check once on page load to reflect stored login state immediately
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Protection for VISIBLE MAIN NAVBAR links (Crime Analysis, Search/Records) ---
    // This targets links inside the main-nav-links container in your HTML
    const protectedMainNav = document.querySelectorAll('.main-nav-links a');
    
    protectedMainNav.forEach(link => {
        const href = link.getAttribute('href');
        
        // We protect the two links that require login (analytics_dashboard, advanced_search)
        if (href === 'analytics_dashboard.html' || href === 'advanced_search.html') {
            link.addEventListener('click', handleProtectedClick);
        }
        // 'Home' is left unprotected.
    });

    // --- 2. Protection for HAMBURGER MENU links ---
    // The .menu-link class covers ALL links inside the hamburger menu.
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', handleProtectedClick); 
    });

    // --- 3. Initial UI Update ---
    updateAuthUI();
});