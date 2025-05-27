export interface Exercise {
  id: string;
  name: string;
  category: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  defaultRestTime?: number;
}

export interface WorkoutSet {
  target: number;
  actual: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetReps: number;
  sets: WorkoutSet[];
  restTime?: number;
}

export interface Workout {
  id: string;
  timestamp: number;
  duration: number;
  exercises: WorkoutExercise[];
  completed: boolean;
  name?: string;
}
