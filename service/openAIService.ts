// services/openAIService.ts

import {Exercise, WorkoutExercise, UserPreferences} from '../types/workout';
import {exerciseService} from './exerciseService';

interface WorkoutGenerationParams {
  duration: number;
  preferences: UserPreferences;
  focusAreas?: Exercise['category'][];
  recentExerciseIds?: string[];
}

interface AIGeneratedWorkout {
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: number;
    restSeconds: number;
    notes?: string;
  }>;
  workoutNotes?: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAIService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateWorkout(
    params: WorkoutGenerationParams,
  ): Promise<WorkoutExercise[]> {
    try {
      const availableExercises = exerciseService.getExercisesForUser(
        params.preferences,
      );

      // Filter out recent exercises if provided
      const exercisesToUse = params.recentExerciseIds
        ? availableExercises.filter(
            ex => !params.recentExerciseIds!.includes(ex.id),
          )
        : availableExercises;

      // Create a simplified exercise list for the AI
      const exerciseList = exercisesToUse.map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        equipment: ex.equipment,
        primaryMuscles: ex.muscleGroups.primary,
        difficulty: ex.difficulty,
        movement: ex.movement,
      }));

      const systemPrompt = `You are an expert personal trainer creating workouts. 
You must respond with ONLY valid JSON matching the specified format.
Available exercises are provided in the exercise list.
Consider the user's experience level, available equipment, and workout duration.
Create balanced workouts with proper exercise order (compound before isolation).
Ensure proper rest times based on exercise intensity.`;

      const userPrompt = `Create a ${params.duration}-minute workout for a ${
        params.preferences.experienceLevel
      } level person.
Goals: ${params.preferences.goals.join(', ')}
${
  params.focusAreas
    ? `Focus areas: ${params.focusAreas.join(', ')}`
    : 'Create a balanced workout'
}
${
  params.preferences.avoidMuscleGroups?.length
    ? `Avoid: ${params.preferences.avoidMuscleGroups.join(', ')}`
    : ''
}

Available exercises:
${JSON.stringify(exerciseList, null, 2)}

Respond with JSON in this exact format:
{
  "exercises": [
    {
      "exerciseId": "exercise_id_from_list",
      "sets": 3,
      "reps": 10,
      "restSeconds": 90,
      "notes": "Optional coaching tip"
    }
  ],
  "workoutNotes": "Optional workout overview"
}`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // Updated to current model
          messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: userPrompt},
          ],
          response_format: {type: 'json_object'},
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const data: OpenAIResponse = await response.json();

      // Add validation for response structure
      if (
        !data.choices ||
        !data.choices[0] ||
        !data.choices[0].message ||
        !data.choices[0].message.content
      ) {
        throw new Error('Invalid response structure from OpenAI API');
      }

      let aiWorkout: AIGeneratedWorkout;
      try {
        aiWorkout = JSON.parse(data.choices[0].message.content);
      } catch (parseError) {
        console.error(
          'Failed to parse AI response:',
          data.choices[0].message.content,
        );
        throw new Error('Invalid JSON response from OpenAI API');
      }

      // Validate AI response structure
      if (!aiWorkout.exercises || !Array.isArray(aiWorkout.exercises)) {
        throw new Error('Invalid workout structure in AI response');
      }

      // Convert AI response to WorkoutExercise format
      return this.convertToWorkoutExercises(aiWorkout, exercisesToUse);
    } catch (error) {
      console.error('Error generating AI workout:', error);
      // Fallback to standard generation
      return exerciseService.generateWorkout(
        params.duration,
        params.preferences,
        params.focusAreas,
      );
    }
  }

  private convertToWorkoutExercises(
    aiWorkout: AIGeneratedWorkout,
    availableExercises: Exercise[],
  ): WorkoutExercise[] {
    return aiWorkout.exercises
      .map(aiExercise => {
        // Validate AI exercise data
        if (
          !aiExercise.exerciseId ||
          typeof aiExercise.sets !== 'number' ||
          typeof aiExercise.reps !== 'number'
        ) {
          console.warn('Invalid exercise data from AI:', aiExercise);
          return null;
        }

        const exercise = availableExercises.find(
          ex => ex.id === aiExercise.exerciseId,
        );
        if (!exercise) {
          console.warn('Exercise not found:', aiExercise.exerciseId);
          return null;
        }

        return {
          id: exercise.id,
          name: exercise.name,
          targetReps: aiExercise.reps,
          sets: Array.from({length: Math.max(1, aiExercise.sets)}, () => ({
            target: aiExercise.reps,
            actual: 0,
            weight: exercise.defaultWeight || 0,
            completed: false,
          })),
          restTime: aiExercise.restSeconds || 60, // Default rest time if not provided
        } as WorkoutExercise;
      })
      .filter((ex): ex is WorkoutExercise => ex !== null);
  }

  async getExerciseRecommendation(
    currentExerciseId: string,
    preferences: UserPreferences,
  ): Promise<Exercise | null> {
    try {
      const currentExercise =
        exerciseService.getExerciseById(currentExerciseId);
      if (!currentExercise) return null;

      const availableExercises =
        exerciseService.getExercisesForUser(preferences);
      const alternatives = availableExercises.filter(
        ex => ex.id !== currentExerciseId,
      );

      if (alternatives.length === 0) return null;

      const prompt = `Given a ${currentExercise.name} (${
        currentExercise.category
      }, ${currentExercise.equipment}), 
suggest the best alternative from this list for a ${
        preferences.experienceLevel
      } user:
${JSON.stringify(
  alternatives.map(ex => ({id: ex.id, name: ex.name, equipment: ex.equipment})),
)}

Respond with just the exercise ID.`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // More cost-effective for simple recommendations
          messages: [{role: 'user', content: prompt}],
          temperature: 0.5,
          max_tokens: 50,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: OpenAIResponse = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI API');
      }

      const suggestedId = data.choices[0].message.content.trim();

      return alternatives.find(ex => ex.id === suggestedId) || null;
    } catch (error) {
      console.error('Error getting exercise recommendation:', error);
      return null;
    }
  }
}

// Export a function to create the service with API key
export const createOpenAIService = (apiKey: string) =>
  new OpenAIService(apiKey);
