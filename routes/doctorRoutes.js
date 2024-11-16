const express = require('express');
const doctorController = require('../controllers/doctorController');
const router = express.Router();

// Public routes
router.post('/register', doctorController.register);   
// ulr: http://localhost:9900/doctors/register



// Register a new doctor
router.post('/login', doctorController.login); 
// ulr: http://localhost:9900/doctors/login
// only email for login on doctor's account on postman

// Log in a doctor
router.get('/logout', doctorController.logout);         // Log out a doctor

// Protected routes that require authentication
router.put('/profile',  doctorController.updateProfile); // Update doctor's profile



router.get('/profile',  doctorController.getProfile);    // Get doctor's 
// url: http://localhost:9900/doctors/profile


//router.get('/dashboard', doctorController.getDashboard); // Get doctor's dashboard data
router.delete('/delete',  doctorController.deleteAccount); // Delete doctor's account

module.exports = router;
