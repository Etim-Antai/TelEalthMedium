const db = require('../config/db'); // Assuming you are using a custom DB connection setup

// Patient - Find patient by Email
const findByEmail = async (email) => {
    try {
        const [result] = await db.query('SELECT * FROM patients WHERE email = ?', [email]);
        return result.length > 0 ? result[0] : null; // Return the first result or null if not found
    } catch (error) {
        console.error('Error finding patient by email:', error);
        throw new Error('Database error');
    }
};

// Patient - Create a new patient (registration)
const create = async (patientData) => {
    try {
        const { first_name, last_name, email, password_hash, phone, date_of_birth, gender, address } = patientData;
        const [result] = await db.query(
            'INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, password_hash, phone, date_of_birth, gender, address]
        );

        console.log("Database Insert Result:", result);
        
        if (!result || typeof result.insertId === 'undefined') {
            console.error("Result object:", result); // Log the result for debugging
            throw new Error('Error creating patient: No insert ID found.');
        }

        const newPatient = {
            patient_id: result.insertId,
            first_name,
            last_name,
            email,
            password_hash,
            phone,
            date_of_birth,
            gender,
            address
        };
        console.log("New patient created successfully. Details:", newPatient);
        return newPatient;

    } catch (error) {
        console.error('Error creating patient:', error);
        throw new Error('Database error');
    }
};

// Patient - Find patient by ID
const findById = async (patient_id) => {
    try {
        const [result] = await db.query('SELECT * FROM patients WHERE patient_id = ?', [patient_id]);
        return result.length > 0 ? result[0] : null; // Return the first result or null if not found
    } catch (error) {
        console.error('Error finding patient by ID:', error);
        throw new Error('Database error');
    }
};

// Patient - Update patient profile
const updateProfile = async (patientId, updateData) => {
    const { first_name, last_name, phone, date_of_birth, gender, address } = updateData;

    try {
        const [result] = await db.query(
            'UPDATE patients SET first_name = ?, last_name = ?, phone = ?, date_of_birth = ?, gender = ?, address = ? WHERE patient_id = ?',
            [first_name, last_name, phone, date_of_birth, gender, address, patientId]
        );
        
        console.log("Database Update Result:", result);
        return result.affectedRows > 0 ? result : null; // Return the result or null if no rows affected

    } catch (error) {
        console.error('Error updating patient profile:', error);
        throw new Error('Database error');
    }
};

// Delete a patient account
const deletePatient = async (patient_id) => {
    console.log("Deleting patient account with ID:", patient_id);

    const query = `DELETE FROM patients WHERE patient_id = ?`;
    const [result] = await db.query(query, [patient_id]);

    if (result.affectedRows > 0) {
        console.log("Patient account deleted successfully. Patient ID:", patient_id);
        return result;
    } else {
        console.log("No patient found with ID:", patient_id);
        return null; // No patient found
    }
};

module.exports = {
    findByEmail,
    create,
    findById,
    updateProfile,
    deletePatient
};
