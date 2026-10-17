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
  // ⚠️ Inicia en 1 y NUNCA baja a 0 → el texto siempre es visible
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.08, { duration: 120 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    opacity.value = withSequence(
      withTiming(0.85, { duration: 80 }),
      withTiming(1, { duration: 150 })
    );
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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