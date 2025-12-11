// Gemini API Configuration
// For production, use environment variables. For development, you can set the key here.

export const getGeminiApiKey = () => {
  // Check environment variables first
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  // Fallback: return placeholder or throw error for production
  // Set GEMINI_API_KEY in your .env file
  console.warn("⚠️ GEMINI_API_KEY not found in environment variables");
  return "your-gemini-api-key-here";
};


