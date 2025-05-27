import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {colors} from '../../themes/colors';
import * as Progress from 'react-native-progress';

interface TimerModalProps {
  visible: boolean;
  onDismiss: () => void;
  initialDuration: number;
  timerUpdated: boolean;
  setTimerUpdated: (updated: boolean) => void;
}

export default function TimerModal({
  visible,
  onDismiss,
  timerUpdated,
  setTimerUpdated,
  initialDuration,
}: TimerModalProps) {
  const [timer, setTimer] = useState(initialDuration);
  const [maxDuration, setMaxDuration] = useState(initialDuration);

  useEffect(() => {
    if (visible) {
      setTimer(initialDuration);
      setMaxDuration(initialDuration);
    }
  }, [visible, initialDuration]);

  useEffect(() => {
    if (!timerUpdated) {
      setTimer(initialDuration);
      setMaxDuration(initialDuration);
      setTimerUpdated(true);
    }
  }, [initialDuration, timerUpdated, setTimerUpdated]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer <= 0 && visible) {
      onDismiss();
    }
    return () => clearInterval(interval);
  }, [visible, timer, onDismiss]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustTimer = (delta: number) => {
    setTimer(prev => {
      const newTimer = Math.max(0, prev + delta);
      if (newTimer > maxDuration) {
        setMaxDuration(newTimer);
      }
      return newTimer;
    });
  };

  const progress = timer / maxDuration;

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Progress.Bar
        progress={progress}
        width={null}
        height={3}
        color={colors.accent || '#007aff'}
        unfilledColor="transparent"
        borderWidth={0}
        style={styles.progressBar}
      />

      <View style={styles.content}>
        <Text style={styles.timerText}>{formatTime(timer)}</Text>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => adjustTimer(-15)}
            style={styles.button}>
            <Text style={styles.buttonText}>-15</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => adjustTimer(15)}
            style={styles.button}>
            <Text style={styles.buttonText}>+15</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDismiss}
            style={[styles.button, styles.skipButton]}>
            <Text style={[styles.buttonText, styles.skipButtonText]}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 12,
    right: 12,
    backgroundColor: colors.timerBackground || '#1c1c1e',
    borderRadius: 12,

    // iOS shadow
    shadowColor: colors.timerShadowColor || '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 10,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerText: {
    color: colors.textPrimary || '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: colors.inputBackground || '#2c2c2e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: colors.accent || '#007aff',
  },
  buttonText: {
    color: colors.textPrimary || '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#ffffff',
  },
});
