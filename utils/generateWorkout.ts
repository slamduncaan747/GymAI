import {Exercise, WorkoutExercise} from '../types/workout';
import {EXERCISES} from '../data/exercises';

export function generateWorkout(duration: number): WorkoutExercise[] {
  const exerciseCount = Math.max(1, Math.floor(duration / 10));
  const shuffled = [...EXERCISES].sort(() => 0.5 - Math.random());
  const selectedExercises = shuffled.slice(0, exerciseCount);

  return selectedExercises.map((exercise: Exercise) => ({
    id: exercise.id,
    name: exercise.name,
    targetReps: exercise.defaultReps,
    sets: Array.from({length: exercise.defaultSets}, () => ({
      target: exercise.defaultReps,
      actual: 0,
      weight: exercise.defaultWeight,
    })),
  }));
}
