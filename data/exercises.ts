// data/exercises.ts
// This file maintains backward compatibility with the old exercise structure
// while using the new comprehensive database

import {EXERCISE_DATABASE} from './exerciseDatabase';
import {Exercise} from '../types/workout';

// Convert new Exercise format to old format for backward compatibility
export const EXERCISES = EXERCISE_DATABASE.map(exercise => ({
  id: exercise.id,
  name: exercise.name,
  category: exercise.category,
  defaultSets: exercise.defaultSets,
  defaultReps: exercise.defaultReps,
  defaultWeight: exercise.defaultWeight || 0,
  defaultRestTime: exercise.defaultRestSeconds,
}));

// Export the categories for UI components
export const EXERCISE_CATEGORIES = [
  'chest',
  'back',
  'shoulders',
  'legs',
  'arms',
  'core',
  'full_body',
] as const;

// Helper function to get exercises by category (backward compatible)
export const getExercisesByCategory = (category: string) => {
  return EXERCISES.filter(ex => ex.category === category);
};
