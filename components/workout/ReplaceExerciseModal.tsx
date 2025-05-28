import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import {WorkoutExercise, Exercise} from '../../types/workout';
import {EXERCISES} from '../../data/exercises';
import {colors} from '../../themes/colors';

interface ReplaceExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onReplace: (exercise: WorkoutExercise) => void;
  currentExerciseId: string;
}

const ReplaceExerciseModal: React.FC<ReplaceExerciseModalProps> = ({
  visible,
  onClose,
  onReplace,
  currentExerciseId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = EXERCISES.filter(
    exercise =>
      exercise.id !== currentExerciseId &&
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectExercise = (exercise: Exercise) => {
    const workoutExercise: WorkoutExercise = {
      id: exercise.id,
      name: exercise.name,
      targetReps: exercise.defaultReps,
      sets: Array.from({length: exercise.defaultSets}, () => ({
        target: exercise.defaultReps,
        actual: 0,
        weight: exercise.defaultWeight,
        completed: false,
      })),
      restTime: exercise.defaultRestTime,
    };
    onReplace(workoutExercise);
  };

  const renderExercise = ({item}: {item: Exercise}) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => handleSelectExercise(item)}>
      <View>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDetails}>
          {item.category} • {item.defaultSets} sets × {item.defaultReps} reps
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Replace Exercise</Text>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredExercises}
            renderItem={renderExercise}
            keyExtractor={item => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  exerciseItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.inputBackground,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
});

export default ReplaceExerciseModal;
