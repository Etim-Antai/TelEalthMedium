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


// get all patients
router.get('/patients', doctorController.getAllPatients); 
// URL: http://localhost:9900/doctors/patients




// get statistics
router.get('/statistics', doctorController.getAppointmentStatistics,); 
// URL: http://localhost:9900/doctors/statistics

// age distribution of patients
router.get('/age-distribution', doctorController.getAgeDistribution); 
// url: http://localhost:9900/doctors/age-distribution


// get doctot's appointments
router.get('/appointments', doctorController.getDoctorAppointments); 
// URL: http://localhost:9900/doctors/appointments

// patient's distribution by address
router.get('/address-distribution', doctorController.getPatientDistributionByAddress); 
// URL: http://localhost:9900/doctors/address-distribution



module.exports = router;

