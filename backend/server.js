require('dotenv').config();
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? '***set***' : '***missing***');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration for production
app.use(cors({
  origin: ['https://yourconsultingltd.co.uk', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB connection - supports both local and cloud
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ycl_website';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Configure the transporter using environment variables for security
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Flexible Contact Schema
const contactSchema = new mongoose.Schema({}, { strict: false });
const Contact = mongoose.model('Contact', contactSchema);

// Flexible Job Application Schema
const jobAppSchema = new mongoose.Schema({}, { strict: false });
const JobApplication = mongoose.model('JobApplication', jobAppSchema);

// Newsletter Signup Schema
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true },
  subscribedAt: { type: Date, default: Date.now }
});
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('Received contact form submission:', req.body);
  try {
    const contact = new Contact({ ...req.body, submittedAt: new Date() });
    await contact.save();
    console.log('Contact form data saved to MongoDB:', req.body);

    // Send thank you email if email is provided
    if (req.body.email && process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      console.log('[CONTACT] Attempting to send thank you email to:', req.body.email);
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: req.body.email,
        subject: 'Thank you for contacting YCL!',
        text: `Dear ${req.body.firstName || req.body.name || 'User'},\n\nThank you for reaching out! We have received your message and will get back to you soon.\n\nBest regards,\nYCL Team`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('[CONTACT] Error sending thank you email:', error);
        } else {
          console.log('[CONTACT] Thank you email sent:', info.response);
        }
      });
    } else {
      console.warn('[CONTACT] No email provided or email credentials missing');
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
    const jobApp = new JobApplication({ 
      ...req.body, 
      files: req.files,
      submittedAt: new Date() 
    });
    await jobApp.save();
    console.log('Job application saved to MongoDB:', req.body);

    res.json({ success: true, message: 'Application submitted successfully!' });
  } catch (err) {
    console.error('Error saving job application:', err);
    res.status(500).json({ success: false, message: 'Failed to save application.' });
  }
});

// Newsletter signup endpoint
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email } = req.body;
    const existingSubscriber = await Newsletter.findOne({ email });
    
    if (existingSubscriber) {
      return res.json({ success: false, message: 'Email already subscribed.' });
    }

    const newsletter = new Newsletter({ email });
    await newsletter.save();
    console.log('Newsletter signup saved to MongoDB:', email);

    res.json({ success: true, message: 'Successfully subscribed to newsletter!' });
  } catch (err) {
    console.error('Error saving newsletter signup:', err);
    res.status(500).json({ success: false, message: 'Failed to subscribe.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 