const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// --- This is your temporary, in-memory "database" ---
// User data will be stored here while the server is running.
let users = [];
console.log("✅ Temporary user storage initialized.");

// --- Middleware Setup ---
// This allows your frontend (on a different port) to talk to this backend.
app.use(cors({
    // This setting dynamically allows requests from the origin they came from.
    // It's more flexible for development than a hardcoded list of ports
    // and works correctly with `credentials: true`.
    origin: true,
    credentials: true
}));
app.use(express.json()); // To parse JSON from the frontend

// --- API ROUTES ---

// 1. REGISTRATION ENDPOINT
app.post('/register', (req, res) => {
    console.log('\nReceived a request to /register...');
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        console.log('❌ Registration failed: Missing fields.');
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
        console.log(`❌ Registration failed: User '${username}' or email '${email}' already exists.`);
        return res.status(409).json({ success: false, error: 'Username or email already exists.' });
    }

    // Store the new user
    const newUser = { id: users.length + 1, username, email, password };
    users.push(newUser);
    
    console.log('✅ User registered successfully!');
    console.log('Current users:', users.map(u => ({id: u.id, username: u.username, email: u.email}))); // Don't log passwords

    res.status(201).json({ success: true, message: 'Registration successful!' });
});

// 2. LOGIN ENDPOINT
app.post('/login', (req, res) => {
    console.log('\nReceived a request to /login...');
    const { username, password } = req.body;

    if (!username || !password) {
        console.log('❌ Login failed: Missing fields.');
        return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    // Find user by username OR email, and check password
    const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

    if (!user) {
        console.log(`❌ Login failed: Invalid credentials for user '${username}'.`);
        return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    console.log(`✅ User '${user.username}' logged in successfully.`);

    // Send back the user data your frontend expects
    res.json({
        success: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`🚀 Temporary backend server is running!`);
    console.log(`Listening on http://localhost:${PORT}`);
    console.log('This server stores users in memory. Data will be lost on restart.');
    console.log('Press CTRL + C to stop the server.');
    console.log('-------------------------------------------');
});
