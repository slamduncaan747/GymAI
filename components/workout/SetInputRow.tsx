import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {WorkoutSet} from '../../types/workout';
import {colors} from '../../themes/colors';
import {debounce} from 'lodash';

// Define interfaces for props and styles
interface SetInputRowProps {
  setNumber: number;
  set: WorkoutSet;
  onUpdate: (actual: number, weight: number, completed: boolean) => void;
  previousSet?: WorkoutSet;
  restTime?: number;
}

const SetInputRow: React.FC<SetInputRowProps> = React.memo(
  ({setNumber, set, onUpdate, previousSet, restTime = 60}) => {
    const [weight, setWeight] = useState<string>(
      set.weight > 0 ? set.weight.toString() : '',
    );
    const [reps, setReps] = useState<string>(
      set.actual > 0 ? set.actual.toString() : '',
    );
    const [isCompleted, setIsCompleted] = useState<boolean>(
      set.completed || false,
    );

    const debouncedUpdate = useCallback(
      debounce((actual: number, weight: number, completed: boolean) => {
        onUpdate(actual, weight, completed);
      }, 300),
      [onUpdate],
    );

    useEffect(() => {
      setWeight(set.weight > 0 ? set.weight.toString() : '');
      setReps(set.actual > 0 ? set.actual.toString() : '');
      setIsCompleted(set.completed || false);
    }, [set]);

    const handleWeightChange = (value: string): void => {
      const cleanValue = value.replace(/[^0-9.]/g, '');
      setWeight(cleanValue);
      const numValue = parseFloat(cleanValue) || 0;
      if (isCompleted) {
        debouncedUpdate(parseInt(reps) || 0, numValue, true);
      }
    };

    const handleRepsChange = (value: string): void => {
      const cleanValue = value.replace(/[^0-9]/g, '');
      setReps(cleanValue);
      const numValue = parseInt(cleanValue) || 0;
      if (isCompleted) {
        debouncedUpdate(numValue, parseFloat(weight) || 0, true);
      }
    };

    const handleComplete = (): void => {
      if (isCompleted) {
        // Uncomplete the set
        setIsCompleted(false);
        debouncedUpdate(0, parseFloat(weight) || 0, false);
      } else {
        // Complete the set
        const currentWeight = parseFloat(weight) || set.weight || 0;
        const currentReps = parseInt(reps) || set.target || 0;

        if (currentReps === 0 && !weight) return;

        setWeight(currentWeight.toString());
        setReps(currentReps.toString());
        setIsCompleted(true);

        // Update with completed status - the timer will be handled by parent
        debouncedUpdate(currentReps, currentWeight, true);
      }
    };

    const getPreviousData = (): string => {
      if (previousSet && previousSet.weight > 0 && previousSet.actual > 0) {
        return `${previousSet.weight} × ${previousSet.actual}`;
      }
      return '---';
    };

    return (
      <View
        style={[styles.container, isCompleted && styles.completedContainer]}>
        <View style={styles.setNumberContainer}>
          <Text style={styles.setNumber}>{setNumber}</Text>
        </View>

        <View style={styles.previousContainer}>
          <Text style={styles.previousText}>{getPreviousData()}</Text>
        </View>

        <View style={styles.weightContainer}>
          <TextInput
            style={[styles.input, isCompleted && styles.inputCompleted]}
            value={weight}
            onChangeText={handleWeightChange}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            selectTextOnFocus
            editable={true}
          />
        </View>

        <View style={styles.repsContainer}>
          <TextInput
            style={[styles.input, isCompleted && styles.inputCompleted]}
            value={reps}
            onChangeText={handleRepsChange}
            placeholder={set.target > 0 ? set.target.toString() : '0'}
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            selectTextOnFocus
            editable={true}
          />
        </View>

        <TouchableOpacity
          style={[styles.completeButton, isCompleted && styles.completedButton]}
          onPress={handleComplete}>
          <Text
            style={[
              styles.completeButtonText,
              isCompleted && styles.completedButtonText,
            ]}>
            ✓
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

// Define style types
interface Styles {
  container: object;
  completedContainer: object;
  setNumberContainer: object;
  setNumber: object;
  previousContainer: object;
  previousText: object;
  weightContainer: object;
  repsContainer: object;
  input: object;
  inputCompleted: object;
  completeButton: object;
  completedButton: object;
  completeButtonText: object;
  completedButtonText: object;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.setRowBackground,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  completedContainer: {
    backgroundColor: colors.setRowCompleted,
  },
  setNumberContainer: {
    width: 32,
    alignItems: 'center',
  },
  setNumber: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  previousContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  previousText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  weightContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  repsContainer: {
    flex: 0.8,
    paddingHorizontal: 8,
  },
  input: {
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  inputCompleted: {
    backgroundColor: 'transparent',
    borderColor: colors.setRowBorderCompleted,
    color: colors.accent,
  },
  completeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginLeft: 12,
  },
  completedButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  completeButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedButtonText: {
    color: colors.buttonText,
  },
});

export default SetInputRow;
