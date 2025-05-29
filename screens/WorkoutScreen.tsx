// screens/WorkoutScreen.tsx

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {useWorkout} from '../context/WorkoutContext';
import {generateWorkout} from '../utils/generateWorkout';
import ExerciseCard from '../components/workout/ExerciseCard';
import WorkoutHeader from '../components/workout/WorkoutHeader';
import TimerModal from '../components/workout/TimerModal';
import ReorderExercisesModal from '../components/workout/ReorderExerciseModal';
import ReplaceExerciseModal from '../components/workout/ReplaceExerciseModal';
import {colors} from '../themes/colors';
import {WorkoutExercise} from '../types/workout';

type WorkoutScreenRouteProp = RouteProp<RootStackParamList, 'Workout'> & {
  params: {
    duration: number;
    focusAreas?: string[];
    useAI?: boolean;
    exercises?: WorkoutExercise[];
    preGenerated?: boolean;
  };
};

type WorkoutScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Workout'
>;

interface ActiveTimer {
  exerciseIndex: number;
  restTime: number;
}

export default function WorkoutScreen() {
  const navigation = useNavigation<WorkoutScreenNavigationProp>();
  const route = useRoute<WorkoutScreenRouteProp>();
  const {duration, focusAreas, useAI = false} = route.params;
  const {
    currentWorkout,
    startWorkout,
    completeWorkout,
    updateExerciseSet,
    removeExercise,
    reorderExercises,
    replaceExercise,
  } = useWorkout();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>(
    'Generating your workout...',
  );
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timerUpdated, setTimerUpdated] = useState<boolean>(true);
  const [showReorderModal, setShowReorderModal] = useState<boolean>(false);
  const [showReplaceModal, setShowReplaceModal] = useState<boolean>(false);
  const [exerciseToReplace, setExerciseToReplace] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (currentWorkout) {
      setIsLoading(false);
      return;
    }

    generateWorkoutAsync();
  }, [currentWorkout, duration, focusAreas, useAI]);

  const generateWorkoutAsync = async () => {
    try {
      setIsLoading(true);
      if (useAI) {
        setLoadingMessage('AI is crafting your personalized workout...');
      }

      // Generate exercises
      const exercises = await generateWorkout(
        duration,
        undefined, // TODO: Add user preferences
        focusAreas as any,
        useAI,
      );

      // Make sure we have exercises
      if (!exercises || exercises.length === 0) {
        throw new Error('No exercises generated');
      }

      // Start the workout
      startWorkout(duration, exercises);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating workout:', error);
      setIsLoading(false);
      Alert.alert(
        'Generation Failed',
        'Failed to generate workout. Please try again.',
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    }
  };

  const handleTimerFinished = () => {
    setActiveTimer(null);
  };

  const handleCompleteWorkout = () => {
    Alert.alert(
      'Complete Workout',
      'Are you sure you want to finish this workout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Complete',
          onPress: async () => {
            await completeWorkout();
            navigation.navigate('Home');
          },
        },
      ],
    );
  };

  const handleSetUpdate = (
    exerciseIndex: number,
    setIndex: number,
    actual: number,
    weight: number,
    completed: boolean = false,
    restTime?: number,
  ) => {
    if (currentWorkout) {
      updateExerciseSet(exerciseIndex, setIndex, actual, weight, completed);

      // Only start timer if set is completed and restTime is provided
      if (completed && restTime) {
        setActiveTimer({
          exerciseIndex,
          restTime,
        });
        setTimerUpdated(false);
      }
    }
  };

  const handleReorderRequest = () => {
    setShowReorderModal(true);
  };

  const handleReplaceRequest = (exerciseIndex: number) => {
    setExerciseToReplace(exerciseIndex);
    setShowReplaceModal(true);
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    if (!currentWorkout || currentWorkout.exercises.length <= 1) {
      Alert.alert(
        'Cannot Remove',
        'You must have at least one exercise in your workout.',
      );
      return;
    }

    Alert.alert(
      'Remove Exercise',
      `Are you sure you want to remove ${currentWorkout.exercises[exerciseIndex].name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (removeExercise) {
              removeExercise(exerciseIndex);
            }
          },
        },
      ],
    );
  };

  const handleReorderComplete = (newOrder: WorkoutExercise[]) => {
    if (reorderExercises) {
      reorderExercises(newOrder);
    }
    setShowReorderModal(false);
  };

  const handleReplaceComplete = (newExercise: WorkoutExercise) => {
    if (exerciseToReplace !== null && replaceExercise) {
      replaceExercise(exerciseToReplace, newExercise);
    }
    setShowReplaceModal(false);
    setExerciseToReplace(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
        {useAI && (
          <Text style={styles.loadingSubtext}>
            This may take a few seconds...
          </Text>
        )}
      </View>
    );
  }

  if (!currentWorkout) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Failed to load workout. Please try again.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WorkoutHeader />
      <View
        style={{
          padding: 10,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        <Text style={{color: colors.textPrimary}}>
          Duration: {currentWorkout.duration} min
        </Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {currentWorkout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={`${exercise.id}-${index}`} // Fix for duplicate key error
            exercise={exercise}
            exerciseIndex={index}
            onUpdate={(setIndex, actual, weight, completed, restTime) =>
              handleSetUpdate(
                index,
                setIndex,
                actual,
                weight,
                completed,
                restTime,
              )
            }
            onReorderRequest={handleReorderRequest}
            onReplaceRequest={() => handleReplaceRequest(index)}
            onRemoveExercise={handleRemoveExercise}
          />
        ))}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteWorkout}>
          <Text style={styles.completeButtonText}>COMPLETE WORKOUT</Text>
        </TouchableOpacity>
      </ScrollView>

      <TimerModal
        visible={!!activeTimer}
        onDismiss={handleTimerFinished}
        initialDuration={activeTimer?.restTime || 60}
        timerUpdated={timerUpdated}
        setTimerUpdated={setTimerUpdated}
      />

      {showReorderModal && currentWorkout && (
        <ReorderExercisesModal
          visible={showReorderModal}
          exercises={currentWorkout.exercises}
          onClose={() => setShowReorderModal(false)}
          onReorder={handleReorderComplete}
        />
      )}

      {showReplaceModal && (
        <ReplaceExerciseModal
          visible={showReplaceModal}
          onClose={() => {
            setShowReplaceModal(false);
            setExerciseToReplace(null);
          }}
          onReplace={handleReplaceComplete}
          currentExerciseId={
            exerciseToReplace !== null
              ? currentWorkout.exercises[exerciseToReplace].id
              : ''
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  completeButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  completeButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
});
