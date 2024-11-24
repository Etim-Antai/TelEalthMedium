const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();
const { adminAuth } = require('../middleware/authMiddleware'); 

// Admin Registration
router.post('/register', adminController.register);
// URL: http://localhost:9900/admin/register
// Method: POST

// Admin Login
router.post('/login', adminController.login);

// Admin Logout
router.get('/logout', adminController.logout);
// git admin profile
router.get('/profile', adminAuth, adminController.getProfile);

// Route to register a new patient
router.post('/register-patient', adminAuth, adminController.addPatient);

// Route to register a new doctor
router.post('/register-doctor', adminAuth, adminController.addDoctor);
// URL: http://localhost:9900/admin/register-doctor

// Protected routes (require authentication)

// Display a list of patients (admin only), with search and filter options.
router.get('/patients/:search?/:filterByGender?', adminAuth, adminController.getPatients);

// Display a list of appointments (admin only), with search and filter options.
router.get('/appointments/:search?/:filterByStatus?', adminAuth, adminController.getAppointments);

// Display a list of doctors (admin only), with search and filter options.
router.get('/doctors/:search?/:filterBySpecialization?', adminAuth, adminController.getDoctors); // Corrected to 'filterBySpecialization'

// Admin Dashboard - protected route
router.get('/dashboard', adminAuth, adminController.getDashboard); // Ensure you have this in your adminController
// hospital statistics
router.get('/hospital-stats', adminAuth, adminController.getHospitalStatistics); // Ensure you have this in your adminController
// url: http://localhost:9900/admin/hospital-stats
// update profile - admin only
router.put('/profile-update', adminAuth, adminController. updateProfile); // Ensure you have this in your adminController

module.exports = router;
