// components/workout/ExerciseCard.tsx

import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';
import {WorkoutExercise, WorkoutSet} from '../../types/workout';
import {useWorkout} from '../../context/WorkoutContext';
import SwipeableSetRow from './SwipableSetRow';
import RestTimeModal from './RestTimeModal';
import ExerciseOptionsModal from './ExerciseOptionsModal';
import {colors, typography, spacing} from '../../themes';
import Icon from 'react-native-vector-icons/Ionicons';

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
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet: WorkoutSet = {
        target: lastSet?.target || exercise.targetReps || 8,
        actual: 0,
        weight: lastSet?.weight || 0,
        completed: false,
      };
      addSetToExercise(exerciseIndex, newSet);
    };

    const handleSetDelete = (setIndex: number) => {
      if (exercise.sets.length > 1) {
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

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
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
                  <Text style={styles.restTime}>Rest: {restTime}s</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowOptionsModal(true)}
            activeOpacity={0.7}>
            <Icon
              name="ellipsis-horizontal"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, {width: `${progress * 100}%`}]}
            />
          </View>
        </View>

        {/* Sets */}
        <View style={styles.setsContainer}>
          <View style={styles.setsHeader}>
            <Text style={[styles.headerText, {flex: 0.8}]}>SET</Text>
            <Text style={[styles.headerText, {flex: 1.2}]}>PREVIOUS</Text>
            <Text style={styles.headerText}>WEIGHT</Text>
            <Text style={styles.headerText}>REPS</Text>
            <View style={{width: 40}} />
          </View>
          {exercise.sets.map((set, index) => (
            <SwipeableSetRow
              key={set.id || `${exercise.id}-set-${index}`}
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
            <Icon name="add" size={20} color={colors.primary} />
            <Text style={styles.addSetText}>Add Set</Text>
          </TouchableOpacity>
        </View>

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
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
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
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setCount: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: spacing.sm,
  },
  restTime: {
    fontSize: typography.sizes.caption,
    color: colors.primary,
  },
  menuButton: {
    padding: spacing.sm,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 1.5,
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
    backgroundColor: colors.background,
  },
  headerText: {
    flex: 1,
    fontSize: typography.sizes.micro,
    fontWeight: typography.weights.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wider,
    textAlign: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addSetText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
});

export default ExerciseCard;
