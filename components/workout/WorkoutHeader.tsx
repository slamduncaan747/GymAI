// components/workout/WorkoutHeader.tsx

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
import {colors, typography, spacing} from '../../themes';
import Icon from 'react-native-vector-icons/Ionicons';

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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
    }

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>No Active Workout</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = total > 0 ? completed / total : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.timerContainer}>
            <Icon name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.timer}>{formatElapsedTime(elapsedTime)}</Text>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Icon
              name="ellipsis-vertical"
              size={20}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {completed}/{total}
            </Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {currentWorkout.exercises.length}
            </Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(calculateVolume())}
            </Text>
            <Text style={styles.statLabel}>Volume (lbs)</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${progress * 100}%`}]} />
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
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  timer: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  menuButton: {
    padding: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.headline,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.sizes.headline,
    fontWeight: typography.weights.semibold,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.caption,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});

export default WorkoutHeader;
