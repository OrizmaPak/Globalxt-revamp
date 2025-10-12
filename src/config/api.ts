// API Configuration
import { getCompanyEmail } from './chat';

const ENV_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || 'https://global-xt-api.vercel.app';

export const API_CONFIG = {
  // Vercel deployment URL (updated with dual email system)
  BASE_URL: ENV_BASE,
  
  // API endpoints
  ENDPOINTS: {
    SEND_ENQUIRY: '/api/send-enquiry', // legacy
    SEND_EMAIL: '/api/send-email',     // generic single-email sender
    HEALTH: '/'
  },

  // Business recipient for notifications (uses chat config)
  RECIPIENT_EMAIL: getCompanyEmail(),
  
  // Request timeout (in milliseconds)
  TIMEOUT: 30000
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const ep = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${ep}`;
};

// Default headers for API requests
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});
