const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require("child_process");

const app = express();

app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(cors());

// ⚠️ SECURITY NOTE: REPLACE THIS WITH A STRONG, RANDOM, COMPLEX SECRET KEY
const jwtSecret = 'CRIME_ANALYTICS_SUPER_SECRET_KEY_12345'; 

// MySQL connection (using original direct connection)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Iamkannan@12345',
    database: 'crime_db'
});

db.connect(err => {
    if (err) {
        console.error('❌ DB connection error:', err);
    } else {
        console.log('✅ Connected to MySQL database');
    }
});

// Helper function to wrap db.query in a Promise (essential for async/await in auth routes)
const queryAsync = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Configure storage for photos (saves them to a local 'uploads/missing_photos' directory)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // NOTE: You must create this folder in your project directory!
        if(file.fieldname === 'wantedPhoto'){
            cb(null, 'uploads/wanted/');    
        }else if(file.fieldname === 'photo'){
            cb(null, 'uploads/missing_photos/');
        }
    },
    filename: (req, file, cb) => {
        // Use a unique name to prevent collisions
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


// ================= JWT AUTHENTICATION MIDDLEWARE ================= //

/**
 * Middleware to check if a valid JWT is present and extract user data (id, role).
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        
        // 🚨 CRITICAL DEBUG: Place this line here!
        console.log(`[DEBUG AUTH] Token Verified. Raw Role: "${user.role}"`); 
        
        req.userId = user.id;
        req.userRole = user.role; 
        next();
    });
};

/**
 * Middleware to check if the authenticated user has the necessary role.
 */
const checkRole = (requiredRoles) => (req, res, next) => {
    if (requiredRoles.includes(req.userRole)) {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
};


// ================= AUTHENTICATION ROUTES (JWT Generation) ================= //

// 1. SIGNUP Route (Unchanged)
app.post('/api/signup', async (req, res) => {
    const { fullName, email, password } = req.body; 

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const existingUser = await queryAsync('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const userRole = 'public'; 
        
        const result = await queryAsync(
            'INSERT INTO users (full_name, email, password_hash, user_role) VALUES (?, ?, ?, ?)',
            [fullName, email, passwordHash, userRole]
        );
        const userId = result.insertId;

        const token = jwt.sign({ id: userId, role: userRole }, jwtSecret, { expiresIn: '1h' });

        return res.status(201).json({ 
            message: 'User created and logged in.',
            token, 
            userRole 
        });

    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ message: 'Server error during signup.' });
    }
});


// 2. LOGIN Route (Unchanged)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body; 

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const users = await queryAsync('SELECT id, password_hash, full_name, user_role FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' }); 
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Log login event
        await queryAsync(
            'INSERT INTO login_logs (user_id, full_name, ip_address) VALUES (?, ?, ?)',
            [user.id, user.full_name, req.ip]
        );
        
        const token = jwt.sign({ id: user.id, role: user.user_role }, jwtSecret, { expiresIn: '1h' });
        
        return res.status(200).json({ 
            message: 'Login successful.',
            token, 
            userRole: user.user_role
        });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});

