// Helper function to safely access environment variables in Vite
export const getEnvVar = (key, fallback = '') => {
  // In Vite, environment variables must be prefixed with VITE_
  return import.meta.env[`VITE_${key}`] || fallback;
};

// Export API keys
export const GEMINI_API_KEY = getEnvVar('GEMINI_API_KEY');
export const OPENROUTER_API_KEY = getEnvVar('OPENROUTER_API_KEY');
export const RAZORPAY_KEY_ID = getEnvVar('RAZORPAY_KEY_ID');

// Export ZegoCloud configuration
export const ZEGO_CONFIG = {
  appID: parseInt(getEnvVar('ZEGO_APP_ID')),
  serverSecret: getEnvVar('ZEGO_SERVER_SECRET'),
  serverUrl: getEnvVar('ZEGO_SERVER_URL'),
  appSign: getEnvVar('ZEGO_APP_SIGN'),
  callbackSecret: getEnvVar('ZEGO_CALLBACK_SECRET')
}; 