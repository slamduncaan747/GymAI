import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {colors} from '../../themes/colors';

interface ExerciseOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  onReorder: () => void;
  onReplace: () => void;
  onRemove: () => void;
}

const ExerciseOptionsModal: React.FC<ExerciseOptionsModalProps> = ({
  visible,
  onClose,
  exerciseName,
  onReorder,
  onReplace,
  onRemove,
}) => {
  const handleOptionPress = (action: () => void) => {
    onClose();
    // Add a small delay to let the modal close before executing the action
    setTimeout(action, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={2}>
                  {exerciseName}
                </Text>
              </View>

              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress(onReorder)}
                  activeOpacity={0.7}>
                  <Text style={styles.optionText}>🔄 Reorder Exercises</Text>
                </TouchableOpacity>

                <View style={styles.separator} />

                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleOptionPress(onReplace)}
                  activeOpacity={0.7}>
                  <Text style={styles.optionText}>🔄 Replace Exercise</Text>
                </TouchableOpacity>

                <View style={styles.separator} />

                <TouchableOpacity
                  style={[styles.option, styles.dangerOption]}
                  onPress={() => handleOptionPress(onRemove)}
                  activeOpacity={0.7}>
                  <Text style={[styles.optionText, styles.dangerText]}>
                    🗑️ Remove Exercise
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerOption: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  dangerText: {
    color: '#FF3B30',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
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

export default ExerciseOptionsModal;