// ================= PUBLIC API ROUTE (REPORT MISSING) ================= //
app.post('/api/missing/report', upload.single('photo'), async (req, res) => {
    // Note: Data is in req.body, file info is in req.file
    const { personName, age, gender, height, lastSeenLocation, lastSeenDate, description, reporterEmail } = req.body;

    if (!personName || !lastSeenLocation || !lastSeenDate) {
        return res.status(400).json({ message: 'Missing required person name, last seen location, or date.' });
    }

    const photoFilename = req.file ? req.file.filename : null;

    try {
        const sql = `
            INSERT INTO missing_reports (person_name, age, gender, height, last_seen_location, last_seen_date, description, photo_filename, reporter_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await queryAsync(sql, [
            personName, age || null, gender || null, height || null, 
            lastSeenLocation, lastSeenDate, description, photoFilename, reporterEmail
        ]);
        
        res.status(201).json({ message: 'Missing person report submitted for review. Thank you.' });
    } catch (error) {
        console.error('Error reporting missing person:', error);
        res.status(500).json({ message: 'Server error saving report.' });
    }
});


// ================= PROTECTED API ROUTE (SMART CRIME ADDER) ================= //


/**
 * Endpoint for adding new incidents. It routes the data based on user role:
 * - Officials ('admin', 'analyst'): Inserts into 'crimes_new'.
 * - Public Users ('public'): Inserts into 'tips'.
 */
app.post('/api/crimes', 
    authenticateToken, // 1. Verify the JWT and get user ID/Role
    // ⚠️ CRITICAL CHANGE: The 'checkRole' middleware is REMOVED so ALL logged-in users can post.
    async (req, res) => {
    
    // Data fields expected from the frontend form (adjust keys if necessary)
    const { crimeType, description, severity, location, latitude, longitude, datetime, contactEmail } = req.body;
    
    const reportedByUserId = req.userId;

    // 💡 CRITICAL FIX: Trim the role string to remove any leading/trailing spaces
    const userRole = req.userRole ? req.userRole.trim() : '';

    // 🚨 CRITICAL DEBUG: Place this line here!
    console.log(`[DEBUG ROUTE] Evaluating final role: "${userRole}"`);

    // Basic Validation: Ensure we have the absolute essentials for any submission
    if (!crimeType || !description) {
        return res.status(400).json({ message: 'Missing required fields: Crime Type and Description.' });
    }

    try {
        if (userRole === 'admin' || userRole === 'analyst') {
            // --- LOGIC FOR OFFICIALS (Insert into crimes_new) ---

            // Formal reports require location and time
            if (!location || !datetime) {
                return res.status(400).json({ message: 'Official reports require Location and Date/Time.' });
            }

            const insertQuery = `
                INSERT INTO crimes_new  
                (type, description, severity, location, latitude, longitude, incident_datetime, reported_by_user_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const result = await queryAsync(insertQuery, [
                crimeType, 
                description, 
                severity, 
                location, 
                latitude || null, 
                longitude || null, 
                datetime,           
                reportedByUserId
            ]);
            
            return res.status(201).json({ 
                message: 'Official crime record successfully added.',
                recordId: result.insertId, 
                table: 'crimes_new'
            });

        } else if (userRole === 'public') {
            // --- LOGIC FOR PUBLIC USERS (Insert into tips) ---
            
            const insertQuery = `
                INSERT INTO tips  
                (crime_type, description, location_detail, tip_contact_email) 
                VALUES (?, ?, ?, ?)
            `;
            
            const result = await queryAsync(insertQuery, [
                crimeType, 
                description, 
                location, 
                contactEmail || null 
            ]);

            return res.status(201).json({ 
                message: 'Public tip successfully recorded.',
                tipId: result.insertId,
                table: 'tips'
            });

        } else {    
            // Failsafe for unhandled roles
            console.error(`Attempted POST with invalid role: "${userRole}" for User ID: ${reportedByUserId}`); // 👈 LOGGING THE INVALID ROLE
            return res.status(403).json({ message: 'Invalid user role.' });
        }

    } catch (error) {
        console.error('Error recording incident or tip:', error);
        return res.status(500).json({ message: 'Server error: Failed to save record to database.' });
    }
});

