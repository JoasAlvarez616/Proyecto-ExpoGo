import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useClientes } from '../../src/hooks/useClientes';
import { useTheme } from '../../src/hooks/useTheme';
import { Header } from '../../src/components/Header';
import { SearchBar } from '../../src/components/SearchBar';
import { GlassCard } from '../../src/components/GlassCard';
import { FloatingActionButton } from '../../src/components/FloatingActionButton';
import { ConfirmModal } from '../../src/components/ConfirmModal';
import { formatCurrency } from '../../src/utils/formatters';
import { BorderRadius, Palette, Spacing, Typography } from '../../src/theme/tokens';
import { Cliente } from '../../src/types';

export default function ClientesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    clientes,
    loading,
    refreshing,
    refresh,
    busqueda,
    setBusqueda,
    eliminarCliente,
  } = useClientes();

  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleIntentarEliminar = (cli: Cliente) => {
    setClienteAEliminar(cli);
    setWarningMessage(null);
    setModalDeleteVisible(true);
  };

  const ejecutarEliminacion = async () => {
    if (!clienteAEliminar) return;

    const res = await eliminarCliente(clienteAEliminar.id);
    if (!res.success) {
      setWarningMessage(res.message);
    } else {
      setModalDeleteVisible(false);
      setClienteAEliminar(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Cartera de Clientes"
        subtitle={`${clientes.length} contactos registrados`}
        showBack
        rightAction={{
          icon: 'person-add',
          onPress: () => router.push('/cliente/nuevo'),
        }}
      />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por nombre, email o teléfono..."
          />
        </View>

        <FlatList
          data={clientes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.accentCyan}
              colors={[Palette.cyan400]}
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
              <GlassCard style={styles.clientCard}>
                <View style={styles.clientCardTop}>
                  <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={20} color={colors.accentCyan} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.clientName, { color: colors.textPrimary }]}>
                      {item.nombre}
                    </Text>
                    <Text style={[styles.clientEmail, { color: colors.textMuted }]}>
                      {item.email}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => router.push(`/cliente/nuevo?id=${item.id}`)}
                    style={[styles.editBtn, { backgroundColor: colors.surfaceSecondary }]}
                    hitSlop={8}
                  >
                    <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
                  </Pressable>

                  <Pressable
                    onPress={() => handleIntentarEliminar(item)}
                    style={[styles.deleteBtn, { backgroundColor: 'rgba(244, 63, 94, 0.12)' }]}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={16} color={Palette.rose400} />
                  </Pressable>
                </View>

                {item.telefono && (
                  <Text style={[styles.infoRowText, { color: colors.textSecondary }]}>
                    📞 {item.telefono}
                  </Text>
                )}

                {item.direccion && (
                  <Text style={[styles.infoRowText, { color: colors.textMuted }]}>
                    📍 {item.direccion}
                  </Text>
                )}

                <View style={[styles.clientMetricsRow, { borderTopColor: colors.divider }]}>
                  <View>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      Compras Realizadas
                    </Text>
                    <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
                      {item.ventas_count || 0} facturas
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                      Total Consumo
                    </Text>
                    <Text style={[styles.metricValHighlight, { color: Palette.emerald400 }]}>
                      {formatCurrency(item.total_compras || 0)}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}
          ListEmptyComponent={
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No hay clientes que coincidan
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Usa el botón inferior para registrar un nuevo cliente.
              </Text>
            </GlassCard>
          }
        />
      </View>

      <FloatingActionButton
        icon="person-add"
        onPress={() => router.push('/cliente/nuevo')}
      />

      {/* Modal de Confirmación para Borrado Físico */}
      <ConfirmModal
        visible={modalDeleteVisible}
        title={warningMessage ? 'No se puede eliminar' : '¿Eliminar cliente?'}
        message={
          warningMessage ||
          `¿Estás seguro de eliminar a ${clienteAEliminar?.nombre}? Esta acción solo procederá si el cliente no posee facturas registradas en el sistema.`
        }
        confirmText={warningMessage ? 'Aceptar' : 'Eliminar'}
        cancelText="Volver"
        variant={warningMessage ? 'warning' : 'danger'}
        onConfirm={warningMessage ? () => setModalDeleteVisible(false) : ejecutarEliminacion}
        onCancel={() => {
          setModalDeleteVisible(false);
          setClienteAEliminar(null);
          setWarningMessage(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 90,
  },
  clientCard: {
    marginBottom: Spacing.md,
  },
  clientCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  avatarCircle: {
    width: 40,
    height: 40,
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
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRowText: {
    ...Typography.caption,
    marginTop: 4,
    marginLeft: 48,
  },
  clientMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  metricLabel: {
    ...Typography.caption,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  metricVal: {
    ...Typography.bodyBold,
  },
  metricValHighlight: {
    ...Typography.title3,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.title3,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: Spacing.xl,
  },
});

