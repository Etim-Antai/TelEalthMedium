const db = require('../config/db'); // Assuming you are using a custom DB connection setup

// Admin - Find Admin by Username
const findByUsername = async (username) => {
    try {
        const [result] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);
        return result.length > 0 ? result[0] : null; // Return the first result or null if not found
    } catch (error) {
        console.error('Error finding admin by username:', error);
        throw new Error('Database error');
    }
};

// Admin - Create a new Admin
const create = async (adminData) => {
    try {
        const { username, password_hash, role } = adminData;
        const [result] = await db.query('INSERT INTO admin (username, password_hash, role) VALUES (?, ?, ?)', 
                                      [username, password_hash, role]);

        console.log("Database Insert Result:", result); // Log the full result of the insert query
        
        if (!result || typeof result.insertId === 'undefined') {
            throw new Error('Insert operation failed. No ID returned.');
        }

        const newAdmin = { admin_id: result.insertId, username, role }; // New admin object
        
        console.log("Admin registered successfully:", newAdmin); // Log successful registration details
        
        return newAdmin; // Return the newly created admin object with the ID
    } catch (error) {
        console.error('Error creating admin:', error);
        throw new Error('Database error');
    }
};

// Admin - Get All Doctors (with optional search/filtering)
const getAllDoctors = async ({ search, filterBySpecialization }) => {
    try {
        let query = 'SELECT * FROM doctors WHERE 1=1';
        let params = [];

        if (search) {
            query += ' AND (name LIKE ? OR specialization LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (filterBySpecialization) {
            query += ' AND specialization = ?';
            params.push(filterBySpecialization);
        }

        const [doctors] = await db.query(query, params);
        return doctors;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw new Error('Database error');
    }
};

// Admin - Get All Patients (with optional search/filtering)
const getAllPatients = async ({ search, filterByGender }) => {
    try {
        let query = 'SELECT * FROM patients WHERE 1=1';
        let params = [];

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR date_of_birth LIKE ? OR address LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (filterByGender) {
            query += ' AND gender = ?';
            params.push(filterByGender);
        }

        const [patients] = await db.query(query, params);
        return patients;
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw new Error('Database error');
    }
};

// Admin - Get All Appointments (with optional search/filtering)
const getAllAppointments = async ({ search, filterByStatus }) => {
    try {
        let query = 'SELECT * FROM appointments WHERE 1=1';
        let params = [];

        if (search) {
            query += ' AND (patient_name LIKE ? OR doctor_name LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (filterByStatus) {
            query += ' AND status = ?';
            params.push(filterByStatus);
        }

        const [appointments] = await db.query(query, params);
        return appointments;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        throw new Error('Database error');
    }
};

// Export model methods
module.exports = {
    findByUsername,
    create,
    getAllDoctors,
    getAllPatients,
    getAllAppointments
};
