# YCL Website - Full Project Documentation

## Overview
This project is a full-stack website for YCL, featuring:
- A static frontend (HTML, CSS, JS) for company pages, contact, and job application forms
- A Node.js/Express backend with MongoDB for data storage, file uploads, and email notifications

---

## Folder Structure
```
ycl_website/
  backend/           # Backend code and uploads
    backend/
      server.js      # Main backend server
      README.md      # (Backend-only docs)
    package.json     # Backend dependencies
    ...
  frontend/          # Frontend static site
    index.html       # Home page
    contactform.html # Contact form
    applynow.html    # Job application form
    config.js        # API config
    style.css        # Styles
    README.md        # (Frontend-only docs)
  uploads/           # Uploaded files (if any)
  README.md          # (This file)
  QUICK_START.md     # Quick deployment guide
  DEPLOYMENT_GUIDE.md# Full deployment guide
```

---

## Backend

### Setup
1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```
2. **Environment variables:**
   - Create a `.env` file in `backend/backend/`:
     ```
     GMAIL_USER=yourname@gmail.com
     GMAIL_PASS=your_app_password
     ```
   - (Get an App Password from your Google Account, not your regular password)
3. **MongoDB:**
   - By default, uses `mongodb://localhost:27017/ycl_website`
   - For MongoDB Atlas, set `MONGODB_URI` in your environment
4. **Start the server:**
   ```bash
   cd backend
   npm start
   # or
   node backend/server.js
   ```

### API Endpoints
- **POST `/api/contact`**
  - Receives contact form data (JSON)
  - Saves to MongoDB
  - Sends a thank you email to the user
- **POST `/api/apply`**
  - Receives job application data and files
  - Saves to MongoDB and `uploads/`
  - Sends a thank you email to the applicant

### Email Sending
- Uses Nodemailer with Gmail SMTP
- Credentials from `.env`
- Edit email content in `server.js` (`mailOptions`)

### File Uploads
- Uses Multer
- Files saved to `backend/uploads/`
- File info stored in MongoDB

### Troubleshooting
- **No emails:** Check `.env`, use App Password, check backend logs
- **No data in DB:** Check MongoDB connection, ensure DB is running
- **File upload issues:** Ensure `uploads/` exists and is writable

---

## Frontend

### Structure
- All files in `frontend/`
- Main pages: `index.html`, `contactform.html`, `applynow.html`
- Styles: `style.css`
- API config: `config.js`

### Configuration
- Edit `frontend/config.js` to set the backend API URL:
  ```js
  const config = {
    API_BASE_URL: 'http://localhost:5001', // or your deployed backend URL
    endpoints: {
      contact: '/api/contact',
      apply: '/api/apply'
    }
  };
  ```

### How Forms Work
- **Contact form:** Sends POST to `/api/contact` with user data
- **Job application:** Sends POST to `/api/apply` with user data and files
- Backend processes, stores, and sends thank you emails

### Customization
- Change backend URL: edit `config.js`
- Edit form fields: change HTML in `contactform.html` or `applynow.html`
- Change styles: edit `style.css`
- Add new pages: create new HTML files

### Deployment
- Deploy `frontend/` as a static site (Netlify, Vercel, GitHub Pages, etc.)
- Ensure `config.js` points to your live backend URL

### Troubleshooting
- **Forms not working:** Check browser console, API URL, backend status
- **No thank you email:** Backend must be set up correctly

---

## Deployment
- See `QUICK_START.md` for a 30-minute deployment guide
- See `DEPLOYMENT_GUIDE.md` for detailed, step-by-step instructions

---

## Customization & Extending
- **Change email content:** Edit `mailOptions` in backend `server.js`
- **Add more form fields:** Just add to the HTML; backend schemas are flexible
- **Change file upload settings:** Edit Multer config in backend
- **Add analytics, custom domains, etc.:** See deployment guides

---

## Need Help?
- See `QUICK_START.md` and `DEPLOYMENT_GUIDE.md`
- Check backend and frontend `README.md` for more details
- For issues, check backend logs and browser console 