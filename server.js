require('dotenv').config();

// Environment variable logging (for debugging)
console.log('🔧 Environment Check:');
console.log('GMAIL_USER:', process.env.GMAIL_USER ? '***set***' : '❌ missing');
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? '***set***' : '❌ missing');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '***set***' : '❌ missing');
console.log('PORT:', process.env.PORT || 'default (5001)');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration for production - allow your GoDaddy domain
app.use(cors({
  origin: [
    'https://yourconsultingltd.co.uk',
    'https://www.yourconsultingltd.co.uk',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// MongoDB Atlas connection with robust error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ycl_website';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    });
    console.log('✅ Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Troubleshooting tips:');
    console.log('   - Check if MONGODB_URI environment variable is set');
    console.log('   - Verify MongoDB Atlas cluster is running');
    console.log('   - Ensure network access allows connections from anywhere');
    console.log('   - Check username/password in connection string');
    
    // Don't exit the process, let it continue without DB
    console.log('⚠️ Continuing without database connection...');
  }
};

// Initialize database connection
connectDB();

// Configure nodemailer transporter with error handling
let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('✅ Email transporter configured');
} catch (error) {
  console.error('❌ Email transporter error:', error.message);
  console.log('⚠️ Email functionality will be disabled');
}

// Database Schemas
const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  company: String,
  email: String,
  phone: String,
  message: String,
  submittedAt: { type: Date, default: Date.now }
}, { strict: false });

const jobAppSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  position: String,
  experience: String,
  files: Object,
  submittedAt: { type: Date, default: Date.now }
}, { strict: false });

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);
const JobApplication = mongoose.model('JobApplication', jobAppSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    email: transporter ? 'configured' : 'not configured',
    environment: process.env.NODE_ENV || 'development'
  };
  
  console.log('🏥 Health check:', health);
  res.json(health);
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  console.log('📧 Received contact form submission:', req.body);
  
  try {
    // Save to database if connected
    if (mongoose.connection.readyState === 1) {
      const contact = new Contact({ ...req.body, submittedAt: new Date() });
      await contact.save();
      console.log('✅ Contact form data saved to MongoDB Atlas');
    } else {
      console.log('⚠️ Database not connected, skipping save');
    }

    // Send thank you email if configured
    if (req.body.email && transporter && process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      console.log('📧 Sending thank you email to:', req.body.email);
      
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: req.body.email,
        subject: 'Thank you for contacting YCL!',
        text: `Dear ${req.body.firstName || req.body.name || 'User'},

Thank you for reaching out to YCL! We have received your message and will get back to you soon.

Your message details:
- Name: ${req.body.firstName} ${req.body.lastName}
- Company: ${req.body.company || 'Not provided'}
- Email: ${req.body.email}
- Phone: ${req.body.phone || 'Not provided'}

We appreciate your interest in our services.

Best regards,
YCL Team`,
        html: `
          <h2>Thank you for contacting YCL!</h2>
          <p>Dear ${req.body.firstName || req.body.name || 'User'},</p>
          <p>Thank you for reaching out to YCL! We have received your message and will get back to you soon.</p>
          <h3>Your message details:</h3>
          <ul>
            <li><strong>Name:</strong> ${req.body.firstName} ${req.body.lastName}</li>
            <li><strong>Company:</strong> ${req.body.company || 'Not provided'}</li>
            <li><strong>Email:</strong> ${req.body.email}</li>
            <li><strong>Phone:</strong> ${req.body.phone || 'Not provided'}</li>
          </ul>
          <p>We appreciate your interest in our services.</p>
          <p>Best regards,<br>YCL Team</p>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('❌ Error sending thank you email:', error);
        } else {
          console.log('✅ Thank you email sent successfully:', info.response);
        }
      });
    } else {
      console.log('⚠️ Email not configured or missing credentials');
    }

    res.json({ 
      success: true, 
      message: 'Contact form submitted successfully!',
      database: mongoose.connection.readyState === 1 ? 'saved' : 'not_connected',
      email: transporter ? 'sent' : 'not_configured'
    });
    
  } catch (err) {
    console.error('❌ Error processing contact form:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process contact form.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Job application form endpoint
app.post('/api/apply', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), async (req, res) => {
  console.log('📄 Received job application:', req.body);
  
  try {
    if (mongoose.connection.readyState === 1) {
      const jobApp = new JobApplication({ 
        ...req.body, 
        files: req.files,
        submittedAt: new Date() 
      });
      await jobApp.save();
      console.log('✅ Job application saved to MongoDB Atlas');
    } else {
      console.log('⚠️ Database not connected, skipping save');
    }

    res.json({ 
      success: true, 
      message: 'Application submitted successfully!',
      database: mongoose.connection.readyState === 1 ? 'saved' : 'not_connected'
    });
    
  } catch (err) {
    console.error('❌ Error saving job application:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save application.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Newsletter signup endpoint
app.post('/api/newsletter', async (req, res) => {
  console.log('📰 Newsletter signup request:', req.body.email);
  
  try {
    if (mongoose.connection.readyState === 1) {
      const { email } = req.body;
      const existingSubscriber = await Newsletter.findOne({ email });
      
      if (existingSubscriber) {
        return res.json({ success: false, message: 'Email already subscribed.' });
      }

      const newsletter = new Newsletter({ email });
      await newsletter.save();
      console.log('✅ Newsletter signup saved to MongoDB Atlas:', email);
    } else {
      console.log('⚠️ Database not connected, skipping save');
    }

    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter!',
      database: mongoose.connection.readyState === 1 ? 'saved' : 'not_connected'
    });
    
  } catch (err) {
    console.error('❌ Error saving newsletter signup:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to subscribe.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'YCL Backend API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      apply: '/api/apply',
      newsletter: '/api/newsletter'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  // console.log(`🔗 CORS origins: ${app.get('cors').origin.join(', ')}`);
}); 