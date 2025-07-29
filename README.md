# IMS - Installment Management System

A comprehensive banking credit card installment management system that allows customers to place installment plans directly without requiring banking front desk staff support.

## 🎯 Project Overview

The IMS (Installment Management System) is designed to streamline credit card installment plan management for banking institutions. It provides a complete solution with multiple interconnected subsystems that handle customer interactions, staff verification, and analytics.

## 🏗️ System Architecture

The system consists of four main components:

### 1. **Chatbot System** (`/chatbot/`)
- **Purpose**: Customer-facing interface for installment plan applications
- **Features**:
  - Customer data collection (card number, NIC, merchant details, bill amount)
  - Direct installment plan submission
  - User-friendly conversational interface
- **Technology**: Node.js, Express, MySQL
- **Access**: Public customer access

### 2. **Verification System** (`/verification system/`)
- **Purpose**: Staff interface for processing and verifying installment applications
- **User Roles**:
  - **Readers** (Credit Card Center): View applications and place installment plans
  - **Editors** (Call Center): Verify data and approve/reject requests
  - **Admins** (Department Heads): Full administrative privileges
- **Features**:
  - Application review and verification
  - Status updates and approvals
  - Role-based access control
- **Technology**: Node.js, Express, MySQL, Session Management

### 3. **Analytics Dashboard PBI** (`/analytics_dashboard_PBI/`)
- **Purpose**: Power BI-based analytics and reporting
- **Features**: Business intelligence dashboards for management insights
- **Technology**: Power BI

### 4. **Analytics Dashboard** (`/analytics_dashboard/`)
- **Purpose**: Python-based analytics dashboard
- **Features**: Data analysis and visualization using pandas and other Python libraries
- **Technology**: Python, Flask, Node.js, TensorFlow

## 🛠️ System Requirements

### Prerequisites
- **Node.js** (v14 or higher)
- **MySQL** (v8.0 or higher)
- **Python** (v3.8 or higher)
- **Power BI Desktop** (for PBI dashboard)

### Database Setup
- MySQL server running on localhost:3306
- Database name: `IMS_throwhorse`
- Default credentials: root/Root@123

## 🚀 Installation & Setup

### 1. Database Setup
```bash
# Import the database schema
mysql -u root -p < IMS_Database.sql
```

### 2. Install Dependencies

#### Chatbot System
```bash
cd chatbot
npm install
```

#### Verification System
```bash
cd "verification system"
npm install
```

#### Analytics Dashboard
```bash
cd analytics_dashboard
npm install
pip install flask pandas tensorflow
```

### 3. Configuration
Update database credentials in each component's configuration files if needed:
- `chatbot/server.js`
- `verification system/app.js`
- `analytics_dashboard/server.js`

### 4. Start Services

#### Start Chatbot (Port 3000)
```bash
cd chatbot
npm start
```

#### Start Verification System (Port 3000)
```bash
cd "verification system"
node app.js
```

#### Start Analytics Dashboard (Port 5000)
```bash
cd analytics_dashboard
python app.py
```

## 👥 User Access

### Customer Access
- **URL**: `http://localhost:3000` (Chatbot)
- **Purpose**: Submit installment plan applications
- **No authentication required**

### Staff Access
- **URL**: `http://localhost:3000` (Verification System)
- **Default Credentials**:
  - **Reader**: `reader` / `Reader_123`
  - **Editor**: `editor` / `Editor_123`
  - **Admin**: `admin` / `Admin_123`

## 📊 Database Schema

### Main Tables
- `customer_data`: Customer information
- `installment_applications`: Application submissions
- `login_credentials`: Staff authentication

### Key Fields
- Card number, NIC, customer details
- Merchant information, bill amount, installment plan
- Application status and verification flags

## 🔧 Development

### Project Structure
```
IMS/
├── chatbot/                 # Customer chatbot interface
├── verification system/     # Staff verification system
├── analytics_dashboard/     # Python analytics dashboard
├── analytics_dashboard_PBI/ # Power BI dashboard
├── IMS_Database.sql        # Database schema
└── README.md              # This file
```

### Key Features
- **Real-time processing**: Instant application submission
- **Role-based access**: Secure staff permissions
- **Data analytics**: Comprehensive reporting
- **Scalable architecture**: Modular component design

## 📝 Documentation

- **User Guide**: See `uer gide.pdf` for detailed user instructions
- **Database Schema**: `IMS_Database.sql` contains complete database structure
- **API Documentation**: Available in each component's source code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions about the IMS system, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**License**: ISC
