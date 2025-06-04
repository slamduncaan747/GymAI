// components/workout/ExerciseCard.tsx (Redesigned)
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';
import {WorkoutExercise, WorkoutSet} from '../../types/workout';
import {useWorkout} from '../../context/WorkoutContext';
import SwipeableSetRow from './SwipableSetRow';
import RestTimeModal from './RestTimeModal';
import ExerciseOptionsModal from './ExerciseOptionsModal';
import Card from '../common/Card';
import {colors, typography, spacing, shadows} from '../../themes';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ExerciseCardNavigationProp = StackNavigationProp<RootStackParamList>;

interface ExerciseCardProps {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  onUpdate?: (
    setIndex: number,
    actual: number,
    weight: number,
    completed: boolean,
    restTime?: number,
  ) => void;
  onReorderRequest?: () => void;
  onReplaceRequest?: (exerciseIndex: number) => void;
  onRemoveExercise?: (exerciseIndex: number) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = React.memo(
  ({
    exercise,
    exerciseIndex,
    onUpdate,
    onReorderRequest,
    onReplaceRequest,
    onRemoveExercise,
  }) => {
    const navigation = useNavigation<ExerciseCardNavigationProp>();
    const {
      updateExerciseSet,
      addSetToExercise,
      removeSetFromExercise,
      updateExerciseRestTime,
    } = useWorkout();

    const [showRestModal, setShowRestModal] = useState(false);
    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [restTime, setRestTime] = useState(exercise.restTime || 60);
    const [isExpanded, setIsExpanded] = useState(true);
    const rotateAnim = useRef(new Animated.Value(1)).current;

    const handleSetUpdate = (
      setIndex: number,
      actual: number,
      weight: number,
      completed: boolean = false,
    ) => {
      updateExerciseSet(exerciseIndex, setIndex, actual, weight, completed);
      if (onUpdate) {
        onUpdate(
          setIndex,
          actual,
          weight,
          completed,
          completed ? restTime : undefined,
        );
      }
    };

    const addSet = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet: WorkoutSet = {
        target: lastSet?.target || exercise.targetReps || 8,
        actual: 0,
        weight: lastSet?.weight || 0,
        completed: false,
      };
      addSetToExercise(exerciseIndex, newSet);
    };

    const toggleExpanded = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(!isExpanded);

      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const formatRestTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return mins === 0
        ? `${secs}s`
        : secs === 0
        ? `${mins}min`
        : `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSetDelete = (setIndex: number) => {
      if (exercise.sets.length > 1) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        removeSetFromExercise(exerciseIndex, setIndex);
      }
    };

    const handleExerciseNamePress = () => {
      navigation.navigate('ExercisePreview', {
        exerciseName: exercise.name,
        exerciseId: exercise.id,
      });
    };

    const handleRestTimeChange = (time: number) => {
      setRestTime(time);
      updateExerciseRestTime(exerciseIndex, time);
    };

    const completedSets = exercise.sets.filter(set => set.completed).length;
    const totalSets = exercise.sets.length;
    const progress = totalSets > 0 ? completedSets / totalSets : 0;

    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <Card style={styles.card} noPadding variant="elevated">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={toggleExpanded}
            activeOpacity={0.7}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{exerciseIndex + 1}</Text>
            </View>
            <View style={styles.exerciseInfo}>
              <TouchableOpacity
                onPress={handleExerciseNamePress}
                activeOpacity={0.7}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
              </TouchableOpacity>
              <View style={styles.exerciseStats}>
                <Text style={styles.setCount}>
                  {completedSets}/{totalSets} sets
                </Text>
                <View style={styles.dot} />
                <TouchableOpacity
                  onPress={() => setShowRestModal(true)}
                  activeOpacity={0.7}>
                  <Text style={styles.restTime}>
                    Rest: {formatRestTime(restTime)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowOptionsModal(true)}
              activeOpacity={0.7}>
              <Text style={styles.menuIcon}>⋯</Text>
            </TouchableOpacity>
            <Animated.View style={{transform: [{rotate: spin}]}}>
              <TouchableOpacity
                style={styles.expandButton}
                onPress={toggleExpanded}
                activeOpacity={0.7}>
                <Text style={styles.expandIcon}>⌄</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Sets */}
        {isExpanded && (
          <View style={styles.setsContainer}>
            <View style={styles.setsHeader}>
              <Text style={[styles.headerText, {flex: 1}]}>WEIGHT</Text>
              <Text style={[styles.headerText, {flex: 0.8}]}>REPS</Text>
              <View style={{width: 40}} />
            </View>

            {exercise.sets.map((set, index) => (
              <SwipeableSetRow
                key={index}
                setNumber={index + 1}
                set={set}
                onUpdate={(actual, weight, completed) =>
                  handleSetUpdate(index, actual, weight, completed)
                }
                onDelete={() => handleSetDelete(index)}
                previousSet={index > 0 ? exercise.sets[index - 1] : undefined}
                restTime={restTime}
                canDelete={exercise.sets.length > 1}
              />
            ))}

            <TouchableOpacity
              style={styles.addSetButton}
              onPress={addSet}
              activeOpacity={0.7}>
              <Text style={styles.addSetIcon}>+</Text>
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modals */}
        <RestTimeModal
          visible={showRestModal}
          onClose={() => setShowRestModal(false)}
          currentTime={restTime}
          onTimeSelect={handleRestTimeChange}
          exerciseName={exercise.name}
        />

        <ExerciseOptionsModal
          visible={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          exerciseName={exercise.name}
          onReorder={onReorderRequest || (() => {})}
          onReplace={() => onReplaceRequest?.(exerciseIndex)}
          onRemove={() => onRemoveExercise?.(exerciseIndex)}
        />
      </Card>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exerciseNumberText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
    marginHorizontal: spacing.sm,
  },
  restTime: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  menuIcon: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  expandButton: {
    padding: spacing.sm,
  },
  expandIcon: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  setsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background + '50',
  },
  headerText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addSetIcon: {
    fontSize: 20,
    color: colors.primary,
    marginRight: spacing.sm,
    fontWeight: typography.weights.bold,
  },
  addSetText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});

export default ExerciseCard;
