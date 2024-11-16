// Middleware for admin routes
const adminAuth = (req, res, next) => {
    console.log("Admin authorization check:");
    console.log("Session Data:", req.session); // Log the session data
    if (req.session && req.session.adminData && req.session.adminData.id) {
        console.log(`Admin access granted for admin ID: ${req.session.adminData.id}`);
        return next(); // User is authenticated, proceed to the requested route
    }
    // If not authenticated
    console.log("Unauthorized admin access attempt");
    res.status(401).json({ message: 'Unauthorized: Please log in' });
};
























// Middleware for patient routes
const patientAuth = (req, res, next) => {
    console.log("Patient authorization check:");
    console.log("Session Data:", req.session); // Log the session data
    if (req.session && req.session.patientData && req.session.patientData.id) {
        console.log(`Patient access granted for patient ID: ${req.session.patientData.id}`);
        return next(); // User is authenticated, proceed to the requested route
    }
    // If not authenticated
    console.log("Unauthorized patient access attempt", {
        sessionId: req.session?.id, // This will be undefined if session does not exist
        patientData: req.session.patientData // Log the patientData specifically
    });
    res.status(401).json({ message: 'Unauthorized: Please log in' });
};

// Generic middleware for checking if a patient is authenticated
const isAuthenticated = (req, res, next) => {
    console.log("Generic authentication check:");
    console.log("Session Data:", req.session); // Log session data
    if (req.session && req.session.patientData && req.session.patientData.id) { // Check if patient is authenticated
        return next(); // Access granted
    }
    console.log("Unauthorized access attempt");
    res.status(401).json({ message: 'Unauthorized: Please log in' });
};

// Middleware for doctor routes
const doctorAuth = (req, res, next) => {
    console.log("Doctor authorization check:");
    console.log("Session Data:", req.session); // Log the session data
    if (req.session && req.session.doctorData && req.session.doctorData.id) {
        console.log(`Doctor access granted for doctor ID: ${req.session.doctorData.id}`);
        return next(); // User is authenticated, proceed to the requested route
    }
    // If not authenticated
    console.log("Unauthorized doctor access attempt");
    res.status(401).json({ message: 'Unauthorized: Please log in' });
};

// Export the middleware along with the other auth middlewares
module.exports = { adminAuth};
