// components/workout/SetInputRow.tsx

import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {WorkoutSet} from '../../types/workout';
import {colors, typography, spacing} from '../../themes';
import {debounce} from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';

interface SetInputRowProps {
  setNumber: number;
  set: WorkoutSet;
  onUpdate: (actual: number, weight: number, completed: boolean) => void;
  onDelete?: () => void;
  previousSet?: WorkoutSet;
  restTime?: number;
  canDelete?: boolean;
}

const SetInputRow: React.FC<SetInputRowProps> = React.memo(
  ({
    setNumber,
    set,
    onUpdate,
    onDelete,
    previousSet,
    restTime = 60,
    canDelete = true,
  }) => {
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
    const rowScale = useRef(new Animated.Value(1)).current;
    const deleteOpacity = useRef(new Animated.Value(0)).current;
    const [showDelete, setShowDelete] = useState(false);

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

      // Animate button press
      Animated.sequence([
        Animated.timing(rowScale, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rowScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const toggleDelete = () => {
      const newShowDelete = !showDelete;
      setShowDelete(newShowDelete);

      Animated.timing(deleteOpacity, {
        toValue: newShowDelete ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    const handleDelete = () => {
      Animated.timing(rowScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onDelete?.();
      });
    };

    const getPreviousData = () => {
      if (previousSet && previousSet.weight > 0 && previousSet.actual > 0) {
        return `${previousSet.weight} × ${previousSet.actual}`;
      }
      return '—';
    };

    return (
      <Animated.View
        style={[
          styles.container,
          isCompleted && styles.completedContainer,
          {transform: [{scale: rowScale}]},
        ]}>
        <Text style={styles.setNumber}>{setNumber}</Text>

        <Text style={styles.previousText}>{getPreviousData()}</Text>

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

        {!showDelete ? (
          <TouchableOpacity
            style={[
              styles.completeButton,
              isCompleted && styles.completedButton,
            ]}
            onPress={handleComplete}
            onLongPress={canDelete ? toggleDelete : undefined}
            activeOpacity={0.7}>
            <Animated.View
              style={{
                transform: [{scale: checkmarkScale}],
              }}>
              <Icon
                name={isCompleted ? 'checkmark' : 'checkmark'}
                size={20}
                color={isCompleted ? colors.buttonText : colors.textTertiary}
              />
            </Animated.View>
          </TouchableOpacity>
        ) : (
          <Animated.View style={{opacity: deleteOpacity}}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.7}>
              <Icon name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  completedContainer: {
    backgroundColor: colors.cardBackground,
  },
  setNumber: {
    flex: 1,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  previousText: {
    flex: 1,
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.xs,
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputCompleted: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    color: colors.primary,
  },
  completeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  completedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});

export default SetInputRow;
