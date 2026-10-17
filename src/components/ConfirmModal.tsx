import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GradientButton } from './GradientButton';
import { BorderRadius, Palette, Shadows, Spacing, Typography } from '../theme/tokens';
import { useTheme } from '../hooks/useTheme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading = false,
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.75);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 14, stiffness: 220 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.75, { duration: 150 });
    }
  }, [visible]);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const isDanger = variant === 'danger';
  const iconName = isDanger ? 'alert-circle' : 'help-circle';
  const iconColor = isDanger ? Palette.rose400 : Palette.amber400;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
            },
            Shadows.medium,
            animatedCardStyle,
          ]}
        >
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isDanger
                  ? 'rgba(244, 63, 94, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)',
              },
            ]}
          >
            <Ionicons name={iconName} size={36} color={iconColor} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCancel();
              }}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                {cancelText}
              </Text>
            </Pressable>

            <View style={styles.confirmButtonWrapper}>
              <GradientButton
                title={confirmText}
                variant={isDanger ? 'danger' : 'primary'}
                onPress={onConfirm}
                loading={loading}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.title2,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelText: {
    ...Typography.bodyBold,
  },
  confirmButtonWrapper: {
    flex: 1,
  },
});

