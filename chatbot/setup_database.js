const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Root@123',
    port: 3306
};

async function setupDatabase() {
    try {
        // Create connection without database selected
        const connection = await mysql.createConnection(dbConfig);
        
        console.log('\x1b[36m%s\x1b[0m', '🔄 Setting up database...');

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS IMS_throwhorse`);
        console.log('\x1b[32m%s\x1b[0m', '✅ Database created successfully');

        // Use the database
        await connection.query(`USE IMS_throwhorse`);

        // Create customer_data table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS customer_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                card_number VARCHAR(16) NOT NULL,
                nic VARCHAR(20) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                contact_number VARCHAR(15) NOT NULL,
                email VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('\x1b[32m%s\x1b[0m', '✅ customer_data table created successfully');

        // Create installment_applications table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS installment_applications (
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
            )
        `);
        console.log('\x1b[32m%s\x1b[0m', '✅ installment_applications table created successfully');

        // Insert sample data
        await connection.query(`
            INSERT INTO customer_data (card_number, nic, full_name, contact_number, email) 
            VALUES 
            ('1234567890123456', '123456789V', 'John Silva', '0771234567', 'john.silva@email.com'),
            ('2345678901234567', '234567890V', 'Mary Fernando', '0772345678', 'mary.fernando@email.com')
            ON DUPLICATE KEY UPDATE card_number=card_number
        `);
        console.log('\x1b[32m%s\x1b[0m', '✅ Sample data inserted successfully');

        await connection.end();
        console.log('\x1b[32m%s\x1b[0m', '✅ Database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Database setup failed:', error.message);
        process.exit(1);
    }
}

setupDatabase();
