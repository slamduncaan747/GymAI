// screens/WorkoutSelectScreen.tsx

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import {RootStackParamList} from '../../App';
import {colors} from '../../themes/colors';
import {Exercise} from '../../types/workout';

type WorkoutSelectNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutSelect'
>;

const DURATION_OPTIONS = [
  {minutes: 15, label: 'Quick', description: '3-4 exercises', icon: '⚡'},
  {minutes: 30, label: 'Standard', description: '5-6 exercises', icon: '💪'},
  {minutes: 45, label: 'Focused', description: '7-9 exercises', icon: '🎯'},
  {minutes: 60, label: 'Complete', description: '10-12 exercises', icon: '🔥'},
  {minutes: 90, label: 'Extended', description: '12+ exercises', icon: '💯'},
];

const MUSCLE_GROUPS: {id: Exercise['category']; label: string; icon: string}[] =
  [
    {id: 'chest', label: 'Chest', icon: '🏋️'},
    {id: 'back', label: 'Back', icon: '🦾'},
    {id: 'shoulders', label: 'Shoulders', icon: '💪'},
    {id: 'legs', label: 'Legs', icon: '🦵'},
    {id: 'arms', label: 'Arms', icon: '💪'},
    {id: 'core', label: 'Core', icon: '🎯'},
  ];

export default function WorkoutSelectScreen() {
  const navigation = useNavigation<WorkoutSelectNavigationProp>();
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<
    Exercise['category'][]
  >([]);
  const [useAI, setUseAI] = useState(true);

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
  };

  const toggleMuscleGroup = (group: Exercise['category']) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group],
    );
  };

  const handleStartWorkout = () => {
    if (!selectedDuration) return;

    // Pass additional params for AI generation
    navigation.navigate('Workout', {
      duration: selectedDuration,
      focusAreas:
        selectedMuscleGroups.length > 0 ? selectedMuscleGroups : undefined,
      useAI: useAI,
    });
  };

  const isReadyToStart = selectedDuration !== null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Your Workout</Text>
          <View style={styles.placeholder} />
        </View>

        {/* AI Toggle */}
        <View style={styles.aiToggleCard}>
          <View style={styles.aiToggleContent}>
            <Text style={styles.aiToggleIcon}>🤖</Text>
            <View style={styles.aiToggleTextContainer}>
              <Text style={styles.aiToggleTitle}>AI-Powered Workout</Text>
              <Text style={styles.aiToggleSubtitle}>
                Get personalized exercise selection
              </Text>
            </View>
          </View>
          <Switch
            value={useAI}
            onValueChange={setUseAI}
            trackColor={{false: colors.inputBackground, true: colors.accent}}
            thumbColor={colors.buttonText}
          />
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Duration</Text>
          <View style={styles.durationContainer}>
            {DURATION_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.minutes}
                style={[
                  styles.durationCard,
                  selectedDuration === option.minutes &&
                    styles.durationCardSelected,
                ]}
                onPress={() => handleDurationSelect(option.minutes)}
                activeOpacity={0.8}>
                <Text style={styles.durationIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.durationNumber,
                    selectedDuration === option.minutes &&
                      styles.durationNumberSelected,
                  ]}>
                  {option.minutes}
                </Text>
                <Text
                  style={[
                    styles.durationLabel,
                    selectedDuration === option.minutes &&
                      styles.durationLabelSelected,
                  ]}>
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.durationDescription,
                    selectedDuration === option.minutes &&
                      styles.durationDescriptionSelected,
                  ]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Focus Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Focus Areas <Text style={styles.sectionSubtitle}>(Optional)</Text>
          </Text>
          <View style={styles.muscleGroupContainer}>
            {MUSCLE_GROUPS.map(group => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.muscleGroupCard,
                  selectedMuscleGroups.includes(group.id) &&
                    styles.muscleGroupCardSelected,
                ]}
                onPress={() => toggleMuscleGroup(group.id)}
                activeOpacity={0.8}>
                <Text style={styles.muscleGroupIcon}>{group.icon}</Text>
                <Text
                  style={[
                    styles.muscleGroupLabel,
                    selectedMuscleGroups.includes(group.id) &&
                      styles.muscleGroupLabelSelected,
                  ]}>
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            !isReadyToStart && styles.startButtonDisabled,
          ]}
          onPress={handleStartWorkout}
          disabled={!isReadyToStart}
          activeOpacity={0.9}>
          <LinearGradient
            colors={
              isReadyToStart
                ? [colors.accent, '#ff8c00']
                : [colors.inputBackground, colors.inputBackground]
            }
            style={styles.startButtonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <Text style={styles.startButtonText}>
              {isReadyToStart ? 'Generate Workout' : 'Select Duration'}
            </Text>
          </LinearGradient>
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  aiToggleCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiToggleIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  aiToggleTextContainer: {
    flex: 1,
  },
  aiToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  aiToggleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'normal',
    color: colors.textSecondary,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  durationCard: {
    width: '31%',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.cardBackground,
  },
  durationIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  durationNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  durationNumberSelected: {
    color: colors.accent,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  durationLabelSelected: {
    color: colors.accent,
  },
  durationDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  durationDescriptionSelected: {
    color: colors.textSecondary,
  },
  muscleGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  muscleGroupCard: {
    width: '31%',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  muscleGroupCardSelected: {
    borderColor: colors.accent,
  },
  muscleGroupIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  muscleGroupLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  muscleGroupLabelSelected: {
    color: colors.accent,
  },
  startButton: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  startButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttonText,
    letterSpacing: 0.5,
  },
});
