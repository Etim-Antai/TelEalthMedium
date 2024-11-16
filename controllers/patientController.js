const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Patient Registration
exports.registerPatient = async (req, res) => {
    const { first_name, last_name, email, password, phone, date_of_birth, gender, address } = req.body;

    // Check if patient already exists
    const [existingPatient] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
    if (existingPatient.length > 0) {
        return res.status(400).json({ message: 'Patient with this email already exists!' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new patient into the database
    try {
        const [result] = await db.execute(
            'INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, hashedPassword, phone, date_of_birth, gender, address]
        );
        res.status(201).json({ message: 'Patient registered successfully!', patientId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Patient Login
exports.loginPatient = async (req, res) => {
    const { email, password } = req.body;

    // Find patient by email
    const [patient] = await db.execute('SELECT * FROM patients WHERE email = ?', [email]);
    if (patient.length === 0) {
        return res.status(400).json({ message: 'No patient found with this email!' });
    }

    const validPassword = await bcrypt.compare(password, patient[0].password_hash);
    if (!validPassword) {
        return res.status(400).json({ message: 'Invalid password!' });
    }

    // Successful login - create session
    req.session.patientId = patient[0].patient_id;
    res.status(200).json({ message: 'Login successful', patientId: patient[0].patient_id });
};

// Get Patient Profile
exports.getPatientProfile = async (req, res) => {
    const patientId = req.session.patientId;

    if (!patientId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const [patient] = await db.execute('SELECT * FROM patients WHERE patient_id = ?', [patientId]);
    if (patient.length === 0) {
        return res.status(404).json({ message: 'Patient not found' });
    }

    res.status(200).json({ profile: patient[0] });
};

// Update Patient Profile
exports.updatePatientProfile = async (req, res) => {
    const patientId = req.session.patientId;
    const { first_name, last_name, phone, date_of_birth, gender, address } = req.body;

    if (!patientId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const [result] = await db.execute(
            'UPDATE patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE patient_id = ?',
            [first_name, last_name, phone, date_of_birth, gender, address, patientId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Profile updated successfully!' });
        } else {
            res.status(400).json({ message: 'Failed to update profile' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Patient Logout
exports.logoutPatient = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
};
/// Delete Patient Account
exports.deletePatientAccount = async (req, res) => {
    const patientId = req.params.patient_id;

    try {
        // Check if the patient exists
        const [existingPatient] = await db.execute('SELECT * FROM patients WHERE patient_id = ?', [patientId]);

        if (existingPatient.length === 0) {
            return res.status(404).json({ message: 'Patient not found!' });
        }

        // Delete the patient from the database
        const [result] = await db.execute('DELETE FROM patients WHERE patient_id = ?', [patientId]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Patient account deleted successfully.' });
        } else {
            res.status(400).json({ message: 'Failed to delete the patient account.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};







