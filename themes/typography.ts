// themes/typography.ts
import {Platform} from 'react-native';

export const typography = {
  // Font families
  fontFamily: Platform.select({
    ios: {
      regular: 'SF Pro Display',
      medium: 'SF Pro Display',
      semibold: 'SF Pro Display',
      bold: 'SF Pro Display',
      mono: 'SF Mono',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto-Medium',
      semibold: 'Roboto-Medium',
      bold: 'Roboto-Bold',
      mono: 'RobotoMono-Regular',
    },
  }),

  // Font sizes - Refined scale
  sizes: {
    micro: 11,
    caption: 13,
    body: 16,
    bodyLarge: 17,
    headline: 20,
    title: 24,
    display: 32,
    hero: 40,
    xxl: 48,
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.02,
    wider: 0.08, // For uppercase micro text
  },
};
