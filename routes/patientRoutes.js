
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Define routes using the methods from patientController
router.post('/register', patientController.register);
// url: http://localhost:9900/patients/register



router.post('/login', patientController.login);
// url: http://localhost:9900/patients/login


router.get('/profile', patientController.getProfile);
// url: http://localhost:9900/patients/profile



router.put('/update', patientController.updateProfile);
// url: http://localhost:9900/patients/update


router.post('/logout', patientController.logout);
// url: http://localhost:9900/patients/logout
router.delete('/delete/:patient_id', patientController.deleteAccount);
// url: http://localhost:9900/patients/delete/:patient_id
module.exports = router;




