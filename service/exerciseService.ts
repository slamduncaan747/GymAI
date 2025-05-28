import { Exercise, UserPreferences, WorkoutExercise } from '../types/workout';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { OpenAIService } from './openAIService'; // Import OpenAIService

class ExerciseService {
  private exercises: Exercise[] = EXERCISE_DATABASE;
  private openAIService?: OpenAIService; // Optional OpenAIService instance

  constructor(openAIService?: OpenAIService) {
    this.openAIService = openAIService; // Inject OpenAIService if provided
  }

  // Get all exercises
  getAllExercises(): Exercise[] {
    return this.exercises;
  }

  // Get exercise by ID
  getExerciseById(id: string): Exercise | undefined {
    return this.exercises.find(exercise => exercise.id === id);
  }

  // Get exercises by category
  getExercisesByCategory(category: Exercise['category']): Exercise[] {
    return this.exercises.filter(exercise => exercise.category === category);
  }

  // Get exercises by equipment
  getExercisesByEquipment(equipment: Exercise['equipment'][]): Exercise[] {
    return this.exercises.filter(exercise =>
      equipment.includes(exercise.equipment),
    );
  }

  // Get exercises by difficulty
  getExercisesByDifficulty(difficulty: Exercise['difficulty']): Exercise[] {
    return this.exercises.filter(
      exercise => exercise.difficulty === difficulty,
    );
  }

  // Search exercises by name or muscle group
  searchExercises(query: string): Exercise[] {
    const lowerQuery = query.toLowerCase();
    return this.exercises.filter(
      exercise =>
        exercise.name.toLowerCase().includes(lowerQuery) ||
        exercise.muscleGroups.primary.some(muscle =>
          muscle.toLowerCase().includes(lowerQuery),
        ) ||
        exercise.muscleGroups.secondary.some(muscle =>
          muscle.toLowerCase().includes(lowerQuery),
        ) ||
        exercise.category.toLowerCase().includes(lowerQuery),
    );
  }

  // Get exercises suitable for user preferences
  getExercisesForUser(preferences: UserPreferences): Exercise[] {
    return this.exercises.filter(exercise => {
      // Check equipment availability
      if (!preferences.availableEquipment.includes(exercise.equipment)) {
        return false;
      }

      // Check difficulty level
      if (
        preferences.experienceLevel === 'beginner' &&
        exercise.difficulty === 'advanced'
      ) {
        return false;
      }
      if (
        preferences.experienceLevel === 'intermediate' &&
        exercise.difficulty === 'advanced'
      ) {
        // Allow some advanced exercises for intermediate users
        return Math.random() > 0.7; // 30% chance
      }

      // Check avoided muscle groups
      if (preferences.avoidMuscleGroups) {
        const hasAvoidedMuscle = exercise.muscleGroups.primary.some(muscle =>
          preferences.avoidMuscleGroups!.includes(muscle),
        );
        if (hasAvoidedMuscle) return false;
      }

      return true;
    });
  }

  // Get related exercises (same muscle group or movement pattern)
  async getRelatedExercises(
    exerciseId: string,
    limit: number = 5,
    recentExerciseIds?: string[], // Added to avoid recent exercises
  ): Promise<Exercise[]> {
    if (this.openAIService) {
      // Try AI-based recommendation first
      const recommendation = await this.openAIService.getExerciseRecommendation(
        exerciseId,
        { experienceLevel: 'intermediate', availableEquipment: ['bodyweight', 'dumbbell', 'barbell'], goals: ['general fitness'] } // Default preferences, adjust as needed
      );
      if (recommendation) {
        // Get additional related exercises if needed to meet the limit
        const remainingLimit = limit - 1;
        const fallbackExercises = await this.getFallbackRelatedExercises(
          exerciseId,
          remainingLimit,
          recentExerciseIds,
        );
        return [recommendation, ...fallbackExercises.filter(ex => ex.id !== recommendation.id)].slice(0, limit);
      }
    }

    // Fallback to original logic
    return this.getFallbackRelatedExercises(exerciseId, limit, recentExerciseIds);
  }

  // Helper method for fallback related exercises logic
  private getFallbackRelatedExercises(
    exerciseId: string,
    limit: number,
    recentExerciseIds?: string[],
  ): Exercise[] {
    const exercise = this.getExerciseById(exerciseId);
    if (!exercise) return [];

    return this.exercises
      .filter(ex => {
        if (ex.id === exerciseId) return false;
        if (recentExerciseIds?.includes(ex.id)) return false; // Exclude recent exercises

        // Check for same primary muscle groups
        const sameMuscle = ex.muscleGroups.primary.some(muscle =>
          exercise.muscleGroups.primary.includes(muscle),
        );

        // Check for same category
        const sameCategory = ex.category === exercise.category;

        // Check for same movement pattern
        const sameMovement = ex.movement === exercise.movement;

        return sameMuscle || sameCategory || sameMovement;
      })
      .sort((a, b) => {
        // Prioritize same equipment
        if (
          a.equipment === exercise.equipment &&
          b.equipment !== exercise.equipment
        )
          return -1;
        if (
          a.equipment !== exercise.equipment &&
          b.equipment === exercise.equipment
        )
          return 1;

        // Then same difficulty
        if (
          a.difficulty === exercise.difficulty &&
          b.difficulty !== exercise.difficulty
        )
          return -1;
        if (
          a.difficulty !== exercise.difficulty &&
          b.difficulty === exercise.difficulty
        )
          return 1;

        return 0;
      })
      .slice(0, limit);
  }

