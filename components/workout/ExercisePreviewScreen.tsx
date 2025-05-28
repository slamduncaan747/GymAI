// components/workout/ExercisePreviewScreen.tsx

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';
import {colors} from '../../themes/colors';
import {exerciseService} from '../../service/exerciseService';
import {useWorkout} from '../../context/WorkoutContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ExercisePreviewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ExercisePreview'
>;
type ExercisePreviewScreenRouteProp = RouteProp<
  RootStackParamList,
  'ExercisePreview'
>;

interface ExerciseHistory {
  date: string;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
}

export default function ExercisePreviewScreen() {
  const navigation = useNavigation<ExercisePreviewScreenNavigationProp>();
  const route = useRoute<ExercisePreviewScreenRouteProp>();
  const {exerciseName, exerciseId} = route.params;
  const {savedWorkouts} = useWorkout();

  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'tips'>(
    'info',
  );
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory[]>([]);
  const [personalRecord, setPersonalRecord] = useState<{
    weight: number;
    reps: number;
  } | null>(null);

  const exercise = exerciseService.getExerciseById(exerciseId);

  useEffect(() => {
    if (exercise) {
      loadExerciseHistory();
    }
  }, [exercise, savedWorkouts]);

  const loadExerciseHistory = () => {
    const history: ExerciseHistory[] = [];
    let maxWeight = 0;
    let maxWeightReps = 0;

    savedWorkouts.forEach(workout => {
      const exerciseInWorkout = workout.exercises.find(
        ex => ex.id === exerciseId,
      );
      if (exerciseInWorkout) {
        const sets = exerciseInWorkout.sets
          .filter(set => set.actual > 0)
          .map(set => ({
            weight: set.weight,
            reps: set.actual,
          }));

        if (sets.length > 0) {
          history.push({
            date: new Date(workout.timestamp).toLocaleDateString(),
            sets,
          });

          // Track personal record
          sets.forEach(set => {
            if (set.weight > maxWeight) {
              maxWeight = set.weight;
              maxWeightReps = set.reps;
            }
          });
        }
      }
    });

    setExerciseHistory(history.reverse()); // Most recent first
    if (maxWeight > 0) {
      setPersonalRecord({weight: maxWeight, reps: maxWeightReps});
    }
  };

  if (!exercise) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  const renderInfoTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Exercise Details */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Exercise Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>
            {exercise.category.charAt(0).toUpperCase() +
              exercise.category.slice(1)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Equipment:</Text>
          <Text style={styles.detailValue}>
            {exercise.equipment.replace('_', ' ').charAt(0).toUpperCase() +
              exercise.equipment.replace('_', ' ').slice(1)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Difficulty:</Text>
          <Text
            style={[
              styles.detailValue,
              styles[`difficulty${exercise.difficulty}`],
            ]}>
            {exercise.difficulty.charAt(0).toUpperCase() +
              exercise.difficulty.slice(1)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Primary Muscles:</Text>
          <Text style={styles.detailValue}>
            {exercise.muscleGroups.primary
              .map(
                m =>
                  m.replace('_', ' ').charAt(0).toUpperCase() +
                  m.replace('_', ' ').slice(1),
              )
              .join(', ')}
          </Text>
        </View>
        {exercise.muscleGroups.secondary.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Secondary Muscles:</Text>
            <Text style={styles.detailValue}>
              {exercise.muscleGroups.secondary
                .map(
                  m =>
                    m.replace('_', ' ').charAt(0).toUpperCase() +
                    m.replace('_', ' ').slice(1),
                )
                .join(', ')}
            </Text>
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>How to Perform</Text>
        {exercise.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionRow}>
            <Text style={styles.instructionNumber}>{index + 1}.</Text>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>

      {/* Common Mistakes */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Common Mistakes to Avoid</Text>
        {exercise.commonMistakes.map((mistake, index) => (
          <View key={index} style={styles.mistakeRow}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.mistakeText}>{mistake}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {personalRecord && (
        <View style={styles.prCard}>
          <Text style={styles.prTitle}>Personal Record</Text>
          <Text style={styles.prValue}>
            {personalRecord.weight} lbs × {personalRecord.reps} reps
          </Text>
        </View>
      )}

      {exerciseHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No history yet</Text>
          <Text style={styles.emptySubtext}>
            Complete this exercise in a workout to see your history
          </Text>
        </View>
      ) : (
        exerciseHistory.map((session, index) => (
          <View key={index} style={styles.historyCard}>
            <Text style={styles.historyDate}>{session.date}</Text>
            <View style={styles.setsContainer}>
              {session.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
                  <Text style={styles.setData}>
                    {set.weight} lbs × {set.reps} reps
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderTipsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Pro Tips */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Pro Tips</Text>
        {exercise.tips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Default Programming */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Suggested Programming</Text>
        <View style={styles.programmingCard}>
          <View style={styles.programmingRow}>
            <Text style={styles.programmingLabel}>Sets:</Text>
            <Text style={styles.programmingValue}>{exercise.defaultSets}</Text>
          </View>
          <View style={styles.programmingRow}>
            <Text style={styles.programmingLabel}>Reps:</Text>
            <Text style={styles.programmingValue}>{exercise.defaultReps}</Text>
          </View>
          <View style={styles.programmingRow}>
            <Text style={styles.programmingLabel}>Rest:</Text>
            <Text style={styles.programmingValue}>
              {exercise.defaultRestSeconds}s
            </Text>
          </View>
          {exercise.defaultWeight && (
            <View style={styles.programmingRow}>
              <Text style={styles.programmingLabel}>Starting Weight:</Text>
              <Text style={styles.programmingValue}>
                {exercise.defaultWeight} lbs
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Related Exercises */}
      {exercise.variations && exercise.variations.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Related Exercises</Text>
          {exerciseService
            .getRelatedExercises(exercise.id, 5)
            .map((related, index) => (
              <TouchableOpacity
                key={index}
                style={styles.relatedExerciseRow}
                onPress={() => {
                  navigation.push('ExercisePreview', {
                    exerciseName: related.name,
                    exerciseId: related.id,
                  });
                }}>
                <Text style={styles.relatedExerciseName}>{related.name}</Text>
                <Text style={styles.relatedExerciseInfo}>
                  {related.equipment} • {related.difficulty}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {exerciseName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {exercise.movement.charAt(0).toUpperCase() +
              exercise.movement.slice(1)}{' '}
            Movement
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'info' && styles.activeTabText,
            ]}>
            Instructions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.activeTabText,
            ]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tips' && styles.activeTab]}
          onPress={() => setActiveTab('tips')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'tips' && styles.activeTabText,
            ]}>
            Tips & More
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'info' && renderInfoTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'tips' && renderTipsTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.accent,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    width: 140,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  difficultybeginner: {
    color: '#4CAF50',
  },
  difficultyintermediate: {
    color: colors.accent,
  },
  difficultyadvanced: {
    color: '#F44336',
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    width: 24,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  mistakeRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#F44336',
    width: 20,
  },
  mistakeText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 16,
    width: 24,
  },
  tipText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  prCard: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  prTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttonText,
    marginBottom: 8,
  },
  prValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.buttonText,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setNumber: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  setData: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  programmingCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  programmingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  programmingLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  programmingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  relatedExerciseRow: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  relatedExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  relatedExerciseInfo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
