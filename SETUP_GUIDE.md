# Complete Setup Guide: GoDaddy + Render + MongoDB

## Overview
This guide will help you deploy your YCL website with:
- **Frontend**: GoDaddy hosting
- **Backend**: Render (free Node.js hosting)
- **Database**: MongoDB Atlas (free cloud database)
- **Email**: Gmail integration

## Step 1: GitHub Repository Setup

### 1.1 Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name: `ycl-website`
4. Make it **Public** (required for free Render)
5. Click "Create repository"

### 1.2 Connect Your Code
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/ycl-website.git
git push -u origin main
```

## Step 2: MongoDB Atlas Setup (Free Database)

### 2.1 Create Atlas Account
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Click "Try Free"
3. Create account or sign in

### 2.2 Create Free Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS/Google Cloud/Azure)
4. Choose region close to you
5. Click "Create"

### 2.3 Set Up Database Access
1. Left sidebar → "Database Access"
2. Click "Add New Database User"
3. Username: `ycl-admin`
4. Password: Create strong password (save this!)
5. Role: "Read and write to any database"
6. Click "Add User"

### 2.4 Set Up Network Access
1. Left sidebar → "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Click "Confirm"

### 2.5 Get Connection String
1. Go back to "Database" in sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

**Your connection string will look like:**
```
mongodb+srv://ycl-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ycl_website
```

## Step 3: Gmail App Password Setup

### 3.1 Enable 2-Factor Authentication
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → "2-Step Verification"
3. Enable if not already enabled

### 3.2 Generate App Password
1. Security → "App passwords"
2. Select "Mail" from dropdown
3. Click "Generate"
4. Copy the 16-character password

## Step 4: Render Deployment

### 4.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Verify email

### 4.2 Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ycl-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

### 4.3 Set Environment Variables
In Render dashboard → Environment tab, add:

```
GMAIL_USER = your-gmail@gmail.com
GMAIL_PASS = your-16-character-app-password
MONGODB_URI = mongodb+srv://ycl-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ycl_website
```

### 4.4 Deploy
1. Click "Create Web Service"
2. Wait 2-3 minutes for deployment
3. Copy your service URL (e.g., `https://ycl-backend.onrender.com`)

## Step 5: Update Frontend Configuration

### 5.1 Update config.js
In `frontend/config.js`, update:
```javascript
API_BASE_URL: 'https://your-actual-render-url.onrender.com'
```

### 5.2 Test Backend
Visit: `https://your-render-url.onrender.com/api/health`
Should show: `{"status":"OK","message":"Backend is running","mongodb":"connected"}`

## Step 6: Upload to GoDaddy

### 6.1 Upload Frontend Files
1. Upload all files from `frontend/` folder
2. Make sure `index.html` is in the root directory
3. Keep the same folder structure

### 6.2 Test Contact Form
1. Visit your GoDaddy website
2. Fill out the contact form
3. Check if data appears in MongoDB Atlas
4. Check if you receive email notifications

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string format
- Check username/password in connection string
- Ensure "Allow Access from Anywhere" is enabled

### Email Issues
- Verify Gmail app password is correct
- Check GMAIL_USER and GMAIL_PASS environment variables
- Ensure 2-factor authentication is enabled

### Render Deployment Issues
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure package.json has correct start script

## Final Result
✅ Contact forms save to MongoDB  
✅ Email notifications sent via Gmail  
✅ Frontend works on GoDaddy  
✅ Backend runs on Render (free)  
✅ Database hosted on MongoDB Atlas (free)  

## Support
If you encounter issues:
1. Check Render logs for errors
2. Verify all environment variables
3. Test MongoDB connection string
4. Check Gmail app password 