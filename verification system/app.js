const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

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

// Set up absolute paths
const publicPath = path.resolve(__dirname, 'public');
console.log('Public directory path:', publicPath);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(publicPath));
console.log('Static middleware configured with path:', publicPath);

// Session configuration
app.use(session({
    secret: 'ims_secret_key_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// Role-based access middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role_access)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Routes

// Serve login page
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.sendFile('login.html', { root: publicPath }, (err) => {
            if (err) {
                console.error('Error sending login file:', err);
                res.status(500).send('Error loading login page');
            }
        });
    }
});

// Serve dashboard
app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile('dashboard.html', { root: publicPath }, (err) => {
        if (err) {
            console.error('Error sending dashboard file:', err);
            res.status(500).send('Error loading dashboard page');
        }
    });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { user_id, password } = req.body;
        
        if (!user_id || !password) {
            return res.status(400).json({ error: 'User ID and password are required' });
        }

        const [rows] = await pool.execute(
            'SELECT user_id, password, role_access FROM login_credentials WHERE user_id = ?',
            [user_id]
        );

        if (rows.length === 0 || rows[0].password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        req.session.user = {
            user_id: user.user_id,
            role_access: user.role_access
        };

        res.json({ 
            success: true, 
            user: {
                user_id: user.user_id,
                role_access: user.role_access
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ success: true });
    });
});

// Get current user info
app.get('/api/user', requireAuth, (req, res) => {
    res.json({ user: req.session.user });
});

// Get installment applications with filtering
app.get('/api/applications', requireAuth, async (req, res) => {
    try {
        const { 
            verified = 'false', 
            merchant = '', 
            installment_plan = '', 
            date_from = '', 
            date_to = '',
            search = '',
            page = 1,
            limit = 50
        } = req.query;

        let query = 'SELECT * FROM installment_applications WHERE 1=1';
        const params = [];

        // Filter by verification status
        if (verified === 'true') {
            query += ' AND is_verified = true';
        } else if (verified === 'false') {
            query += ' AND is_verified = false';
        }

        // Filter by merchant
        if (merchant) {
            query += ' AND merchant LIKE ?';
            params.push(`%${merchant}%`);
        }

        // Filter by installment plan
        if (installment_plan) {
            query += ' AND installment_plan = ?';
            params.push(installment_plan);
        }

        // Filter by date range
        if (date_from) {
            query += ' AND DATE(transaction_date) >= DATE(?)';
            params.push(date_from);
        }
        if (date_to) {
            query += ' AND DATE(transaction_date) <= DATE(?)';
            params.push(date_to);
        }

        // Search in multiple fields
        if (search) {
            query += ' AND (card_number LIKE ? OR nic LIKE ? OR full_name LIKE ? OR contact_number LIKE ? OR email LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY transaction_date DESC LIMIT ' + parseInt(limit) + ' OFFSET ' + parseInt(offset);

        const [rows] = await pool.execute(query, params);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM installment_applications WHERE 1=1';
        const countParams = params.slice(0, -2); // Remove limit and offset
        
        if (verified === 'true') {
            countQuery += ' AND is_verified = true';
        } else if (verified === 'false') {
            countQuery += ' AND is_verified = false';
        }
        if (merchant) {
            countQuery += ' AND merchant LIKE ?';
        }
        if (installment_plan) {
            countQuery += ' AND installment_plan = ?';
        }
        if (date_from) {
            countQuery += ' AND DATE(transaction_date) >= ?';
        }
        if (date_to) {
            countQuery += ' AND DATE(transaction_date) <= ?';
        }
        if (search) {
            countQuery += ' AND (card_number LIKE ? OR nic LIKE ? OR full_name LIKE ? OR contact_number LIKE ? OR email LIKE ?)';
        }

        const [countResult] = await pool.execute(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            applications: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Toggle verification status (Editor and Admin only)
app.put('/api/applications/:id/toggle-verification', requireAuth, requireRole(['editor', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get current status
        const [rows] = await pool.execute(
            'SELECT is_verified FROM installment_applications WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const newStatus = !rows[0].is_verified;
        
        // Update status
        await pool.execute(
            'UPDATE installment_applications SET is_verified = ? WHERE id = ?',
            [newStatus, id]
        );

        res.json({ success: true, is_verified: newStatus });
    } catch (error) {
        console.error('Toggle verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bulk verification (Admin only)
app.put('/api/applications/bulk-verify', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { ids, verify } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid application IDs' });
        }

        const placeholders = ids.map(() => '?').join(',');
        const query = `UPDATE installment_applications SET is_verified = ? WHERE id IN (${placeholders})`;
        const params = [verify, ...ids];

        const [result] = await pool.execute(query, params);

        res.json({ 
            success: true, 
            updated: result.affectedRows,
            verified: verify
        });
    } catch (error) {
        console.error('Bulk verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get merchants for filter dropdown
app.get('/api/merchants', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT DISTINCT merchant FROM installment_applications ORDER BY merchant'
        );
        res.json(rows.map(row => row.merchant));
    } catch (error) {
        console.error('Get merchants error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get installment plans for filter dropdown
app.get('/api/installment-plans', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT DISTINCT installment_plan FROM installment_applications ORDER BY installment_plan'
        );
        res.json(rows.map(row => row.installment_plan));
    } catch (error) {
        console.error('Get installment plans error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

// Fallback 404 handler (should be last)
app.use((req, res) => {
    console.log('404 Not Found:', req.path);
    res.status(404).send('404 Not Found: The requested resource does not exist.');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Verify the public directory exists
    const fs = require('fs');
    if (!fs.existsSync(publicPath)) {
        console.error('ERROR: Public directory does not exist:', publicPath);
    } else {
        console.log('Public directory exists and contains:', fs.readdirSync(publicPath));
    }
});