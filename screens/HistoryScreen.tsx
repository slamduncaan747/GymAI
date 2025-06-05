// screens/HistoryScreen.tsx

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import {useWorkout} from '../context/WorkoutContext';
import {colors, typography, spacing} from '../themes';
import {Workout} from '../types/workout';
import Icon from 'react-native-vector-icons/Ionicons';

interface GroupedWorkouts {
  [key: string]: Workout[];
}

export default function HistoryScreen() {
  const {loadSavedWorkouts, savedWorkouts} = useWorkout();
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkouts>({});
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadSavedWorkouts();

    // Entry animation
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
  }, []);

  useEffect(() => {
    // Group workouts by month
    const grouped: GroupedWorkouts = {};
    savedWorkouts.forEach(workout => {
      const date = new Date(workout.timestamp);
      const monthKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(workout);
    });
    setGroupedWorkouts(grouped);

    // Auto-expand current month
    const currentMonth = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
    setExpandedMonths(new Set([currentMonth]));
  }, [savedWorkouts]);

  const toggleMonthExpansion = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  const getWorkoutStats = (workout: Workout) => {
    const totalSets = workout.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter(set => set.completed).length,
      0,
    );
    const totalVolume = workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight || 0) * (set.actual || 0);
        }, 0)
      );
    }, 0);

    return {totalSets, totalVolume};
  };

  const months = Object.keys(groupedWorkouts).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  if (savedWorkouts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>History</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="time-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Workout History</Text>
          <Text style={styles.emptyText}>
            Your completed workouts will appear here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Text style={styles.screenTitle}>History</Text>
        <Text style={styles.screenSubtitle}>
          {savedWorkouts.length} workouts completed
        </Text>
      </Animated.View>

      <Animated.ScrollView
        style={[styles.scrollView, {opacity: fadeAnim}]}
        showsVerticalScrollIndicator={false}>
        {months.map((month, monthIndex) => {
          const workouts = groupedWorkouts[month];
          const isExpanded = expandedMonths.has(month);
          const monthStats = workouts.reduce(
            (acc, workout) => {
              const stats = getWorkoutStats(workout);
              return {
                workouts: acc.workouts + 1,
                volume: acc.volume + stats.totalVolume,
              };
            },
            {workouts: 0, volume: 0},
          );

          return (
            <Animated.View
              key={month}
              style={[
                styles.monthSection,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <TouchableOpacity
                style={styles.monthHeader}
                onPress={() => toggleMonthExpansion(month)}
                activeOpacity={0.8}>
                <View>
                  <Text style={styles.monthTitle}>{month}</Text>
                  <Text style={styles.monthStats}>
                    {monthStats.workouts} workout
                    {monthStats.workouts !== 1 ? 's' : ''} •{' '}
                    {Math.round(monthStats.volume / 1000)}k lbs
                  </Text>
                </View>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: isExpanded ? '180deg' : '0deg',
                      },
                    ],
                  }}>
                  <Icon
                    name="chevron-down"
                    size={20}
                    color={colors.textTertiary}
                  />
                </Animated.View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.workoutsContainer}>
                  {workouts.map((workout, index) => {
                    const {totalSets, totalVolume} = getWorkoutStats(workout);
                    const workoutDate = new Date(workout.timestamp);
                    const isToday =
                      new Date().toDateString() === workoutDate.toDateString();

                    return (
                      <TouchableOpacity
                        key={workout.id}
                        style={[
                          styles.workoutCard,
                          isToday && styles.workoutCardToday,
                        ]}
                        activeOpacity={0.8}>
                        <View style={styles.workoutLeft}>
                          <View style={styles.workoutDateContainer}>
                            <Text style={styles.workoutWeekday}>
                              {workoutDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                              })}
                            </Text>
                            <Text style={styles.workoutDate}>
                              {workoutDate.getDate()}
                            </Text>
                          </View>

                          <View style={styles.workoutContent}>
                            <Text style={styles.workoutTime}>
                              {workoutDate.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </Text>
                            <Text style={styles.workoutExercises}>
                              {workout.exercises.length} exercises •{' '}
                              {workout.duration} min
                            </Text>
                          </View>
                        </View>

                        <View style={styles.workoutRight}>
                          <View style={styles.workoutStats}>
                            <Text style={styles.workoutVolume}>
                              {Math.round(totalVolume).toLocaleString()}
                            </Text>
                            <Text style={styles.workoutVolumeLabel}>lbs</Text>
                          </View>
                          <Icon
                            name="chevron-forward"
                            size={16}
                            color={colors.textTertiary}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </Animated.View>
          );
        })}

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  screenTitle: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  screenSubtitle: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  monthSection: {
    marginBottom: spacing.xs,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  monthTitle: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  monthStats: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  workoutsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  workoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutCardToday: {
    borderColor: colors.primary,
  },
  workoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workoutDateContainer: {
    width: 48,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  workoutWeekday: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  workoutDate: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  workoutContent: {
    flex: 1,
  },
  workoutTime: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  workoutExercises: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  workoutRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutVolume: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  workoutVolumeLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
