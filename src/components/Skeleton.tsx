import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius } from '../theme/tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceSecondary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { backgroundColor: colors.surface, borderColor: colors.cardBorder },
      ]}
    >
      <Skeleton width="45%" height={18} borderRadius={8} />
      <Skeleton width="75%" height={14} borderRadius={6} style={{ marginTop: 8 }} />
      <Skeleton width="30%" height={22} borderRadius={8} style={{ marginTop: 14 }} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  cardContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
});

