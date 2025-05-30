// screens/HomeScreen.tsx

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {useWorkout} from '../context/WorkoutContext';
import {colors} from '../themes/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const {width} = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
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

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutSelect');
  };

  const getTotalWorkouts = () => savedWorkouts.length;

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

  const getRecentWorkouts = () => {
    return savedWorkouts.slice(0, 5).map(workout => ({
      id: workout.id,
      date: new Date(workout.timestamp).toLocaleDateString(),
      duration: workout.duration,
      exercises: workout.exercises.length,
      volume: workout.exercises.reduce((total, exercise) => {
        return (
          total +
          exercise.sets.reduce((setTotal, set) => {
            return setTotal + (set.weight * set.actual || 0);
          }, 0)
        );
      }, 0),
    }));
  };

  const getPersonalRecords = () => {
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

    return Object.entries(prs).slice(0, 4);
  };

  const recentWorkouts = getRecentWorkouts();
  const personalRecords = getPersonalRecords();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              {userName ? `Hi, ${userName}` : 'Ready to Train?'}
            </Text>
            <Text style={styles.subtitleText}>Start your workout</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings' as any)}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Main CTA Button */}
        <TouchableOpacity
          style={styles.mainCTAButton}
          onPress={handleStartWorkout}
          activeOpacity={0.9}>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaText}>START WORKOUT</Text>
            <Text style={styles.ctaSubtext}>Create your training session</Text>
          </View>
        </TouchableOpacity>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{getTotalWorkouts()}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={[styles.statCard, styles.statCardMiddle]}>
              <Text style={styles.statNumber}>{getThisWeekWorkouts()}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {Math.round(getTotalVolume() / 1000)}k
              </Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
          </View>
        </View>

        {/* Personal Records */}
        {personalRecords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <View style={styles.recordsContainer}>
              {personalRecords.map(([exercise, record]) => (
                <View key={exercise} style={styles.recordCard}>
                  <Text style={styles.recordExercise} numberOfLines={1}>
                    {exercise}
                  </Text>
                  <Text style={styles.recordValue}>
                    {record.weight}lbs × {record.reps}
                  </Text>
                  <Text style={styles.recordDate}>{record.date}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <View style={styles.workoutsContainer}>
              {recentWorkouts.map(workout => (
                <View key={workout.id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutDate}>{workout.date}</Text>
                    <Text style={styles.workoutDuration}>
                      {workout.duration} min
                    </Text>
                  </View>
                  <Text style={styles.workoutDetails}>
                    {workout.exercises} exercises • {Math.round(workout.volume)}{' '}
                    lbs
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {savedWorkouts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No workouts yet</Text>
            <Text style={styles.emptyStateText}>
              Start your first workout to track your progress
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  mainCTAButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ctaContent: {
    backgroundColor: colors.accent,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.buttonText,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  ctaSubtext: {
    color: colors.buttonText,
    fontSize: 14,
    opacity: 0.9,
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
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statCardMiddle: {
    marginHorizontal: 10,
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
  recordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recordCard: {
    width: (width - 50) / 2,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordExercise: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 4,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  workoutsContainer: {
    gap: 12,
  },
  workoutCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  workoutDuration: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  workoutDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
