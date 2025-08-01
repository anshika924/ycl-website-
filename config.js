// Configuration for API endpoints
const config = {
  // Production backend URL - UPDATE THIS WITH YOUR RENDER URL
  API_BASE_URL: 'https://ycl-backend.onrender.com', // Replace with your actual Render URL
  
  // For local development, uncomment this line:
  // API_BASE_URL: 'http://localhost:5001',
  
  endpoints: {
    contact: '/api/contact',
    apply: '/api/apply',
    newsletter: '/api/newsletter',
    health: '/api/health'
  }
};

// Make API_BASE_URL globally accessible
window.API_BASE_URL = config.API_BASE_URL;

// Helper function to get full API URL
function getApiUrl(endpoint) {
  return config.API_BASE_URL + config.endpoints[endpoint];
}

// Test backend connection
async function testBackendConnection() {
  try {
    const response = await fetch(getApiUrl('health'));
    const data = await response.json();
    console.log('✅ Backend connection test:', data);
    return data;
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return null;
  }
}

// Export for use in other scripts
window.testBackendConnection = testBackendConnection; 