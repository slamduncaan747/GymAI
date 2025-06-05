// screens/WorkoutSummaryScreen.tsx

import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Share,
  Animated,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {colors, typography, spacing} from '../themes';
import {Workout} from '../types/workout';
import Icon from 'react-native-vector-icons/Ionicons';

type WorkoutSummaryScreenRouteProp = RouteProp<
  RootStackParamList,
  'WorkoutSummary'
>;
type WorkoutSummaryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutSummary'
>;

export default function WorkoutSummaryScreen() {
  const navigation = useNavigation<WorkoutSummaryScreenNavigationProp>();
  const route = useRoute<WorkoutSummaryScreenRouteProp>();
  const {workout} = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, []);

  const getTotalVolume = () => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.weight || 0) * (set.actual || 0);
        }, 0)
      );
    }, 0);
  };

  const getTotalSets = () => {
    return workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.filter(set => set.completed).length;
    }, 0);
  };

  const getTotalReps = () => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.actual || 0);
        }, 0)
      );
    }, 0);
  };

  const getTopExercises = () => {
    return workout.exercises
      .map(exercise => {
        const totalVolume = exercise.sets.reduce(
          (sum, set) => sum + (set.weight || 0) * (set.actual || 0),
          0,
        );
        const maxWeight = Math.max(
          ...exercise.sets.map(set => set.weight || 0),
        );
        return {
          name: exercise.name,
          sets: exercise.sets.filter(set => set.completed).length,
          maxWeight,
          totalVolume,
        };
      })
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 3);
  };

  const handleShare = async () => {
    const topExercises = getTopExercises();
    const summary =
      `Workout Complete! 💪\n\n` +
      `Duration: ${workout.duration} minutes\n` +
      `Exercises: ${workout.exercises.length}\n` +
      `Total Sets: ${getTotalSets()}\n` +
      `Total Reps: ${getTotalReps()}\n` +
      `Volume: ${Math.round(getTotalVolume()).toLocaleString()} lbs\n\n` +
      `Top Exercises:\n${topExercises
        .map(ex => `• ${ex.name}: ${ex.maxWeight} lbs`)
        .join('\n')}`;

    try {
      await Share.share({
        message: summary,
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  };

  const handleDone = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  };

  const stats = [
    {
      value: workout.duration,
      label: 'Minutes',
      icon: 'time-outline',
    },
    {
      value: getTotalSets(),
      label: 'Sets',
      icon: 'refresh-outline',
    },
    {
      value: getTotalReps(),
      label: 'Reps',
      icon: 'repeat-outline',
    },
    {
      value: `${Math.round(getTotalVolume() / 1000)}k`,
      label: 'Volume',
      icon: 'barbell-outline',
    },
  ];

  const topExercises = getTopExercises();

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={[styles.scrollView, {opacity: fadeAnim}]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={styles.successIcon}>
            <Icon name="checkmark-circle" size={80} color={colors.success} />
          </View>
          <Text style={styles.title}>Great Work!</Text>
          <Text style={styles.subtitle}>
            You've completed your {workout.duration} minute workout
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Animated.View
              key={stat.label}
              style={[
                styles.statCard,
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
              <Icon name={stat.icon} size={24} color={colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Top Exercises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performances</Text>
          {topExercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseRow}>
              <View style={styles.exerciseRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseStats}>
                  {exercise.sets} sets • Max: {exercise.maxWeight} lbs
                </Text>
              </View>
              <Text style={styles.exerciseVolume}>
                {Math.round(exercise.totalVolume).toLocaleString()} lbs
              </Text>
            </View>
          ))}
        </View>

        {/* Exercise Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Exercises</Text>
          {workout.exercises.map((exercise, index) => {
            const completedSets = exercise.sets.filter(
              set => set.completed,
            ).length;
            const volume = exercise.sets.reduce(
              (sum, set) => sum + (set.weight || 0) * (set.actual || 0),
              0,
            );

            return (
              <View key={`${exercise.id}-${index}`} style={styles.summaryCard}>
                <Text style={styles.summaryName}>{exercise.name}</Text>
                <View style={styles.summaryStats}>
                  <Text style={styles.summaryStat}>
                    {completedSets}/{exercise.sets.length} sets
                  </Text>
                  <View style={styles.summaryDot} />
                  <Text style={styles.summaryStat}>
                    {Math.round(volume).toLocaleString()} lbs
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>

      {/* Action Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.8}>
          <Icon name="share-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.8}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.headline,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rankNumber: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.buttonText,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  exerciseStats: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  exerciseVolume: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  summaryCard: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  summaryDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: spacing.sm,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  shareButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  doneButton: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonText: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.semibold,
    color: colors.buttonText,
  },
});
