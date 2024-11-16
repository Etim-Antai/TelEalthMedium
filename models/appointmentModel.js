const db = require('../config/db'); // Import the database connection

// Appointment Model
const Appointment = {
  // Create a new appointment
  create: (patient_id, doctor_id, appointment_date, appointment_time, callback) => {
    const query = `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) 
                   VALUES (?, ?, ?, ?, 'scheduled')`;

    db.query(query, [patient_id, doctor_id, appointment_date, appointment_time], (err, result) => {
      if (err) {
        console.error("Error creating appointment:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },

  // Get all appointments for a specific patient
  getAllForPatient: (patient_id, callback) => {
    const query = `SELECT * FROM appointments WHERE patient_id = ?`;

    db.query(query, [patient_id], (err, results) => {
      if (err) {
        console.error("Error fetching appointments for patient:", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // Get all appointments for a specific doctor
  getAllForDoctor: (doctor_id, callback) => {
    const query = `SELECT * FROM appointments WHERE doctor_id = ?`;

    db.query(query, [doctor_id], (err, results) => {
      if (err) {
        console.error("Error fetching appointments for doctor:", err);
        return callback(err, null);
      }
      return callback(null, results);
    });
  },

  // Update the status of an appointment (e.g., cancel, complete)
updateStatus: (appointment_id, status) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE appointments SET status = ? WHERE appointment_id = ?`;

        db.query(query, [status, appointment_id], (err, result) => {
            if (err) {
                console.error("Error updating appointment status:", err);
                return reject(err);
            }
            resolve(result);
        });
    });
},


  // Delete an appointment
  delete: (appointment_id, callback) => {
    const query = `DELETE FROM appointments WHERE appointment_id = ?`;

    db.query(query, [appointment_id], (err, result) => {
      if (err) {
        console.error("Error deleting appointment:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },
};

module.exports = Appointment;