  // Convert Exercise to WorkoutExercise
  toWorkoutExercise(exercise: Exercise): WorkoutExercise {
    return {
      id: exercise.id,
      name: exercise.name,
      targetReps: exercise.defaultReps,
      sets: Array.from({length: exercise.defaultSets}, () => ({
        target: exercise.defaultReps,
        actual: 0,
        weight: exercise.defaultWeight || 0,
        completed: false,
      })),
      restTime: exercise.defaultRestSeconds,
    };
  }

  // Generate a balanced workout
50% chance
      return await this.openAIService.generateWorkout({
        duration,
        preferences,
        focusAreas,
        recentExerciseIds, // Pass recent exercises to avoid repetition
      });
    }

    // Fallback to original logic
    return this.generateFallbackWorkout(duration, preferences, focusAreas);
  }

  // Helper method for fallback workout generation
  private generateFallbackWorkout(
    duration: number,
    preferences: UserPreferences,
    focusAreas?: Exercise['category'][],
  ): WorkoutExercise[] {
    const exerciseTimeEstimate = 5; // minutes per exercise on average
    const targetExerciseCount = Math.max(
      3,
      Math.min(10, Math.floor(duration / exerciseTimeEstimate)),
    );

    const suitableExercises = this.getExercisesForUser(preferences);

    if (suitableExercises.length === 0) {
      // Fallback to bodyweight exercises if no equipment matches
      return this.getExercisesByEquipment(['bodyweight'])
        .slice(0, targetExerciseCount)
        .map(ex => this.toWorkoutExercise(ex));
    }

    let selectedExercises: Exercise[] = [];

    if (focusAreas && focusAreas.length > 0) {
      // Prioritize focus areas
      const focusExercises = suitableExercises.filter(ex =>
        focusAreas.includes(ex.category),
      );

      const otherExercises = suitableExercises.filter(
        ex => !focusAreas.includes(ex.category),
      );

      // 70% focus areas, 30% other
      const focusCount = Math.ceil(targetExerciseCount * 0.7);
      const otherCount = targetExerciseCount - focusCount;

      selectedExercises = [
        ...this.selectBalancedExercises(focusExercises, focusCount),
        ...this.selectBalancedExercises(otherExercises, otherCount),
      ];
    } else {
      // Generate a balanced full-body workout
      selectedExercises = this.selectBalancedExercises(
        suitableExercises,
        targetExerciseCount,
      );
    }

    return selectedExercises.map(ex => this.toWorkoutExercise(ex));
  }

  // Select exercises ensuring variety in movement patterns and muscle groups
  private selectBalancedExercises(
    exercises: Exercise[],
    count: number,
  ): Exercise[] {
    if (exercises.length <= count) return exercises;

    const selected: Exercise[] = [];
    const usedCategories = new Set<string>();
    const usedMovements = new Set<string>();
    const usedMuscles = new Set<string>();

    // Shuffle exercises
    const shuffled = [...exercises].sort(() => Math.random() - 0.5);

    for (const exercise of shuffled) {
      if (selected.length >= count) break;

      // Check for variety
      const categoryUsed = usedCategories.has(exercise.category);
      const movementUsed = usedMovements.has(exercise.movement);
      const musclesUsed = exercise.muscleGroups.primary.some(m =>
        usedMuscles.has(m),
      );

      // Prioritize exercises that add variety
      if (
        !categoryUsed ||
        !movementUsed ||
        !musclesUsed ||
        selected.length < count / 2
      ) {
        selected.push(exercise);
        usedCategories.add(exercise.category);
        usedMovements.add(exercise.movement);
        exercise.muscleGroups.primary.forEach(m => usedMuscles.add(m));
      }
    }

    // Fill remaining slots if needed
    if (selected.length < count) {
      const remaining = shuffled.filter(ex => !selected.includes(ex));
      selected.push(...remaining.slice(0, count - selected.length));
    }

    // Order exercises logically (compound before isolation, large muscles before small)
    return selected.sort((a, b) => {
      const movementOrder = {
        compound: 0,
        push: 1,
        pull: 2,
        squat: 3,
        hinge: 4,
        lunge: 5,
        carry: 6,
        isolation: 7,
        cardio: 8,
      };
      return (
        (movementOrder[a.movement] || 99) - (movementOrder[b.movement] || 99)
      );
    });
  }
}

// Export singleton instance
export const exerciseService = new ExerciseService();

// Export a function to create ExerciseService with OpenAIService
export const createExerciseServiceWithAI = (openAIService: OpenAIService) =>
  new ExerciseService(openAIService);