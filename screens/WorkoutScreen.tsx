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
  BackHandler,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
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

type WorkoutScreenRouteProp = RouteProp<RootStackParamList, 'Workout'>;
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
  const {
    duration,
    focusAreas,
    useAI = false,
    exercises: preGeneratedExercises,
    preGenerated = false,
  } = route.params || {};

  const {
    currentWorkout,
    startWorkout,
    completeWorkout,
    cancelWorkout,
    updateExerciseSet,
    removeExercise,
    reorderExercises,
    replaceExercise,
  } = useWorkout();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timerUpdated, setTimerUpdated] = useState<boolean>(true);
  const [showReorderModal, setShowReorderModal] = useState<boolean>(false);
  const [showReplaceModal, setShowReplaceModal] = useState<boolean>(false);
  const [exerciseToReplace, setExerciseToReplace] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Handle back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (currentWorkout && !currentWorkout.completed) {
          handleBackPress();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [currentWorkout]),
  );

  // Override navigation back button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      gestureEnabled: false,
    });
  }, [navigation]);

  useEffect(() => {
    initializeWorkout();
  }, []);

  const initializeWorkout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required parameters
      if (!duration) {
        throw new Error('Duration is required');
      }

      let exercisesToUse: WorkoutExercise[] = [];

      if (
        preGenerated &&
        preGeneratedExercises &&
        preGeneratedExercises.length > 0
      ) {
        console.log(
          'Using pre-generated exercises:',
          preGeneratedExercises.length,
        );
        exercisesToUse = preGeneratedExercises;
      } else {
        console.log('Generating new workout...');
        exercisesToUse = await generateWorkout(
          duration,
          undefined,
          focusAreas as any,
          useAI,
        );
      }

      if (!exercisesToUse || exercisesToUse.length === 0) {
        throw new Error('No exercises were generated');
      }

      console.log('Starting workout with', exercisesToUse.length, 'exercises');
      startWorkout(duration, exercisesToUse);
    } catch (error) {
      console.error('Error initializing workout:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to initialize workout',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    Alert.alert(
      'Exit Workout?',
      'You have an active workout. What would you like to do?',
      [
        {text: 'Continue', style: 'cancel'},
        {
          text: 'Save & Exit',
          onPress: handleCompleteWorkout,
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: handleDiscardWorkout,
        },
      ],
    );
  };

  const handleTimerFinished = () => {
    setActiveTimer(null);
  };

  const handleCompleteWorkout = async () => {
    try {
      const completedWorkout = await completeWorkout();
      if (completedWorkout) {
        navigation.navigate('WorkoutSummary', {workout: completedWorkout});
      } else {
        navigation.navigate('MainTabs');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const handleDiscardWorkout = () => {
    Alert.alert(
      'Discard Workout?',
      'Are you sure you want to discard this workout? All progress will be lost.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            cancelWorkout();
            navigation.navigate('MainTabs');
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
    updateExerciseSet(exerciseIndex, setIndex, actual, weight, completed);

    // Only start timer if set is completed and restTime is provided
    if (completed && restTime) {
      setActiveTimer({
        exerciseIndex,
        restTime,
      });
      setTimerUpdated(false);
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
          onPress: () => removeExercise(exerciseIndex),
        },
      ],
    );
  };

  const handleReorderComplete = (newOrder: WorkoutExercise[]) => {
    reorderExercises(newOrder);
    setShowReorderModal(false);
  };

  const handleReplaceComplete = (newExercise: WorkoutExercise) => {
    if (exerciseToReplace !== null) {
      replaceExercise(exerciseToReplace, newExercise);
    }
    setShowReplaceModal(false);
    setExerciseToReplace(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Starting your workout...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Workout Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No workout state
  if (!currentWorkout) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Active Workout</Text>
        <Text style={styles.errorText}>
          Unable to load workout. Please try creating a new one.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.retryButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WorkoutHeader />

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          Duration: {currentWorkout.duration} min •{' '}
          {currentWorkout.exercises.length} exercises
        </Text>
      </View>

      {/* Exercises */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {currentWorkout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={`${exercise.id}-${index}`}
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.discardButton}
            onPress={handleDiscardWorkout}>
            <Text style={styles.discardButtonText}>Discard Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              Alert.alert(
                'Complete Workout',
                'Are you sure you want to finish this workout?',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {text: 'Complete', onPress: handleCompleteWorkout},
                ],
              );
            }}>
            <Text style={styles.completeButtonText}>Complete Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Timer Modal */}
      <TimerModal
        visible={!!activeTimer}
        onDismiss={handleTimerFinished}
        initialDuration={activeTimer?.restTime || 60}
        timerUpdated={timerUpdated}
        setTimerUpdated={setTimerUpdated}
      />

      {/* Reorder Modal */}
      {showReorderModal && currentWorkout && (
        <ReorderExercisesModal
          visible={showReorderModal}
          exercises={currentWorkout.exercises}
          onClose={() => setShowReorderModal(false)}
          onReorder={handleReorderComplete}
        />
      )}

      {/* Replace Modal */}
      {showReplaceModal && exerciseToReplace !== null && (
        <ReplaceExerciseModal
          visible={showReplaceModal}
          onClose={() => {
            setShowReplaceModal(false);
            setExerciseToReplace(null);
          }}
          onReplace={handleReplaceComplete}
          currentExerciseId={currentWorkout.exercises[exerciseToReplace].id}
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
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBar: {
    backgroundColor: colors.cardBackground,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  actionButtons: {
    marginTop: 30,
    gap: 12,
  },
  discardButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  discardButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completeButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
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
  },
});
