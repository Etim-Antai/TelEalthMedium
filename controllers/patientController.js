const Patient = require('../models/patientModel');
const bcrypt = require('bcrypt'); // Use bcryptjs for consistency
const db = require('../config/db'); 
const saltRounds = 10;


const register = async (req, res) => {
    const { first_name, last_name, email, password , phone, date_of_birth, gender, address } = req.body;
    try {
        // Check for existing admin by username
        if (await Patient.findByEmail(email)) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Hash password and create new admin
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newPatient = { first_name, last_name, email, password_hash: hashedPassword, phone, date_of_birth, gender, address };
        const savedPatient = await Patient.create(newPatient);

        console.log("Patient registered successfully:", savedPatient); // Log successful registration details
        res.status(201).json({ message: 'Patient registered successfully!', patient: savedPatient });
        } catch (error) {
        console.error("Error registering patient:", error);
        res.status(500).json({ message: 'Error registering patient.', error: error.message });

        // Log error details to server console
        console.error(error);
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check for existing admin by email
        const patient = await Patient.findByEmail(email);
        if (!patient) {
            return res.status(400).json({ message: 'No patient found with this email.' });
        }

        // Log the password attempt
        console.log('Attempting to log in with password:', password);

        // Compare password with stored hash
        const isMatch = await bcrypt.compare(password, patient.password_hash);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.warn(`Invalid credentials for email: ${email}`);
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // Set session data for logged-in admin
        req.session.patientId = patient.patient_id;
        console.log('Session data after login:', req.session);

        // Return success response with patient data
        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            patientData: {
                first_name: patient.first_name,
                last_name: patient.last_name,
                email: patient.email,
                phone: patient.phone,
                date_of_birth: patient.date_of_birth,
                gender: patient.gender,
                address: patient.address
            }
        });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: 'An error occurred while logging in. Please try again later.' });
    }
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ message: 'Failed to log out!' });
        }
        res.clearCookie('connect.sid'); // Clears the session cookie
        return res.status(200).json({ message: 'Logged out successfully!' });
    });
};

const getProfile = async (req, res) => {
    const patientId = req.session.patientId;
    try {
        if (!patientId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        return res.status(200).json({
            first_name: patient.first_name,
            last_name: patient.last_name,
            email: patient.email,
            phone: patient.phone,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
            address: patient.address
        });
    } catch (error) {
        console.error("Error fetching patient profile:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProfile = async (req, res) => {
    const patientId = req.session.patientId; // Get patient ID from the session
    const { first_name, last_name, phone, date_of_birth, gender, address } = req.body;

    try {
        if (!patientId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const updatedResult = await Patient.updateProfile(patientId, { first_name, last_name, phone, date_of_birth, gender, address });
        
        if (updatedResult.affectedRows > 0) {
            return res.status(200).json({ message: 'Profile updated successfully!' });
        } else {
            return res.status(400).json({ message: 'Failed to update profile' });
        }
    } catch (error) {
        console.error("Error updating patient profile:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteAccount = async (req, res) => {
    const patientId = req.params.patient_id;

    try {
        const result = await Patient.delete(patientId);
        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Patient account deleted successfully.' });
        } else {
            return res.status(400).json({ message: 'Failed to delete the patient account.' });
        }
    } catch (error) {
        console.error("Error deleting patient account:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    deleteAccount
};

