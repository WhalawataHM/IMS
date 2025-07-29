// server.js - Backend server for database operations
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Redirect root to installment_chatbot.html
app.get('/', (req, res) => {
    res.redirect('/installment_chatbot.html');
});

// Database configuration
const dbConfig = {
    host: 'localhost',
    database: 'IMS_throwhorse',
    user: 'root',
    password: 'Root@123',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        console.log('\x1b[36m%s\x1b[0m', '🔄 Attempting to connect to database...');
        const connection = await pool.getConnection();
        console.log('\x1b[32m%s\x1b[0m', '✅ Database connected successfully');
        console.log('\x1b[36m%s\x1b[0m', 'Connected to database:', dbConfig.database);
        
        // Test if the required tables exist
        const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ? 
            AND table_name IN ('customer_data', 'installment_applications')
        `, [dbConfig.database]);
        
        if (tables.length < 2) {
            console.error('\x1b[33m%s\x1b[0m', '⚠️ Warning: Required tables are missing!');
            console.log('\x1b[36m%s\x1b[0m', 'Please run the database setup script first.');
            process.exit(1);
        }
        
        connection.release();
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Database connection failed:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\x1b[33m%s\x1b[0m', '⚠️ Authentication Error: Check your username and password');
            console.error('\x1b[36m%s\x1b[0m', 'Current credentials:', {
                user: dbConfig.user,
                host: dbConfig.host,
                database: dbConfig.database,
                port: dbConfig.port
            });
        } else if (error.code === 'ECONNREFUSED') {
            console.error('\x1b[33m%s\x1b[0m', `⚠️ Connection Error: Check if MySQL server is running on port ${dbConfig.port}`);
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\x1b[33m%s\x1b[0m', `⚠️ Database Error: Database '${dbConfig.database}' does not exist`);
            console.log('\x1b[36m%s\x1b[0m', 'Please create the database first using the setup script.');
        }
        process.exit(1); // Exit if database connection fails
    }
}

// API endpoint to verify user
app.post('/api/verify-user', async (req, res) => {
    const { cardNo, nic, fullName, contactNo } = req.body;

    try {
        // Validate input
        if (!cardNo || !nic || !fullName || !contactNo) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // SQL query to find user
        const query = `
            SELECT card_number, nic, full_name, contact_number, email 
            FROM customer_data 
            WHERE card_number = ? 
            AND nic = ? 
            AND LOWER(full_name) = LOWER(?) 
            AND contact_number = ?
        `;

        const [rows] = await pool.execute(query, [cardNo, nic, fullName, contactNo]);

        if (rows.length > 0) {
            const user = rows[0];
            res.json({
                success: true,
                message: 'User verified successfully',
                user: {
                    cardNo: user.card_number,
                    nic: user.nic,
                    name: user.full_name,
                    contact: user.contact_number,
                    email: user.email
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found or details do not match'
            });
        }

    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Verification Error:', error.message);
        console.error('\x1b[90m%s\x1b[0m', 'Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Database error occurred',
            error: error.message
        });
    }
});

// API endpoint to save installment application
app.post('/api/save-application', async (req, res) => {
    const { cardNo, nic, fullName, contactNo, email, merchant, installmentPlan, billAmount, transactionDate } = req.body;

    try {
        const query = `
            INSERT INTO installment_applications 
            (card_number, nic, full_name, contact_number, email, merchant, installment_plan, bill_amount, transaction_date, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await pool.execute(query, [
            cardNo, nic, fullName, contactNo, email, merchant, installmentPlan, billAmount, transactionDate
        ]);

        res.json({
            success: true,
            message: 'Application saved successfully',
            applicationId: result.insertId
        });

    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Application Save Error:', error.message);
        console.error('\x1b[90m%s\x1b[0m', 'Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to save application',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.clear(); // Clear console for better visibility
    console.log('\x1b[35m%s\x1b[0m', '='.repeat(50));
    console.log('\x1b[36m%s\x1b[0m', `🚀 Server running on http://localhost:${PORT}`);
    console.log('\x1b[35m%s\x1b[0m', '='.repeat(50));
    testConnection();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

/*
To run this server:

1. Install required packages:
   npm init -y
   npm install express mysql2 cors

2. Create your database and table:
   CREATE DATABASE IMS_throwhorse;
   USE IMS_throwhorse;
   
   CREATE TABLE customer_data (
       id INT AUTO_INCREMENT PRIMARY KEY,
       card_number VARCHAR(16) NOT NULL,
       nic VARCHAR(20) NOT NULL,
       full_name VARCHAR(100) NOT NULL,
       contact_number VARCHAR(15) NOT NULL,
       email VARCHAR(100) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE TABLE installment_applications (
       id INT AUTO_INCREMENT PRIMARY KEY,
       card_number VARCHAR(16) NOT NULL,
       nic VARCHAR(20) NOT NULL,
       full_name VARCHAR(100) NOT NULL,
       contact_number VARCHAR(15) NOT NULL,
       email VARCHAR(100) NOT NULL,
       merchant VARCHAR(100) NOT NULL,
       installment_plan INT NOT NULL,
       bill_amount DECIMAL(10,2) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

3. Insert some sample data:
   INSERT INTO customer_data (card_number, nic, full_name, contact_number, email) VALUES 
   ('1234567890123456', '123456789V', 'John Silva', '0771234567', 'john.silva@email.com'),
   ('2345678901234567', '234567890V', 'Mary Fernando', '0772345678', 'mary.fernando@email.com');

4. Run the server:
   node server.js
*/