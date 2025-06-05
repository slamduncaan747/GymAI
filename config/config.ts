export const OPENAI_API_KEY =
  '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';

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
