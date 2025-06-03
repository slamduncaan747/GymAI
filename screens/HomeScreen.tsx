// screens/HomeScreen.tsx (Progress Tab)

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useWorkout} from '../context/WorkoutContext';
import {colors} from '../themes/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

export default function HomeScreen() {
  const {loadSavedWorkouts, savedWorkouts} = useWorkout();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadSavedWorkouts();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const getThisWeekWorkouts = () => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return savedWorkouts.filter(workout => workout.timestamp > oneWeekAgo)
      .length;
  };

  const getTotalVolume = () => {
    return savedWorkouts.reduce((total, workout) => {
      return (
        total +
        workout.exercises.reduce((workoutTotal, exercise) => {
          return (
            workoutTotal +
            exercise.sets.reduce((setTotal, set) => {
              return setTotal + (set.weight * set.actual || 0);
            }, 0)
          );
        }, 0)
      );
    }, 0);
  };

  const getWeeklyStreak = () => {
    // Simple streak calculation
    const weeks = Math.floor(savedWorkouts.length / 3); // Rough estimate
    return Math.max(0, weeks);
  };

  const getPersonalRecords = () => {
    const prs: {[key: string]: {weight: number; reps: number; date: Date}} = {};

    savedWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.actual > 0 && set.weight > 0) {
            const key = exercise.name;
            if (!prs[key] || set.weight > prs[key].weight) {
              prs[key] = {
                weight: set.weight,
                reps: set.actual,
                date: new Date(workout.timestamp),
              };
            }
          }
        });
      });
    });

    return Object.entries(prs)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 3);
  };

  const personalRecords = getPersonalRecords();

  if (savedWorkouts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon
              name="barbell-outline"
              size={64}
              color={colors.textTertiary}
            />
          </View>
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptyText}>
            Complete your first workout to begin tracking your progress
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Progress</Text>
          {userName && (
            <Text style={styles.welcomeText}>Welcome back, {userName}</Text>
          )}
        </View>

        {/* Overview Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardsContainer}
          contentContainerStyle={styles.cardsContent}>
          <View style={[styles.overviewCard, styles.primaryCard]}>
            <View style={styles.cardHeader}>
              <Icon name="flame" size={24} color={colors.warning} />
              <Text style={styles.cardLabel}>Streak</Text>
            </View>
            <Text style={styles.cardValue}>{getWeeklyStreak()}</Text>
            <Text style={styles.cardUnit}>weeks</Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.cardHeader}>
              <Icon name="calendar-outline" size={24} color={colors.accent} />
              <Text style={styles.cardLabel}>This Week</Text>
            </View>
            <Text style={styles.cardValue}>{getThisWeekWorkouts()}</Text>
            <Text style={styles.cardUnit}>workouts</Text>
          </View>

          <View style={styles.overviewCard}>
            <View style={styles.cardHeader}>
              <Icon name="analytics" size={24} color={colors.success} />
              <Text style={styles.cardLabel}>Total Volume</Text>
            </View>
            <Text style={styles.cardValue}>
              {Math.round(getTotalVolume() / 1000)}k
            </Text>
            <Text style={styles.cardUnit}>pounds</Text>
          </View>
        </ScrollView>

        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Records</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {personalRecords.map(([exercise, record], index) => (
              <TouchableOpacity key={exercise} style={styles.recordCard}>
                <View style={styles.recordRank}>
                  <Text style={styles.recordRankText}>#{index + 1}</Text>
                </View>
                <View style={styles.recordContent}>
                  <Text style={styles.recordExercise}>{exercise}</Text>
                  <Text style={styles.recordDate}>
                    {record.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.recordStats}>
                  <Text style={styles.recordWeight}>{record.weight} lbs</Text>
                  <Text style={styles.recordReps}>{record.reps} reps</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {savedWorkouts.slice(0, 5).map((workout, index) => {
            const volume = workout.exercises.reduce((total, exercise) => {
              return (
                total +
                exercise.sets.reduce((setTotal, set) => {
                  return setTotal + (set.weight * set.actual || 0);
                }, 0)
              );
            }, 0);

            const isToday =
              new Date(workout.timestamp).toDateString() ===
              new Date().toDateString();
            const isYesterday =
              new Date(workout.timestamp).toDateString() ===
              new Date(Date.now() - 86400000).toDateString();

            return (
              <TouchableOpacity key={workout.id} style={styles.activityCard}>
                <View style={styles.activityLeft}>
                  <Text style={styles.activityDate}>
                    {isToday
                      ? 'Today'
                      : isYesterday
                      ? 'Yesterday'
                      : new Date(workout.timestamp).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                  </Text>
                  <View style={styles.activityStats}>
                    <Text style={styles.activityStat}>
                      <Icon
                        name="time-outline"
                        size={14}
                        color={colors.textSecondary}
                      />{' '}
                      {workout.duration} min
                    </Text>
                    <Text style={styles.activityDot}>•</Text>
                    <Text style={styles.activityStat}>
                      {workout.exercises.length} exercises
                    </Text>
                  </View>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityVolume}>
                    {Math.round(volume)}
                  </Text>
                  <Text style={styles.activityVolumeLabel}>lbs</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
  welcomeText: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  // Overview Cards
  cardsContainer: {
    marginBottom: 32,
  },
  cardsContent: {
    paddingHorizontal: 20,
  },
  overviewCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryCard: {
    borderColor: colors.warning,
    backgroundColor: colors.cardBackgroundSecondary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardUnit: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
  },
  // Personal Records
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  recordContent: {
    flex: 1,
  },
  recordExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  recordStats: {
    alignItems: 'flex-end',
  },
  recordWeight: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 2,
  },
  recordReps: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Activity
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityLeft: {
    flex: 1,
  },
  activityDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  activityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityStat: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activityDot: {
    color: colors.textTertiary,
    marginHorizontal: 8,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityVolume: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activityVolumeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
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
});
