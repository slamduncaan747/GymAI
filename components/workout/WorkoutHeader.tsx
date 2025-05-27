import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useWorkout} from '../../context/WorkoutContext';
import {WorkoutExercise} from '../../types/workout';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../themes/colors'; // Import the colors file

const WorkoutHeader: React.FC = () => {
  const {currentWorkout, completeWorkout} = useWorkout();
  const navigation = useNavigation();
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    if (!currentWorkout || !currentWorkout.timestamp) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const startTime = currentWorkout.timestamp;
      const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedTime(elapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentWorkout]);

  const formatElapsedTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const calculateVolume = (): number => {
    if (!currentWorkout) return 0;
    return currentWorkout.exercises.reduce(
      (total: number, exercise: WorkoutExercise) => {
        return (
          total +
          exercise.sets.reduce((setTotal: number, set) => {
            return setTotal + (set.weight * set.actual || 0);
          }, 0)
        );
      },
      0,
    );
  };

  const calculateSetsProgress = (): {completed: number; total: number} => {
    if (!currentWorkout) return {completed: 0, total: 0};
    let totalSets = 0;
    let completedSets = 0;

    currentWorkout.exercises.forEach((exercise: WorkoutExercise) => {
      totalSets += exercise.sets.length;
      completedSets += exercise.sets.filter(set => set.actual > 0).length;
    });

    return {completed: completedSets, total: totalSets};
  };

  const {completed, total} = calculateSetsProgress();

  if (!currentWorkout) {
    return (
      <SafeAreaView style={styles.header}>
        <Text style={styles.title}>No Active Workout</Text>
      </SafeAreaView>
    );
  }

  const handleFinish = async () => {
    await completeWorkout();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Active Workout</Text>
        <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>
              {formatElapsedTime(elapsedTime)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Volume</Text>
            <Text style={styles.statValue}>
              {Math.round(calculateVolume())} lbs
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sets</Text>
            <Text style={styles.statValue}>
              {completed}/{total}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'column',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 12,
    padding: 5,
  },
  backText: {
    color: colors.textPrimary,
    fontSize: 18,
  },
  finishButton: {
    position: 'absolute',
    right: 10,
    top: 12,
    padding: 5,
  },
  finishText: {
    color: colors.finish,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutHeader;
