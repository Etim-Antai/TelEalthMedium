const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController'); // Import appointment controller
const patientController = require('../controllers/patientController'); // Import patient controller
// Route to book an appointment
router.post('/book', appointmentController.createAppointment);
// Example URL: http://localhost:9900/appointments/book
/*
{
    "doctor_id": 2,
    "appointment_date": "2024-11-20",
    "appointment_time": "10:30:00"
}
*/

// Route to get appointment statistics for a patient
router.get('/statistics', appointmentController.getAppointmentStatistics);
// Example URL: http://localhost:9900/appointments/statistics

// Route to get all appointments for a patient
router.get('/patient', appointmentController.getPatientAppointments);
// Example URL: http://localhost:9900/appointments/patient

// Route to get count of appointments per patient for a doctor
router.get('/doctor-patient', appointmentController.loadAppointmentsPerPatient);
// Example URL: http://localhost:9900/appointments/doctor-patient

// Route to get all appointments for a doctor
router.get('/doctor/:doctor_id', appointmentController.getAppointmentsForDoctor);
// Example URL: http://localhost:9900/appointments/doctor/:doctor_id

// Route to update an appointment (e.g., reschedule or change status)
router.put('/update/:appointment_id', appointmentController.updateAppointment);
// Example URL: http://localhost:9900/appointments/update/:appointment_id
/*
{
    "appointment_date": "2024-11-15",
    "appointment_time": "12:30:00",
    "appointment_id": "27"
}
*/

// Route to cancel an appointment
router.delete('/cancel/:appointment_id', appointmentController.cancelAppointment);
// Example URL: http://localhost:9900/appointments/cancel/:appointment_id

// Route to get appointment statistics per doctor
router.get('/doctor-statistics', appointmentController.getAppointmentsPerDoctorStatistics);
// Example URL: http://localhost:9900/appointments/doctor-statistics

// New route to get appointment statistics per doctor
router.get('/byPatient', appointmentController.loadAppointmentsPerPatient);
// Example URL: http://localhost:9900/appointments/byPatient


router.get('/doctor-appointment', patientController.getAppointmentsPerDoctorStatistics);
// Example URL: http://localhost:9900/appointments/doctor-appointment


router.get('/doctor-appointmentcount', appointmentController.getAppointmentsCountPerDoctor);
// Example URL: http://localhost:9900/appointments/doctor-appointmentcount


router.put('/update-appointment', appointmentController.updateAppointment)
// Example URL: http://localhost:9900/appointments/update-appointment



module.exports = router;
