# Render Deployment Guide for YCL Backend

## Quick Setup Checklist

### ✅ Pre-requisites
- [ ] GitHub repository created
- [ ] MongoDB Atlas account and cluster
- [ ] Gmail app password
- [ ] Code pushed to GitHub

### ✅ Render Setup
- [ ] Render account created
- [ ] Web service deployed
- [ ] Environment variables set
- [ ] Service is live

### ✅ Frontend Update
- [ ] config.js updated with Render URL
- [ ] Files uploaded to GoDaddy
- [ ] Contact form tested

## Step-by-Step Render Deployment

### 1. Create Render Account
1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with your GitHub account
4. Verify your email

### 2. Deploy Web Service
1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub repository (`ycl-website`)
4. Configure the service:

**Settings:**
- **Name**: `ycl-backend`
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: `Node`

### 3. Set Environment Variables
In Render dashboard → **Environment** tab, add these variables:

```
GMAIL_USER = your-gmail@gmail.com
GMAIL_PASS = your-16-character-app-password
MONGODB_URI = mongodb+srv://ycl-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ycl_website
NODE_ENV = production
```

**Important Notes:**
- Replace `your-gmail@gmail.com` with your actual Gmail
- Replace `your-16-character-app-password` with your Gmail app password
- Replace the MongoDB URI with your actual connection string
- Make sure there are no spaces around the `=` sign

### 4. Deploy
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Check the logs for any errors
4. Copy your service URL (e.g., `https://ycl-backend.onrender.com`)

### 5. Test Backend
Visit your Render URL + `/api/health`:
```
https://your-service-name.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Backend is running",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "mongodb": "connected",
  "email": "configured",
  "environment": "production"
}
```

### 6. Update Frontend
In `frontend/config.js`, update:
```javascript
API_BASE_URL: 'https://your-service-name.onrender.com'
```

### 7. Upload to GoDaddy
1. Upload all files from `frontend/` folder
2. Make sure `index.html` is in the root directory
3. Test the contact form

## Troubleshooting

### Common Issues:

#### 1. MongoDB Connection Error
**Error**: `MongoDB connection error: connect ECONNREFUSED`
**Solution**: 
- Check MongoDB Atlas connection string
- Ensure network access allows connections from anywhere
- Verify username/password in connection string

#### 2. Email Not Working
**Error**: `Email transporter error`
**Solution**:
- Verify Gmail app password is correct
- Check GMAIL_USER and GMAIL_PASS environment variables
- Ensure 2-factor authentication is enabled

#### 3. CORS Error
**Error**: `CORS policy: No 'Access-Control-Allow-Origin'`
**Solution**:
- Check if your GoDaddy domain is in the CORS origins list
- Verify the backend is running on Render

#### 4. Build Failed
**Error**: `Build failed`
**Solution**:
- Check if `package.json` has correct start script
- Verify all dependencies are listed
- Check Node.js version compatibility

### Debug Commands:

#### Test Backend Health:
```bash
curl https://your-service-name.onrender.com/api/health
```

#### Test Contact Form:
```bash
curl -X POST https://your-service-name.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"1234567890","message":"Test message"}'
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GMAIL_USER` | Your Gmail address | `yourname@gmail.com` |
| `GMAIL_PASS` | Gmail app password | `abcd efgh ijkl mnop` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (auto-set by Render) | `10000` |

## Success Indicators

✅ **Backend Health Check**: Returns status "OK"  
✅ **MongoDB**: Shows "connected"  
✅ **Email**: Shows "configured"  
✅ **Contact Form**: Saves data and sends emails  
✅ **Frontend**: Connects to backend without errors  

## Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Verify all environment variables are set correctly
3. Test the health endpoint
4. Check MongoDB Atlas cluster status
5. Verify Gmail app password is working 