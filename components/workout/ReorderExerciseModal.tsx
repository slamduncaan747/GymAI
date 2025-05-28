import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import {WorkoutExercise} from '../../types/workout';
import {colors} from '../../themes/colors';

interface ReorderExercisesModalProps {
  visible: boolean;
  exercises: WorkoutExercise[];
  onClose: () => void;
  onReorder: (newOrder: WorkoutExercise[]) => void;
}

const ReorderExercisesModal: React.FC<ReorderExercisesModalProps> = ({
  visible,
  exercises,
  onClose,
  onReorder,
}) => {
  const [orderedExercises, setOrderedExercises] = useState(exercises);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...orderedExercises];
    [newOrder[index], newOrder[index - 1]] = [
      newOrder[index - 1],
      newOrder[index],
    ];
    setOrderedExercises(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === orderedExercises.length - 1) return;
    const newOrder = [...orderedExercises];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    setOrderedExercises(newOrder);
  };

  const handleSave = () => {
    onReorder(orderedExercises);
  };

  const renderExercise = ({
    item,
    index,
  }: {
    item: WorkoutExercise;
    index: number;
  }) => (
    <View style={styles.exerciseRow}>
      <Text style={styles.exerciseNumber}>{index + 1}</Text>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.moveButton, index === 0 && styles.disabledButton]}
          onPress={() => moveUp(index)}
          disabled={index === 0}>
          <Text style={styles.moveButtonText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.moveButton,
            index === orderedExercises.length - 1 && styles.disabledButton,
          ]}
          onPress={() => moveDown(index)}
          disabled={index === orderedExercises.length - 1}>
          <Text style={styles.moveButtonText}>↓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Reorder Exercises</Text>
          </View>

          <FlatList
            data={orderedExercises}
            renderItem={renderExercise}
            keyExtractor={item => item.id}
            style={styles.list}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}>
              <Text style={styles.saveText}>Save Order</Text>
            </TouchableOpacity>
          </View>
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
  list: {
    maxHeight: 400,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 30,
  },
  exerciseName: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  moveButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  disabledButton: {
    opacity: 0.3,
  },
  moveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.inputBackground,
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttonText,
  },
});

export default ReorderExercisesModal;
