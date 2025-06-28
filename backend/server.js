const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Files will be saved in the 'uploads' folder

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  // Just use req.body as an object
  console.log('Contact form data:', req.body);
  res.json({ success: true, message: 'Contact form submitted successfully!' });
});

// Job application form endpoint with file upload support
app.post('/api/apply', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 }
]), (req, res) => {
  // req.body contains text fields, req.files contains files
  console.log('Job application data:', req.body);
  console.log('Uploaded files:', req.files);
  res.json({ success: true, message: 'Application with files submitted successfully!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 