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
