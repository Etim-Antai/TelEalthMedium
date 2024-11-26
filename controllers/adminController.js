const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');
const db = require('../config/db'); 
const saltRounds = 10;  // Salt rounds constant

// Admin - Register
const register = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        // Check for existing admin by username
        if (await Admin.findByUsername(username)) {
            return res.status(400).json({ message: 'Username is already registered.' });
        }

        // Hash password and create new admincls
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newAdmin = { username, password_hash: hashedPassword, role };
        const savedAdmin = await Admin.create(newAdmin);

        console.log("Admin registered successfully:", savedAdmin); // Log successful registration details
        res.status(201).json({ message: 'Admin registered successfully!', admin: savedAdmin });
    } catch (error) {
        console.error("Error registering admin:", error);
        res.status(500).json({ message: 'Error registering admin.', error: error.message });
    }
};

// Admin - Login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required!' });
        }
        
        // Log the login request details
        console.log('Login request received:', { username, password });

        // Fetch the admin based on the username
        const admin = await Admin.findByUsername(username);
        console.log('Admin object after fetch:', admin);

        // Check if admin exists and has a valid hash
        if (!admin || !admin.password_hash) {
            console.warn(`Login attempt with non-existing username or incomplete data: ${username}`);
            return res.status(400).json({ success: false, message: 'Admin not found or invalid data! Please register.' });
        }

        // Compare password with the stored hash
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            console.warn(`Invalid credentials for username: ${username}`);
            return res.status(401).json({ success: false, message: 'Invalid credentials!' });
        }

        // Set the session data for the logged-in admin
        req.session.adminData = {
            id: admin.admin_id,
            username: admin.username,
            role: admin.role
        };

        // Log the session data after setting it
        console.log('Session data after login:', req.session.adminData);

        // Return success response and include the role
        res.status(200).json({ 
            success: true, 
            message: 'Login successful!', 
            admin_id: admin.admin_id,
            username: admin.username,
            role: admin.role // Include the role in the response
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: 'An error occurred while logging in. Please try again later.' });
    }
};

// Admin - Logout
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ message: 'Failed to log out!' });
        }
        res.clearCookie('connect.sid'); // Clears the session cookie
        res.status(200).json({ message: 'Logged out successfully!' });
    });
};









// get admin profile using findByUsername from adminModel, session:req.session.adminData
const getProfile = async (req, res) => {
    try {
        const { username } = req.session.adminData; // Get the username from the session data
        const admin = await Admin.findByUsername(username);
        console.log('Admin object after fetch:', admin);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found!' });
        }
        res.status(200).json({ success: true, message: 'Admin profile fetched successfully!', admin });
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ success: false, message: 'Error fetching admin profile', error: error.message });
    }
};



const updateProfile = async (req, res) => {
    try {
        const { id: admin_id } = req.session.adminData; // Safely destructure admin_id from session
        const { username, password, role } = req.body; // Destructure the required fields from req.body
        
        // Log the received request details
        console.log("Update request received:", { admin_id, username, role });

        // Check if admin_id is defined
        if (!admin_id) {
            return res.status(400).json({ success: false, message: 'Admin ID is undefined.' });
        }

        // Hash the password before saving
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Prepare admin data for updating
        const adminData = { admin_id, username, password_hash, role };

        // Call the model's update function
        const updatedAdmin = await Admin.updateAmin(adminData);
        console.log('Updated admin object:', updatedAdmin);

        res.status(200).json({ success: true, message: 'Admin profile updated successfully!', admin: updatedAdmin });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ success: false, message: 'Error updating admin profile', error: error.message });
    }
};












 
 // Register a patient
 

// Register a patient
const addPatient = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, date_of_birth, gender, address, password } = req.body;

        // Validate input
        if (!first_name || !last_name || !email || !phone || !date_of_birth || !gender || !address || !password) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        // Hash the password
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert patient data into the database
        const [result] = await db.query(
            'INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, date_of_birth, gender, address, password_hash]
        );

        // Check if the insert was successful
        if (!result || typeof result.insertId === 'undefined') {
            throw new Error('Insert operation failed. No ID returned.');
        }

        // Create the new patient object
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

        console.log('Patient registered successfully:', newPatient);

        // Return success response
        res.status(201).json({ message: 'Patient registered successfully!', patient: newPatient });
    } catch (error) {
        console.error('Error registering patient:', error);
        res.status(500).json({ message: 'Error registering patient.', error: error.message });
    }
};



