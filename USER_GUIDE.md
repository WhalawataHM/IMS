# IMS - Installment Management System
## Complete User Guide

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Customer Guide](#customer-guide)
4. [Staff Guide](#staff-guide)
5. [Administrator Guide](#administrator-guide)
6. [Troubleshooting](#troubleshooting)
7. [FAQs](#faqs)

---

## System Overview

The IMS (Installment Management System) is a comprehensive banking solution designed to manage credit card installment plans efficiently. The system eliminates the need for customers to visit bank branches by providing direct access to installment plan applications through a user-friendly chatbot interface.

### Key Benefits
- **24/7 Availability**: Customers can apply for installment plans anytime
- **Reduced Staff Workload**: Automated processing reduces manual work
- **Faster Processing**: Streamlined verification and approval process
- **Better Tracking**: Comprehensive analytics and reporting
- **Secure Access**: Role-based permissions for staff members

### System Components
1. **Customer Chatbot**: Public interface for installment applications
2. **Staff Verification System**: Internal system for processing applications
3. **Analytics Dashboards**: Reporting and insights for management
4. **Database Management**: Centralized data storage and retrieval

---

## Getting Started

### System Requirements
- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Internet Connection**: Stable connection for real-time processing
- **Device**: Desktop, laptop, tablet, or smartphone

### Access URLs
- **Customer Portal**: `http://localhost:3000` (Chatbot)
- **Staff Portal**: `http://localhost:3000` (Verification System)
- **Analytics Dashboard**: `http://localhost:5000` (Python Dashboard)

---

## Customer Guide

### How to Apply for an Installment Plan

#### Step 1: Access the Chatbot
1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. You'll be automatically redirected to the chatbot interface

#### Step 2: Provide Your Information
The chatbot will ask for the following details:

**Required Information:**
- **Card Number**: Your 16-digit credit card number
- **NIC Number**: Your National Identity Card number
- **Full Name**: Your complete name as registered with the bank
- **Contact Number**: Your registered phone number
- **Email Address**: Your email address for notifications

**Installment Details:**
- **Merchant Name**: Where you made the purchase
- **Bill Amount**: Total amount to be converted to installments
- **Installment Plan**: Number of months (3, 6, 12, 24, etc.)
- **Transaction Date**: Date of the original purchase

#### Step 3: Submit Application
1. Review all entered information
2. Click "Submit Application"
3. You'll receive a confirmation message
4. Your application will be queued for staff verification

#### Step 4: Track Your Application
- Applications are typically processed within 24-48 hours
- You'll receive updates via email
- Check your application status through the chatbot

### Important Notes for Customers
- **Accuracy**: Ensure all information matches your bank records exactly
- **Timing**: Apply within 30 days of the original transaction
- **Eligibility**: Your card must be active and in good standing
- **Limits**: Check your card's installment limit before applying

### Common Customer Queries

**Q: How long does approval take?**
A: Most applications are processed within 24-48 hours during business days.

**Q: Can I cancel my application?**
A: Yes, contact the call center within 24 hours of submission.

**Q: What if my information is incorrect?**
A: Contact the call center immediately to correct any errors.

**Q: How will I know if my application is approved?**
A: You'll receive an email notification with the approval status.

---

## Staff Guide

### Accessing the Verification System

#### Login Process
1. Navigate to: `http://localhost:3000`
2. Enter your credentials:
   - **Username**: Your assigned user ID
   - **Password**: Your secure password
3. Click "Login"

#### User Roles and Permissions

##### Reader Role (Credit Card Center)
**Access Level**: Read-only access to applications
**Capabilities**:
- View all pending applications
- Access customer information
- Generate installment plans
- View application history
- Export data for reporting

**Default Credentials**: `reader` / `Reader_123`

##### Editor Role (Call Center)
**Access Level**: Read and edit applications
**Capabilities**:
- All Reader capabilities
- Verify customer information
- Approve or reject applications
- Update application status
- Add verification notes
- Contact customers for clarification

**Default Credentials**: `editor` / `Editor_123`

##### Admin Role (Department Heads)
**Access Level**: Full administrative access
**Capabilities**:
- All Editor capabilities
- Manage user accounts
- System configuration
- Generate reports
- Database management
- Analytics access

**Default Credentials**: `admin` / `Admin_123`

### Processing Applications

#### Step 1: Review Pending Applications
1. Log into the verification system
2. Navigate to "Pending Applications"
3. Applications are listed by submission date
4. Click on an application to view details

#### Step 2: Verify Customer Information
**For Editors and Admins:**
1. Cross-reference customer details with bank records
2. Verify card number and NIC match
3. Confirm contact information
4. Check card status and limits

#### Step 3: Process the Application
**For Readers:**
1. Review application details
2. Generate installment plan
3. Update application status to "Processed"

**For Editors:**
1. Verify all information
2. Choose action:
   - **Approve**: Application meets all criteria
   - **Reject**: Application doesn't meet requirements
   - **Request More Info**: Need additional details
3. Add notes explaining the decision
4. Update application status

#### Step 4: Notify Customer
- System automatically sends email notifications
- Status updates are reflected in the chatbot
- Customers can track their application progress

### Application Status Codes
- **Pending**: Awaiting staff review
- **Under Review**: Being processed by staff
- **Approved**: Application approved and installment plan created
- **Rejected**: Application denied (with reason)
- **More Info Required**: Additional information needed
- **Processed**: Installment plan successfully created

### Best Practices for Staff

#### Data Verification
- Always cross-reference with bank systems
- Verify customer identity thoroughly
- Check for duplicate applications
- Ensure all required fields are complete

#### Communication
- Add clear notes for all decisions
- Use professional language in communications
- Respond to customer inquiries promptly
- Maintain confidentiality of customer data

#### Processing Guidelines
- Process applications in order of submission
- Prioritize urgent requests appropriately
- Follow bank policies and procedures
- Document all actions taken

---

## Administrator Guide

### System Management

#### User Management
1. **Add New Users**:
   - Navigate to "User Management"
   - Click "Add New User"
   - Enter user details and assign role
   - Set initial password

2. **Modify User Permissions**:
   - Select user from list
   - Change role or permissions
   - Update access levels

3. **Deactivate Users**:
   - Select user account
   - Set status to "Inactive"
   - Maintain audit trail

#### System Configuration
1. **Database Settings**:
   - Update connection parameters
   - Configure backup schedules
   - Set performance parameters

2. **Email Notifications**:
   - Configure SMTP settings
   - Set notification templates
   - Test email delivery

3. **Security Settings**:
   - Password policies
   - Session timeouts
   - Access restrictions

#### Analytics and Reporting
1. **Power BI Dashboard**:
   - Open `analytics_dashboard.pbix`
   - Refresh data connections
   - Generate reports

2. **Python Analytics**:
   - Access analytics dashboard
   - View real-time metrics
   - Export data for analysis

### Monitoring and Maintenance

#### Daily Tasks
- Review system logs
- Check application processing times
- Monitor error rates
- Verify data integrity

#### Weekly Tasks
- Generate performance reports
- Review user activity
- Update system configurations
- Backup verification

#### Monthly Tasks
- Comprehensive system audit
- Performance optimization
- Security review
- User access review

---

## Troubleshooting

### Common Issues and Solutions

#### Customer Issues

**Problem**: Can't access the chatbot
**Solution**: 
- Check internet connection
- Clear browser cache
- Try a different browser
- Contact technical support

**Problem**: Application not submitting
**Solution**:
- Verify all required fields are filled
- Check card number format (16 digits)
- Ensure NIC format is correct
- Try refreshing the page

**Problem**: No confirmation email received
**Solution**:
- Check spam/junk folder
- Verify email address is correct
- Contact call center for status

#### Staff Issues

**Problem**: Can't log into verification system
**Solution**:
- Verify username and password
- Check if account is active
- Clear browser cache
- Contact administrator

**Problem**: Applications not loading
**Solution**:
- Check database connection
- Refresh the page
- Clear browser cache
- Contact technical support

**Problem**: Can't update application status
**Solution**:
- Verify you have appropriate permissions
- Check if application is locked
- Refresh the page
- Contact administrator

#### System Issues

**Problem**: Database connection errors
**Solution**:
- Check MySQL server status
- Verify database credentials
- Restart database service
- Check network connectivity

**Problem**: Slow system performance
**Solution**:
- Check server resources
- Optimize database queries
- Clear system cache
- Restart services

### Error Messages and Meanings

**"Database Connection Failed"**
- MySQL server is not running
- Incorrect database credentials
- Network connectivity issues

**"Authentication Required"**
- Session has expired
- User not logged in
- Invalid session data

**"Insufficient Permissions"**
- User doesn't have required role
- Access level too low
- Account deactivated

**"Application Not Found"**
- Application ID is invalid
- Application was deleted
- Database synchronization issue

### Getting Help

#### For Customers
- **Call Center**: Contact the bank's call center
- **Email Support**: Send email to support@bank.com
- **Live Chat**: Available on the chatbot interface

#### For Staff
- **IT Support**: Contact internal IT department
- **System Administrator**: Contact your system admin
- **Emergency Contact**: Use emergency contact numbers

#### For Administrators
- **Technical Documentation**: Check system documentation
- **Vendor Support**: Contact software vendor
- **Emergency Procedures**: Follow emergency protocols

---

## FAQs

### General Questions

**Q: What is the IMS system?**
A: The IMS (Installment Management System) is a comprehensive banking solution that allows customers to apply for credit card installment plans online without visiting bank branches.

**Q: Is the system secure?**
A: Yes, the system uses industry-standard security measures including encryption, secure sessions, and role-based access control.

**Q: What types of cards are supported?**
A: The system supports all major credit cards issued by the bank, including Visa, MasterCard, and local cards.

**Q: Can I apply for multiple installments?**
A: Yes, you can apply for multiple installment plans as long as you stay within your card's credit limit.

### Technical Questions

**Q: What browsers are supported?**
A: The system works with all modern browsers including Chrome, Firefox, Safari, and Edge.

**Q: Is there a mobile app?**
A: The system is web-based and works on all devices including smartphones and tablets.

**Q: How is my data protected?**
A: All data is encrypted in transit and at rest, following banking industry security standards.

**Q: What happens if the system goes down?**
A: The system has backup procedures and alternative contact methods for urgent requests.

### Process Questions

**Q: How long does approval take?**
A: Most applications are processed within 24-48 hours during business days.

**Q: Can I cancel my application?**
A: Yes, you can cancel within 24 hours of submission by contacting the call center.

**Q: What if I make a mistake in my application?**
A: Contact the call center immediately to correct any errors in your application.

**Q: How will I know if my application is approved?**
A: You'll receive an email notification with the approval status and installment details.

---

## Contact Information

### Customer Support
- **Phone**: 1234567
- **Email**: customersupport@bank.com
- **Hours**: 24/7 for urgent matters

### Staff Support
- **IT Help Desk**: Ext. 1234
- **System Administrator**: Ext. 5678
- **Emergency**: Ext. 9999

### Technical Support
- **Email**: techsupport@bank.com
- **Documentation**: Available on internal portal
- **Training**: Contact HR for training sessions

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Next Review**: 2025

---

*This user guide is maintained by the IMS Development Team. For questions or suggestions about this documentation, please contact the documentation team.* 