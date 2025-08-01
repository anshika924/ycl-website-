// Configuration for API endpoints
const config = {
  // Production backend URL - REPLACE THIS WITH YOUR RENDER URL
  API_BASE_URL: 'https://ycl-backend.onrender.com', // Replace with your actual Render URL
  
  // For local development, uncomment this line:
  // API_BASE_URL: 'http://localhost:5001',
  
  endpoints: {
    contact: '/api/contact',
    apply: '/api/apply',
    newsletter: '/api/newsletter'
  }
};

// Make API_BASE_URL globally accessible
window.API_BASE_URL = config.API_BASE_URL;

// Helper function to get full API URL
function getApiUrl(endpoint) {
  return config.API_BASE_URL + config.endpoints[endpoint];
} 