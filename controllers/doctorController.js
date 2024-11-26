// Import necessary modules and models
const Doctor = require('../models/doctorModel');       
const Appointment = require('../models/appointmentModel');
const Patient = require('../models/patientModel');
const bcrypt = require('bcrypt'); // Ensure bcrypt is installed via npm
const db = require('../config/db');  
const saltRounds = 10;  // Salt rounds constant

// Register a new doctor
const register = async (req, res) => {
    const { first_name, last_name, specialization, email, password, phone, schedule } = req.body;

    try {
        // Check for existing doctor by email
        if (await Doctor.findByEmail(email)) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        // Check for existing doctor by phone
        if (await Doctor.findByPhone(phone)) {
            return res.status(400).json({ message: 'Phone number is already registered.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash password with salt rounds

        const newDoctor = { 
            first_name, 
            last_name, 
            specialization, 
            email, 
            phone, 
            schedule, 
            password: hashedPassword // Store the hashed password
        };

        const savedDoctor = await Doctor.createDoctor(newDoctor); // Save the doctor

        res.status(201).json({ message: 'Doctor registered successfully!', doctor: savedDoctor });
    } catch (error) {
        console.error("Error registering doctor:", error);
        res.status(500).json({ message: 'Error registering doctor.', error: error.message });
    }
};

// Log in a doctor
const login = async (req, res) => {
    const { email, password } = req.body; // Get email and password from request body

    try {
        const doctor = await Doctor.findByEmail(email);
        if (!doctor) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, doctor.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        req.session.doctorData = {
            id: doctor.doctor_id,
            email: doctor.email,
            first_name: doctor.first_name,
            last_name: doctor.last_name,
            phone: doctor.phone,
            specialization: doctor.specialization,
            schedule: doctor.schedule
        };

        console.log("Doctor session data set:", req.session.doctorData); // Log session for debugging

        res.status(200).json({ success: true, message: 'Logged in successfully.', doctorData: req.session.doctorData });
    } catch (error) {
        console.error("Error logging in doctor:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Log out a doctor
const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error logging out doctor:", err);
            res.status(500).json({ message: 'Error logging out doctor.', error: err.message });
        } else {
            res.status(200).json({ message: 'Logged out successfully.' });
        }
    });
};

// Get doctor profile
const getProfile = async (req, res) => {
    const doctorId = req.session.doctorData?.id; // Get doctor ID from session
    if (!doctorId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const doctor = await Doctor.getDoctorById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        const profileData = {
            doctor_id: doctor.doctor_id,
            first_name: doctor.first_name,
            last_name: doctor.last_name,
            email: doctor.email,
            phone: doctor.phone,
            specialization: doctor.specialization,
            schedule: doctor.schedule
        };

        res.status(200).json(profileData);
    } catch (error) {
        console.error("Error retrieving doctor profile:", error);
        res.status(500).json({ message: 'Error retrieving profile.', error: error.message });
    }
};

// Update doctor profile
const updateProfile = async (req, res) => {
    const doctorId = req.session.doctorData?.id; // Get doctor ID from session
    if (!doctorId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const { first_name, last_name, specialization, email, phone, schedule } = req.body;

        const updatedData = {
            first_name,
            last_name,
            specialization,
            email,
            phone,
            schedule
        };

        const updateDoctor = await Doctor.updateDoctor(doctorId, updatedData);
        res.status(200).json({ message: 'Profile updated successfully.', doctor: updateDoctor });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        res.status(500).json({ message: 'Error updating profile.', error: error.message });
    }
};

// Delete doctor account
const deleteAccount = async (req, res) => {
    const doctorId = req.session.doctorData?.id; // Get doctor ID from session
    if (!doctorId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        await Doctor.deleteDoctor(doctorId); // Call the delete function
        req.session.destroy((err) => {
            if (err) {
                console.error("Error deleting account:", err);
                res.status(500).json({ message: 'Error deleting account.', error: err.message });
            } else {
                res.status(200).json({ message: 'Account deleted successfully.' });
            }
        });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: 'Error deleting account.', error: error.message });
    }
};

// Get all patients
const getAllPatients = async (req, res) => {
    try {
        const [patients] = await db.execute('SELECT * FROM patients'); // Fetch all patients
        res.status(200).json({ patients });
    } catch (error) {
        console.error("Error retrieving all patients:", error);
        res.status(500).json({ message: 'Error retrieving patients.', error: error.message });
    }
};

// Get all doctors
const getAllDoctors = async (req, res) => {
    try {    
        const [doctors] = await db.execute('SELECT * FROM doctors'); // Fetch all doctors
        res.status(200).json({ doctors });
    } catch (error) {
        console.error("Error retrieving all doctors:", error);
        res.status(500).json({ message: 'Error retrieving doctors.', error: error.message });
    }
};

