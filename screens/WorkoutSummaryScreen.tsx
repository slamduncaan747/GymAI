// screens/WorkoutSummaryScreen.tsx

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Share,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {colors} from '../themes/colors';
import {Workout} from '../types/workout';

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

  const [personalRecords, setPersonalRecords] = useState<string[]>([]);

  useEffect(() => {
    // Check for potential PRs (simplified - you might want more sophisticated logic)
    const prs: string[] = [];
    workout.exercises.forEach(exercise => {
      const maxWeight = Math.max(...exercise.sets.map(set => set.weight || 0));
      if (maxWeight > 0) {
        // This is a simplified check - in reality you'd compare against historical data
        prs.push(`${exercise.name}: ${maxWeight} lbs`);
      }
    });
    setPersonalRecords(prs.slice(0, 3)); // Show top 3
  }, [workout]);

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

  const getWorkoutDuration = () => {
    if (workout.timestamp && workout.completed) {
      // Calculate actual duration based on start/end times
      // For now, using the planned duration
      return workout.duration;
    }
    return workout.duration;
  };

  const handleShare = async () => {
    const summary =
      `💪 Workout Complete!\n\n` +
      `Duration: ${getWorkoutDuration()} minutes\n` +
      `Exercises: ${workout.exercises.length}\n` +
      `Sets: ${getTotalSets()}\n` +
      `Reps: ${getTotalReps()}\n` +
      `Volume: ${Math.round(getTotalVolume())} lbs\n\n` +
      `Exercises:\n${workout.exercises.map(ex => `• ${ex.name}`).join('\n')}`;

    try {
      await Share.share({
        message: summary,
        title: 'My Workout Summary',
      });
    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  };

  const handleDone = () => {
    // Navigate back to the main tabs
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  };

  const handleStartAnother = () => {
    // Navigate to workout select (which is the default tab)
    navigation.reset({
      index: 0,
      routes: [{name: 'MainTabs'}],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workout Complete! 🎉</Text>
          <Text style={styles.subtitle}>Great job crushing your workout</Text>
        </View>

        {/* Key Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getWorkoutDuration()}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{workout.exercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getTotalSets()}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round(getTotalVolume())}
            </Text>
            <Text style={styles.statLabel}>lbs Volume</Text>
          </View>
        </View>

        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Strong Lifts Today</Text>
            <View style={styles.prContainer}>
              {personalRecords.map((pr, index) => (
                <View key={index} style={styles.prCard}>
                  <Text style={styles.prText}>{pr}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Exercise Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Summary</Text>
          <View style={styles.exercisesContainer}>
            {workout.exercises.map((exercise, index) => {
              const completedSets = exercise.sets.filter(
                set => set.completed,
              ).length;
              const totalSets = exercise.sets.length;
              const maxWeight = Math.max(
                ...exercise.sets.map(set => set.weight || 0),
              );
              const totalReps = exercise.sets.reduce(
                (sum, set) => sum + (set.actual || 0),
                0,
              );

              return (
                <View
                  key={`${exercise.id}-${index}`}
                  style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseCompletion}>
                      {completedSets}/{totalSets} sets
                    </Text>
                  </View>
                  <View style={styles.exerciseStats}>
                    <Text style={styles.exerciseStat}>
                      Max: {maxWeight > 0 ? `${maxWeight} lbs` : 'Bodyweight'}
                    </Text>
                    <Text style={styles.exerciseStat}>
                      Total Reps: {totalReps}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Achievement Badge */}
        <View style={styles.achievementContainer}>
          <View style={styles.achievementBadge}>
            <Text style={styles.achievementIcon}>💪</Text>
            <Text style={styles.achievementText}>Consistency is Key</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.8}>
          <Text style={styles.shareButtonText}>📤 Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.anotherButton}
          onPress={handleStartAnother}
          activeOpacity={0.8}>
          <Text style={styles.anotherButtonText}>Start Another</Text>
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
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  prContainer: {
    gap: 8,
  },
  prCard: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  prText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttonText,
  },
  exercisesContainer: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  exerciseCompletion: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseStat: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  achievementContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  achievementBadge: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  anotherButton: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  anotherButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
});
