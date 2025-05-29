// service/openAIService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import {WorkoutExercise, UserPreferences, Exercise} from '../types/workout';
import {exerciseService} from './exerciseService';

const OPENAI_API_KEY_STORAGE = 'openai_api_key';

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
  }
}

interface OpenAIService {
  generateWorkout: (params: {
    duration: number;
    preferences: UserPreferences;
    focusAreas?: Exercise['category'][];
    recentExerciseIds?: string[];
    feedback?: string;
    currentExercises?: WorkoutExercise[];
  }) => Promise<WorkoutExercise[]>;
}

export function createOpenAIService(apiKey: string): OpenAIService {
  const generateWorkout = async (params: {
    duration: number;
    preferences: UserPreferences;
    focusAreas?: Exercise['category'][];
    recentExerciseIds?: string[];
    feedback?: string;
    currentExercises?: WorkoutExercise[];
  }): Promise<WorkoutExercise[]> => {
    const {
      duration,
      preferences,
      focusAreas,
      recentExerciseIds = [],
      feedback,
      currentExercises,
    } = params;

    try {
      // Get all available exercises
      const allExercises = exerciseService.getAllExercises();

      // Filter by user preferences
      const suitableExercises = allExercises.filter(ex => {
        if (!preferences.availableEquipment.includes(ex.equipment))
          return false;
        if (
          preferences.avoidMuscleGroups?.some(mg =>
            ex.muscleGroups.primary.includes(mg),
          )
        )
          return false;
        return true;
      });

      // Create a prompt for OpenAI
      const prompt = createWorkoutPrompt({
        duration,
        preferences,
        focusAreas,
        recentExerciseIds,
        suitableExercises,
        feedback,
        currentExercises,
      });

      // Call OpenAI API
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
                  'You are a professional fitness trainer creating personalized workout plans. Respond only with a JSON array of exercise IDs.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response to get exercise IDs
      const exerciseIds = parseAIResponse(content);

      // Convert IDs to WorkoutExercises
      const workoutExercises: WorkoutExercise[] = [];
      for (const id of exerciseIds) {
        const exercise = suitableExercises.find(ex => ex.id === id);
        if (exercise) {
          workoutExercises.push(exerciseService.toWorkoutExercise(exercise));
        }
      }

      // If we don't have enough exercises, fall back to standard generation
      if (workoutExercises.length < 3) {
        return exerciseService.generateWorkout(
          duration,
          preferences,
          focusAreas,
        );
      }

      return workoutExercises;
    } catch (error) {
      console.error('OpenAI workout generation failed:', error);
      // Fall back to standard generation
      return exerciseService.generateWorkout(duration, preferences, focusAreas);
    }
  };

  return {
    generateWorkout,
  };
}

function createWorkoutPrompt(params: {
  duration: number;
  preferences: UserPreferences;
  focusAreas?: Exercise['category'][];
  recentExerciseIds: string[];
  suitableExercises: Exercise[];
  feedback?: string;
  currentExercises?: WorkoutExercise[];
}): string {
  const {
    duration,
    preferences,
    focusAreas,
    recentExerciseIds,
    suitableExercises,
    feedback,
    currentExercises,
  } = params;

  // Create exercise list with details
  const exerciseList = suitableExercises
    .map(
      ex =>
        `${ex.id}: ${ex.name} (${ex.category}, ${
          ex.equipment
        }, ${ex.muscleGroups.primary.join(', ')})`,
    )
    .join('\n');

  let prompt = `Create a ${duration}-minute workout plan for a ${
    preferences.experienceLevel
  } level user.

Goals: ${preferences.goals.join(', ')}
${focusAreas ? `Focus areas: ${focusAreas.join(', ')}` : ''}
${
  recentExerciseIds.length > 0
    ? `Avoid these recently used exercises: ${recentExerciseIds.join(', ')}`
    : ''
}

Available exercises:
${exerciseList}

Guidelines:
- Select ${Math.max(3, Math.floor(duration / 5))} exercises
- Balance muscle groups appropriately
- Order exercises from compound to isolation
- Consider exercise difficulty for ${preferences.experienceLevel} level
${focusAreas ? `- Prioritize ${focusAreas.join(' and ')} exercises` : ''}`;

  if (feedback && currentExercises) {
    const currentExerciseNames = currentExercises.map(ex => ex.name).join(', ');
    prompt += `\n\nUser feedback on current workout (${currentExerciseNames}): "${feedback}"
Please adjust the workout based on this feedback.`;
  }

  prompt +=
    '\n\nRespond with ONLY a JSON array of exercise IDs, like: ["bench_press_barbell", "squat_barbell", ...]';

  return prompt;
}

function parseAIResponse(content: string): string[] {
  try {
    // Try to extract JSON array from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.filter(id => typeof id === 'string');
      }
    }
    return [];
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}
