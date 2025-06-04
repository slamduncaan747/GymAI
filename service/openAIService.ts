// service/openAIService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {WorkoutExercise, Exercise, UserPreferences} from '../types/workout';
import {exerciseService} from './exerciseService';

const OPENAI_API_KEY_STORAGE = 'openai_api_key';

export interface OpenAIService {
  generateWorkout(params: {
    duration: number;
    preferences: UserPreferences;
    focusAreas?: Exercise['category'][];
    recentExerciseIds?: string[];
    feedback?: string;
    currentExercises?: WorkoutExercise[];
    targetExerciseCount: number;
  }): Promise<WorkoutExercise[]>;
}

export function createOpenAIService(apiKey: string): OpenAIService {
  return {
    async generateWorkout(params): Promise<WorkoutExercise[]> {
      const {
        duration,
        preferences,
        focusAreas,
        recentExerciseIds = [],
        feedback,
        currentExercises,
        targetExerciseCount,
      } = params;

      try {
        // Create a prompt for GPT
        const prompt = buildWorkoutPrompt(
          duration,
          preferences,
          focusAreas,
          recentExerciseIds,
          feedback,
          currentExercises,
          targetExerciseCount,
        );

        const response = await fetch(
          'https://api.openai.com/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content:
                    'You are a professional fitness trainer creating personalized workout plans. Always respond with valid JSON arrays only.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          throw new Error('No content in OpenAI response');
        }

        // Parse the JSON response
        const exerciseNames = JSON.parse(content);

        // Convert exercise names to WorkoutExercise objects
        const workoutExercises: WorkoutExercise[] = [];

        for (const exerciseName of exerciseNames) {
          // Find the exercise in our database
          const exercise = exerciseService.getExerciseByName(exerciseName);

          if (exercise) {
            workoutExercises.push(exerciseService.toWorkoutExercise(exercise));
          }
        }

        // If we don't have enough exercises, fill with suitable alternatives
        if (workoutExercises.length < targetExerciseCount) {
          const additionalExercises = exerciseService.generateWorkout(
            duration,
            preferences,
            focusAreas,
            targetExerciseCount - workoutExercises.length,
          );
          workoutExercises.push(...additionalExercises);
        }

        return workoutExercises.slice(0, targetExerciseCount);
      } catch (error) {
        console.error('OpenAI service error:', error);
        // Fallback to standard generation
        return exerciseService.generateWorkout(
          duration,
          preferences,
          focusAreas,
          targetExerciseCount,
        );
      }
    },
  };
}

function buildWorkoutPrompt(
  duration: number,
  preferences: UserPreferences,
  focusAreas?: Exercise['category'][],
  recentExerciseIds: string[] = [],
  feedback?: string,
  currentExercises?: WorkoutExercise[],
  targetExerciseCount: number = 5,
): string {
  let prompt = `Create a ${duration}-minute workout with EXACTLY ${targetExerciseCount} exercises.

User preferences:
- Experience level: ${preferences.experienceLevel}
- Available equipment: ${preferences.availableEquipment.join(', ')}
- Goals: ${preferences.goals.join(', ')}
${
  preferences.avoidMuscleGroups?.length
    ? `- Avoid these muscle groups: ${preferences.avoidMuscleGroups.join(', ')}`
    : ''
}

`;

  if (focusAreas && focusAreas.length > 0) {
    prompt += `Focus on these muscle groups: ${focusAreas.join(', ')}\n`;
  }

  if (recentExerciseIds.length > 0) {
    const recentExercises = recentExerciseIds
      .map(id => exerciseService.getExerciseById(id)?.name)
      .filter(Boolean);
    if (recentExercises.length > 0) {
      prompt += `Avoid these recently used exercises: ${recentExercises.join(
        ', ',
      )}\n`;
    }
  }

  if (feedback && currentExercises) {
    prompt += `\nUser feedback on current workout: ${feedback}\n`;
    prompt += `Current exercises: ${currentExercises
      .map(ex => ex.name)
      .join(', ')}\n`;
  }

  prompt += `
Choose from these available exercises: ${exerciseService
    .getAllExercises()
    .map(ex => ex.name)
    .join(', ')}

Return ONLY a JSON array of exercise names, nothing else. Example format:
["Barbell Bench Press", "Dumbbell Rows", "Squats"]

Make sure to:
1. Return EXACTLY ${targetExerciseCount} exercises
2. Balance muscle groups appropriately
3. Consider the time constraint (${duration} minutes means about ${Math.floor(
    duration / targetExerciseCount,
  )} minutes per exercise)
4. Match the user's experience level and equipment
5. Avoid exercises the user has done recently`;

  return prompt;
}

export async function getOpenAIKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(OPENAI_API_KEY_STORAGE);
  } catch (error) {
    console.error('Error getting OpenAI key:', error);
    return null;
  }
}

export async function setOpenAIKey(key: string): Promise<void> {
  try {
    if (key) {
      await AsyncStorage.setItem(OPENAI_API_KEY_STORAGE, key);
    } else {
      await AsyncStorage.removeItem(OPENAI_API_KEY_STORAGE);
    }
  } catch (error) {
    console.error('Error setting OpenAI key:', error);
    throw error;
  }
}
