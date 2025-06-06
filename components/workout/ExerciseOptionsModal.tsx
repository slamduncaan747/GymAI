import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {colors, typography, spacing} from '../../themes';
import Icon from 'react-native-vector-icons/Ionicons';

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
              <View style={styles.modalContent}>
                <View style={styles.handle} />

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
                    <View style={styles.optionIcon}>
                      <Icon
                        name="swap-vertical"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={styles.optionText}>Reorder Exercises</Text>
                    <Icon
                      name="chevron-forward"
                      size={20}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleOptionPress(onReplace)}
                    activeOpacity={0.7}>
                    <View style={styles.optionIcon}>
                      <Icon name="repeat" size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.optionText}>Replace Exercise</Text>
                    <Icon
                      name="chevron-forward"
                      size={20}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.option, styles.dangerOption]}
                    onPress={() => handleOptionPress(onRemove)}
                    activeOpacity={0.7}>
                    <View style={[styles.optionIcon, styles.dangerIcon]}>
                      <Icon
                        name="trash-outline"
                        size={20}
                        color={colors.danger}
                      />
                    </View>
                    <Text style={[styles.optionText, styles.dangerText]}>
                      Remove Exercise
                    </Text>
                    <Icon
                      name="chevron-forward"
                      size={20}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.textTertiary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    opacity: 0.5,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  optionsContainer: {
    paddingBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dangerOption: {},
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dangerIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  optionText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  dangerText: {
    color: colors.danger,
  },
});

export default ExerciseOptionsModal;
