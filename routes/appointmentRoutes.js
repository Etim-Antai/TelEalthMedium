const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController'); // Import appointment controller

// Route to book an appointment
router.post('/book', appointmentController.createAppointment);
// http://localhost:9900/appointments/book

/*{
    "doctor_id": 2,
    "appointment_date": "2024-11-20",
    "appointment_time": "10:30:00"
}*/





// Route to get all appointments for a patient
router.get('/patient/:patient_id', appointmentController.getPatientAppointments); // Updated function name

// url: http://localhost:9900/appointments/patient/patient_id


// Route to get all appointments for a doctor
router.get('/doctor/:doctor_id', appointmentController.getAppointmentsForDoctor); // Ensure this function exists in the controller

// url: http://localhost:9900/appointments/doctor/doctor_id


// Route to update an appointment (e.g., reschedule or change status)
router.put('/update/:appointment_id', appointmentController.updateAppointment);

//http://localhost:9900/appointments/update/patient_id



/*   {
    "appointment_date": "2024-11-15",
    "appointment_time": "12:30:00",
    "appointment_id": "27"
}


*/




// Route to cancel an appointment
router.delete('/cancel/:appointment_id', appointmentController.cancelAppointment);

// http://localhost:9900/appointments/cancel/:appointment_id




module.exports = router;
