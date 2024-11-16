const db = require('../config/db'); // Import the database connection
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

// Patient Model
const Patient = {
  // Create a new patient (registration)
  create: (first_name, last_name, email, password, phone, date_of_birth, gender, address, callback) => {
    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return callback(err, null);
      }

      const query = `INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(query, [first_name, last_name, email, hashedPassword, phone, date_of_birth, gender, address], (err, result) => {
        if (err) {
          console.error("Error creating patient:", err);
          return callback(err, null);
        }
        return callback(null, result);
      });
    });
  },

  // Find a patient by email (for login)
  findByEmail: (email, callback) => {
    const query = `SELECT * FROM patients WHERE email = ?`;

    db.query(query, [email], (err, results) => {
      if (err) {
        console.error("Error finding patient by email:", err);
        return callback(err, null);
      }
      return callback(null, results[0]); // Returns the first patient with that email
    });
  },

  // Update a patient's profile (excluding email and password)
  updateProfile: (patient_id, first_name, last_name, phone, date_of_birth, gender, address, callback) => {
    const query = `UPDATE patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? 
                   WHERE patient_id = ?`;

    db.query(query, [first_name, last_name, phone, date_of_birth, gender, address, patient_id], (err, result) => {
      if (err) {
        console.error("Error updating patient profile:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },

  // Delete a patient account
  delete: (patient_id, callback) => {
    const query = `DELETE FROM patients WHERE patient_id = ?`;

    db.query(query, [patient_id], (err, result) => {
      if (err) {
        console.error("Error deleting patient account:", err);
        return callback(err, null);
      }
      return callback(null, result);
    });
  },

  // Verify password during login
  verifyPassword: (enteredPassword, storedHash, callback) => {
    bcrypt.compare(enteredPassword, storedHash, (err, isMatch) => {
      if (err) {
        console.error("Error comparing password:", err);
        return callback(err, null);
      }
      return callback(null, isMatch);
    });
  }
};

module.exports = Patient;
