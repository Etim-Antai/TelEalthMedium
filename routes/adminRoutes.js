const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();
const { adminAuth } = require('../middleware/authMiddleware'); 

// Admin Registration
router.post('/register', adminController.register);

// url: http://localhost:9900/admin/register
// method: POST



// Admin Login
router.post('/login', adminController.login);

// Admin Logout
router.get('/logout', adminController.logout);


// Protected routes (require authentication)

// Display a list of patients (admin only), with search and filter options.
router.get('/patients/:search?/:filterByGender?', adminAuth, adminController.getPatients);


// Display a list of appointments (admin only), with search and filter options.
router.get('/appointments/:search?/:filterByStatus?', adminAuth, adminController.getAppointments);

// Display a list of doctors (admin only), with search and filter options.
router.get('/doctors/:search?/:filterBySpecialization?', adminAuth, adminController.getDoctors); // Corrected to 'filterBySpecialization'

// Admin Dashboard - protected route
router.get('/dashboard', adminAuth, adminController.getDashboard); // Ensure you have this in your adminController

module.exports = router;
