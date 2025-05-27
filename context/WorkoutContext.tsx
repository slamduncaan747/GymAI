import React, {createContext, useContext, useState, ReactNode} from 'react';
import {Workout, WorkoutExercise, WorkoutSet} from '../types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';

interface WorkoutContextType {
  currentWorkout: Workout | null;
  savedWorkouts: Workout[];
  startWorkout: (duration: number, exercises: WorkoutExercise[]) => void;
  updateExerciseSet: (
    exerciseIndex: number,
    setIndex: number,
    actual: number,
    weight: number,
    completed: boolean,
  ) => void;
  addSetToExercise: (exerciseIndex: number, newSet: WorkoutSet) => void;
  removeSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
  updateExerciseRestTime: (exerciseIndex: number, restTime: number) => void;
  completeWorkout: () => Promise<void>;
  loadSavedWorkouts: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({children}: {children: ReactNode}) {
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);

  const startWorkout = (duration: number, exercises: WorkoutExercise[]) => {
    const workout: Workout = {
      id: `workout_${Date.now()}`,
      timestamp: Date.now(),
      duration,
      exercises,
      completed: false,
    };
    setCurrentWorkout(workout);
  };

  const updateExerciseSet = (
    exerciseIndex: number,
    setIndex: number,
    actual: number,
    weight: number,
    completed: boolean = false,
  ) => {
    if (!currentWorkout) return;

    // Validate indices
    if (
      exerciseIndex < 0 ||
      exerciseIndex >= currentWorkout.exercises.length ||
      setIndex < 0 ||
      setIndex >= currentWorkout.exercises[exerciseIndex].sets.length
    ) {
      console.error('Invalid exercise or set index');
      return;
    }

    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises[exerciseIndex].sets[setIndex] = {
      ...updatedWorkout.exercises[exerciseIndex].sets[setIndex],
      actual,
      weight,
      completed,
    };
    setCurrentWorkout(updatedWorkout);
  };

  const addSetToExercise = (exerciseIndex: number, newSet: WorkoutSet) => {
    if (!currentWorkout) return;

    // Validate exercise index
    if (exerciseIndex < 0 || exerciseIndex >= currentWorkout.exercises.length) {
      console.error('Invalid exercise index');
      return;
    }

    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises[exerciseIndex].sets.push(newSet);
    setCurrentWorkout(updatedWorkout);
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    if (!currentWorkout) return;

    // Validate indices
    if (
      exerciseIndex < 0 ||
      exerciseIndex >= currentWorkout.exercises.length ||
      setIndex < 0 ||
      setIndex >= currentWorkout.exercises[exerciseIndex].sets.length
    ) {
      console.error('Invalid exercise or set index');
      return;
    }

    // Don't allow deleting the last set
    if (currentWorkout.exercises[exerciseIndex].sets.length <= 1) {
      console.warn('Cannot delete the last set');
      return;
    }

    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises[exerciseIndex].sets.splice(setIndex, 1);
    setCurrentWorkout(updatedWorkout);
  };
    if (!currentWorkout) return;

    // Validate exercise index
    if (exerciseIndex < 0 || exerciseIndex >= currentWorkout.exercises.length) {
      console.error('Invalid exercise index');
      return;
    }

    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises[exerciseIndex].restTime = restTime;
    setCurrentWorkout(updatedWorkout);
  };

  const completeWorkout = async () => {
    if (!currentWorkout) return;

    const completedWorkout = {
      ...currentWorkout,
      completed: true,
    };

    try {
      const updatedWorkouts = [completedWorkout, ...savedWorkouts];
      setSavedWorkouts(updatedWorkouts);
      await AsyncStorage.setItem(
        'savedWorkouts',
        JSON.stringify(updatedWorkouts),
      );
      setCurrentWorkout(null);
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const loadSavedWorkouts = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedWorkouts');
      if (saved) {
        setSavedWorkouts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        currentWorkout,
        savedWorkouts,
        startWorkout,
        updateExerciseSet,
        addSetToExercise,
        removeSetFromExercise,
        updateExerciseRestTime,
        completeWorkout,
        loadSavedWorkouts,
      }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}