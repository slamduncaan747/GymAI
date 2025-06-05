// screens/WorkoutSelectScreen.tsx

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  Vibration,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {colors, typography, spacing} from '../themes';
import {Exercise} from '../types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';

type WorkoutSelectNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutSelect'
>;

const {width} = Dimensions.get('window');

const DURATION_OPTIONS = [
  {minutes: 15, label: 'Quick', exercises: '3-4 exercises'},
  {minutes: 30, label: 'Standard', exercises: '5-6 exercises'},
  {minutes: 45, label: 'Focused', exercises: '7-9 exercises'},
  {minutes: 60, label: 'Complete', exercises: '10-12 exercises'},
  {minutes: 90, label: 'Extended', exercises: '12+ exercises'},
];

const MUSCLE_GROUPS: {id: Exercise['category']; label: string}[] = [
  {id: 'chest', label: 'Chest'},
  {id: 'back', label: 'Back'},
  {id: 'shoulders', label: 'Shoulders'},
  {id: 'legs', label: 'Legs'},
  {id: 'arms', label: 'Arms'},
  {id: 'core', label: 'Core'},
  {id: 'full_body', label: 'Full Body'},
];

export default function WorkoutSelectScreen() {
  const navigation = useNavigation<WorkoutSelectNavigationProp>();
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<
    Exercise['category'][]
  >([]);
  const [userName, setUserName] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const muscleGroupAnims = useRef(
    MUSCLE_GROUPS.map(() => new Animated.Value(1)),
  ).current;

  useEffect(() => {
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
    const name = await AsyncStorage.getItem('userName');
    if (name) setUserName(name);
  };

  const handleDurationSelect = (duration: number) => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(1);
    }
    setSelectedDuration(duration);
  };

  const toggleMuscleGroup = (group: Exercise['category'], index: number) => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate(1);
    }

    // Animate the selection
    Animated.sequence([
      Animated.timing(muscleGroupAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(muscleGroupAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedMuscleGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group],
    );
  };

  const handleStartWorkout = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('WorkoutPreview', {
        duration: selectedDuration,
        focusAreas:
          selectedMuscleGroups.length > 0 ? selectedMuscleGroups : undefined,
      });
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const selectedOption = DURATION_OPTIONS.find(
    opt => opt.minutes === selectedDuration,
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        style={[styles.scrollView, {opacity: fadeAnim}]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View
          style={[styles.header, {transform: [{translateY: slideAnim}]}]}>
          <Text style={styles.greeting}>
            {getGreeting()}
            {userName ? `, ${userName}` : ''}
          </Text>
          <Text style={styles.title}>Start Your Workout</Text>
        </Animated.View>

        {/* Duration Selection */}
        <View style={styles.durationSection}>
          <Text style={styles.sectionLabel}>DURATION</Text>

          <View style={styles.durationDisplay}>
            <Text style={styles.durationNumber}>{selectedDuration}</Text>
            <Text style={styles.durationUnit}>minutes</Text>
          </View>

          {selectedOption && (
            <Text style={styles.durationInfo}>{selectedOption.exercises}</Text>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.durationScroll}
            snapToInterval={80}
            decelerationRate="fast">
            {DURATION_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.minutes}
                style={[
                  styles.durationOption,
                  selectedDuration === option.minutes &&
                    styles.durationOptionActive,
                ]}
                onPress={() => handleDurationSelect(option.minutes)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.durationOptionNumber,
                    selectedDuration === option.minutes &&
                      styles.durationOptionNumberActive,
                  ]}>
                  {option.minutes}
                </Text>
                <Text
                  style={[
                    styles.durationOptionLabel,
                    selectedDuration === option.minutes &&
                      styles.durationOptionLabelActive,
                  ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Focus Areas */}
        <View style={styles.focusSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>FOCUS AREAS</Text>
            <Text style={styles.sectionHint}>
              Optional • Select muscle groups
            </Text>
          </View>

          <View style={styles.muscleGrid}>
            {MUSCLE_GROUPS.map((group, index) => {
              const isSelected = selectedMuscleGroups.includes(group.id);
              return (
                <Animated.View
                  key={group.id}
                  style={{transform: [{scale: muscleGroupAnims[index]}]}}>
                  <TouchableOpacity
                    style={[
                      styles.muscleButton,
                      isSelected && styles.muscleButtonActive,
                    ]}
                    onPress={() => toggleMuscleGroup(group.id, index)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.muscleLabel,
                        isSelected && styles.muscleLabelActive,
                      ]}>
                      {group.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Quick Start Suggestions */}
        <View style={styles.suggestionsSection}>
          <Text style={styles.sectionLabel}>QUICK START</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsScroll}>
            <TouchableOpacity
              style={styles.suggestionCard}
              onPress={() => {
                setSelectedDuration(30);
                setSelectedMuscleGroups(['chest', 'arms']);
                handleStartWorkout();
              }}
              activeOpacity={0.8}>
              <Text style={styles.suggestionTitle}>Push Day</Text>
              <Text style={styles.suggestionSubtitle}>
                Chest & Arms • 30 min
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestionCard}
              onPress={() => {
                setSelectedDuration(45);
                setSelectedMuscleGroups(['back', 'shoulders']);
                handleStartWorkout();
              }}
              activeOpacity={0.8}>
              <Text style={styles.suggestionTitle}>Pull Day</Text>
              <Text style={styles.suggestionSubtitle}>
                Back & Shoulders • 45 min
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.suggestionCard}
              onPress={() => {
                setSelectedDuration(60);
                setSelectedMuscleGroups(['legs']);
                handleStartWorkout();
              }}
              activeOpacity={0.8}>
              <Text style={styles.suggestionTitle}>Leg Day</Text>
              <Text style={styles.suggestionSubtitle}>Lower Body • 60 min</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Animated.ScrollView>

      {/* Start Button */}
      <View style={styles.bottomContainer}>
        <Animated.View style={{transform: [{scale: buttonScale}]}}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
            activeOpacity={0.8}>
            <Text style={styles.startButtonText}>Generate Workout</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.bottomHint}>
          AI will create a personalized {selectedDuration}-minute workout
        </Text>
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
    paddingBottom: 160,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: typography.letterSpacing.wide,
  },
  title: {
    fontSize: typography.sizes.display,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  durationSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wider,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  durationDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  durationNumber: {
    fontSize: 72,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: -2,
  },
  durationUnit: {
    fontSize: typography.sizes.headline,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  durationInfo: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  durationScroll: {
    paddingHorizontal: spacing.lg,
  },
  durationOption: {
    width: 72,
    height: 72,
    marginHorizontal: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  durationOptionActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  durationOptionNumber: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  durationOptionNumberActive: {
    color: colors.primary,
  },
  durationOptionLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  durationOptionLabelActive: {
    color: colors.primary,
  },
  focusSection: {
    paddingVertical: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHint: {
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  muscleButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    margin: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  muscleButtonActive: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primary,
  },
  muscleLabel: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  muscleLabelActive: {
    color: colors.primary,
  },
  suggestionsSection: {
    paddingTop: spacing.lg,
  },
  suggestionsScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  suggestionCard: {
    width: 160,
    padding: spacing.lg,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionTitle: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  suggestionSubtitle: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.semibold,
    color: colors.buttonText,
    letterSpacing: typography.letterSpacing.wide,
  },
  bottomHint: {
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
