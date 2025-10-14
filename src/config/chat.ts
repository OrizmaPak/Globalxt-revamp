// Chat System Configuration
import { allowedAdminEmails } from './admin';

export const CHAT_CONFIG = {
  // Admin Settings (uses existing admin configuration)
  ADMIN_EMAILS: allowedAdminEmails, // Uses the same admin emails as the main admin system
  
  // Company Settings (for customer emails and chat)
  COMPANY_EMAIL: 'info@globalxtltd.com',
  
  // Chat Settings
  PRESENCE_HEARTBEAT_INTERVAL: 20000, // 20 seconds
  MESSAGE_NOTIFICATION_DELAY: 30000, // 30 seconds before sending email notification
  
  // UI Settings
  MAX_MESSAGE_LENGTH: 2000,
  TYPING_INDICATOR_TIMEOUT: 1000,
  
  // Company Info
  COMPANY_NAME: 'Global XT',
  SUPPORT_HOURS: '9:00 AM - 6:00 PM (Mon-Fri)',
};

// Utility functions
export const isAdminEmail = (email: string): boolean => {
  return CHAT_CONFIG.ADMIN_EMAILS.includes(email.toLowerCase());
};

export const getAdminEmails = (): string[] => {
  return CHAT_CONFIG.ADMIN_EMAILS;
};

export const getCompanyEmail = (): string => {
  return CHAT_CONFIG.COMPANY_EMAIL;
};
