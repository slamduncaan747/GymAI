// screens/WorkoutSelectScreen.tsx

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {colors} from '../themes/colors';
import {Exercise} from '../types/workout';

type WorkoutSelectNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutSelect'
>;

const TIME_OPTIONS = [
  {minutes: 15, label: 'Quick', exercises: '3-4'},
  {minutes: 30, label: 'Standard', exercises: '5-6'},
  {minutes: 45, label: 'Full', exercises: '7-8'},
  {minutes: 60, label: 'Extended', exercises: '9-10'},
];

const MUSCLE_GROUPS: {id: Exercise['category']; label: string}[] = [
  {id: 'chest', label: 'Chest'},
  {id: 'back', label: 'Back'},
  {id: 'shoulders', label: 'Shoulders'},
  {id: 'legs', label: 'Legs'},
  {id: 'arms', label: 'Arms'},
  {id: 'core', label: 'Core'},
];

export default function WorkoutSelectScreen() {
  const navigation = useNavigation<WorkoutSelectNavigationProp>();
  const [selectedTime, setSelectedTime] = useState<number>(30); // Default 30 min
  const [selectedMuscles, setSelectedMuscles] = useState<
    Exercise['category'][]
  >([]);

  const toggleMuscle = (muscle: Exercise['category']) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle],
    );
  };

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutPreview', {
      duration: selectedTime,
      focusAreas: selectedMuscles.length > 0 ? selectedMuscles : undefined,
      useAI: true, // Always true
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>New Workout</Text>
          <Text style={styles.subtitle}>
            AI will create your perfect workout
          </Text>
        </View>

        {/* Time Selector - Horizontal Pills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DURATION</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.timeScroll}>
            {TIME_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.minutes}
                style={[
                  styles.timePill,
                  selectedTime === option.minutes && styles.timePillSelected,
                ]}
                onPress={() => setSelectedTime(option.minutes)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.timeMinutes,
                    selectedTime === option.minutes &&
                      styles.timeMinutesSelected,
                  ]}>
                  {option.minutes} min
                </Text>
                <Text
                  style={[
                    styles.timeExercises,
                    selectedTime === option.minutes &&
                      styles.timeExercisesSelected,
                  ]}>
                  {option.exercises} exercises
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Muscle Groups */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TARGET MUSCLES</Text>
            <Text style={styles.sectionHint}>Leave empty for full body</Text>
          </View>

          <View style={styles.muscleGrid}>
            {MUSCLE_GROUPS.map(muscle => (
              <TouchableOpacity
                key={muscle.id}
                style={[
                  styles.muscleButton,
                  selectedMuscles.includes(muscle.id) &&
                    styles.muscleButtonSelected,
                ]}
                onPress={() => toggleMuscle(muscle.id)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.muscleText,
                    selectedMuscles.includes(muscle.id) &&
                      styles.muscleTextSelected,
                  ]}>
                  {muscle.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Workout Type Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>AI Optimized</Text>
            <Text style={styles.infoText}>
              Your workout will be personalized based on:
            </Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Your workout history</Text>
              <Text style={styles.infoItem}>• Exercise variety</Text>
              <Text style={styles.infoItem}>• Progressive overload</Text>
              <Text style={styles.infoItem}>• Muscle recovery</Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
          activeOpacity={0.8}>
          <Text style={styles.startButtonText}>Generate Workout</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  // Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  // Time Pills
  timeScroll: {
    paddingHorizontal: 20,
  },
  timePill: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  timePillSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.cardBackgroundSecondary,
  },
  timeMinutes: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  timeMinutesSelected: {
    color: colors.accent,
  },
  timeExercises: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  timeExercisesSelected: {
    color: colors.textPrimary,
  },
  // Muscle Groups
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  muscleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  muscleButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  muscleText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  muscleTextSelected: {
    color: colors.buttonText,
  },
  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  infoList: {
    gap: 4,
  },
  infoItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // Start Button
  startButton: {
    backgroundColor: colors.accent,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.buttonText,
  },
});
