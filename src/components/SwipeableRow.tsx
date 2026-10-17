import React from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BorderRadius, Palette, Spacing, Typography } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = -90;

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteLabel?: string;
  disabled?: boolean;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onDelete,
  deleteLabel = 'Eliminar',
  disabled = false,
}) => {
  const translateX = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleAction = () => {
    onDelete();
    translateX.value = withTiming(0);
  };

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Solo permitir deslizamiento hacia la izquierda
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -120);
      } else {
        translateX.value = 0;
      }
    })
    .onEnd(() => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-100, { damping: 15 });
        runOnJS(triggerHaptic)();
      } else {
        translateX.value = withSpring(0, { damping: 15 });
      }
    });

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? withTiming(1) : withTiming(0),
  }));

  return (
    <View style={styles.container}>
      {/* Fondo de acción deslizable (Delete) */}
      <Animated.View style={[styles.deleteBackground, animatedBackdropStyle]}>
        <Pressable
          onPress={handleAction}
          style={styles.deleteButton}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Ionicons name="trash-outline" size={22} color={Palette.white} />
          <Text style={styles.deleteText}>{deleteLabel}</Text>
        </Pressable>
      </Animated.View>

      {/* Contenido principal animado */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedRowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  deleteBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Palette.rose500,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: Spacing.lg,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    ...Typography.captionBold,
    color: Palette.white,
    fontSize: 11,
    marginTop: 2,
  },
});

