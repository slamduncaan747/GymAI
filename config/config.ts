// config/config.ts

// This is a placeholder for the OpenAI API key
// In production, this should be handled through environment variables
// or secure storage, not hardcoded
export const OPENAI_API_KEY = '';

// API endpoints
export const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1',
};

// App configuration
export const APP_CONFIG = {
  appName: 'GymAI',
  version: '1.0.0',

  // Workout generation settings
  workout: {
    minDuration: 15,
    maxDuration: 90,
    defaultRestTime: 60,
    defaultSets: 3,
    defaultReps: 10,
  },

  // Exercise settings
  exercise: {
    minSets: 1,
    maxSets: 10,
    minReps: 1,
    maxReps: 50,
    minWeight: 0,
    maxWeight: 1000,
  },
};
