import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useWorkout} from '../context/WorkoutContext';
import {colors, typography, spacing, shadows} from '../themes';
import Card from '../components/common/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

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

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.timestamp);
      const dayDiff = Math.floor(
        (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDiff <= streak + 1) {
        streak = dayDiff + 1;
      } else {
        break;
      }
    }

    return streak;
  }

  function getPersonalRecords() {
    const prs: any[] = [];
    const exercisePRs: {
      [key: string]: {weight: number; reps: number; date: string};
    } = {};

    savedWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.actual > 0 && set.weight > 0) {
            const key = exercise.name;
            if (!exercisePRs[key] || set.weight > exercisePRs[key].weight) {
              exercisePRs[key] = {
                weight: set.weight,
                reps: set.actual,
                date: new Date(workout.timestamp).toLocaleDateString(),
              };
            }
          }
        });
      });
    });

    return Object.entries(exercisePRs)
      .slice(0, 5)
      .map(([exercise, pr]) => ({
        exercise,
        weight: pr.weight,
        reps: pr.reps,
        date: pr.date,
      }));
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      'Every rep counts',
      'Stronger than yesterday',
      'Progress, not perfection',
      'Crush your goals',
      'Stay consistent',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{userName || 'Athlete'} 💪</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>{stats.streak}</Text>
              <Text style={styles.streakLabel}>
                day{stats.streak !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Text style={styles.quote}>"{getMotivationalQuote()}"</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
            <View
              style={[styles.statContainer, {backgroundColor: colors.primary}]}>
              <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
            <View
              style={[styles.statContainer, {backgroundColor: colors.success}]}>
              <Text style={styles.statNumber}>{stats.thisWeek}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
            <View
              style={[
                styles.statContainer,
                {backgroundColor: colors.secondary},
              ]}>
              <Text style={styles.statNumber}>
                {Math.round(stats.totalVolume / 1000)}k
              </Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
            <View
              style={[styles.statContainer, {backgroundColor: colors.warning}]}>
              <Text style={styles.statNumber}>
                {savedWorkouts.length > 0
                  ? Math.round(stats.totalVolume / stats.totalWorkouts)
                  : 0}
              </Text>
              <Text style={styles.statLabel}>Avg Volume</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Personal Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {getPersonalRecords().length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.prScroll}>
              {getPersonalRecords().map((pr, index) => (
                <Card key={index} style={styles.prCard} variant="elevated">
                  <View style={styles.prIcon}>
                    <Text style={styles.prEmoji}>🏆</Text>
                  </View>
                  <Text style={styles.prExercise} numberOfLines={1}>
                    {pr.exercise}
                  </Text>
                  <Text style={styles.prValue}>
                    {pr.weight} lbs × {pr.reps}
                  </Text>
                  <Text style={styles.prDate}>{pr.date}</Text>
                </Card>
              ))}
            </ScrollView>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No records yet</Text>
              <Text style={styles.emptySubtext}>
                Complete workouts to set personal records
              </Text>
            </Card>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>History →</Text>
            </TouchableOpacity>
          </View>

          {savedWorkouts.length > 0 ? (
            savedWorkouts.slice(0, 3).map((workout, index) => (
              <Card
                key={workout.id}
                style={styles.activityCard}
                variant="elevated">
                <View style={styles.activityHeader}>
                  <View style={styles.activityDate}>
                    <Text style={styles.activityDay}>
                      {new Date(workout.timestamp).getDate()}
                    </Text>
                    <Text style={styles.activityMonth}>
                      {new Date(workout.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>
                      {workout.name ||
                        `Workout #${savedWorkouts.length - index}`}
                    </Text>
                    <Text style={styles.activityStats}>
                      {workout.duration} min • {workout.exercises.length}{' '}
                      exercises
                    </Text>
                  </View>
                  <View style={styles.activityVolume}>
                    <Text style={styles.volumeNumber}>
                      {Math.round(
                        workout.exercises.reduce(
                          (total, ex) =>
                            total +
                            ex.sets.reduce(
                              (sum, set) =>
                                sum + (set.weight * set.actual || 0),
                              0,
                            ),
                          0,
                        ),
                      )}
                    </Text>
                    <Text style={styles.volumeLabel}>lbs</Text>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No workouts yet</Text>
              <Text style={styles.emptySubtext}>
                Start your fitness journey today!
              </Text>
            </Card>
          )}
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
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    backgroundColor: colors.backgroundLight,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.heavy,
    color: colors.textPrimary,
  },
  streakBadge: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    ...shadows.medium,
  },
  streakNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  streakLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textPrimary,
    opacity: 0.9,
  },
  quote: {
    fontSize: typography.sizes.lg,
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginTop: -spacing.md,
  },
  statCard: {
    width: (width - spacing.md * 3) / 2,
    margin: spacing.xs,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  statContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.heavy,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    opacity: 0.9,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  prScroll: {
    paddingHorizontal: spacing.lg,
  },
  prCard: {
    width: 140,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  prIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  prEmoji: {
    fontSize: 24,
  },
  prExercise: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  prValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  prDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  activityCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDate: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityDay: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  activityMonth: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  activityStats: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  activityVolume: {
    alignItems: 'center',
  },
  volumeNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  volumeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
});
