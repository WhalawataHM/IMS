// setup.js - Run this file to create the required directory structure and files

const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
    console.log('✓ Created public directory');
} else {
    console.log('✓ Public directory already exists');
}

// Check if package.json exists
if (!fs.existsSync('package.json')) {
    const packageJson = {
        "name": "ims-verification-system",
        "version": "1.0.0",
        "description": "Installment Management System - Verification Portal",
        "main": "app.js",
        "scripts": {
            "start": "node app.js",
            "dev": "nodemon app.js"
        },
        "dependencies": {
            "express": "^4.18.2",
            "mysql2": "^3.6.0",
            "express-session": "^1.17.3"
        },
        "keywords": ["installment", "management", "verification"],
        "author": "IMS Team"
    };
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✓ Created package.json');
}

// Check required files
const requiredFiles = [
    'app.js',
    'public/login.html',
    'public/dashboard.html'
];

console.log('\nChecking required files:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✓ ${file} exists`);
    } else {
        console.log(`✗ ${file} is missing - Please create this file`);
    }
});

// Database setup instructions
console.log('\n=== Database Setup Required ===');
console.log('1. Make sure MySQL is running on port 3307');
console.log('2. Create database: IMS_throwhorse');
console.log('3. Run these SQL commands:');
console.log(`
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
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_credentials (
    user_id VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role_access ENUM('reader', 'editor', 'admin') NOT NULL
);

INSERT INTO login_credentials VALUES 
('admin', 'admin123', 'admin'),
('editor', 'edit123', 'editor'),
('reader', 'read123', 'reader');
`);

console.log('\n=== Next Steps ===');
console.log('1. Run: npm install');
console.log('2. Make sure all files are created');
console.log('3. Setup database as shown above');
console.log('4. Run: npm start');
console.log('5. Open: http://localhost:3000');

// Check Node.js modules
if (!fs.existsSync('node_modules')) {
    console.log('\n⚠️  Node modules not installed. Run: npm install');
}

console.log('\n=== Test Accounts ===');
console.log('Admin: admin / admin123');
console.log('Editor: editor / edit123');
console.log('Reader: reader / read123');