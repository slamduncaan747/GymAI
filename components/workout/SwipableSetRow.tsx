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
  const translateX = useRef(new Animated.Value(0)).current;
  const DELETE_BUTTON_WIDTH = 80;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          canDelete &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 10
        );
      },
      onPanResponderGrant: () => {
        translateX.setOffset(translateX._value);
        translateX.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (canDelete) {
          // Only allow left swipe (negative values) up to button width
          const newValue = Math.max(
            -DELETE_BUTTON_WIDTH,
            Math.min(0, gestureState.dx),
          );
          translateX.setValue(newValue);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateX.flattenOffset();

        if (gestureState.dx < -DELETE_BUTTON_WIDTH / 2 && canDelete) {
          // Reveal delete button
          Animated.spring(translateX, {
            toValue: -DELETE_BUTTON_WIDTH,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        } else {
          // Hide delete button
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
    }),
  ).current;

  const handleDelete = () => {
    // Quick slide out animation
    Animated.timing(translateX, {
      toValue: -400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  const hideDeleteButton = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Delete button - positioned absolutely */}
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
          {
            transform: [{translateX: translateX}],
          },
        ]}
        {...panResponder.panHandlers}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={hideDeleteButton}
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
    marginBottom: 2,
    backgroundColor: colors.background,
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
    width: 70,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  swipeableContent: {
    backgroundColor: colors.surface,
    position: 'relative',
    zIndex: 1,
  },
  setRowContainer: {
    flex: 1,
  },
});

export default SwipeableSetRow;
