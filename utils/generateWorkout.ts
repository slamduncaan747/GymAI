// utils/generateWorkout.ts

import {WorkoutExercise, UserPreferences, Exercise} from '../types/workout';
import {exerciseService} from '../service/exerciseService';

// Default user preferences if none are set
const DEFAULT_PREFERENCES: UserPreferences = {
  experienceLevel: 'intermediate',
  availableEquipment: ['barbell', 'dumbbell', 'cable', 'bodyweight', 'machine'],
  goals: ['strength', 'muscle'],
  avoidMuscleGroups: [],
};

export function generateWorkout(
  duration: number,
  userPreferences?: UserPreferences,
  focusAreas?: Exercise['category'][],
): WorkoutExercise[] {
  const preferences = userPreferences || DEFAULT_PREFERENCES;

  // Generate workout using the exercise service
  return exerciseService.generateWorkout(duration, preferences, focusAreas);
}

// Generate a quick workout with specific equipment
export function generateQuickWorkout(
  duration: number,
  equipment: Exercise['equipment'][],
): WorkoutExercise[] {
  const preferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    availableEquipment: equipment,
  };

  return exerciseService.generateWorkout(duration, preferences);
}

// Generate a workout focusing on specific muscle groups
export function generateTargetedWorkout(
  duration: number,
  targetAreas: Exercise['category'][],
  userPreferences?: UserPreferences,
): WorkoutExercise[] {
  const preferences = userPreferences || DEFAULT_PREFERENCES;

  return exerciseService.generateWorkout(duration, preferences, targetAreas);
}

// Generate a workout based on user's recent activity to ensure variety
export function generateVariedWorkout(
  duration: number,
  recentExerciseIds: string[],
  userPreferences?: UserPreferences,
): WorkoutExercise[] {
  const preferences = userPreferences || DEFAULT_PREFERENCES;

  // Get all suitable exercises
  const suitableExercises = exerciseService.getExercisesForUser(preferences);

  // Filter out recently used exercises (within last 2 workouts)
  const freshExercises = suitableExercises.filter(
    ex => !recentExerciseIds.includes(ex.id),
  );

  // If we filtered out too many, add some back
  const exercisesToUse =
    freshExercises.length >= 10
      ? freshExercises
      : [
          ...freshExercises,
          ...suitableExercises
            .filter(ex => recentExerciseIds.includes(ex.id))
            .slice(0, 5),
        ];

  // Generate workout from this filtered set
  const exerciseCount = Math.max(3, Math.floor(duration / 5));
  const selected = exercisesToUse
    .sort(() => Math.random() - 0.5)
    .slice(0, exerciseCount);

  return selected.map(ex => exerciseService.toWorkoutExercise(ex));
}
