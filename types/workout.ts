export interface Exercise {
  id: string;
  name: string;
  category:
    | 'chest'
    | 'back'
    | 'shoulders'
    | 'legs'
    | 'arms'
    | 'core'
    | 'cardio'
    | 'full_body';
  muscleGroups: {
    primary: string[];
    secondary: string[];
  };
  equipment:
    | 'barbell'
    | 'dumbbell'
    | 'machine'
    | 'cable'
    | 'bodyweight'
    | 'band'
    | 'kettlebell'
    | 'ez_bar'
    | 'smith_machine'
    | 'ab_wheel'
    | 'none';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  movement:
    | 'push'
    | 'pull'
    | 'squat'
    | 'hinge'
    | 'lunge'
    | 'carry'
    | 'isolation'
    | 'compound'
    | 'cardio';
  instructions: string[];
  commonMistakes: string[];
  tips: string[];
  variations?: string[];
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
  defaultWeight?: number;
}

export interface WorkoutSet {
  id?: string; // Add unique identifier
  target: number;
  actual: number;
  weight: number;
  completed?: boolean;
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
export interface UserPreferences {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  availableEquipment: Exercise['equipment'][];
  goals: ('strength' | 'muscle' | 'endurance' | 'weight_loss')[];
  avoidMuscleGroups?: string[];
}

// Personal records tracking
export interface PersonalRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  date: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: Date;
  preferences: UserPreferences;
  stats?: {
    height?: number;
    weight?: number;
    age?: number;
  };
  personalRecords: PersonalRecord[];
}
