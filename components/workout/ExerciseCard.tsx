import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';
import {WorkoutExercise, WorkoutSet} from '../../types/workout';
import {useWorkout} from '../../context/WorkoutContext';
import SwipeableSetRow from './SwipeableSetRow';
import RestTimeModal from './RestTimeModal';
import ExerciseOptionsModal from './ExerciseOptionsModal';
import {colors} from '../../themes/colors';

type ExerciseCardNavigationProp = StackNavigationProp<RootStackParamList>;

// Define interfaces for props and types
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
}

const ExerciseCard: React.FC<ExerciseCardProps> = React.memo(
  ({exercise, exerciseIndex, onUpdate}) => {
    const navigation = useNavigation<ExerciseCardNavigationProp>();
    const {updateExerciseSet, addSetToExercise, removeSetFromExercise} = useWorkout();
    const [showRestModal, setShowRestModal] = useState<boolean>(false);
    const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
    const [restTime, setRestTime] = useState<number>(exercise.restTime || 60);

    const handleSetUpdate = (
      setIndex: number,
      actual: number,
      weight: number,
      completed: boolean = false,
    ): void => {
      updateExerciseSet(exerciseIndex, setIndex, actual, weight, completed);
      if (onUpdate) {
        // Pass the current exercise's rest time when a set is completed
        onUpdate(setIndex, actual, weight, completed, completed ? restTime : undefined);
      }
    };

    const addSet = (): void => {
      const lastSet: WorkoutSet | undefined =
        exercise.sets[exercise.sets.length - 1];
      const newSet: WorkoutSet = {
        target: lastSet?.target || exercise.targetReps || 8,
        actual: 0,
        weight: lastSet?.weight || 0,
        completed: false,
      };
      
      // Add the new set to the exercise
      if (addSetToExercise) {
        addSetToExercise(exerciseIndex, newSet);
      }
    };

    const formatRestTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      if (mins === 0) {
        return `${secs}s`;
      } else if (secs === 0) {
        return `${mins}min`;
      } else {
        return `${mins}min ${secs}s`;
      }
    };

    const handleSetDelete = (setIndex: number): void => {
      if (exercise.sets.length > 1 && removeSetFromExercise) {
        removeSetFromExercise(exerciseIndex, setIndex);
      }
    };

    const handleExerciseNamePress = (): void => {
      navigation.navigate('ExercisePreview', {
        exerciseName: exercise.name,
        exerciseId: exercise.id,
      });
    };

    const handleReorderExercises = (): void => {
      // Placeholder for reorder functionality
      console.log('Reorder exercises');
    };

    const handleReplaceExercise = (): void => {
      // Placeholder for replace functionality
      console.log('Replace exercise');
    };

    const handleRemoveExercise = (): void => {
      // Placeholder for remove functionality
      console.log('Remove exercise');
    }; could add a separate method to update exercise properties
        // For now, the rest time is managed locally in this component
      }
    };

    return (
      <View style={styles.card}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <TouchableOpacity
              style={styles.restTimeButton}
              onPress={() => setShowRestModal(true)}>
              <Text style={styles.restTimeText}>
                Rest Timer: {formatRestTime(restTime)}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuText}>⋯</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.setsContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerText, {width: 32}]}>SET</Text>
            <Text style={[styles.headerText, {flex: 1, paddingHorizontal: 12}]}>
              PREVIOUS
            </Text>
            <Text style={[styles.headerText, {flex: 1, paddingHorizontal: 8}]}>
              LBS
            </Text>
            <Text
              style={[styles.headerText, {flex: 0.8, paddingHorizontal: 8}]}>
              REPS
            </Text>
            <Text style={[styles.headerText, {width: 40}]}></Text>
          </View>

          {exercise.sets.map((set: WorkoutSet, index: number) => (
            <SetInputRow
              key={index}
              setNumber={index + 1}
              set={set}
              onUpdate={(
                actual: number,
                weight: number,
                completed: boolean,
              ) =>
                handleSetUpdate(
                  index,
                  actual,
                  weight,
                  completed,
                )
              }
              previousSet={index > 0 ? exercise.sets[index - 1] : undefined}
              restTime={restTime}
            />
          ))}

          <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
            <Text style={styles.addSetText}>+ Add Set</Text>
          </TouchableOpacity>
        </View>

        <RestTimeModal
          visible={showRestModal}
          onClose={() => setShowRestModal(false)}
          currentTime={restTime}
          onTimeSelect={handleRestTimeChange}
          exerciseName={exercise.name}
        />
      </View>
    );
  },
);

export default ExerciseCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  restTimeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  restTimeText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  setsContainer: {
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  addSetButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 8,
  },
  addSetText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});