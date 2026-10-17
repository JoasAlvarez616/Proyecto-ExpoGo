import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ProductoSchema, ProductoFormData } from '../../src/schemas/productoSchema';
import { ProductoService } from '../../src/services/ProductoService';
import { CategoriaService } from '../../src/services/CategoriaService';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/Header';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { SuccessModal } from '../../src/components/SuccessModal';
import { calculateProfitMargin } from '../../src/utils/calculations';
import { formatCurrency } from '../../src/utils/formatters';
import { Categoria } from '../../src/types';
import { BorderRadius, Palette, Spacing, Typography } from '../../src/theme/tokens';

export default function NuevoProductoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;
  const router = useRouter();
  const { colors } = useTheme();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormData>({
    resolver: zodResolver(ProductoSchema),
    defaultValues: {
      nombre: '',
      categoria_id: 1,
      descripcion: '',
      precio_compra: 0,
      precio_venta: 0,
      stock: 0,
      stock_minimo: 5,
    },
  });

  const watchPrecioCompra = watch('precio_compra') || 0;
  const watchPrecioVenta = watch('precio_venta') || 0;
  const watchCategoriaId = watch('categoria_id');

  const { gananciaNeta, margenPorcentaje } = calculateProfitMargin(
    Number(watchPrecioCompra),
    Number(watchPrecioVenta)
  );

  useEffect(() => {
    const cats = CategoriaService.getAll();
    setCategorias(cats);

    if (isEditing && id) {
      const prod = ProductoService.getById(parseInt(id, 10));
      if (prod) {
        setValue('nombre', prod.nombre);
        setValue('categoria_id', prod.categoria_id);
        setValue('descripcion', prod.descripcion || '');
        setValue('precio_compra', prod.precio_compra);
        setValue('precio_venta', prod.precio_venta);
        setValue('stock', prod.stock);
        setValue('stock_minimo', prod.stock_minimo);
      }
    }
  }, [id]);

  const onSubmit = (data: ProductoFormData) => {
    try {
      setErrorMessage(null);
      if (isEditing && id) {
        ProductoService.update(parseInt(id, 10), data);
      } else {
        ProductoService.create(data);
      }
      setSuccessModalVisible(true);
    } catch (err: any) {
      console.error('Error al guardar producto:', err);
      setErrorMessage(err?.message || 'Error inesperado al procesar el producto.');
    }
  };

  const handleModalClose = () => {
    setSuccessModalVisible(false);
    router.replace('/(tabs)/productos');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
        subtitle={isEditing ? 'Actualizar especificaciones' : 'Registro de inventario'}
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

          {/* Información General */}
          <GlassCard style={styles.card}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Nombre del Producto *
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
                  placeholder="Ej. Teclado Mecánico RGB"
                  placeholderTextColor={colors.textMuted}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre.message}</Text>}

            {/* Selector de Categoría */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Categoría *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categorias.map((cat) => {
                const isSelected = watchCategoriaId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setValue('categoria_id', cat.id)}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(34, 211, 238, 0.15)'
                          : colors.surfaceSecondary,
                        borderColor: isSelected ? Palette.cyan400 : colors.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        {
                          color: isSelected ? Palette.cyan400 : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '400',
                        },
                      ]}
                    >
                      {cat.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {errors.categoria_id && (
              <Text style={styles.errorText}>{errors.categoria_id.message}</Text>
            )}

            {/* Descripción */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Descripción (Opcional)
            </Text>
            <Controller
              control={control}
              name="descripcion"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: colors.inputBackground,
                      borderColor: colors.cardBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="Características, modelo o detalles adicionales..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value || ''}
                />
              )}
            />
          </GlassCard>

          {/* Precios y Rentabilidad Comercial */}
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Precios y Rentabilidad
            </Text>

            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Precio Compra *
                </Text>
                <Controller
                  control={control}
                  name="precio_compra"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: errors.precio_compra ? Palette.rose400 : colors.cardBorder,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={(val) => onChange(Number(val.replace(/[^0-9]/g, '')))}
                      value={value ? value.toString() : ''}
                    />
                  )}
                />
                {errors.precio_compra && (
                  <Text style={styles.errorText}>{errors.precio_compra.message}</Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Precio Venta *
                </Text>
                <Controller
                  control={control}
                  name="precio_venta"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: errors.precio_venta ? Palette.rose400 : colors.cardBorder,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      onBlur={onBlur}
                      onChangeText={(val) => onChange(Number(val.replace(/[^0-9]/g, '')))}
                      value={value ? value.toString() : ''}
                    />
                  )}
                />
                {errors.precio_venta && (
                  <Text style={styles.errorText}>{errors.precio_venta.message}</Text>
                )}
              </View>
            </View>

            {/* Simulador en vivo de Rentabilidad */}
            <View style={[styles.profitPreview, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={styles.profitPreviewItem}>
                <Text style={[styles.profitPreviewLabel, { color: colors.textMuted }]}>
                  Margen Estimado
                </Text>
                <Text
                  style={[
                    styles.profitPreviewValue,
                    {
                      color:
                        margenPorcentaje > 0 ? Palette.emerald400 : Palette.rose400,
                    },
                  ]}
                >
                  {margenPorcentaje > 0 ? `+${margenPorcentaje}%` : '0%'}
                </Text>
              </View>

              <View style={styles.profitPreviewItem}>
                <Text style={[styles.profitPreviewLabel, { color: colors.textMuted }]}>
                  Ganancia Neta
                </Text>
                <Text
                  style={[
                    styles.profitPreviewValue,
                    {
                      color:
                        gananciaNeta > 0 ? Palette.emerald400 : Palette.slate400,
                    },
                  ]}
                >
                  {formatCurrency(gananciaNeta)}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Inventario y Control de Stock */}
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Control de Inventario
            </Text>

            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Stock Inicial *
                </Text>
                <Controller
                  control={control}
                  name="stock"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: errors.stock ? Palette.rose400 : colors.cardBorder,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onChangeText={(val) => onChange(Number(val.replace(/[^0-9]/g, '')))}
                      value={value !== undefined ? value.toString() : '0'}
                    />
                  )}
                />
                {errors.stock && <Text style={styles.errorText}>{errors.stock.message}</Text>}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Stock Mínimo (Alerta)
                </Text>
                <Controller
                  control={control}
                  name="stock_minimo"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: errors.stock_minimo ? Palette.rose400 : colors.cardBorder,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder="5"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      onChangeText={(val) => onChange(Number(val.replace(/[^0-9]/g, '')))}
                      value={value !== undefined ? value.toString() : '5'}
                    />
                  )}
                />
                {errors.stock_minimo && (
                  <Text style={styles.errorText}>{errors.stock_minimo.message}</Text>
                )}
              </View>
            </View>
          </GlassCard>

          {/* Botón Guardar */}
          <View style={styles.submitContainer}>
            <GradientButton
              title={isEditing ? 'Actualizar Producto' : 'Registrar en Inventario'}
              icon="save-outline"
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Éxito */}
      <SuccessModal
        visible={successModalVisible}
        title={isEditing ? '¡Producto Actualizado!' : '¡Producto Creado!'}
        message={
          isEditing
            ? 'Los cambios se han guardado satisfactoriamente y el inventario ha sido actualizado.'
            : 'El nuevo producto ya se encuentra activo en el inventario y disponible para venta.'
        }
        buttonText="Ver Inventario"
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
  sectionTitle: {
    ...Typography.title3,
    marginBottom: Spacing.md,
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    ...Typography.caption,
    color: Palette.rose400,
    marginTop: 4,
    fontSize: 12,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  categoryOptionText: {
    ...Typography.captionBold,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  profitPreview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  profitPreviewItem: {
    alignItems: 'center',
  },
  profitPreviewLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  profitPreviewValue: {
    ...Typography.title3,
    fontWeight: '800',
    marginTop: 2,
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