app.post('/api/notices/post', authenticateToken, checkRole(['admin', 'analyst']), 
    upload.single('wantedPhoto'), 
    async (req, res) => {
    
    const userId = req.userId;
    const { category, title, content, datePosted, locationSpecific, bounty } = req.body;
    
    // Get the filename saved by Multer
    const photoFilename = req.file ? req.file.filename : null; 

    if (!category || !title || !content || !datePosted) {
        return res.status(400).json({ message: 'Missing required fields: Category, Title, Content, or Date.' });
    }
    
    if (category === 'Most Wanted' && !photoFilename) {
        return res.status(400).json({ message: 'Most Wanted announcements require a photo upload.' });
    }

    try {
        const sql = `
            INSERT INTO police_notices (category, title, content, date_posted, location_specific, photo_filename, bounty, posted_by_user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await queryAsync(sql, [
            category, title, content, datePosted, locationSpecific || null, photoFilename, bounty || null, userId
        ]);
        
        res.status(201).json({ message: 'Police Notice posted successfully.' });
    } catch (error) {
        console.error('Error posting notice:', error);
        res.status(500).json({ message: 'Server error posting notice.' });
    }
});

app.put('/api/missing/review/:id', authenticateToken, checkRole(['admin', 'analyst']), async (req, res) => {
    const reportId = req.params.id;
    const { action } = req.body; // Expects 'approve' or 'reject'
    const officialId = req.userId; // Official's ID from JWT

    if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ message: 'Invalid action.' });
    }

    try {
        // 1. Get the report details from the staging table
        const reports = await queryAsync('SELECT * FROM missing_reports WHERE id = ?', [reportId]);
        if (reports.length === 0) return res.status(404).json({ message: 'Report not found.' });
        const report = reports[0];

        if (action === 'approve') {
            // 2. Insert into the public table
            const insertSql = `
                INSERT INTO missing_public_view (person_name, age, gender, height, last_seen_location, last_seen_date, description, photo_filename, approved_by_user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await queryAsync(insertSql, [
                report.person_name, report.age, report.gender, report.height, report.last_seen_location, report.last_seen_date, report.description, report.photo_filename, officialId
            ]);
        }
        
        // 3. Update the status in the staging table
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        const updateSql = 'UPDATE missing_reports SET report_status = ? WHERE id = ?';
        await queryAsync(updateSql, [newStatus, reportId]);

        res.json({ message: `Report successfully ${newStatus.toLowerCase()}.`, action });

    } catch (error) {
        console.error(`Error during ${action} of report:`, error);
        res.status(500).json({ message: 'Server error during review process.' });
    }
});

app.get('/api/missing/pending', authenticateToken, checkRole(['admin', 'analyst']), async (req, res) => {
    try {
        const sql = 'SELECT * FROM missing_reports WHERE report_status = "Pending Review" ORDER BY submitted_at ASC';
        const results = await queryAsync(sql);
        res.json(results);
    } catch (error) {
        console.error('Error fetching pending reports:', error);
        res.status(500).json({ message: 'Server error fetching reports.' });
    }
});

app.get('/api/tips/all', authenticateToken, checkRole(['admin', 'analyst']), async (req, res) => {
    try {
        // Retrieve all tips, ordered by newest first
        const sql = 'SELECT id, submitted_at, crime_type, location_detail, description, tip_status FROM tips ORDER BY submitted_at DESC';
        const results = await queryAsync(sql); 
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching tips:', error);
        res.status(500).json({ message: 'Server error fetching tips.' });
    }
});

app.put('/api/tips/:id/status', authenticateToken, checkRole(['admin', 'analyst']), async (req, res) => {
    const tipId = req.params.id;
    const { newStatus } = req.body; // Expecting { newStatus: "Reviewed" }

    // Validate the new status against the ENUM values in your tips table
    const validStatuses = ['New', 'Reviewed', 'Actioned', 'Archived'];

    if (!newStatus || !validStatuses.includes(newStatus)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    try {
        const sql = 'UPDATE tips SET tip_status = ? WHERE id = ?';
        const result = await queryAsync(sql, [newStatus, tipId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `Tip ID ${tipId} not found.` });
        }
        
        res.json({ message: 'Tip status updated successfully.', tipId, newStatus });
    } catch (error) {
        console.error('Error updating tip status:', error);
        res.status(500).json({ message: 'Server error updating status.' });
    }
});

/**
 * Endpoint for officials to search the crimes_new table using multiple filters.
 * Filters are received via query parameters (req.query).
 */
