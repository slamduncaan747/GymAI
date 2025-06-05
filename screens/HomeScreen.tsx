// screens/HomeScreen.tsx

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {useWorkout} from '../context/WorkoutContext';
import {colors, typography, spacing} from '../themes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

export default function HomeScreen() {
  const {loadSavedWorkouts, savedWorkouts} = useWorkout();
  const [userName, setUserName] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadSavedWorkouts();
    loadUserName();

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

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const stats = {
    totalWorkouts: savedWorkouts.length,
    thisWeek: savedWorkouts.filter(
      w => w.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000,
    ).length,
    totalVolume: savedWorkouts.reduce((total, workout) => {
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
    }, 0),
    streak: calculateStreak(savedWorkouts),
  };

  function calculateStreak(workouts: any[]) {
    if (workouts.length === 0) return 0;

    const sortedWorkouts = [...workouts].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.timestamp);
      workoutDate.setHours(0, 0, 0, 0);
      const dayDiff = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff === streak) {
        streak++;
      } else if (dayDiff > streak) {
        break;
      }
    }

    return streak;
  }

  function getPersonalRecords() {
    const prs: {[key: string]: {weight: number; reps: number; date: string}} =
      {};

    savedWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.actual > 0 && set.weight > 0) {
            const key = exercise.name;
            if (!prs[key] || set.weight > prs[key].weight) {
              prs[key] = {
                weight: set.weight,
                reps: set.actual,
                date: new Date(workout.timestamp).toLocaleDateString(),
              };
            }
          }
        });
      });
    });

    return Object.entries(prs)
      .slice(0, 3)
      .map(([exercise, pr]) => ({
        exercise,
        weight: pr.weight,
        reps: pr.reps,
        date: pr.date,
      }));
  }

  const personalRecords = getPersonalRecords();

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={[styles.scrollView, {opacity: fadeAnim}]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View
          style={[styles.header, {transform: [{translateY: slideAnim}]}]}>
          <Text style={styles.screenTitle}>Progress</Text>
          {stats.streak > 0 && (
            <View style={styles.streakBadge}>
              <Icon name="flame" size={16} color={colors.warning} />
              <Text style={styles.streakText}>{stats.streak} days</Text>
            </View>
          )}
        </Animated.View>

        {/* Hero Stats */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <Text style={styles.heroNumber}>{stats.totalWorkouts}</Text>
            <Text style={styles.heroLabel}>Total Workouts</Text>
            <View style={styles.heroProgress}>
              <View
                style={[
                  styles.heroProgressBar,
                  {width: `${Math.min(stats.totalWorkouts * 2, 100)}%`},
                ]}
              />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.thisWeek}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {Math.round(stats.totalVolume / 1000)}k
              </Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
          </View>
        </View>

        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Records</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>

            {personalRecords.map((pr, index) => (
              <TouchableOpacity
                key={index}
                style={styles.prCard}
                activeOpacity={0.8}>
                <View style={styles.prIcon}>
                  <Icon name="trophy" size={20} color={colors.warning} />
                </View>
                <View style={styles.prContent}>
                  <Text style={styles.prExercise}>{pr.exercise}</Text>
                  <Text style={styles.prStats}>
                    {pr.weight} lbs × {pr.reps} reps
                  </Text>
                </View>
                <Text style={styles.prDate}>{pr.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Icon
                name="chevron-forward"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {savedWorkouts.length > 0 ? (
            savedWorkouts.slice(0, 5).map((workout, index) => {
              const date = new Date(workout.timestamp);
              const volume = workout.exercises.reduce(
                (total, ex) =>
                  total +
                  ex.sets.reduce(
                    (sum, set) => sum + (set.weight * set.actual || 0),
                    0,
                  ),
                0,
              );

              return (
                <TouchableOpacity
                  key={workout.id}
                  style={styles.activityCard}
                  activeOpacity={0.8}>
                  <View style={styles.activityDate}>
                    <Text style={styles.activityDay}>{date.getDate()}</Text>
                    <Text style={styles.activityMonth}>
                      {date.toLocaleDateString('en-US', {month: 'short'})}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      {workout.exercises.length} exercises • {workout.duration}{' '}
                      min
                    </Text>
                    <View style={styles.activityStats}>
                      <Text style={styles.activityStat}>
                        {workout.exercises.reduce(
                          (sum, ex) =>
                            sum + ex.sets.filter(s => s.completed).length,
                          0,
                        )}{' '}
                        sets
                      </Text>
                      <View style={styles.activityDot} />
                      <Text style={styles.activityStat}>
                        {Math.round(volume)} lbs
                      </Text>
                    </View>
                  </View>
                  <Icon
                    name="chevron-forward"
                    size={20}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyCard}>
              <Icon
                name="barbell-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyText}>No workouts yet</Text>
              <Text style={styles.emptySubtext}>
                Start your first workout to track progress
              </Text>
            </View>
          )}
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteSection}>
          <Text style={styles.quote}>
            "The only bad workout is the one that didn't happen"
          </Text>
        </View>
      </Animated.ScrollView>
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  streakText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroNumber: {
    fontSize: 64,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -2,
  },
  heroLabel: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  heroProgress: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  heroProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.headline,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  prCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  prContent: {
    flex: 1,
  },
  prExercise: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  prStats: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  prDate: {
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  activityDate: {
    width: 48,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityDay: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  activityMonth: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  activityStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  activityStat: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  activityDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.sizes.body,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  quoteSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  quote: {
    fontSize: typography.sizes.body,
    fontStyle: 'italic',
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
