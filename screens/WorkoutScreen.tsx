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
  const {
    duration,
    focusAreas,
    useAI = false,
    exercises: preGeneratedExercises,
    preGenerated = false,
  } = route.params;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timerUpdated, setTimerUpdated] = useState<boolean>(true);
  const [showReorderModal, setShowReorderModal] = useState<boolean>(false);
  const [showReplaceModal, setShowReplaceModal] = useState<boolean>(false);
  const [exerciseToReplace, setExerciseToReplace] = useState<number | null>(
    null,
  );
  const [workoutInitialized, setWorkoutInitialized] = useState(false);

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

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [currentWorkout]),
  );

  // Override navigation back button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // Remove default back button
      gestureEnabled: false, // Disable swipe back on iOS
    });
  }, [navigation]);

  useEffect(() => {
    // Only initialize workout once
    if (!workoutInitialized) {
      initializeWorkout();
    }
  }, []);

  const initializeWorkout = async () => {
    try {
      setIsLoading(true);

      if (
        preGenerated &&
        preGeneratedExercises &&
        preGeneratedExercises.length > 0
      ) {
        console.log(
          'Starting workout with pre-generated exercises:',
          preGeneratedExercises.length,
        );
        // Clear any existing workout and start fresh
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure state updates
        startWorkout(duration, preGeneratedExercises);
        setWorkoutInitialized(true);
      } else if (!preGenerated) {
        // Legacy flow - generate new workout
        const exercises = await generateWorkout(
          duration,
          undefined,
          focusAreas as any,
          useAI,
        );
        if (exercises && exercises.length > 0) {
          startWorkout(duration, exercises);
          setWorkoutInitialized(true);
        } else {
          throw new Error('No exercises generated');
        }
      } else {
        throw new Error('No exercises provided');
      }
    } catch (error) {
      console.error('Error initializing workout:', error);
      Alert.alert('Error', 'Failed to start workout. Please try again.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
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
      await completeWorkout();
      navigation.navigate('Home');
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
        <Text style={styles.loadingText}>Starting your workout...</Text>
      </View>
    );
  }

  if (!currentWorkout || !workoutInitialized) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No active workout</Text>
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
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          Duration: {currentWorkout.duration} min •{' '}
          {currentWorkout.exercises.length} exercises
        </Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
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
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  actionButtons: {
    marginVertical: 30,
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
