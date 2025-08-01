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
app.use('/uploads', express.static('uploads'));

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

// Newsletter Signup Schema
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true },
  subscribedAt: { type: Date, default: Date.now }
});
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Check for required email environment variables
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  console.error('ERROR: GMAIL_USER or GMAIL_PASS is missing in the .env file!');
  process.exit(1); // Stop the server if credentials are missing
}

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

// Newsletter signup endpoint
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }
  try {
    // Save to DB
    const newsletter = new Newsletter({ email });
    await newsletter.save();
    console.log('Newsletter signup:', email);

    // Notify company
    const notifyOptions = {
      from: process.env.GMAIL_USER,
      to: 'contact@yourconsultingltd.co.uk',
      subject: 'New Newsletter Signup',
      text: `A new user has signed up for the newsletter: ${email}`
    };
    transporter.sendMail(notifyOptions, (error, info) => {
      if (error) {
        console.error('[NEWSLETTER] Error sending notification email:', error);
      } else {
        console.log('[NEWSLETTER] Notification email sent:', info.response);
      }
    });

    // Thank you email to subscriber (updated wording)
    const thankYouOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Thank you for subscribing to the YCL Newsletter!',
      text: `Dear Subscriber,\n\nThank you for subscribing to the YCL Newsletter!\n\nYou will now be notified about our latest updates, insights, and exclusive content.\n\nBest regards,\nYCL Team`
    };
    transporter.sendMail(thankYouOptions, (error, info) => {
      if (error) {
        console.error('[NEWSLETTER] Error sending thank you email:', error);
      } else {
        console.log('[NEWSLETTER] Thank you email sent:', info.response);
      }
    });

    res.json({ success: true, message: 'Subscribed successfully!' });
  } catch (err) {
    console.error('Error saving newsletter signup:', err);
    res.status(500).json({ success: false, message: 'Failed to subscribe.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 