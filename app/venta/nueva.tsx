import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSaleWizardStore } from '../../src/store/saleWizardStore';
import { useClientes } from '../../src/hooks/useClientes';
import { useProductos } from '../../src/hooks/useProductos';
import { useTheme } from '../../src/hooks/useTheme';
import { VentaService } from '../../src/services/VentaService';
import { Header } from '../../src/components/Header';
import { SearchBar } from '../../src/components/SearchBar';
import { GlassCard } from '../../src/components/GlassCard';
import { GradientButton } from '../../src/components/GradientButton';
import { AnimatedCounter } from '../../src/components/AnimatedCounter';
import { AnimatedBadge } from '../../src/components/AnimatedBadge';
import { SuccessModal } from '../../src/components/SuccessModal';
import { formatCurrency } from '../../src/utils/formatters';
import { BorderRadius, Palette, Spacing, Typography } from '../../src/theme/tokens';
import { Cliente, Producto } from '../../src/types';

export default function NuevaVentaScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const {
    currentStep,
    setStep,
    nextStep,
    prevStep,
    clienteSeleccionado,
    setCliente,
    items,
    addItem,
    updateItemQuantity,
    removeItem,
    totales,
    resetWizard,
  } = useSaleWizardStore();

  const { clientes, busqueda: busquedaCliente, setBusqueda: setBusquedaCliente } = useClientes();
  const { productos, busqueda: busquedaProducto, setBusqueda: setBusquedaProducto } = useProductos();

  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdVentaId, setCreatedVentaId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const steps = [
    { number: 1, title: 'Cliente' },
    { number: 2, title: 'Productos' },
    { number: 3, title: 'Resumen' },
  ];

  // ==========================================
  // PASO 1: SELECCIÓN DE CLIENTE
  // ==========================================
  const renderStepCliente = () => (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContent}>
      <Text style={[styles.stepInstruction, { color: colors.textSecondary }]}>
        Paso 1: Selecciona el cliente para emitir la factura o registra uno nuevo.
      </Text>

      <View style={styles.searchRow}>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={busquedaCliente}
            onChangeText={setBusquedaCliente}
            placeholder="Buscar por nombre, email o teléfono..."
          />
        </View>
        <Pressable
          onPress={() => router.push('/cliente/nuevo')}
          style={[styles.addClientBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
          hitSlop={8}
        >
          <Ionicons name="person-add" size={20} color={colors.accentCyan} />
        </Pressable>
      </View>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {clientes.map((cliente) => {
          const isSelected = clienteSeleccionado?.id === cliente.id;
          return (
            <Pressable
              key={cliente.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCliente(cliente);
              }}
              style={[
                styles.selectCard,
                {
                  backgroundColor: isSelected ? 'rgba(34, 211, 238, 0.12)' : colors.surface,
                  borderColor: isSelected ? Palette.cyan400 : colors.cardBorder,
                },
              ]}
            >
              <View style={styles.clientCardHeader}>
                <View style={styles.clientAvatar}>
                  <Ionicons
                    name="person"
                    size={18}
                    color={isSelected ? Palette.cyan400 : colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.clientName, { color: colors.textPrimary }]}>
                    {cliente.nombre}
                  </Text>
                  <Text style={[styles.clientEmail, { color: colors.textMuted }]}>
                    {cliente.email}
                  </Text>
                </View>

                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={Palette.cyan400} />
                )}
              </View>

              {cliente.telefono && (
                <Text style={[styles.clientPhone, { color: colors.textMuted }]}>
                  📞 {cliente.telefono}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.stepFooter}>
        <GradientButton
          title="Continuar a Productos"
          icon="arrow-forward"
          iconPosition="right"
          variant="primary"
          disabled={!clienteSeleccionado}
          onPress={nextStep}
        />
      </View>
    </Animated.View>
  );

  // ==========================================
  // PASO 2: AGREGAR PRODUCTOS Y STOCK
  // ==========================================
  const renderStepProductos = () => (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContent}>
      <Text style={[styles.stepInstruction, { color: colors.textSecondary }]}>
        Paso 2: Agrega productos al carrito. El inventario se valida automáticamente.
      </Text>

      <SearchBar
        value={busquedaProducto}
        onChangeText={setBusquedaProducto}
        placeholder="Buscar producto a vender..."
      />

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {productos.map((prod) => {
          const itemInCart = items.find((i) => i.producto.id === prod.id);
          const cantidadEnCarrito = itemInCart ? itemInCart.cantidad : 0;
          const stockRestante = prod.stock - cantidadEnCarrito;
          const agotado = stockRestante <= 0;

          return (
            <GlassCard key={prod.id} style={styles.productSaleCard}>
              <View style={styles.productSaleTop}>
                <View style={{ flex: 1, marginRight: Spacing.sm }}>
                  <Text style={[styles.productSaleName, { color: colors.textPrimary }]}>
                    {prod.nombre}
                  </Text>
                  <Text style={[styles.productSalePrice, { color: colors.accentCyan }]}>
                    {formatCurrency(prod.precio_venta)}
                  </Text>
                </View>

                <AnimatedBadge
                  type={agotado ? 'anulada' : prod.stock <= prod.stock_minimo ? 'bajo_stock' : 'activo'}
                  label={agotado ? 'Sin stock' : `${stockRestante} disp.`}
                  size="sm"
                />
              </View>

              <View style={styles.productSaleActions}>
                {cantidadEnCarrito > 0 ? (
                  <View style={styles.stepperContainer}>
                    <Pressable
                      onPress={() => updateItemQuantity(prod.id, cantidadEnCarrito - 1)}
                      style={[styles.stepperBtn, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <Ionicons name="remove" size={16} color={colors.textPrimary} />
                    </Pressable>

                    <Text style={[styles.stepperQty, { color: colors.textPrimary }]}>
                      {cantidadEnCarrito}
                    </Text>

                    <Pressable
                      disabled={agotado}
                      onPress={() => updateItemQuantity(prod.id, cantidadEnCarrito + 1)}
                      style={[
                        styles.stepperBtn,
                        { backgroundColor: colors.surfaceSecondary },
                        agotado && { opacity: 0.4 },
                      ]}
                    >
                      <Ionicons name="add" size={16} color={colors.textPrimary} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    disabled={agotado}
                    onPress={() => addItem(prod, 1)}
                    style={[
                      styles.addBtnSmall,
                      {
                        backgroundColor: agotado
                          ? colors.surfaceSecondary
                          : 'rgba(34, 211, 238, 0.15)',
                        borderColor: agotado ? colors.cardBorder : Palette.cyan400,
                      },
                    ]}
                  >
                    <Ionicons
                      name="cart-outline"
                      size={15}
                      color={agotado ? colors.textMuted : Palette.cyan400}
                    />
                    <Text
                      style={[
                        styles.addBtnSmallText,
                        { color: agotado ? colors.textMuted : Palette.cyan400 },
                      ]}
                    >
                      {agotado ? 'Agotado' : 'Agregar'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </GlassCard>
          );
        })}
      </ScrollView>

      {/* Mini resumen inferior del carrito */}
      <View style={[styles.cartBar, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <View>
          <Text style={[styles.cartBarLabel, { color: colors.textMuted }]}>
            {totales.itemsTotales} {totales.itemsTotales === 1 ? 'producto' : 'productos'}
          </Text>
          <AnimatedCounter
            value={totales.total}
            isCurrency={true}
            style={styles.cartBarTotal}
          />
        </View>

        <View style={styles.cartBarButtons}>
          <Pressable
            onPress={prevStep}
            style={[styles.backNavBtn, { backgroundColor: colors.surfaceSecondary }]}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>

          <GradientButton
            title="Revisar Totales"
            icon="arrow-forward"
            iconPosition="right"
            variant="primary"
            disabled={items.length === 0}
            onPress={nextStep}
          />
        </View>
      </View>
    </Animated.View>
  );

  // ==========================================
  // PASO 3: RESUMEN Y CONFIRMAR EN SQLITE
  // ==========================================
  const renderStepResumen = () => (
    <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContent}>
      <Text style={[styles.stepInstruction, { color: colors.textSecondary }]}>
        Paso 3: Verifica la liquidación tributaria y confirma la transacción.
      </Text>

      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {/* Tarjeta del Cliente */}
        <GlassCard style={styles.summaryCard}>
          <Text style={[styles.summaryCardTitle, { color: colors.accentCyan }]}>
            Cliente Facturado
          </Text>
          <Text style={[styles.summaryClientName, { color: colors.textPrimary }]}>
            {clienteSeleccionado?.nombre}
          </Text>
          <Text style={[styles.summaryClientDetail, { color: colors.textMuted }]}>
            Email: {clienteSeleccionado?.email}
          </Text>
          {clienteSeleccionado?.telefono && (
            <Text style={[styles.summaryClientDetail, { color: colors.textMuted }]}>
              Tel: {clienteSeleccionado.telefono}
            </Text>
          )}
        </GlassCard>

        {/* Desglose de Artículos */}
        <GlassCard style={styles.summaryCard}>
          <Text style={[styles.summaryCardTitle, { color: colors.accentViolet }]}>
            Artículos en Orden ({items.length})
          </Text>

          {items.map((it) => (
            <View key={it.producto.id} style={styles.summaryItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryItemName, { color: colors.textPrimary }]}>
                  {it.producto.nombre}
                </Text>
                <Text style={[styles.summaryItemSub, { color: colors.textMuted }]}>
                  {it.cantidad} x {formatCurrency(it.precio_unitario)}
                </Text>
              </View>

              <Text style={[styles.summaryItemTotal, { color: colors.textPrimary }]}>
                {formatCurrency(it.subtotal)}
              </Text>
            </View>
          ))}
        </GlassCard>

        {/* Liquidación Económica (Impuestos e IVA) */}
        <GlassCard style={[styles.summaryCard, { borderColor: Palette.cyan400 }]}>
          <Text style={[styles.summaryCardTitle, { color: colors.textPrimary }]}>
            Liquidación Contable
          </Text>

          <View style={styles.taxRow}>
            <Text style={[styles.taxLabel, { color: colors.textSecondary }]}>Subtotal Gravable</Text>
            <Text style={[styles.taxValue, { color: colors.textPrimary }]}>
              {formatCurrency(totales.subtotal)}
            </Text>
          </View>

          <View style={styles.taxRow}>
            <Text style={[styles.taxLabel, { color: colors.textSecondary }]}>IVA (19% Legal)</Text>
            <Text style={[styles.taxValue, { color: colors.accentCyan }]}>
              {formatCurrency(totales.impuesto)}
            </Text>
          </View>

          <View style={[styles.taxRow, styles.taxTotalRow, { borderTopColor: colors.divider }]}>
            <Text style={[styles.totalGrandLabel, { color: colors.textPrimary }]}>
              TOTAL A COBRAR
            </Text>
            <AnimatedCounter
              value={totales.total}
              isCurrency={true}
              style={styles.totalGrandValue}
            />
          </View>
        </GlassCard>

        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={Palette.rose400} />
            <Text style={styles.errorBoxText}>{errorMessage}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.confirmActionsRow}>
        <Pressable
          onPress={prevStep}
          style={[styles.backNavBtn, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={{ flex: 1 }}>
          <GradientButton
            title="Confirmar y Cobrar"
            icon="checkmark-done"
            variant="success"
            loading={loadingConfirm}
            onPress={handleConfirmarVenta}
          />
        </View>
      </View>
    </Animated.View>
  );

  const handleConfirmarVenta = () => {
    if (!clienteSeleccionado || items.length === 0) return;

    try {
      setLoadingConfirm(true);
      setErrorMessage(null);

      const ventaCreada = VentaService.createVenta({
        cliente_id: clienteSeleccionado.id,
        items: items.map((it) => ({
          producto_id: it.producto.id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          subtotal: it.subtotal,
        })),
        estado: 'pagada',
      });

      setCreatedVentaId(ventaCreada.id);
      setSuccessModalVisible(true);
    } catch (err: any) {
      console.error('Error al confirmar venta:', err);
      setErrorMessage(err?.message || 'Error al procesar la venta en la base de datos.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handleFinalizar = () => {
    setSuccessModalVisible(false);
    const idToNavigate = createdVentaId;
    resetWizard();
    if (idToNavigate) {
      router.replace(`/venta/${idToNavigate}`);
    } else {
      router.replace('/(tabs)/ventas');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Nueva Factura de Venta"
        subtitle={`Paso ${currentStep} de 3`}
        showBack
        onBackPress={() => {
          if (currentStep > 1) {
            prevStep();
          } else {
            router.back();
          }
        }}
      />

      {/* Indicador de Pasos Animado */}
      <View style={styles.stepsIndicatorContainer}>
        {steps.map((st, idx) => {
          const isActive = currentStep === st.number;
          const isDone = currentStep > st.number;

          return (
            <React.Fragment key={st.number}>
              <Pressable
                onPress={() => {
                  if (st.number < currentStep) setStep(st.number);
                }}
                style={styles.stepIndicatorItem}
              >
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: isDone
                        ? Palette.emerald400
                        : isActive
                        ? Palette.cyan400
                        : colors.surfaceSecondary,
                    },
                  ]}
                >
                  {isDone ? (
                    <Ionicons name="checkmark" size={14} color={Palette.slate900} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        { color: isActive ? Palette.slate900 : colors.textMuted },
                      ]}
                    >
                      {st.number}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: isActive ? Palette.cyan400 : colors.textMuted },
                  ]}
                >
                  {st.title}
                </Text>
              </Pressable>

              {idx < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor: isDone ? Palette.emerald400 : colors.divider,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Contenedor del paso activo */}
      <View style={{ flex: 1, paddingHorizontal: Spacing.lg }}>
        {currentStep === 1 && renderStepCliente()}
        {currentStep === 2 && renderStepProductos()}
        {currentStep === 3 && renderStepResumen()}
      </View>

      {/* Modal de Éxito al Confirmar Venta */}
      <SuccessModal
        visible={successModalVisible}
        title="¡Venta Procesada con Éxito!"
        message={`La factura #${createdVentaId} fue registrada y el inventario se actualizó atómicamente.`}
        buttonText="Ver Factura Detallada"
        onClose={handleFinalizar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  stepsIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  stepIndicatorItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    ...Typography.captionBold,
    fontSize: 12,
  },
  stepLabel: {
    ...Typography.captionBold,
    fontSize: 11,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  addClientBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  listContainer: {
    flex: 1,
  },
  selectCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  clientCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  clientAvatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: {
    ...Typography.bodyBold,
  },
  clientEmail: {
    ...Typography.caption,
    fontSize: 12,
  },
  clientPhone: {
    ...Typography.caption,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 44,
  },
  stepFooter: {
    paddingVertical: Spacing.md,
  },
  productSaleCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  productSaleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  productSaleName: {
    ...Typography.bodyBold,
    marginBottom: 2,
  },
  productSalePrice: {
    ...Typography.title3,
    fontWeight: '700',
  },
  productSaleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    ...Typography.title3,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center',
  },
  addBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  addBtnSmallText: {
    ...Typography.captionBold,
    fontSize: 12,
  },
  cartBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  cartBarLabel: {
    ...Typography.caption,
    fontSize: 11,
  },
  cartBarTotal: {
    fontSize: 20,
    fontWeight: '800',
  },
  cartBarButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backNavBtn: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginBottom: Spacing.md,
  },
  summaryCardTitle: {
    ...Typography.captionBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  summaryClientName: {
    ...Typography.title3,
    marginBottom: 2,
  },
  summaryClientDetail: {
    ...Typography.caption,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.12)',
  },
  summaryItemName: {
    ...Typography.bodyBold,
    fontSize: 14,
  },
  summaryItemSub: {
    ...Typography.caption,
    fontSize: 12,
  },
  summaryItemTotal: {
    ...Typography.bodyBold,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  taxLabel: {
    ...Typography.body,
  },
  taxValue: {
    ...Typography.bodyBold,
  },
  taxTotalRow: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  totalGrandLabel: {
    ...Typography.title3,
    fontWeight: '800',
  },
  totalGrandValue: {
    ...Typography.title1,
    fontWeight: '900',
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.sm,
  },
  errorBoxText: {
    ...Typography.captionBold,
    color: Palette.rose400,
    flex: 1,
  },
});

