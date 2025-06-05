// screens/WorkoutPreviewScreen.tsx

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {WorkoutExercise, Exercise} from '../types/workout';
import {generateWorkout} from '../utils/generateWorkout';
import {colors, typography, spacing} from '../themes';
import {exerciseService} from '../service/exerciseService';
import ReplaceExerciseModal from '../components/workout/ReplaceExerciseModal';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

type WorkoutPreviewScreenRouteProp = RouteProp<
  RootStackParamList,
  'WorkoutPreview'
>;
type WorkoutPreviewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutPreview'
>;

export default function WorkoutPreviewScreen() {
  const navigation = useNavigation<WorkoutPreviewScreenNavigationProp>();
  const route = useRoute<WorkoutPreviewScreenRouteProp>();
  const {duration, focusAreas} = route.params;

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [exerciseToReplace, setExerciseToReplace] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    generateInitialWorkout();
  }, []);

  const generateInitialWorkout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const generated = await generateWorkout(
        duration,
        undefined,
        focusAreas as any,
        true, // Always use AI
      );

      if (!generated || generated.length === 0) {
        throw new Error('No exercises were generated');
      }

      setExercises(generated);

      // Animate in
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
    } catch (error) {
      console.error('Error generating workout:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to generate workout',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const generated = await generateWorkout(
        duration,
        undefined,
        focusAreas as any,
        true,
      );

      if (generated && generated.length > 0) {
        setExercises(generated);
      } else {
        throw new Error('No exercises generated');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to regenerate workout.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRemoveExercise = (index: number) => {
    if (exercises.length <= 1) {
      Alert.alert('Cannot Remove', 'You must have at least one exercise.');
      return;
    }

    Alert.alert(
      'Remove Exercise',
      `Remove ${exercises[index].name} from workout?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newExercises = exercises.filter((_, i) => i !== index);
            setExercises(newExercises);
          },
        },
      ],
    );
  };

  const handleReplaceExercise = (index: number) => {
    setExerciseToReplace(index);
    setShowReplaceModal(true);
  };

  const handleReplaceComplete = (newExercise: WorkoutExercise) => {
    if (exerciseToReplace !== null) {
      const newExercises = [...exercises];
      newExercises[exerciseToReplace] = newExercise;
      setExercises(newExercises);
    }
    setShowReplaceModal(false);
    setExerciseToReplace(null);
  };

  const handleStartWorkout = () => {
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
      navigation.navigate('Workout', {
        duration,
        exercises: exercises,
        preGenerated: true,
      });
    });
  };

  const getTotalSets = () => {
    return exercises.reduce((total, ex) => total + ex.sets.length, 0);
  };

  const getMuscleGroups = () => {
    const groups = new Set<string>();
    exercises.forEach(ex => {
      const exercise = exerciseService.getExerciseById(ex.id);
      if (exercise) {
        exercise.muscleGroups.primary.forEach(mg => groups.add(mg));
      }
    });
    return Array.from(groups);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Generating your perfect workout...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.danger} />
          <Text style={styles.errorTitle}>Generation Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={generateInitialWorkout}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const muscleGroups = getMuscleGroups();

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Workout</Text>
        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={handleRegenerate}
          disabled={isRegenerating}>
          <Icon
            name="refresh"
            size={20}
            color={isRegenerating ? colors.textTertiary : colors.textPrimary}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        style={[styles.scrollView, {opacity: fadeAnim}]}
        showsVerticalScrollIndicator={false}>
        {/* Workout Overview */}
        <View style={styles.overview}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{duration}</Text>
              <Text style={styles.overviewLabel}>minutes</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{exercises.length}</Text>
              <Text style={styles.overviewLabel}>exercises</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{getTotalSets()}</Text>
              <Text style={styles.overviewLabel}>total sets</Text>
            </View>
          </View>

          {muscleGroups.length > 0 && (
            <View style={styles.muscleGroupsRow}>
              {muscleGroups.slice(0, 4).map((mg, index) => (
                <View key={index} style={styles.muscleTag}>
                  <Text style={styles.muscleTagText}>
                    {mg.replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Exercise List */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>

          {exercises.map((exercise, index) => (
            <Animated.View
              key={`${exercise.id}-${index}`}
              style={[
                styles.exerciseCard,
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
              <View style={styles.exerciseNumber}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets.length} sets × {exercise.targetReps} reps
                </Text>
              </View>

              <View style={styles.exerciseActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleReplaceExercise(index)}>
                  <Icon
                    name="swap-horizontal"
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {exercises.length > 1 && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRemoveExercise(index)}>
                    <Icon name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.ScrollView>

      {/* Start Button */}
      <View style={styles.bottomContainer}>
        <Animated.View
          style={{transform: [{scale: buttonScale}], width: '100%'}}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}
            activeOpacity={0.8}>
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {showReplaceModal && exerciseToReplace !== null && (
        <ReplaceExerciseModal
          visible={showReplaceModal}
          onClose={() => {
            setShowReplaceModal(false);
            setExerciseToReplace(null);
          }}
          onReplace={handleReplaceComplete}
          currentExerciseId={exercises[exerciseToReplace].id}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.bodyLarge,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  retryButtonText: {
    color: colors.buttonText,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    margin: -spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.headline,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  regenerateButton: {
    padding: spacing.sm,
    margin: -spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  overview: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  overviewLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  muscleGroupsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  muscleTag: {
    backgroundColor: colors.primaryDim,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  muscleTagText: {
    fontSize: typography.sizes.caption,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    textTransform: 'capitalize',
  },
  exercisesSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: typography.sizes.headline,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exerciseNumberText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: 8,
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
});
