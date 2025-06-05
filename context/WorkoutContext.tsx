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
  completeWorkout: () => Promise<Workout | undefined>;
  cancelWorkout: () => void;
  loadSavedWorkouts: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({children}: {children: ReactNode}) {
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [savedWorkouts, setSavedWorkouts] = useState<Workout[]>([]);

  const startWorkout = (duration: number, exercises: WorkoutExercise[]) => {
    console.log('Starting workout with', exercises.length, 'exercises');
    const workout: Workout = {
      id: `workout_${Date.now()}`,
      timestamp: Date.now(),
      duration,
      exercises: [...exercises], // Create a copy to avoid reference issues
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
    if (!currentWorkout) {
      console.warn('No current workout to update');
      return;
    }

    if (
      exerciseIndex < 0 ||
      exerciseIndex >= currentWorkout.exercises.length ||
      setIndex < 0 ||
      setIndex >= currentWorkout.exercises[exerciseIndex].sets.length
    ) {
      console.error('Invalid exercise or set index', {exerciseIndex, setIndex});
      return;
    }

    setCurrentWorkout(prevWorkout => {
      if (!prevWorkout) return null;

      const updatedWorkout = {
        ...prevWorkout,
        exercises: prevWorkout.exercises.map((exercise, exIndex) => {
          if (exIndex === exerciseIndex) {
            return {
              ...exercise,
              sets: exercise.sets.map((set, sIndex) => {
                if (sIndex === setIndex) {
                  return {
                    ...set,
                    actual,
                    weight,
                    completed,
                  };
                }
                return set;
              }),
            };
          }
          return exercise;
        }),
      };

      return updatedWorkout;
    });
  };

  const addSetToExercise = (exerciseIndex: number, newSet: WorkoutSet) => {
    if (!currentWorkout) return;

    if (exerciseIndex < 0 || exerciseIndex >= currentWorkout.exercises.length) {
      console.error('Invalid exercise index');
      return;
    }

    setCurrentWorkout(prevWorkout => {
      if (!prevWorkout) return null;

      return {
        ...prevWorkout,
        exercises: prevWorkout.exercises.map((exercise, index) => {
          if (index === exerciseIndex) {
            return {
              ...exercise,
              sets: [...exercise.sets, newSet],
            };
          }
          return exercise;
        }),
      };
    });
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

    setCurrentWorkout(prevWorkout => {
      if (!prevWorkout) return null;

      return {
        ...prevWorkout,
        exercises: prevWorkout.exercises.map((exercise, exIndex) => {
          if (exIndex === exerciseIndex) {
            // Create new array with the set removed
            const newSets = exercise.sets.filter(
              (_, sIndex) => sIndex !== setIndex,
            );

            // Preserve target reps from deleted set if needed
            const deletedSet = exercise.sets[setIndex];

            return {
              ...exercise,
              sets: newSets.map((set, index) => ({
                ...set,
                // Optionally preserve target reps pattern
                target: set.target || deletedSet.target || exercise.targetReps,
              })),
            };
          }
          return exercise;
        }),
      };
    });
  };

  const updateExerciseRestTime = (exerciseIndex: number, restTime: number) => {
    if (!currentWorkout) return;

    if (exerciseIndex < 0 || exerciseIndex >= currentWorkout.exercises.length) {
      console.error('Invalid exercise index');
      return;
    }

    setCurrentWorkout(prevWorkout => {
      if (!prevWorkout) return null;

      return {
        ...prevWorkout,
        exercises: prevWorkout.exercises.map((exercise, index) => {
          if (index === exerciseIndex) {
            return {
              ...exercise,
              restTime,
            };
          }
          return exercise;
        }),
      };
    });
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

    setCurrentWorkout(prevWorkout => {
      if (!prevWorkout) return null;

      return {
        ...prevWorkout,
        exercises: prevWorkout.exercises.filter(
          (_, index) => index !== exerciseIndex,
        ),
      };
    });
  };

  const reorderExercises = (newOrder: WorkoutExercise[]) => {
    if (!currentWorkout) return;

    setCurrentWorkout(prevWorkout => {
      if (!prevWorkout) return null;

      return {
        ...prevWorkout,
        exercises: [...newOrder],
      };
    });
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

    setCurrentWorkout(prevWorkout => {
      if (!prevWorkout) return null;

      return {
        ...prevWorkout,
        exercises: prevWorkout.exercises.map((exercise, index) => {
          if (index === exerciseIndex) {
            return newExercise;
          }
          return exercise;
        }),
      };
    });
  };

  const completeWorkout = async () => {
    if (!currentWorkout) return;

    const completedWorkout: Workout = {
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

      console.log('Workout completed and saved');

      // Return the completed workout so the screen can navigate to summary
      const workoutToReturn = completedWorkout;
      setCurrentWorkout(null);
      return workoutToReturn;
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  };

  const cancelWorkout = () => {
    console.log('Canceling workout');
    setCurrentWorkout(null);
  };

  const loadSavedWorkouts = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedWorkouts');
      if (saved) {
        const workouts = JSON.parse(saved);
        setSavedWorkouts(workouts);
        console.log('Loaded', workouts.length, 'saved workouts');
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
        cancelWorkout,
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