// Set password for a doctor
const setPassword = async (req, res) => {
    const doctorId = req.session.doctorData?.id; // Get doctor ID from session
    if (!doctorId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const { oldPassword, newPassword } = req.body;

        const doctor = await Doctor.getDoctorById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(oldPassword, doctor.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const updatedDoctor = await Doctor.updateDoctor(doctorId, { password: hashedPassword });
        res.status(200).json({ message: 'Password updated successfully.', doctor: updatedDoctor });
    } catch (error) {
        console.error("Error setting password:", error);
        res.status(500).json({ message: 'Error setting password.', error: error.message });
    }
};






// Fetch appointments associated with the authenticated doctor
const getDoctorAppointments = async (req, res) => {
    const doctorId = req.session.doctorData?.id; // Get doctor ID from session

    if (!doctorId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const [appointments] = await db.execute(`
            SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, 
                   p.first_name AS patient_first_name, p.last_name AS patient_last_name 
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            WHERE a.doctor_id = ?`, 
            [doctorId]);

        res.status(200).json({ appointments });
    } catch (error) {
        console.error("Error retrieving doctor appointments:", error);
        res.status(500).json({ message: 'Error retrieving appointments.', error: error.message });
    }
};

// Get Monthly Appointment Statistics
const getAppointmentStatistics = async (req, res) => {
    const doctorId = req.session.doctorData?.id; // Get the doctor ID from the session

    if (!doctorId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const [monthlyAppointments] = await db.execute(`
            SELECT 
                DATE_FORMAT(appointment_date, '%Y-%m') AS month, 
                COUNT(*) AS appointment_count 
            FROM 
                appointments 
            WHERE 
                doctor_id = ?
            GROUP BY 
                month
            ORDER BY 
                month
        `, [doctorId]);

        const labels = monthlyAppointments.map(appointment => appointment.month); // Get month labels
        const counts = monthlyAppointments.map(appointment => appointment.appointment_count); // Get counts

        res.status(200).json({
            monthlyStats: {
                labels,
                counts
            }
        });
    } catch (error) {
        console.error("Error retrieving appointment statistics:", error);
        res.status(500).json({ message: 'Error retrieving appointment statistics.', error: error.message });
    }
};




// Function to get age distribution of patients
// Function to get age distribution of patients
const getAgeDistribution = async (req, res) => {
    try {
        // Query to get age distribution directly from the database
        const [results] = await db.execute(`
            SELECT 
                CASE 
                    WHEN YEAR(CURDATE()) - YEAR(date_of_birth) <= 18 THEN '0-18'
                    WHEN YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN 19 AND 35 THEN '19-35'
                    WHEN YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN 36 AND 50 THEN '36-50'
                    WHEN YEAR(CURDATE()) - YEAR(date_of_birth) BETWEEN 51 AND 65 THEN '51-65'
                    ELSE '66+'
                END AS age_group,
                COUNT(*) AS count
            FROM patients
            GROUP BY age_group;
        `);

        // Initialize age distribution counters
        const ageDistribution = {
            '0-18': 0,
            '19-35': 0,
            '36-50': 0,
            '51-65': 0,
            '66+': 0
        };

        // Fill the ageDistribution object with results
        results.forEach(row => {
            ageDistribution[row.age_group] = row.count;
        });

        res.status(200).json(ageDistribution);
    } catch (error) {
        console.error("Error retrieving age distribution:", error);
        res.status(500).json({ message: 'Error retrieving age distribution', error: error.message });
    }
};


// Function to get patient distribution by address
const getPatientDistributionByAddress = async (req, res) => {
    try {
        // Query to get distribution of patients by address
        const [results] = await db.execute(`
            SELECT address, COUNT(*) AS patient_count
            FROM patients
            GROUP BY address
            ORDER BY patient_count DESC;
        `);

        // Check if results are available
        const patientDistribution = results.map(row => ({
            address: row.address,
            count: row.patient_count
        }));

        res.status(200).json(patientDistribution);
    } catch (error) {
        console.error("Error retrieving patient distribution by address:", error);
        res.status(500).json({ message: 'Error retrieving patient distribution by address', error: error.message });
    }
};





































// Export all controller functions
module.exports = { 
    register, 
    login, 
    logout, 
    getProfile, 
    updateProfile, 
    deleteAccount,
    getAllDoctors,
    getDoctorAppointments,
    getAppointmentStatistics, // Export the appointment statistics function
    setPassword,  // Include if the set password functionality exists
    getAllPatients, // Include functionality to fetch all patients
    getAgeDistribution,
    getPatientDistributionByAddress
};
