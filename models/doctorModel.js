// /models/doctorModel.js

const db = require('../config/db'); // Database connection from config/db

// Function to create a new doctor
const createDoctor = async (doctorData) => {
    const { first_name, last_name, specialization, email, phone, schedule } = doctorData;
    
    try {
        const result = await db.query(
            'INSERT INTO Doctors (first_name, last_name, specialization, email, phone, schedule) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, specialization, email, phone, schedule]
        );
        return result;
    } catch (err) {
        console.error('Error creating doctor:', err.message);
        throw err;
    }
};

// Function to get all doctors
const getAllDoctors = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM Doctors');
        return rows;
    } catch (err) {
        console.error('Error fetching doctors:', err.message);
        throw err;
    }
};

// Function to get a specific doctor by ID
const getDoctorById = async (doctorId) => {
    try {
        const [rows] = await db.query('SELECT * FROM Doctors WHERE doctor_id = ?', [doctorId]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (err) {
        console.error('Error fetching doctor by ID:', err.message);
        throw err;
    }
};

// Function to find a doctor by email
const findByEmail = async (email) => {
    try {
        const [rows] = await db.query('SELECT * FROM Doctors WHERE email = ?', [email]);
        if (rows.length > 0) {
            return rows[0]; // return the first matching doctor
        } else {
            return null; // return null if no doctor was found
        }
    } catch (err) {
        console.error('Error fetching doctor by email:', err.message);
        throw err;
    }
};

// Function to find a doctor by phone
const findByPhone = async (phone) => {
    try {
        const [rows] = await db.query('SELECT * FROM Doctors WHERE phone = ?', [phone]);
        if (rows.length > 0) {
            return rows[0]; // return the first matching doctor
        } else {
            return null; // return null if no doctor was found
        }
    } catch (err) {
        console.error('Error fetching doctor by phone:', err.message);
        throw err;
    }
};





// Function to update a doctor's details
const updateDoctor = async (doctorId, updatedData) => {
    const { first_name, last_name, specialization, email, phone, schedule } = updatedData;
    
    try {
        const result = await db.query(
            'UPDATE Doctors SET first_name = ?, last_name = ?, specialization = ?, email = ?, phone = ?, schedule = ? WHERE doctor_id = ?',
            [first_name, last_name, specialization, email, phone, schedule, doctorId]
        );
        return result;
    } catch (err) {
        console.error('Error updating doctor:', err.message);
        throw err;
    }
};

// Function to delete a doctor by ID (deactivate instead of physical deletion)
const deleteDoctor = async (doctorId) => {
    try {
        const result = await db.query(
            'UPDATE Doctors SET status = "inactive" WHERE doctor_id = ?',
            [doctorId]
        );
        return result;
    } catch (err) {
        console.error('Error deleting doctor:', err.message);
        throw err;
    }
};

// Export the functions for use in controllers
module.exports = {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    findByEmail,
    findByPhone, // Add this line to export the new function
    updateDoctor,
    deleteDoctor,
};
