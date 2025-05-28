// utils/generateWorkout.ts

import {WorkoutExercise, UserPreferences, Exercise} from '../types/workout';
import {exerciseService} from '../service/exerciseService';
import {createOpenAIService} from '../service/openAIService';
import {OPENAI_API_KEY} from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default user preferences if none are set
const DEFAULT_PREFERENCES: UserPreferences = {
  experienceLevel: 'intermediate',
  availableEquipment: ['barbell', 'dumbbell', 'cable', 'bodyweight', 'machine'],
  goals: ['strength', 'muscle'],
  avoidMuscleGroups: [],
};

export async function generateWorkout(
  duration: number,
  userPreferences?: UserPreferences,
  focusAreas?: Exercise['category'][],
  useAI: boolean = false,
): Promise<WorkoutExercise[]> {
  const preferences = userPreferences || DEFAULT_PREFERENCES;

  // If AI is requested and we have an API key, use AI generation
  if (useAI && OPENAI_API_KEY) {
    try {
      const openAIService = createOpenAIService(OPENAI_API_KEY);
      const aiWorkout = await openAIService.generateWorkout({
        duration,
        preferences,
        focusAreas,
        recentExerciseIds: await getRecentExerciseIds(),
      });

      if (aiWorkout.length > 0) {
        return aiWorkout;
      }
    } catch (error) {
      console.error('AI generation failed, falling back to standard:', error);
    }
  }

  // Always fall back to standard generation
  return exerciseService.generateWorkout(duration, preferences, focusAreas);
}

// Get recently used exercise IDs to avoid repetition
async function getRecentExerciseIds(): Promise<string[]> {
  try {
    const savedWorkoutsStr = await AsyncStorage.getItem('savedWorkouts');
    if (!savedWorkoutsStr) return [];

    const workouts = JSON.parse(savedWorkoutsStr);
    const recentWorkouts = workouts.slice(0, 3); // Last 3 workouts

    const exerciseIds = new Set<string>();
    recentWorkouts.forEach((workout: any) => {
      workout.exercises.forEach((exercise: any) => {
        exerciseIds.add(exercise.id);
      });
    });

    return Array.from(exerciseIds);
  } catch (error) {
    console.error('Error getting recent exercises:', error);
    return [];
  }
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
export async function generateVariedWorkout(
  duration: number,
  userPreferences?: UserPreferences,
): Promise<WorkoutExercise[]> {
  const preferences = userPreferences || DEFAULT_PREFERENCES;
  const recentExerciseIds = await getRecentExerciseIds();

  // Get all suitable exercises
  const suitableExercises = exerciseService.getExercisesForUser(preferences);

  // Filter out recently used exercises
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
