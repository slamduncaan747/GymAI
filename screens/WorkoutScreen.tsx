// screens/WorkoutScreen.tsx

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler,
  Animated,
  SafeAreaView,
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
import {colors, typography, spacing} from '../themes';
import {WorkoutExercise} from '../types/workout';
import Icon from 'react-native-vector-icons/Ionicons';

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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  useEffect(() => {
    initializeWorkout();
  }, []);

  const initializeWorkout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let exercisesToUse: WorkoutExercise[] = [];

      if (
        preGenerated &&
        preGeneratedExercises &&
        preGeneratedExercises.length > 0
      ) {
        exercisesToUse = preGeneratedExercises;
      } else {
        exercisesToUse = await generateWorkout(
          duration,
          undefined,
          focusAreas as any,
          true,
        );
      }

      if (!exercisesToUse || exercisesToUse.length === 0) {
        throw new Error('No exercises were generated');
      }

      startWorkout(duration, exercisesToUse);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Starting your workout...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Workout Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentWorkout) {
    return (
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <WorkoutHeader />

      <Animated.ScrollView
        style={[styles.scrollView, {opacity: fadeAnim}]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {currentWorkout.exercises.map((exercise, index) => (
          <Animated.View
            key={`${exercise.id}-${index}`}
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}>
            <ExerciseCard
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
              onReplaceRequest={handleReplaceRequest}
              onRemoveExercise={handleRemoveExercise}
            />
          </Animated.View>
        ))}

        {/* Complete Button */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => {
            Alert.alert(
              'Complete Workout',
              'Finish this workout and save your progress?',
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Complete', onPress: handleCompleteWorkout},
              ],
            );
          }}
          activeOpacity={0.8}>
          <Text style={styles.completeButtonText}>Complete Workout</Text>
        </TouchableOpacity>
      </Animated.ScrollView>

      {/* Timer Modal */}
      <TimerModal
        visible={!!activeTimer}
        onDismiss={() => setActiveTimer(null)}
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
      {showReplaceModal && exerciseToReplace !== null && currentWorkout && (
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
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.bodyLarge,
    marginTop: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.body,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.buttonText,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  completeButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xl,
    shadowColor: colors.success,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    color: colors.buttonText,
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
});
