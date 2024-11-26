// Importing required modules
const Appointment = require('../models/appointmentModel');
const db = require('../config/db'); // Database connection from config/db

// Create Appointment
exports.createAppointment = async (req, res) => {
    const { doctor_id, appointment_date, appointment_time } = req.body;
    const patient_id = req.session.patientId; // Get patient ID from session

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        // Verify that the doctor exists
        const [doctorSchedule] = await db.execute('SELECT * FROM doctors WHERE doctor_id = ?', [doctor_id]);
        if (doctorSchedule.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Create the appointment
        const [result] = await db.execute(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_date, appointment_time, 'scheduled']
        );

        res.status(201).json({ message: 'Appointment booked successfully', appointmentId: result.insertId });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Patient's Appointments
exports.getPatientAppointments = async (req, res) => {
    const patient_id = req.session.patientId; // Get patient ID from session

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const [appointments] = await db.execute(
            'SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name ' +
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
        console.error("Error fetching patient's appointments:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Doctor's Appointments
exports.getAppointmentsForDoctor = async (req, res) => {
    const doctor_id = req.params.doctor_id; // Get doctor ID from request parameters

    if (!doctor_id) {
        return res.status(400).json({ message: 'Doctor ID is required' });
    }

    try {
        const [appointments] = await db.execute(
            'SELECT a.appointment_id, p.first_name AS patient_first_name, p.last_name AS patient_last_name, ' +
            'a.appointment_date, a.appointment_time, a.status ' +
            'FROM appointments a ' +
            'JOIN patients p ON a.patient_id = p.patient_id ' +
            'WHERE a.doctor_id = ?',
            [doctor_id]
        );

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this doctor' });
        }

        res.status(200).json({ appointments });
    } catch (error) {
        console.error("Error fetching doctor's appointments:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Mark Completed Appointments
exports.markCompletedAppointments = async () => {
    try {
        const [appointments] = await db.execute(
            'SELECT appointment_id FROM appointments WHERE appointment_date < NOW() AND status != ?',
            ['completed']
        );

        for (const appointment of appointments) {
            await db.execute(
                'UPDATE appointments SET status = ? WHERE appointment_id = ?',
                ['completed', appointment.appointment_id]
            );
        }

        console.log(`${appointments.length} appointments marked as completed.`);
    } catch (error) {
        console.error('Error marking completed appointments:', error);
    }
};

// Get Appointment Statistics
exports.getAppointmentStatistics = async (req, res) => {
    const patient_id = req.session.patientId; // Get patient ID from session

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const [appointments] = await db.execute(
            'SELECT appointment_date, status FROM appointments WHERE patient_id = ?',
            [patient_id]
        );

        const totalAppointments = appointments.length;
        const canceledAppointments = appointments.filter(app => app.status === 'Canceled').length;
        const completedAppointments = appointments.filter(app => app.status === 'Completed').length;
        const upcomingAppointments = appointments.filter(app => new Date(app.appointment_date) > new Date()).length;

        const monthlyStats = {
            labels: [],
            counts: []
        };

        appointments.forEach(appointment => {
            const month = new Date(appointment.appointment_date).toLocaleString('default', { month: 'short' });
            const index = monthlyStats.labels.indexOf(month);
            if (index === -1) {
                monthlyStats.labels.push(month);
                monthlyStats.counts.push(1);
            } else {
                monthlyStats.counts[index] += 1;
            }
        });

        res.status(200).json({
            totalAppointments,
            canceledAppointments,
            completedAppointments,
            upcomingAppointments,
            monthlyStats
        });
    } catch (error) {
        console.error("Error getting appointment statistics:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Appointment Statistics per Doctor for a particular patient
exports.getAppointmentsPerDoctorStatistics = async (req, res) => {
    try {
        const [appointments] = await db.execute(
            'SELECT doctor_id, COUNT(*) as count FROM appointments GROUP BY doctor_id '
        );

        const doctorStats = {
            doctorNames: [],
            appointmentCounts: []
        };

        for (const appointment of appointments) {
            const [doctor] = await db.execute('SELECT first_name, last_name FROM doctors WHERE doctor_id = ?', [appointment.doctor_id]);
            if (doctor.length > 0) {
                doctorStats.doctorNames.push(`${doctor[0].first_name} ${doctor[0].last_name}`);
                doctorStats.appointmentCounts.push(appointment.count);
            }
        }

        res.status(200).json(doctorStats);
    } catch (error) {
        console.error("Error getting appointment statistics per doctor:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Appointments Count per Patient
exports.loadAppointmentsPerPatient = async (req, res) => {
    const doctorId = req.session.doctorData?.id; // Assuming doctor ID is in session

    if (!doctorId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const [appointments] = await db.execute(
            'SELECT p.first_name AS patient_first_name, p.last_name AS patient_last_name, COUNT(*) AS appointment_count ' +
            'FROM appointments a JOIN patients p ON a.patient_id = p.patient_id ' +
            'WHERE a.doctor_id = ? GROUP BY a.patient_id',
            [doctorId]
        );

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error loading appointments per patient:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Appointment (Reschedule)
exports.updateAppointment = async (req, res) => {
    const { appointment_id, appointment_date, appointment_time } = req.body;
    const patient_id = req.session.patientId; // Get patient ID from session

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const [appointment] = await db.execute('SELECT * FROM appointments WHERE appointment_id = ? AND patient_id = ?', [appointment_id, patient_id,]);
        if (appointment.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const [result] = await db.execute(
            'UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = "scheduled", WHERE appointment_id = ?',
            [appointment_date, appointment_time, appointment_id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Appointment updated successfully' });
        } else {
            res.status(400).json({ message: 'Failed to update appointment' });
        }
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Cancel Appointment
exports.cancelAppointment = async (req, res) => {
    const appointment_id = req.params.appointment_id; // Accept appointment_id from URL
    const patient_id = req.session.patientId; // Get patient ID from session

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const [appointment] = await db.execute(
            'SELECT * FROM appointments WHERE appointment_id = ? AND patient_id = ?',
            [appointment_id, patient_id]
        );

        if (appointment.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await db.execute(
            'UPDATE appointments SET status = "Canceled" WHERE appointment_id = ?',
            [appointment_id]
        );

        res.status(200).json({ message: 'Appointment canceled successfully' });
        
    } catch (error) {
        console.error("Error canceling appointment:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Update Appointment (Reschedule)
exports.updateAppointment = async (req, res) => {
    const { appointment_id, appointment_date, appointment_time } = req.body;
    const patient_id = req.session.patientId; // Get patient ID from session

    if (!patient_id) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        // Check if the appointment exists for the given patient
        const [appointment] = await db.execute(
            'SELECT * FROM appointments WHERE appointment_id = ? AND patient_id = ?',
            [appointment_id, patient_id]
        );

        if (appointment.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Update appointment details including status
        const [result] = await db.execute(
            'UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = "rescheduled" WHERE appointment_id = ?',
            [appointment_date, appointment_time, appointment_id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Appointment updated successfully' });
        } else {
            res.status(400).json({ message: 'Failed to update appointment' });
        }
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
































// get appointments count per doctor for a particular patient, display each doctor first name and last name and the count of appointments
exports.getAppointmentsCountPerDoctor = async (req, res) => {
    const patientId = req.session.patientId; // Get patient ID from session
    if (!patientId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
    try {
        const [appointments] = await db.execute(
            'SELECT d.first_name, d.last_name, COUNT(*) as count FROM appointments a JOIN doctors d ON a.doctor_id = d.doctor_id WHERE a.patient_id = ? GROUP BY a.doctor_id',
            [patientId]
        );
        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found' });
        }
        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching appointments count per doctor:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
