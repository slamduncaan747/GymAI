// components/common/Card.tsx
import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {colors, spacing, shadows} from '../../themes';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outline';
  noPadding?: boolean;
}

export default function Card({
  children,
  style,
  variant = 'default',
  noPadding = false,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outline' && styles.outline,
        noPadding && styles.noPadding,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: spacing.md,
    ...shadows.small,
  },
  elevated: {
    backgroundColor: colors.elevated,
    ...shadows.medium,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  noPadding: {
    padding: 0,
  },
});
