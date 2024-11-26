const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ensure this points to your DB connection module

// Get total number of doctors
router.get('/doctors', async (req, res) => {
    try {
        const [results] = await db.query('SELECT COUNT(*) AS count FROM doctors');
        res.json({ totalDoctors: results[0].count });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching total doctors: ' + err.message });
    }
});

// Get total number of patients
router.get('/patients', async (req, res) => {
    try {
        const [results] = await db.query('SELECT COUNT(*) AS count FROM patients');
        res.json({ totalPatients: results[0].count });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching total patients: ' + err.message });
    }
});

// Get total number of appointments
router.get('/appointments', async (req, res) => {
    try {
        const [results] = await db.query('SELECT COUNT(*) AS count FROM appointments');
        res.json({ totalAppointments: results[0].count });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching total appointments: ' + err.message });
    }
});

// Get appointment counts by status
router.get('/appointments/status', async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT status, COUNT(*) AS count
            FROM appointments
            GROUP BY status
        `);
        res.json(results); // Returns an array of objects with status and count
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching appointment status: ' + err.message });
    }
});

// Get upcoming appointments
router.get('/appointments/upcoming', async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status
            FROM appointments
            WHERE appointment_date >= CURDATE()  /* Adjust the date condition as needed */
            ORDER BY appointment_date, appointment_time
        `);
        res.json(results); // Returns an array of upcoming appointments
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching upcoming appointments: ' + err.message });
    }
});

module.exports = router;
