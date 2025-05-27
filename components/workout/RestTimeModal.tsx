import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {colors} from '../../themes/colors';

// Install the library first:
// npm install @react-native-picker/picker
// For iOS: cd ios && pod install

interface RestTimeModalProps {
  visible: boolean;
  onClose: () => void;
  currentTime: number;
  onTimeSelect: (time: number) => void;
  exerciseName: string;
}

const RestTimeModal: React.FC<RestTimeModalProps> = ({
  visible,
  onClose,
  currentTime,
  onTimeSelect,
  exerciseName,
}) => {
  const [selectedTime, setSelectedTime] = useState<number>(currentTime);

  // Generate time options from 15 seconds to 5 minutes in 15-second increments
  const generateTimeOptions = (): number[] => {
    const options: number[] = [];
    for (let seconds = 15; seconds <= 300; seconds += 15) {
      options.push(seconds);
    }
    return options;
  };

  const timeOptions: number[] = generateTimeOptions();

  const formatTime = (seconds: number): string => {
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

  useEffect(() => {
    setSelectedTime(currentTime);
  }, [currentTime, visible]);

  useEffect(() => {
    onTimeSelect(selectedTime);
  }, [selectedTime]);

  const handleDone = (): void => {
    onTimeSelect(selectedTime);
    onClose();
  };

  const handleCancel = (): void => {
    setSelectedTime(currentTime); // Reset to original value
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={handleCancel}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Rest Timer</Text>
            <Text style={styles.modalSubtitle}>{exerciseName}</Text>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedTime}
              onValueChange={(itemValue: number) => setSelectedTime(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}>
              {timeOptions.map(time => (
                <Picker.Item key={time} label={formatTime(time)} value={time} />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
              activeOpacity={0.8}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RestTimeModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.textSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    opacity: 0.4,
  },
  modalHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pickerContainer: {
    height: 200,
    marginHorizontal: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  pickerItem: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.textSecondary,
    paddingVertical: 16,
    borderRadius: 12,
    opacity: 0.8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.buttonText,
    textAlign: 'center',
  },
});
