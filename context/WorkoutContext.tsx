import React, {createContext, useContext, useState, ReactNode} from 'react';
import {Workout, WorkoutExercise, WorkoutSet} from '../types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  removeExercise: (exerciseIndex: number) => void;
  reorderExercises: (newOrder: WorkoutExercise[]) => void;
  replaceExercise: (
    exerciseIndex: number,
    newExercise: WorkoutExercise,
  ) => void;
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

    if (
      exerciseIndex < 0 ||
      exerciseIndex >= currentWorkout.exercises.length ||
      setIndex < 0 ||
      setIndex >= currentWorkout.exercises[exerciseIndex].sets.length
    ) {
      console.error('Invalid exercise or set index');
      return;
    }

    if (currentWorkout.exercises[exerciseIndex].sets.length <= 1) {
      console.warn('Cannot delete the last set');
      return;
    }

    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises[exerciseIndex].sets.splice(setIndex, 1);
    setCurrentWorkout(updatedWorkout);
  };

  const updateExerciseRestTime = (exerciseIndex: number, restTime: number) => {
    if (!currentWorkout) return;

    if (exerciseIndex < 0 || exerciseIndex >= currentWorkout.exercises.length) {
      console.error('Invalid exercise index');
      return;
    }

    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises[exerciseIndex].restTime = restTime;
    setCurrentWorkout(updatedWorkout);
  };

  const removeExercise = (exerciseIndex: number) => {
    if (!currentWorkout) return;

    if (
      exerciseIndex < 0 ||
      exerciseIndex >= currentWorkout.exercises.length ||
      currentWorkout.exercises.length <= 1
    ) {
      console.error('Invalid exercise index or cannot remove last exercise');
      return;
    }

    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises.splice(exerciseIndex, 1);
    setCurrentWorkout(updatedWorkout);
  };

  const reorderExercises = (newOrder: WorkoutExercise[]) => {
    if (!currentWorkout) return;

    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises = newOrder;
    setCurrentWorkout(updatedWorkout);
  };

  const replaceExercise = (
    exerciseIndex: number,
    newExercise: WorkoutExercise,
  ) => {
    if (!currentWorkout) return;

    if (exerciseIndex < 0 || exerciseIndex >= currentWorkout.exercises.length) {
      console.error('Invalid exercise index');
      return;
    }

    const updatedWorkout = {...currentWorkout};
    updatedWorkout.exercises[exerciseIndex] = newExercise;
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
        removeExercise,
        reorderExercises,
        replaceExercise,
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
