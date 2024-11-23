// Import necessary modules and models
const Doctor = require('../models/doctorModel');       // Adjust path if needed
const Appointment = require('../models/appointmentModel');
const Patient = require('../models/patientModel');
const bcrypt = require('bcrypt'); // Make sure to install via npm
const db = require('../config/db');  
    // Ensure this path is correct based on your structure

// Register a new doctor
const register = async (req, res) => {
    const { first_name, last_name, specialization, email, phone, schedule, password } = req.body;

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
        const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

        const newDoctor = { 
            first_name, 
            last_name, 
            specialization, 
            email, 
            phone, 
            schedule, 
            password: hashedPassword // Store the hashed password
        };

        const savedDoctor = await Doctor.createDoctor(newDoctor);

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
            specialization: doctor.specialization
        };

        res.status(200).json({ success: true, message: 'Logged in successfully.', doctorData: req.session.doctorData });
    } catch (error) {
        console.error("Error logging in doctor:", error);
        res.status(500).json({ message: 'Error logging in doctor.', error: error.message });
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
    const doctorId = req.session.doctorData?.id;
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
    const doctorId = req.session.doctorData?.id;
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
    const doctorId = req.session.doctorData?.id;
    if (!doctorId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        await Doctor.deleteDoctor(doctorId); // Adjust to use the delete function
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

// Get all doctors
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.getAllDoctor(); // Ensure this method exists in your model
        res.status(200).json(doctors);
    } catch (error) {
        console.error("Error retrieving all doctors:", error);
        res.status(500).json({ message: 'Error retrieving doctors.', error: error.message });
    }
};

// Get doctor dashboard (if needed)
const getDashboard = async (req, res) => {
    const doctorId = req.session.doctorData?.id;
    if (!doctorId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    try {
        const doctorDetails = await Doctor.findById(doctorId);
        if (!doctorDetails) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        const dashboardData = {
            doctorId: doctorDetails.doctor_id,
            name: `${doctorDetails.first_name} ${doctorDetails.last_name}`,
            email: doctorDetails.email,
            phone: doctorDetails.phone,
            specialization: doctorDetails.specialization,
            appointments: await Appointment.findByDoctorId(doctorId),
            patients: await Patient.findAll() // Fetch all patients if needed
        };

        res.status(200).json(dashboardData);
    } catch (error) {
        console.error("Error retrieving dashboard data:", error);
        res.status(500).json({ message: 'Error retrieving dashboard.', error: error.message });
    }
};




// Set password for existing doctors
const setPassword = async (req, res) => {
    const { email, password } = req.body; // Get email and password from body

    try {
        const doctor = await Doctor.findByEmail(email);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the doctor record with the new password
        await db.query('UPDATE doctors SET password = ? WHERE email = ?', [hashedPassword, email]);

        res.status(200).json({ message: 'Password set successfully. You can now log in.' });
    } catch (error) {
        console.error("Error setting password:", error);
        res.status(500).json({ message: 'Error setting password.', error: error.message });
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
    getDashboard ,
    setPassword
};
