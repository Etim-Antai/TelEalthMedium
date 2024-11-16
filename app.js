require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise'); // Updated to use promise-based connection
const path = require('path');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { adminAuth} = require('./middleware/authMiddleware')
const app = express();

// Set up middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Creating database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verify database connection
(async () => {
    try {
        await db.query('SELECT 1'); // Test query to verify the connection
        console.log('Database connection verified');
    } catch (err) {
        console.error('Error verifying database connection:', {
            code: err.code,
            errno: err.errno,
            message: err.sqlMessage
        });
        process.exit(1); // Exit if connection fails
    }
})();

// Attach the database pool to the app for use in routes
app.set('db', db);




// Set up session management
app.use(session({
    secret: process.env.SESSION_SECRET, // Use a strong secret for production
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true // Prevent JavaScript access to cookies
    }
}));

// Use routes for handling patient-related and appointment-related requests
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/doctors', doctorRoutes);
//app.use('/admin', adminAuth, adminRoutes)
app.use('/admin', adminRoutes); // Only applies to admin operations after they are authenticated



// Debug route to check database connectivity
app.get('/debug/db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.json({ status: 'Connected', solution: rows[0].solution });
    } catch (err) {
        res.status(500).json({ status: 'Error', message: err.message });
    }
});

// Route for home page
app.get('/', (req, res) => {
    res.send('Welcome to the Telemedicine Application');
});

// Route for handling errors
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

// Global error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message,
        error: process.env.NODE_ENV === 'production' ? error : {}
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
