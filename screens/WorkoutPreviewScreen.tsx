// screens/WorkoutPreviewScreen.tsx

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {WorkoutExercise, Exercise} from '../types/workout';
import {generateWorkout} from '../utils/generateWorkout';
import {colors} from '../themes/colors';
import {exerciseService} from '../service/exerciseService';
import ReplaceExerciseModal from '../components/workout/ReplaceExerciseModal';

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
  const {duration, focusAreas, useAI} = route.params;

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [exerciseToReplace, setExerciseToReplace] = useState<number | null>(
    null,
  );
  const [feedback, setFeedback] = useState('');
  const [generationMethod, setGenerationMethod] = useState<'AI' | 'Standard'>(
    'Standard',
  );

  useEffect(() => {
    generateInitialWorkout();
  }, []);

  const generateInitialWorkout = async () => {
    try {
      setIsLoading(true);
      const generated = await generateWorkout(
        duration,
        undefined,
        focusAreas as any,
        useAI,
      );
      setExercises(generated);
      setGenerationMethod(useAI ? 'AI' : 'Standard');
    } catch (error) {
      console.error('Error generating workout:', error);
      Alert.alert('Error', 'Failed to generate workout. Please try again.');
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
        useAI,
      );
      setExercises(generated);
    } catch (error) {
      Alert.alert('Error', 'Failed to regenerate workout.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateWithFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert(
        'Feedback Required',
        'Please provide feedback for AI to improve the workout.',
      );
      return;
    }

    setIsRegenerating(true);
    try {
      const generated = await generateWorkout(
        duration,
        undefined,
        focusAreas as any,
        true, // Force AI for feedback-based generation
        feedback,
        exercises, // Pass current exercises for context
      );
      setExercises(generated);
      setFeedback('');
      setGenerationMethod('AI');
      Alert.alert('Success', 'Workout regenerated based on your feedback!');
    } catch (error) {
      Alert.alert('Error', 'Failed to regenerate workout with feedback.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRemoveExercise = (index: number) => {
    if (exercises.length <= 1) {
      Alert.alert('Cannot Remove', 'You must have at least one exercise.');
      return;
    }

    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
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
    navigation.navigate('Workout', {
      duration,
      exercises,
      preGenerated: true,
    });
  };

  const getTotalSets = () => {
    return exercises.reduce((total, ex) => total + ex.sets.length, 0);
  };

  const getEstimatedVolume = () => {
    // This is a rough estimate based on typical weights
    return exercises.reduce((total, ex) => {
      const avgWeight = ex.sets[0]?.weight || 100;
      const totalReps = ex.sets.reduce((sum, set) => sum + set.target, 0);
      return total + avgWeight * totalReps;
    }, 0);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>
            {useAI
              ? '🤖 AI is crafting your personalized workout...'
              : 'Generating your workout...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Preview Workout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Generation Info */}
        <View style={styles.generationInfo}>
          <View style={styles.generationBadge}>
            <Text style={styles.generationIcon}>
              {generationMethod === 'AI' ? '🤖' : '⚡'}
            </Text>
            <Text style={styles.generationText}>
              {generationMethod} Generated
            </Text>
          </View>
          <Text style={styles.generationSubtext}>
            {duration} min • {exercises.length} exercises • {getTotalSets()}{' '}
            total sets
          </Text>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseNumber}>{index + 1}</Text>
                  <View>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets.length} sets × {exercise.targetReps} reps
                    </Text>
                  </View>
                </View>
                <View style={styles.exerciseActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleReplaceExercise(index)}>
                    <Text style={styles.actionIcon}>🔄</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRemoveExercise(index)}>
                    <Text style={styles.actionIcon}>❌</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* AI Feedback Section */}
        {useAI && (
          <View style={styles.feedbackSection}>
            <Text style={styles.sectionTitle}>AI Refinement</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Tell AI how to improve this workout..."
              placeholderTextColor={colors.textSecondary}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                isRegenerating && styles.buttonDisabled,
              ]}
              onPress={handleRegenerateWithFeedback}
              disabled={isRegenerating}>
              <Text style={styles.feedbackButtonText}>
                {isRegenerating
                  ? 'Regenerating...'
                  : 'Regenerate with Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.regenerateButton,
              isRegenerating && styles.buttonDisabled,
            ]}
            onPress={handleRegenerate}
            disabled={isRegenerating}>
            <Text style={styles.regenerateButtonText}>
              {isRegenerating ? 'Regenerating...' : '🔄 Regenerate All'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartWorkout}>
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  scrollView: {
    flex: 1,
  },
  generationInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  generationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  generationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  generationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  generationSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  exercisesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
    marginRight: 12,
    width: 30,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
  },
  actionIcon: {
    fontSize: 16,
  },
  feedbackSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  feedbackInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  feedbackButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttonText,
  },
  actionSection: {
    padding: 20,
    gap: 12,
  },
  regenerateButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  regenerateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  startButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
