import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {useWorkout} from '../context/WorkoutContext';
import {generateWorkout} from '../utils/generateWorkout';
import ExerciseCard from '../components/workout/ExerciseCard';
import WorkoutHeader from '../components/workout/WorkoutHeader';
import TimerModal from '../components/workout/TimerModal';
import {colors} from '../themes/colors';

type WorkoutScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Workout'
>;
type WorkoutScreenRouteProp = RouteProp<RootStackParamList, 'Workout'>;

interface ActiveTimer {
  exerciseIndex: number;
  restTime: number;
}

export default function WorkoutScreen() {
  const navigation = useNavigation<WorkoutScreenNavigationProp>();
  const route = useRoute<WorkoutScreenRouteProp>();
  const {duration} = route.params;
  const {currentWorkout, startWorkout, completeWorkout, updateExerciseSet} =
    useWorkout();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [timerUpdated, setTimerUpdated] = useState<boolean>(true);

  useEffect(() => {
    if (currentWorkout) {
      setIsLoading(false);
      return;
    }
    const exercises = generateWorkout(duration);
    startWorkout(duration, exercises);
    setIsLoading(false);
  }, [currentWorkout, duration, startWorkout]);

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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Generating your workout...</Text>
      </View>
    );
  }

  if (!currentWorkout) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          Failed to load workout. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WorkoutHeader />
      <Text style={{color: '#ffffff'}}>
        Timer:{' '}
        {activeTimer
          ? `Active (${
              currentWorkout.exercises[activeTimer.exerciseIndex]?.name
            })`
          : 'Inactive'}
      </Text>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {currentWorkout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.loading,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
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
