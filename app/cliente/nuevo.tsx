import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ClienteSchema, ClienteFormData } from '../../src/schemas/clienteSchema';
import { ClienteService } from '../../src/services/ClienteService';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/Header';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { SuccessModal } from '../../src/components/SuccessModal';
import { BorderRadius, Palette, Spacing, Typography } from '../../src/theme/tokens';

export default function NuevoClienteScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const router = useRouter();
  const { colors } = useTheme();

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(ClienteSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
    },
  });

  useEffect(() => {
    if (isEditing && id) {
      const cli = ClienteService.getById(parseInt(id, 10));
      if (cli) {
        setValue('nombre', cli.nombre);
        setValue('email', cli.email);
        setValue('telefono', cli.telefono || '');
        setValue('direccion', cli.direccion || '');
      }
    }
  }, [id]);

  const onSubmit = (data: ClienteFormData) => {
    try {
      setErrorMessage(null);
      if (isEditing && id) {
        ClienteService.update(parseInt(id, 10), data);
      } else {
        ClienteService.create(data);
      }
      
      setSuccessModalVisible(true);
    } catch (err: any) {
      console.error('Error al guardar cliente:', err);
      setErrorMessage(err?.message || 'Error al guardar los datos del cliente.');
    }
  };

  const handleModalClose = () => {
    setSuccessModalVisible(false);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        subtitle={isEditing ? 'Actualizar datos de contacto' : 'Registrar en cartera'}
        showBack
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {errorMessage && (
            <Animated.View entering={FadeInUp} style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={Palette.rose400} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </Animated.View>
          )}

          <GlassCard style={styles.card}>
            {/* Nombre Completo */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Nombre Completo *
            </Text>
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.nombre ? Palette.rose400 : colors.cardBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Ej. Valentina Ríos Castro"
                  placeholderTextColor={colors.textMuted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre.message}</Text>}

            {/* Email */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Correo Electrónico *
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.email ? Palette.rose400 : colors.cardBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="cliente@ejemplo.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            {/* Teléfono */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Teléfono de Contacto
            </Text>
            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.telefono ? Palette.rose400 : colors.cardBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="+57 301 234 5678"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                />
              )}
            />
            {errors.telefono && <Text style={styles.errorText}>{errors.telefono.message}</Text>}

            {/* Dirección */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Dirección de Despacho / Facturación
            </Text>
            <Controller
              control={control}
              name="direccion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: errors.direccion ? Palette.rose400 : colors.cardBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Carrera 43A # 1-50, Medellín"
                  placeholderTextColor={colors.textMuted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                />
              )}
            />
            {errors.direccion && <Text style={styles.errorText}>{errors.direccion.message}</Text>}
          </GlassCard>

          <View style={styles.submitContainer}>
            <GradientButton
              title={isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}
              icon="person-add-outline"
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={successModalVisible}
        title={isEditing ? '¡Cliente Actualizado!' : '¡Cliente Registrado!'}
        message={
          isEditing
            ? 'Los datos de contacto del cliente han sido actualizados con éxito.'
            : 'El cliente fue agregado exitosamente a la cartera y puede ser asociado a facturas de venta.'
        }
        buttonText="Aceptar"
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    ...Typography.captionBold,
    marginBottom: 6,
  },
  input: {
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorText: {
    ...Typography.caption,
    color: Palette.rose400,
    marginTop: 4,
    fontSize: 12,
  },
  submitContainer: {
    marginTop: Spacing.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: Palette.rose400,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    ...Typography.captionBold,
    color: Palette.rose400,
    flex: 1,
  },
});

