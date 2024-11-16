// const mysql = require('mysql2');
// // configure environment variables
// const dotenv = require('dotenv');
// dotenv.config();

// // mysql.createPool is suitable for applications that require scalable and efficient handling of multiple database queries.
// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// // Design the database schema using MySQL.
// // Function to create tables
// async function createTables() {
//   try {
//     await pool.promise().execute(`
//       CREATE TABLE IF NOT EXISTS Patients (
//         patient_id INT AUTO_INCREMENT PRIMARY KEY,
//         first_name VARCHAR(255) NOT NULL,
//         last_name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         password_hash VARCHAR(255) NOT NULL,
//         phone VARCHAR(20),
//         date_of_birth DATE,
//         gender ENUM('male', 'female', 'other'),
//         address TEXT
//       )
//     `);

//     await pool.promise().execute(`
//       CREATE TABLE IF NOT EXISTS Doctors (
//         doctor_id INT AUTO_INCREMENT PRIMARY KEY,
//         first_name VARCHAR(255) NOT NULL,
//         last_name VARCHAR(255) NOT NULL,
//         specialization VARCHAR(255) NOT NULL,
//         email VARCHAR(255) NOT NULL UNIQUE,
//         phone VARCHAR(20),
//         schedule TEXT
//       )
//     `);

//     await pool.promise().execute(`
//       CREATE TABLE IF NOT EXISTS Appointments (
//         appointment_id INT AUTO_INCREMENT PRIMARY KEY,
//         patient_id INT,
//         doctor_id INT,
//         appointment_date DATE,
//         appointment_time TIME,
//         status ENUM('scheduled', 'completed', 'canceled'),
//         FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
//         FOREIGN KEY (doctor_id) REFERENCES Doctors(id) ON DELETE CASCADE
//       )
//     `);

//     await pool.promise().execute(`
//       CREATE TABLE IF NOT EXISTS admin (
//        admin_id INT AUTO_INCREMENT PRIMARY KEY,
//         username VARCHAR(255) NOT NULL UNIQUE,
//         password_hash VARCHAR(255) NOT NULL,
//         role ENUM('admin', 'superadmin')
//       )
//     `);

//     console.log('All tables created successfully.');
//   } catch (err) {
//     console.error('Error creating tables:', err);
//   }
// }

// // Call the function to create tables
// createTables();
// module.exports = pool.promise();


const mysql = require('mysql2');
// Configure environment variables
const dotenv = require('dotenv');
dotenv.config();

// mysql.createPool is suitable for applications that require scalable and efficient handling of multiple database queries.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Function to create tables
async function createTables() {
    try {
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS patients (
                patient_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                date_of_birth DATE,
                gender ENUM('male', 'female', 'other'),
                address TEXT
            )
        `);

        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS doctors (
                doctor_id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                specialization VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(20),
                schedule TEXT
            )
        `);

        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS appointments (
                appointment_id INT AUTO_INCREMENT PRIMARY KEY,
                patient_id INT,
                doctor_id INT,
                appointment_date DATE,
                appointment_time TIME,
                status ENUM('scheduled', 'completed', 'canceled'),
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
                FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
            )
        `);

        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS admin (
                admin_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('admin', 'superadmin')
            )
        `);

        console.log('All tables created successfully.');
    } catch (err) {
        console.error('Error creating tables:', err.message); // Improved error handling
    }
}

// Call the function to create tables
createTables();
module.exports = pool.promise();