app.get('/api/search/crimes', authenticateToken, checkRole(['admin', 'analyst']), async (req, res) => {
    
    // Extract parameters from the request query
    const { 
        location, 
        crimeType, 
        severity, 
        status, 
        startDate, 
        endDate 
    } = req.query;

    // Start building the dynamic SQL query
    let sql = 'SELECT * FROM crimes_new WHERE 1=1'; // 1=1 allows for easy appending of AND clauses
    const params = [];

    // --- Add Filters Dynamically ---
    if (location) {
        // Use LIKE for partial matches on location/district name
        sql += ' AND location LIKE ?';
        params.push(`%${location}%`); 
    }
    if (crimeType) {
        // Use exact match for crime type
        sql += ' AND type = ?';
        params.push(crimeType);
    }
    if (severity) {
        sql += ' AND severity = ?';
        params.push(severity);
    }
    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }
    
    // Date Range Filtering (uses incident_datetime column)
    if (startDate) {
        // Find crimes occurring ON or AFTER the start date/time
        sql += ' AND incident_datetime >= ?';
        params.push(startDate); 
    }
    if (endDate) {
        // Find crimes occurring ON or BEFORE the end date/time
        sql += ' AND incident_datetime <= ?';
        params.push(endDate); 
    }
    
    // Add sorting for cleaner results
    sql += ' ORDER BY incident_datetime DESC';

    // --- Execute Query ---
    try {
        // Use queryAsync (which returns [rows] array) to execute the dynamically built query
        const results = await queryAsync(sql, params); 
        
        res.json(results);
    } catch (error) {
        console.error('Error during advanced crime search:', error);
        res.status(500).json({ message: 'Server error during advanced search.' });
    }
});

/**
 * Endpoint for a logged-in user to send their current GPS coordinates.
 * Protected by authenticateToken.
 */
app.post('/api/share-location', authenticateToken, async (req, res) => {
    const userId = req.userId;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Missing latitude or longitude data.' });
    }

    try {
        const insertSql = `
            INSERT INTO location_logs (user_id, latitude, longitude)
            VALUES (?, ?, ?)
        `;
        await queryAsync(insertSql, [userId, latitude, longitude]);
        
        // --- Simulate Logging the location for real-time police dashboard ---
        console.log(`[REAL-TIME LOG] User ID ${userId} shared location: LAT=${latitude}, LNG=${longitude} at ${new Date().toISOString()}`);
        
        // --- OPTIONAL: Update a 'current_location' field in the users table for tracking ---
        // You would need to add 'current_latitude' and 'current_longitude' columns to your 'users' table for this:
        /*
        const updateSql = 'UPDATE users SET current_latitude = ?, current_longitude = ?, last_location_update = NOW() WHERE id = ?';
        await queryAsync(updateSql, [latitude, longitude, userId]);
        */
        
        res.status(200).json({ 
            message: 'Location successfully shared with police endpoint.',
            latitude,
            longitude
        });

    } catch (error) {
        console.error('Error sharing location:', error);
        res.status(500).json({ message: 'Server error while processing location share.' });
    }
});

// ================= UNPROTECTED API ROUTES (CRIME DATA - UPDATED TABLE) ================= //

// Get all crimes
app.get('/api/crimes', (req, res) => {
    // ⚠️ UPDATED TABLE: crimes_new
    db.query('SELECT * FROM crimes_new', (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch crimes.' });
        res.json(results);
    });
});



app.get('/api/summary', async (req, res) => {
    try {
        // 1. Total Crimes
        const totalRes = await queryAsync("SELECT COUNT(*) AS total FROM crimes");
        
        // 2. Most Common Crime (Added Alias 'crimeType' for clarity)
        const commonRes = await queryAsync("SELECT type AS crimeType FROM crimes GROUP BY type ORDER BY COUNT(*) DESC LIMIT 1");

        // 3. Safest City (Added Alias 'cityLocation' for clarity)
        const safestRes = await queryAsync("SELECT location AS cityLocation FROM crimes GROUP BY location ORDER BY COUNT(*) ASC LIMIT 1");

        // --- DEBUGGING LOGS (Check your terminal!) ---
        console.log("------------------------------------------------");
        console.log("📊 SUMMARY API DEBUG:");
        console.log("Total Raw:", totalRes);
        console.log("Common Raw:", commonRes);
        console.log("Safest Raw:", safestRes);
        console.log("------------------------------------------------");

        res.json({
            total_crimes: totalRes[0]?.total || 0,
            most_common: commonRes[0]?.crimeType || "N/A", 
            safest_city: safestRes[0]?.cityLocation || "N/A"
        });

    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary data' });
    }
});

