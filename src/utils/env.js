// Helper function to safely access environment variables in Vite
export const getEnvVar = (key, fallback = '') => {
  // In Vite, environment variables must be prefixed with VITE_
  return import.meta.env[`VITE_${key}`] || fallback;
};

// Export commonly used environment variables
export const OPENROUTER_API_KEY = getEnvVar('OPENROUTER_API_KEY', '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'); 