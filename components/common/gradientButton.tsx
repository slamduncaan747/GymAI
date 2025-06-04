import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import {colors, typography, spacing, shadows} from '../../themes';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export default function GradientButton({
  onPress,
  title,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
}: GradientButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: typography.sizes.sm,
        };
      case 'large':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          fontSize: typography.sizes.lg,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          fontSize: typography.sizes.md,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[
          styles.outlineButton,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text
            style={[
              styles.outlineText,
              {fontSize: sizeStyles.fontSize},
              textStyle,
            ]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.9}>
      <View
        style={[
          styles.gradient,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
          variant === 'primary' && styles.primaryGradient,
          variant === 'secondary' && styles.secondaryGradient,
        ]}>
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text
            style={[styles.text, {fontSize: sizeStyles.fontSize}, textStyle]}>
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.medium,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Base layer for gradient effect
  },
  primaryGradient: {
    backgroundColor: colors.gradient.start, // Solid color as a fallback
    position: 'relative',
    overflow: 'hidden',
  },
  secondaryGradient: {
    backgroundColor: colors.secondary, // Solid color as a fallback
    position: 'relative',
    overflow: 'hidden',
  },
  text: {
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  outlineButton: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
});
