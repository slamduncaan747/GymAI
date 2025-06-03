// screens/HistoryScreen.tsx

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useWorkout} from '../context/WorkoutContext';
import {colors} from '../themes/colors';
import {Workout} from '../types/workout';
import Icon from 'react-native-vector-icons/Ionicons';

interface GroupedWorkouts {
  [key: string]: Workout[];
}

export default function HistoryScreen() {
  const {loadSavedWorkouts, savedWorkouts} = useWorkout();
  const [groupedWorkouts, setGroupedWorkouts] = useState<GroupedWorkouts>({});
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSavedWorkouts();
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
    setExpandedDates(new Set([currentMonth]));
  }, [savedWorkouts]);

  const toggleMonthExpansion = (month: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedDates(newExpanded);
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
          <View style={styles.emptyIconContainer}>
            <Icon
              name="calendar-outline"
              size={64}
              color={colors.textTertiary}
            />
          </View>
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
      <View style={styles.header}>
        <Text style={styles.screenTitle}>History</Text>
        <Text style={styles.screenSubtitle}>
          {savedWorkouts.length} total workout
          {savedWorkouts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {months.map(month => {
          const workouts = groupedWorkouts[month];
          const isExpanded = expandedDates.has(month);
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
            <View key={month} style={styles.monthSection}>
              <TouchableOpacity
                style={styles.monthHeader}
                onPress={() => toggleMonthExpansion(month)}
                activeOpacity={0.7}>
                <View>
                  <Text style={styles.monthTitle}>{month}</Text>
                  <Text style={styles.monthStats}>
                    {monthStats.workouts} workout
                    {monthStats.workouts !== 1 ? 's' : ''} •{' '}
                    {Math.round(monthStats.volume / 1000)}k lbs
                  </Text>
                </View>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.workoutsContainer}>
                  {workouts.map(workout => {
                    const {totalSets, totalVolume} = getWorkoutStats(workout);
                    const workoutDate = new Date(workout.timestamp);
                    const dayOfWeek = workoutDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                    });
                    const dayOfMonth = workoutDate.getDate();

                    // Get primary muscle groups
                    const muscleGroups = new Set<string>();
                    workout.exercises.forEach(ex => {
                      const exerciseName = ex.name.toLowerCase();
                      if (
                        exerciseName.includes('bench') ||
                        exerciseName.includes('chest')
                      ) {
                        muscleGroups.add('Chest');
                      } else if (
                        exerciseName.includes('squat') ||
                        exerciseName.includes('leg')
                      ) {
                        muscleGroups.add('Legs');
                      } else if (
                        exerciseName.includes('deadlift') ||
                        exerciseName.includes('row') ||
                        exerciseName.includes('back')
                      ) {
                        muscleGroups.add('Back');
                      } else if (
                        exerciseName.includes('shoulder') ||
                        exerciseName.includes('press')
                      ) {
                        muscleGroups.add('Shoulders');
                      } else if (
                        exerciseName.includes('curl') ||
                        exerciseName.includes('tricep')
                      ) {
                        muscleGroups.add('Arms');
                      }
                    });

                    return (
                      <TouchableOpacity
                        key={workout.id}
                        style={styles.workoutCard}
                        activeOpacity={0.7}>
                        <View style={styles.workoutDateContainer}>
                          <Text style={styles.workoutDay}>{dayOfWeek}</Text>
                          <Text style={styles.workoutDate}>{dayOfMonth}</Text>
                        </View>

                        <View style={styles.workoutContent}>
                          <View style={styles.workoutHeader}>
                            <Text style={styles.workoutTime}>
                              {workoutDate.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </Text>
                            <Text style={styles.workoutDuration}>
                              <Icon
                                name="time-outline"
                                size={14}
                                color={colors.textSecondary}
                              />{' '}
                              {workout.duration} min
                            </Text>
                          </View>

                          <View style={styles.workoutMetrics}>
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>
                                {workout.exercises.length}
                              </Text>
                              <Text style={styles.metricLabel}>Exercises</Text>
                            </View>
                            <View style={styles.metricDivider} />
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>
                                {totalSets}
                              </Text>
                              <Text style={styles.metricLabel}>Sets</Text>
                            </View>
                            <View style={styles.metricDivider} />
                            <View style={styles.metricItem}>
                              <Text style={styles.metricValue}>
                                {Math.round(totalVolume)}
                              </Text>
                              <Text style={styles.metricLabel}>Volume</Text>
                            </View>
                          </View>

                          {muscleGroups.size > 0 && (
                            <View style={styles.muscleGroupsContainer}>
                              {Array.from(muscleGroups)
                                .slice(0, 3)
                                .map((muscle, idx) => (
                                  <View key={idx} style={styles.muscleTag}>
                                    <Text style={styles.muscleTagText}>
                                      {muscle}
                                    </Text>
                                  </View>
                                ))}
                            </View>
                          )}
                        </View>

                        <Icon
                          name="chevron-forward"
                          size={20}
                          color={colors.textTertiary}
                          style={styles.workoutChevron}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Month sections
  monthSection: {
    marginBottom: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  monthStats: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Workouts
  workoutsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutDateContainer: {
    width: 48,
    alignItems: 'center',
    marginRight: 16,
  },
  workoutDay: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  workoutDate: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
  },
  workoutContent: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 12,
  },
  workoutDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  workoutMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  muscleTag: {
    backgroundColor: colors.accentBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  muscleTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
  },
  workoutChevron: {
    marginLeft: 8,
  },
});