// Admin - Register Doctor
const addDoctor = async (req, res) => {
    const { first_name, last_name, specialization, email, password, phone, schedule } = req.body;
    try {
        // Validate input
        if (!first_name || !last_name || !specialization || !email || !password || !phone || !schedule) {
            return res.status(400).json({ message: 'All fields are required!' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create new doctor object with the hashed password
        const newDoctor = { first_name, last_name, specialization, email, password: hashedPassword, phone, schedule };

        // Save the new doctor to the database
        const savedDoctor = await Admin.createDoctor(newDoctor); // Assuming createDoctor method is defined in adminModel

        console.log("Doctor registered successfully:", savedDoctor);
        res.status(201).json({ message: 'Doctor registered successfully!', doctor: savedDoctor });
    } catch (error) {
        console.error("Error registering doctor:", error);
        res.status(500).json({ message: 'Error registering doctor.', error: error.message });
    }
};

// Admin - Get All Doctors
const getDoctors = async (req, res) => {
    try {
        const { search, filterBySpecialization } = req.query; // Use req.query for search params
        const doctors = await Admin.getAllDoctors({ search, filterBySpecialization });
        res.status(200).json(doctors); // Respond with the list of doctors
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: 'Error fetching doctors' });
    }
};

// Admin - Get All Patients
const getPatients = async (req, res) => {
    try {
        const { search, filterByGender } = req.query; // Use req.query for search params
        const patients = await Admin.getAllPatients({ search, filterByGender });
        res.status(200).json(patients); // Respond with the list of patients
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Error fetching patients' });
    }
};

// Admin - Get Dashboard Data
const getDashboard = async (req, res) => {
    try {
        // Fetch counts of patients, doctors, and appointments
        const [patientsCount] = await db.query('SELECT COUNT(*) AS count FROM patients');
        const [doctorsCount] = await db.query('SELECT COUNT(*) AS count FROM doctors');
        const [appointmentsCount] = await db.query('SELECT COUNT(*) AS count FROM appointments');

        // Fetch lists of patients, doctors, and appointments
        const [patients] = await db.query('SELECT * FROM patients'); // Fetch all patients
        const [doctors] = await db.query('SELECT * FROM doctors'); // Fetch all doctors
        const [appointments] = await db.query('SELECT * FROM appointments'); // Fetch all appointments

        // Respond with the collected data
        res.status(200).json({
            success: true,
            message: 'Dashboard data fetched successfully',
            data: {
                patientsCount: patientsCount[0].count,
                doctorsCount: doctorsCount[0].count,
                appointmentsCount: appointmentsCount[0].count,
                patients, // List of all patients
                doctors,  // List of all doctors
                appointments // List of all appointments
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
};

// Admin - Get All Appointments
const getAppointments = async (req, res) => {
    try {
        const { search, filterByStatus } = req.query; // Use req.query for search params
        const appointments = await Admin.getAllAppointments({ search, filterByStatus });

        if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
            return res.status(404).json({ success: false, message: 'No appointments found!' });
        }

        res.status(200).json(appointments); // Respond with the list of appointments
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};




// Function to capture hospital statistics
const getHospitalStatistics = async (req, res) => {
    try {
        const [results] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM patients) AS total_patients,
                (SELECT COUNT(*) FROM doctors) AS total_doctors,
                (SELECT COUNT(*) FROM appointments) AS total_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'Completed') AS completed_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'Cancelled') AS cancelled_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'Pending') AS pending_appointments,
                (SELECT COUNT(*) FROM appointments WHERE appointment_date >= CURDATE()) AS upcoming_appointments
        `);

        res.status(200).json(results[0]); // Return the first row of results
    } catch (error) {
        console.error("Error retrieving hospital statistics:", error);
        res.status(500).json({ message: 'Error retrieving statistics', error: error.message });
    }
};





// Export all controller functions
module.exports = { 
    register, 
    login, 
    logout, 
    addPatient, 
    addDoctor, 
    getDoctors, 
    getPatients, 
    getDashboard, 
    getAppointments,
    getHospitalStatistics,
    getProfile,
    updateProfile
};
