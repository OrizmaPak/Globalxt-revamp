// API Configuration
export const API_CONFIG = {
  // Vercel deployment URL (updated with dual email system)
  BASE_URL: 'https://global-xt-q1k6pi8cf-orevaorior-gmailcoms-projects.vercel.app',
  
  // API endpoints
  ENDPOINTS: {
    SEND_ENQUIRY: '/api/send-enquiry', // legacy
    SEND_EMAIL: '/api/send-email',     // generic single-email sender
    HEALTH: '/'
  },

  // Business recipient for notifications (can be moved to env-backed config if needed)
  RECIPIENT_EMAIL: 'divinehelpfarmers@gmail.com',
  
  // Request timeout (in milliseconds)
  TIMEOUT: 30000
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Default headers for API requests
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});
