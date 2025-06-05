// utils/generateWorkout.ts

import {WorkoutExercise, UserPreferences, Exercise} from '../types/workout';
import {exerciseService} from '../service/exerciseService';
import {createOpenAIService} from '../service/openAIService';
import {OPENAI_API_KEY} from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

// REALISTIC exercise counts based on time
const EXERCISE_COUNT_BY_DURATION: {[key: number]: number} = {
  15: 2, // 3-4 exercises for 15 min
  30: 3, // 5-6 exercises for 30 min
  45: 4, // 7-8 exercises for 45 min
  60: 5, // 9-10 exercises for 60 min
  90: 6, // 11-12 exercises for 90 min
};

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
  useAI: boolean = true, // Default to true since AI is always on
  feedback?: string,
  currentExercises?: WorkoutExercise[],
): Promise<WorkoutExercise[]> {
  const preferences = userPreferences || DEFAULT_PREFERENCES;

  // Get exact exercise count based on duration
  const targetExerciseCount =
    EXERCISE_COUNT_BY_DURATION[duration] ||
    Math.min(Math.floor(duration / 7), 12); // Fallback: ~7 minutes per exercise, max 12

  // Always try AI first
  if (true) {
    try {
      const storedKey = await AsyncStorage.getItem('openai_api_key');
      const apiKey = storedKey || OPENAI_API_KEY;
      console.log('Using OpenAI API key:', apiKey);
      if (apiKey) {
        const openAIService = createOpenAIService(apiKey);
        const aiWorkout = await openAIService.generateWorkout({
          duration,
          preferences,
          focusAreas,
          recentExerciseIds: await getRecentExerciseIds(),
          feedback,
          currentExercises,
          targetExerciseCount, // Pass the exact count to AI
        });

        // Ensure AI returns correct number of exercises
        if (aiWorkout.length > 0) {
          // Trim if too many, or use as is if within range
          const trimmedWorkout = aiWorkout.slice(0, targetExerciseCount);
          return trimmedWorkout;
        }
      }
    } catch (error) {
      console.error('AI generation failed, falling back to standard:', error);
    }
  }

  // Fallback to standard generation with exact count
  return exerciseService.generateWorkout(
    duration,
    preferences,
    focusAreas,
    targetExerciseCount, // Pass exact count
  );
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

  const targetExerciseCount = EXERCISE_COUNT_BY_DURATION[duration] || 6;
  return exerciseService.generateWorkout(
    duration,
    preferences,
    undefined,
    targetExerciseCount,
  );
}

// Generate a workout focusing on specific muscle groups
export function generateTargetedWorkout(
  duration: number,
  targetAreas: Exercise['category'][],
  userPreferences?: UserPreferences,
): WorkoutExercise[] {
  const preferences = userPreferences || DEFAULT_PREFERENCES;
  const targetExerciseCount = EXERCISE_COUNT_BY_DURATION[duration] || 6;

  return exerciseService.generateWorkout(
    duration,
    preferences,
    targetAreas,
    targetExerciseCount,
  );
}

// Generate a workout based on user's recent activity to ensure variety
export async function generateVariedWorkout(
  duration: number,
  userPreferences?: UserPreferences,
): Promise<WorkoutExercise[]> {
  const preferences = userPreferences || DEFAULT_PREFERENCES;
  const recentExerciseIds = await getRecentExerciseIds();
  const targetExerciseCount = EXERCISE_COUNT_BY_DURATION[duration] || 6;

  // Get all suitable exercises
  const suitableExercises = exerciseService.getExercisesForUser(preferences);

  // Filter out recently used exercises
  const freshExercises = suitableExercises.filter(
    ex => !recentExerciseIds.includes(ex.id),
  );

  // If we filtered out too many, add some back
  const exercisesToUse =
    freshExercises.length >= targetExerciseCount * 2
      ? freshExercises
      : [
          ...freshExercises,
          ...suitableExercises
            .filter(ex => recentExerciseIds.includes(ex.id))
            .slice(0, targetExerciseCount / 2),
        ];

  // Generate workout from this filtered set
  const selected = exercisesToUse
    .sort(() => Math.random() - 0.5)
    .slice(0, targetExerciseCount);

  return selected.map(ex => exerciseService.toWorkoutExercise(ex));
}
