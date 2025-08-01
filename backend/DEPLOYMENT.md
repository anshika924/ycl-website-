# Backend Deployment Guide

## Deploy to Render (Recommended)

### Step 1: Prepare Your Repository
1. Make sure your backend code is in a GitHub repository
2. Ensure all files are committed and pushed

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: ycl-backend (or your preferred name)
   - **Root Directory**: backend (if your backend is in a subfolder)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

### Step 3: Set Environment Variables
In Render dashboard, go to Environment and add:
- `GMAIL_USER`: your-gmail@gmail.com
- `GMAIL_PASS`: your-gmail-app-password
- `MONGODB_URI`: mongodb+srv://username:password@cluster.mongodb.net/ycl_website
- `PORT`: 5001 (optional, Render sets this automatically)

### Step 4: Update Frontend
Once deployed, update `frontend/config.js`:
```javascript
API_BASE_URL: 'https://your-app-name.onrender.com'
```

## Alternative: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the backend folder
4. Set environment variables in Railway dashboard

## Gmail App Password Setup
1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password for your application
4. Use this password in GMAIL_PASS environment variable

## MongoDB Atlas Setup
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Replace username, password, and cluster details in the connection string 