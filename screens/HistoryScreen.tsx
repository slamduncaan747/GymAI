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
    // Group workouts by date
    const grouped: GroupedWorkouts = {};
    savedWorkouts.forEach(workout => {
      const date = new Date(workout.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(workout);
    });
    setGroupedWorkouts(grouped);
  }, [savedWorkouts]);

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
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

  const dates = Object.keys(groupedWorkouts).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout History</Text>
        <Text style={styles.headerSubtitle}>
          {savedWorkouts.length} total workouts
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {dates.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No workout history yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete your first workout to see it here
            </Text>
          </View>
        ) : (
          dates.map(date => {
            const workouts = groupedWorkouts[date];
            const isExpanded = expandedDates.has(date);

            return (
              <View key={date} style={styles.dateSection}>
                <TouchableOpacity
                  style={styles.dateHeader}
                  onPress={() => toggleDateExpansion(date)}
                  activeOpacity={0.7}>
                  <View>
                    <Text style={styles.dateText}>{date}</Text>
                    <Text style={styles.workoutCount}>
                      {workouts.length} workout{workouts.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.expandIcon}>
                    {isExpanded ? '−' : '+'}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.workoutsContainer}>
                    {workouts.map((workout, index) => {
                      const {totalSets, totalVolume} = getWorkoutStats(workout);
                      return (
                        <View key={workout.id} style={styles.workoutCard}>
                          <View style={styles.workoutHeader}>
                            <Text style={styles.workoutTime}>
                              {new Date(workout.timestamp).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                },
                              )}
                            </Text>
                            <Text style={styles.workoutDuration}>
                              {workout.duration} min
                            </Text>
                          </View>

                          <View style={styles.workoutStats}>
                            <View style={styles.stat}>
                              <Text style={styles.statValue}>
                                {workout.exercises.length}
                              </Text>
                              <Text style={styles.statLabel}>Exercises</Text>
                            </View>
                            <View style={styles.stat}>
                              <Text style={styles.statValue}>{totalSets}</Text>
                              <Text style={styles.statLabel}>Sets</Text>
                            </View>
                            <View style={styles.stat}>
                              <Text style={styles.statValue}>
                                {Math.round(totalVolume)}
                              </Text>
                              <Text style={styles.statLabel}>lbs</Text>
                            </View>
                          </View>

                          <View style={styles.exercisesList}>
                            {workout.exercises.map((exercise, exIndex) => (
                              <Text
                                key={`${exercise.id}-${exIndex}`}
                                style={styles.exerciseName}>
                                • {exercise.name}
                              </Text>
                            ))}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  dateSection: {
    marginBottom: 8,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  workoutCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  expandIcon: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: 'bold',
  },
  workoutsContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  workoutCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTime: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  workoutDuration: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseName: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 4,
    paddingLeft: 8,
  },
});
