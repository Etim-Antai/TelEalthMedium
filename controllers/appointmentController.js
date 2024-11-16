// Importing required modules
const Appointment = require('../models/appointmentModel');


const db = require('../config/db');

// Create Appointment
exports.createAppointment = async (req, res) => {
    const { doctor_id, appointment_date, appointment_time } = req.body;
    const patient_id = req.session.patientId;

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const [doctorSchedule] = await db.execute('SELECT * FROM doctors WHERE doctor_id = ?', [doctor_id]);
        if (doctorSchedule.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        const [result] = await db.execute(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, 'scheduled']
        );

        res.status(201).json({ message: 'Appointment booked successfully', appointmentId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Patient's Appointments
exports.getPatientAppointments = async (req, res) => {
    const patient_id = req.session.patientId;

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const [appointments] = await db.execute(
            'SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialization ' +
            'FROM appointments a ' +
            'JOIN doctors d ON a.doctor_id = d.doctor_id ' +
            'WHERE a.patient_id = ?',
            [patient_id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found' });
        }

        res.status(200).json({ appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Doctor's Appointments
exports.getAppointmentsForDoctor = async (req, res) => {
    const doctor_id = req.params.doctor_id;

    if (!doctor_id) {
        return res.status(400).json({ message: 'Doctor ID is required' });
    }

    try {
        const [appointments] = await db.execute(
            'SELECT * FROM appointments WHERE doctor_id = ?',
            [doctor_id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this doctor' });
        }

        res.status(200).json({ appointments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Appointment (Reschedule)
exports.updateAppointment = async (req, res) => {
    const { appointment_id, appointment_date, appointment_time } = req.body;
    const patient_id = req.session.patientId;

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const [appointment] = await db.execute('SELECT * FROM appointments WHERE appointment_id = ? AND patient_id = ?', [appointment_id, patient_id]);
        if (appointment.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const [result] = await db.execute(
            'UPDATE appointments SET appointment_date = ?, appointment_time = ? WHERE appointment_id = ?',
            [appointment_date, appointment_time, appointment_id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Appointment updated successfully' });
        } else {
            res.status(400).json({ message: 'Failed to update appointment' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Cancel Appointment
exports.cancelAppointment = async (req, res) => {
    const appointment_id = req.params.appointment_id; // Accept appointment_id from URL
    const patient_id = req.session.patientId;

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        // Check if the appointment exists and belongs to the patient
        const [appointment] = await db.execute(
            'SELECT * FROM appointments WHERE appointment_id = ? AND patient_id = ?',
            [appointment_id, patient_id]
        );

        if (appointment.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Use the model to update the status to 'canceled'
        Appointment.updateStatus(appointment_id, 'canceled', (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.status(200).json({ message: 'Appointment canceled successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
