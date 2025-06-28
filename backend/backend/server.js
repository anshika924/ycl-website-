require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5001;

// To enable email sending, create a .env file in this directory with:
// GMAIL_USER=yourname@gmail.com
// GMAIL_PASS=your_app_password

// MongoDB connection - supports both local and cloud
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ycl_website';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure the transporter using environment variables for security
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Set this in your environment
    pass: process.env.GMAIL_PASS  // Set this in your environment (App Password, not your Gmail password)
  }
});

// Flexible Contact Schema
const contactSchema = new mongoose.Schema({}, { strict: false });
const Contact = mongoose.model('Contact', contactSchema);

// Flexible Job Application Schema
const jobAppSchema = new mongoose.Schema({}, { strict: false });
const JobApplication = mongoose.model('JobApplication', jobAppSchema);

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('Received contact form submission:', req.body); // Debug log
  try {
    const contact = new Contact({ ...req.body, submittedAt: new Date() });
    await contact.save();
    console.log('Contact form data saved:', req.body);

    // Send thank you email if email is provided
    if (req.body.email) {
      console.log('[CONTACT] Attempting to send thank you email to:', req.body.email);
      const mailOptions = {
        from: process.env.GMAIL_USER, // Your Gmail address
        to: req.body.email, // User's email from the form
        subject: 'Thank you for contacting YCL!',
        text: `Dear ${req.body.name || 'User'},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nBest regards,\nYCL`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('[CONTACT] Error sending thank you email:', error);
        } else {
          console.log('[CONTACT] Thank you email sent:', info.response);
        }
      });
    } else {
      console.warn('[CONTACT] No email provided in contact form, thank you email not sent.');
    }

    res.json({ success: true, message: 'Contact form submitted successfully!' });
  } catch (err) {
    console.error('Error saving contact form:', err);
    res.status(500).json({ success: false, message: 'Failed to save contact form.' });
  }
});

// Job application form endpoint with file upload support
app.post('/api/apply', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), async (req, res) => {
  try {
    const submission = {
      ...req.body,
      submittedAt: new Date(),
      files: {}
    };
    if (req.files && req.files.resume) {
      submission.files.resume = req.files.resume.map(f => ({
        originalname: f.originalname,
        filename: f.filename,
        path: f.path
      }));
    }
    if (req.files && req.files.additionalDocs) {
      submission.files.additionalDocs = req.files.additionalDocs.map(f => ({
        originalname: f.originalname,
        filename: f.filename,
        path: f.path
      }));
    }
    const jobApp = new JobApplication(submission);
    await jobApp.save();
    console.log('Job application data saved:', submission);

    // Send thank you email for job application if email is provided
    if (req.body.email) {
      console.log('[APPLY] Attempting to send thank you email to:', req.body.email);
      const mailOptions = {
        from: process.env.GMAIL_USER, // Your Gmail address
        to: req.body.email,
        subject: 'Thank you for applying to YCL !',
        text: `Dear ${req.body.name || 'Applicant'},\n\nThank you for submitting your application! We have received your details and will review them soon.\n\nBest regards,\nYCL`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('[APPLY] Error sending thank you email (job application):', error);
        } else {
          console.log('[APPLY] Thank you email sent (job application):', info.response);
        }
      });
    } else {
      console.warn('[APPLY] No email provided in job application, thank you email not sent.');
    }

    res.json({ success: true, message: 'Application with files submitted successfully!' });
  } catch (err) {
    console.error('Error saving job application:', err);
    res.status(500).json({ success: false, message: 'Failed to save job application.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 