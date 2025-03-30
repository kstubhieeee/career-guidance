// Helper function to safely access environment variables in Vite
export const getEnvVar = (key, fallback = '') => {
  // In Vite, environment variables must be prefixed with VITE_
  return import.meta.env[`VITE_${key}`] || fallback;
};

// Export Gemini API key
export const GEMINI_API_KEY = getEnvVar('GEMINI_API_KEY', 'AIzaSyBmuGPpLhFgSNSsY273SLKBrVMGdMCuzKo'); 