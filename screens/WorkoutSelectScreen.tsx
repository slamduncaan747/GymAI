import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import {RootStackParamList} from '../App';
import {colors, typography, spacing, shadows} from '../themes';
import Card from '../components/common/Card';
import GradientButton from '../components/common/GradientButton';
import {Exercise} from '../types/workout';

type WorkoutSelectNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutSelect'
>;

const DURATION_OPTIONS = [
  {
    minutes: 15,
    label: 'Quick',
    description: '3-4 exercises',
    icon: '⚡',
    color: '#FFE66D',
  },
  {
    minutes: 30,
    label: 'Standard',
    description: '5-6 exercises',
    icon: '💪',
    color: '#4ECDC4',
  },
  {
    minutes: 45,
    label: 'Focused',
    description: '7-9 exercises',
    icon: '🎯',
    color: '#00D9FF',
  },
  {
    minutes: 60,
    label: 'Complete',
    description: '10-12 exercises',
    icon: '🔥',
    color: '#FF6B6B',
  },
  {
    minutes: 90,
    label: 'Extended',
    description: '12+ exercises',
    icon: '💯',
    color: '#9B59B6',
  },
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
  const [scaleAnims] = useState(() =>
    DURATION_OPTIONS.map(() => new Animated.Value(1)),
  );

  const handleDurationSelect = (duration: number, index: number) => {
    // Animate the selection
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedDuration(duration);
  };

  const toggleMuscleGroup = (group: Exercise['category']) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group],
    );
  };

  const handleStartWorkout = () => {
    if (!selectedDuration) return;

    navigation.navigate('WorkoutPreview', {
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
          <Text style={styles.title}>Create Workout</Text>
          <Text style={styles.subtitle}>
            Design your perfect training session
          </Text>
        </View>

        {/* AI Toggle Card */}
        <Card style={styles.aiCard} variant="elevated">
          <View style={styles.aiContent}>
            <View style={styles.aiIcon}>
              <LinearGradient
                colors={['#00D9FF', '#0099CC']}
                style={styles.aiIconGradient}>
                <Text style={styles.aiEmoji}>🤖</Text>
              </LinearGradient>
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiTitle}>AI-Powered</Text>
              <Text style={styles.aiSubtitle}>
                Personalized exercise selection
              </Text>
            </View>
            <Switch
              value={useAI}
              onValueChange={setUseAI}
              trackColor={{false: colors.disabled, true: colors.primary}}
              thumbColor={colors.textPrimary}
              ios_backgroundColor={colors.disabled}
            />
          </View>
        </Card>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duration</Text>
          <Text style={styles.sectionSubtitle}>
            How long do you want to train?
          </Text>

          <View style={styles.durationGrid}>
            {DURATION_OPTIONS.map((option, index) => (
              <Animated.View
                key={option.minutes}
                style={[
                  styles.durationCardWrapper,
                  {transform: [{scale: scaleAnims[index]}]},
                ]}>
                <TouchableOpacity
                  style={[
                    styles.durationCard,
                    selectedDuration === option.minutes &&
                      styles.durationCardSelected,
                  ]}
                  onPress={() => handleDurationSelect(option.minutes, index)}
                  activeOpacity={0.8}>
                  <View
                    style={[
                      styles.durationIcon,
                      {backgroundColor: option.color + '20'},
                    ]}>
                    <Text style={styles.durationEmoji}>{option.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.durationNumber,
                      selectedDuration === option.minutes &&
                        styles.durationNumberSelected,
                    ]}>
                    {option.minutes}
                  </Text>
                  <Text style={styles.durationUnit}>min</Text>
                  <Text style={styles.durationLabel}>{option.label}</Text>
                  <Text style={styles.durationDescription}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Focus Areas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Areas</Text>
          <Text style={styles.sectionSubtitle}>
            Target specific muscle groups
          </Text>

          <View style={styles.muscleGrid}>
            {MUSCLE_GROUPS.map(group => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.muscleCard,
                  selectedMuscleGroups.includes(group.id) &&
                    styles.muscleCardSelected,
                ]}
                onPress={() => toggleMuscleGroup(group.id)}
                activeOpacity={0.8}>
                <Text style={styles.muscleEmoji}>{group.icon}</Text>
                <Text
                  style={[
                    styles.muscleLabel,
                    selectedMuscleGroups.includes(group.id) &&
                      styles.muscleLabelSelected,
                  ]}>
                  {group.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <View style={styles.buttonContainer}>
          <GradientButton
            title={isReadyToStart ? 'Generate Workout' : 'Select Duration'}
            onPress={handleStartWorkout}
            disabled={!isReadyToStart}
            size="large"
          />
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.heavy,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
  },
  aiCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  aiContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    marginRight: spacing.md,
  },
  aiIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiEmoji: {
    fontSize: 24,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  durationCardWrapper: {
    width: '33.33%',
    padding: spacing.xs,
  },
  durationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  durationCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.elevated,
  },
  durationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  durationEmoji: {
    fontSize: 24,
  },
  durationNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  durationNumberSelected: {
    color: colors.primary,
  },
  durationUnit: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  durationLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  durationDescription: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  muscleCard: {
    width: '33.33%',
    padding: spacing.xs,
  },
  muscleCardInner: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.small,
  },
  muscleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.elevated,
  },
  muscleEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  muscleLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  muscleLabelSelected: {
    color: colors.primary,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
});
