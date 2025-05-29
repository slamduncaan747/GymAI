// services/openAIService.ts

import {Exercise, WorkoutExercise, UserPreferences} from '../types/workout';
import {exerciseService} from './exerciseService';

interface WorkoutGenerationParams {
  duration: number;
  preferences: UserPreferences;
  focusAreas?: Exercise['category'][];
  recentExerciseIds?: string[];
}

class OpenAIService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateWorkout(
    params: WorkoutGenerationParams,
  ): Promise<WorkoutExercise[]> {
    try {
      // Get available exercises for the user
      const availableExercises = exerciseService.getExercisesForUser(
        params.preferences,
      );

      // Filter out recent exercises if provided
      let exercisesToUse = availableExercises;
      /*if (params.recentExerciseIds && params.recentExerciseIds.length > 0) {
        exercisesToUse = availableExercises.filter(
          ex => !params.recentExerciseIds!.includes(ex.id),
        );

        // If we filtered out too many, add some back
        if (exercisesToUse.length < 10) {
          exercisesToUse = availableExercises;
        }
      }*/

      // Calculate target exercise count
      const exerciseTimeEstimate = 7; // minutes per exercise on average
      const targetExerciseCount = Math.max(
        3,
        Math.min(12, Math.floor(params.duration / exerciseTimeEstimate)),
      );

      // Create a simplified exercise list for the AI
      const exerciseList = exercisesToUse.map(ex => ({
        id: ex.id,
        name: ex.name,
        difficulty: ex.difficulty,
        defaultSets: ex.defaultSets,
        defaultReps: ex.defaultReps,
        defaultRest: ex.defaultRestSeconds,
      }));

      const systemPrompt = `You are an expert personal trainer. Create a workout by selecting exercises from the provided list.
Return a JSON array of exercise IDs in the order they should be performed.
Consider: compound exercises before isolation, proper muscle group balance, and the user's experience level.
Select exactly ${targetExerciseCount} exercises.`;

      const userPrompt = `Create a ${params.duration}-minute workout.
User level: ${params.preferences.experienceLevel}
Goals: ${params.preferences.goals.join(', ')}
${
  params.focusAreas
    ? `Focus on: ${params.focusAreas.join(', ')}`
    : 'Create a balanced workout'
}

Available exercises:
${JSON.stringify(exerciseList, null, 2)}

Return ONLY a JSON object like this:
{
  "exerciseIds": ["exercise_id_1", "exercise_id_2", ...],
  "notes": "Brief workout description"
}`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: userPrompt},
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });
      /*const workoutData = await response.text();
      console.log('OpenAI API response:', workoutData);*/

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid response from OpenAI');
      }

      const content = data.choices[0].message.content;
      let aiResponse;

      try {
        aiResponse = JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Invalid JSON response from AI');
      }

      // Convert AI response to WorkoutExercise format
      const workoutExercises: WorkoutExercise[] = [];

      if (aiResponse.exerciseIds && Array.isArray(aiResponse.exerciseIds)) {
        for (const exerciseId of aiResponse.exerciseIds) {
          const exercise = exercisesToUse.find(ex => ex.id === exerciseId);
          if (exercise) {
            workoutExercises.push(exerciseService.toWorkoutExercise(exercise));
          }
        }
      }

      // If we didn't get enough exercises, fall back to standard generation
      if (workoutExercises.length < 3) {
        console.log(
          'AI generated too few exercises, falling back to standard generation',
        );
        return exerciseService.generateWorkout(
          params.duration,
          params.preferences,
          params.focusAreas,
        );
      }

      return workoutExercises;
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
      const relatedExercises = exerciseService.getRelatedExercises(
        currentExerciseId,
        10,
      );

      // If we have good related exercises, just use the first one
      if (relatedExercises.length > 0) {
        return relatedExercises[0];
      }

      // Otherwise, find a suitable alternative
      const alternatives = availableExercises.filter(
        ex =>
          ex.id !== currentExerciseId &&
          ex.category === currentExercise.category,
      );

      if (alternatives.length > 0) {
        // Return a random alternative
        return alternatives[Math.floor(Math.random() * alternatives.length)];
      }

      return null;
    } catch (error) {
      console.error('Error getting exercise recommendation:', error);
      return null;
    }
  }
}

// Export a function to create the service with API key
export const createOpenAIService = (apiKey: string) =>
  new OpenAIService(apiKey);
