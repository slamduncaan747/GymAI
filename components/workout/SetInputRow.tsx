// components/workout/SetInputRow.tsx (Redesigned)
import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {WorkoutSet} from '../../types/workout';
import {colors, typography, spacing} from '../../themes';
import {debounce} from 'lodash';

interface SetInputRowProps {
  setNumber: number;
  set: WorkoutSet;
  onUpdate: (actual: number, weight: number, completed: boolean) => void;
  previousSet?: WorkoutSet;
  restTime?: number;
}

const SetInputRow: React.FC<SetInputRowProps> = React.memo(
  ({setNumber, set, onUpdate, previousSet, restTime = 60}) => {
    const [weight, setWeight] = useState(
      set.weight > 0 ? set.weight.toString() : '',
    );
    const [reps, setReps] = useState(
      set.actual > 0 ? set.actual.toString() : '',
    );
    const [isCompleted, setIsCompleted] = useState(set.completed || false);
    const checkmarkScale = useRef(
      new Animated.Value(isCompleted ? 1 : 0),
    ).current;

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

    useEffect(() => {
      Animated.spring(checkmarkScale, {
        toValue: isCompleted ? 1 : 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }, [isCompleted]);

    const handleWeightChange = (value: string) => {
      const cleanValue = value.replace(/[^0-9.]/g, '');
      setWeight(cleanValue);
      const numValue = parseFloat(cleanValue) || 0;
      if (isCompleted) {
        debouncedUpdate(parseInt(reps) || 0, numValue, true);
      }
    };

    const handleRepsChange = (value: string) => {
      const cleanValue = value.replace(/[^0-9]/g, '');
      setReps(cleanValue);
      const numValue = parseInt(cleanValue) || 0;
      if (isCompleted) {
        debouncedUpdate(numValue, parseFloat(weight) || 0, true);
      }
    };

    const handleComplete = () => {
      if (isCompleted) {
        setIsCompleted(false);
        debouncedUpdate(0, parseFloat(weight) || 0, false);
      } else {
        const currentWeight = parseFloat(weight) || set.weight || 0;
        const currentReps = parseInt(reps) || set.target || 0;

        if (currentReps === 0 && !weight) return;

        setWeight(currentWeight.toString());
        setReps(currentReps.toString());
        setIsCompleted(true);
        debouncedUpdate(currentReps, currentWeight, true);
      }
    };

    const getPreviousData = () => {
      if (previousSet && previousSet.weight > 0 && previousSet.actual > 0) {
        return `${previousSet.weight} × ${previousSet.actual}`;
      }
      return '—';
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

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isCompleted && styles.inputCompleted]}
            value={weight}
            onChangeText={handleWeightChange}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            selectTextOnFocus
            editable={true}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isCompleted && styles.inputCompleted]}
            value={reps}
            onChangeText={handleRepsChange}
            placeholder={set.target > 0 ? set.target.toString() : '0'}
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            selectTextOnFocus
            editable={true}
          />
        </View>

        <TouchableOpacity
          style={[styles.completeButton, isCompleted && styles.completedButton]}
          onPress={handleComplete}
          activeOpacity={0.7}>
          <Animated.View
            style={{
              transform: [{scale: checkmarkScale}],
            }}>
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background + '30',
  },
  completedContainer: {
    backgroundColor: colors.primary + '10',
  },
  setNumberContainer: {
    width: 40,
    alignItems: 'center',
  },
  setNumber: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  previousContainer: {
    flex: 1,
    alignItems: 'center',
  },
  previousText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    fontWeight: typography.weights.medium,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  inputCompleted: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    color: colors.primary,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderWidth: 2,
    borderColor: colors.inputBorder,
  },
  completedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: typography.weights.bold,
  },
});

export default SetInputRow;
