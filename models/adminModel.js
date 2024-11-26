const db = require('../config/db'); 

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

// updateAmin - Update an existing Admin
const updateAmin = async (adminData) => {
    try {
        const { admin_id, username, password_hash, role } = adminData;
        const [result] = await db.query('UPDATE admin SET username = ?, password_hash = ?, role = ? WHERE admin_id = ?',
                                          [username, password_hash, role, admin_id]);
        console.log("Database Update Result:", result); // Log the full result of the update query
        if (result.affectedRows === 0) {
            throw new Error('Update operation failed. No rows affected.');
        }
        const updatedAdmin = { admin_id, username, role }; // Updated admin object
        console.log('Admin updated successfully:', updatedAdmin); // Log successful update details
        return updatedAdmin; // Return the updated admin object
    } catch (error) {
        console.error('Error updating admin:', error);
        throw new Error('Database error');
    }
};



// delete - Delete an existing Admin
const deleteAdmin = async (admin_id) => {
    try {
        const [result] = await db.query('DELETE FROM admin WHERE admin_id = ?', [admin_id]);
        if (result.affectedRows === 0) {
            throw new Error('Delete operation failed. No rows affected.');
        }
        console.log('Admin deleted successfully:', admin_id); // Log successful deletion details
    } catch (error) {
        console.error('Error deleting admin:', error);
        throw new Error('Database error');
    }
};









// Register a patient
const createPatient = async (patientData) => {    
    try {
        // Destructure incoming patient data
        const { first_name, last_name, email, phone, date_of_birth, gender, address } = patientData;

        // Basic validation (or use a validation library like Joi)
        if (!first_name || !last_name || !email || !phone || !date_of_birth || !gender || !address) {
            throw new Error('All fields are required for patient registration.');
        }

        // Check for duplicates (optional, if required by your app logic)
        const [existingPatient] = await db.query(
            'SELECT * FROM patients WHERE email = ? OR phone = ?',
            [email, phone]
        );
        if (existingPatient.length > 0) {
            throw new Error('A patient with the same email or phone already exists.');
        }

        // Insert the new patient into the database
        const [result] = await db.query(
            'INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, date_of_birth, gender, address]
        );

        // Ensure the insert operation was successful
        if (!result || typeof result.insertId === 'undefined') {
            throw new Error('Failed to register patient. No ID was returned from the database.');
        }

        // Construct the new patient object
        const newPatient = {
            patient_id: result.insertId,
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            address,
        };

        console.log('Patient registered successfully:', newPatient); // Log for debugging
        return newPatient; // Return the new patient details
    } catch (error) {
        console.error('Error registering patient:', error.message); // Log errors
        throw new Error('An error occurred during patient registration.'); // Generic error for external usage
    }
};


// Register a doctor
const createDoctor = async (doctorData) => {    
    try {
        const { first_name, last_name, specialization, email, password, phone, schedule } = doctorData; // Corrected to use first_name and last_name
        const [result] = await db.query('INSERT INTO doctors (first_name, last_name, specialization, email, password, phone, schedule) VALUES (?, ?, ?, ?, ?,?, ?)', 
                                        [first_name, last_name, specialization, email, password, phone, schedule]);

        console.log("Database Insert Result:", result); // Log the full result of the insert query
        if (!result || typeof result.insertId === 'undefined') {
            throw new Error('Insert operation failed. No ID returned.');
        }

        const newDoctor = { doctor_id: result.insertId, first_name, last_name, specialization, email, password, phone, schedule }; // New doctor object
        console.log("Doctor registered successfully:", newDoctor); // Log successful registration details

        return newDoctor; // Return the newly created doctor object with the ID
    } catch (error) {
        console.error('Error creating doctor:', error);
        throw new Error('Database error');
    }
};

// Admin - Get All Doctors (with optional search/filtering)
const getAllDoctors = async ({ search, filterBySpecialization }) => {
    try {
        let query = 'SELECT * FROM doctors WHERE 1=1';
        let params = [];

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR specialization LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
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
    createPatient,
    createDoctor,
    getAllDoctors,
    getAllPatients,
    getAllAppointments,
    updateAmin,
    deleteAdmin
    
};
