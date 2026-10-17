import React, { useEffect } from 'react';
import { StyleSheet, TextStyle, StyleProp, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Typography } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';

interface AnimatedCounterProps {
  value: number;
  isCurrency?: boolean;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  isCurrency = true,
  style,
  prefix = '',
  suffix = '',
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  // ⚠️ Solo animamos `scale`. La opacidad queda fija en 1 → el número
  // SIEMPRE es visible, incluso si la animación se interrumpe.
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 120 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const safeValue = Number.isFinite(value) ? value : 0;
  const formattedText = isCurrency ? formatCurrency(safeValue) : formatNumber(safeValue);

  return (
    <Animated.View style={animatedStyle}>
      <Text style={[styles.text, { color: colors.textPrimary }, style]}>
        {prefix}
        {formattedText}
        {suffix}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  text: {
    ...Typography.title1,
  },
});