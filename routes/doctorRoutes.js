const express = require('express');
const doctorController = require('../controllers/doctorController');
const router = express.Router();

// Public routes
router.post('/register', doctorController.register);   
// URL: http://localhost:9900/doctors/register

// Log in a doctor
router.post('/login', doctorController.login); 
// URL: http://localhost:9900/doctors/login
// Requires email and password for doctor login

// Log out a doctor
router.get('/logout', doctorController.logout);         

// Protected routes that require authentication
router.put('/profile', doctorController.updateProfile); // Update doctor's profile
router.get('/profile', doctorController.getProfile);     // Get doctor's profile
// URL: http://localhost:9900/doctors/profile

// Get all doctors
router.get('/all-doctors', doctorController.getAllDoctors); 
// URL: http://localhost:9900/doctors/all-doctors

// Get doctor's dashboard data (if needed, uncomment the line below)
// router.get('/dashboard', doctorController.getDashboard); 

// Delete doctor's account
router.delete('/delete', doctorController.deleteAccount); 
// URL: http://localhost:9900/doctors/delete
// Set password for existing doctors
router.post('/set-password', doctorController.setPassword); 
// URL: http://localhost:9900/doctors/set-password

module.exports = router;
