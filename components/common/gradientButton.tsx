// components/common/GradientButton.tsx

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Animated,
} from 'react-native';
import {colors, typography, spacing} from '../../themes';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: typography.sizes.caption,
        };
      case 'large':
        return {
          paddingVertical: spacing.md + 2,
          paddingHorizontal: spacing.xl,
          fontSize: typography.sizes.bodyLarge,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          fontSize: typography.sizes.body,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'ghost':
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
      case 'ghost':
        return styles.outlineText;
      default:
        return styles.buttonText;
    }
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={[
          styles.button,
          getButtonStyle(),
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
          isDisabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator
            color={
              variant === 'outline' || variant === 'ghost'
                ? colors.primary
                : colors.buttonText
            }
            size="small"
          />
        ) : (
          <Text
            style={[
              getTextStyle(),
              {fontSize: sizeStyles.fontSize},
              textStyle,
            ]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: colors.buttonText,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  outlineText: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },
  disabled: {
    opacity: 0.5,
  },
});
