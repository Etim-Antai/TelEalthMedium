const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController'); // Import patient controller



// Route to register a new patient (POST request)
router.post('/register', patientController.registerPatient);

// Route to log in an existing patient (POST request)
router.post('/login', patientController.loginPatient);

// Route to get the profile of a logged-in patient
router.get('/profile/:patient_id', patientController.getPatientProfile);

// Route to update the profile of a logged-in patient
router.put('/profile/:patient_id', patientController.updatePatientProfile);

// Route to delete a patient's account
router.delete('/delete/:patient_id', patientController.deletePatientAccount);

module.exports = router;
