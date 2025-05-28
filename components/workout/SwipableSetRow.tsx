import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import {WorkoutSet} from '../../types/workout';
import SetInputRow from './SetInputRow';
import {colors} from '../../themes/colors';

interface SwipeableSetRowProps {
  setNumber: number;
  set: WorkoutSet;
  onUpdate: (actual: number, weight: number, completed: boolean) => void;
  onDelete: () => void;
  previousSet?: WorkoutSet;
  restTime?: number;
  canDelete?: boolean;
}

const SwipeableSetRow: React.FC<SwipeableSetRowProps> = ({
  setNumber,
  set,
  onUpdate,
  onDelete,
  previousSet,
  restTime,
  canDelete = true,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const DELETE_BUTTON_WIDTH = 80;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return (
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
        Math.abs(gestureState.dx) > 10
      );
    },
    onPanResponderGrant: () => {
      // @ts-ignore - _value is a private property but we need it
      translateX.setOffset(translateX._value);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (canDelete) {
        // Only allow left swipe (negative values)
        const newValue = Math.min(0, gestureState.dx);
        translateX.setValue(newValue);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      translateX.flattenOffset();

      if (gestureState.dx < -DELETE_BUTTON_WIDTH / 2 && canDelete) {
        // Reveal delete button
        setIsRevealed(true);
        Animated.spring(translateX, {
          toValue: -DELETE_BUTTON_WIDTH,
          useNativeDriver: false,
        }).start();
      } else {
        // Hide delete button
        setIsRevealed(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const handleDelete = () => {
    Animated.spring(translateX, {
      toValue: -300, // Slide completely off screen
      useNativeDriver: false,
    }).start(() => {
      onDelete();
    });
  };

  const hideDeleteButton = () => {
    setIsRevealed(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Delete button background */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.swipeableContent,
          {transform: [{translateX: translateX}]},
        ]}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={isRevealed ? hideDeleteButton : undefined}
          style={styles.setRowContainer}>
          <SetInputRow
            setNumber={setNumber}
            set={set}
            onUpdate={onUpdate}
            previousSet={previousSet}
            restTime={restTime}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80%',
    width: 70,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  swipeableContent: {
    backgroundColor: colors.setRowBackground,
  },
  setRowContainer: {
    flex: 1,
  },
});

export default SwipeableSetRow;
