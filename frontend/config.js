// Configuration for API endpoints
const config = {
  // Change this to your deployed backend URL when ready
  API_BASE_URL: 'http://localhost:5001',
  
  // For production, change to your deployed backend URL
  // API_BASE_URL: 'https://your-backend-url.onrender.com',
  
  endpoints: {
    contact: '/api/contact',
    apply: '/api/apply'
  }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
  return config.API_BASE_URL + config.endpoints[endpoint];
} 