app.get('/api/notices/all', async (req, res) => {
    try {
        const sql = 'SELECT * FROM police_notices ORDER BY date_posted DESC, category';
        const results = await queryAsync(sql); 
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching public notices:', error);
        res.status(500).json({ message: 'Server error fetching public notices.' });
    }
});

app.post('/api/tips', authenticateToken, async (req, res) => {
    
    console.log(`⚠️ DEBUG: Secure Tip Submitted by User ID: ${req.userId}`); 
    
    const { crimeType, location, description, contactEmail } = req.body;

    if (!crimeType || !description || !location) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const sql = `
            INSERT INTO tips (crime_type, location_detail, description, tip_contact_email, tip_status) 
            VALUES (?, ?, ?, ?, 'New')
        `;
        
        const result = await queryAsync(sql, [
            crimeType, 
            location, 
            description, 
            contactEmail || null 
        ]);

        res.status(201).json({ 
            message: 'Tip submitted successfully.', 
            tipId: result.insertId 
        });

    } catch (error) {
        console.error('Error submitting tip:', error);
        res.status(500).json({ message: 'Server error saving tip.' });
    }
});

app.get('/api/tip-status/:id', async (req, res) => {
    const tipId = req.params.id;

    try {
        const sql = 'SELECT id, submitted_at, tip_status, crime_type, location_detail FROM tips WHERE id = ?';
        // Note: Using 'queryAsync' which returns [rows] array
        const results = await queryAsync(sql, [tipId]); 

        if (results.length === 0) {
            return res.status(404).json({ message: 'Tip ID not found. Please verify the ID is correct.' });
        }

        const tip = results[0];

        res.json({
            tipId: tip.id,
            status: tip.tip_status,
            crimeType: tip.crime_type,
            location: tip.location_detail,
            submittedAt: tip.submitted_at,
            message: `The status for your tip is currently: ${tip.tip_status}`
        });

    } catch (error) {
        console.error('Error checking tip status:', error);
        res.status(500).json({ message: 'Server error retrieving tip status.' });
    }
});


/**
 * Endpoint for the public to view all approved missing person reports.
 * This route is NOT protected by authentication.
 */
app.get('/api/missing/public-view', async (req, res) => {
    try {
        const sql = 'SELECT id, person_name, age, gender, height, last_seen_location, last_seen_date, description, photo_filename FROM missing_public_view ORDER BY approved_at DESC';
        // Note: queryAsync returns the array of rows
        const results = await queryAsync(sql); 
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching public missing persons:', error);
        res.status(500).json({ message: 'Server error fetching public data.' });
    }
});


// Crimes by type (for charts)
app.get('/api/chart', (req, res) => {
    // ⚠️ UPDATED TABLE: crimes_new
    db.query("SELECT type AS crime_type, COUNT(*) AS count FROM crimes GROUP BY type", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Crimes for map (with lat/lng)
app.get('/api/map', (req, res) => {
    const sql = `
        SELECT location AS city, type AS crime_type, latitude, longitude, status 
        FROM crimes 
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        
        res.json(results.map(r => ({
            city: r.city,
            crime_type: r.crime_type,
            lat: parseFloat(r.latitude),
            lng: parseFloat(r.longitude),
            status: r.status
        })));
    });
});

app.post("/predict", (req, res) => {
    const { state, district, crime } = req.body;

    if (!state || !district || !crime) {
        return res.status(400).json({ error: "Please provide state, district, and crime type." });
    }

    const { spawn } = require("child_process");
    const python = spawn("python", ["prediction.py"]);

    // Send input data to Python script
    python.stdin.write(JSON.stringify({ state, district, crime }));
    python.stdin.end();

    let result = "";
    python.stdout.on("data", (data) => {
        result += data.toString();
    });

    python.stdout.on("end", () => {
        try {
            const output = JSON.parse(result);
            res.json(output);
        } catch (error) {
            res.status(500).json({ error: "Failed to parse Python response" });
        }
    });

    python.stderr.on("data", (data) => {
        console.error("Python error:", data.toString());
    });
});


// ================= START SERVER ================= //
app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));