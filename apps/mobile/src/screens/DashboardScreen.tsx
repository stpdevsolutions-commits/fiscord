import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFacturas } from '../hooks/useFacturas';
import type { DashboardScreenProps } from '../navigation/types';
import type { Factura } from '../types';

const TIPO_COLORS: Record<string, string> = {
  B01: '#dbeafe',
  B02: '#dcfce7',
  E31: '#fef9c3',
  E32: '#fee2e2',
};

function FacturaItem({
  item,
  onPress,
}: {
  item: Factura;
  onPress: () => void;
}) {
  const monto = new Intl.NumberFormat('es-RD', { style: 'currency', currency: 'DOP' }).format(
    parseFloat(String(item.monto)),
  );
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardRow}>
        <View
          style={[styles.tipoBadge, { backgroundColor: TIPO_COLORS[item.tipo_factura] ?? '#f1f5f9' }]}
        >
          <Text style={styles.tipoText}>{item.tipo_factura}</Text>
        </View>
        <Text style={[styles.estado, item.estado === 'activa' ? styles.estadoActiva : styles.estadoCancelada]}>
          {item.estado}
        </Text>
      </View>
      <Text style={styles.ncf} numberOfLines={1}>{item.ncf}</Text>
      <Text style={styles.rnc} numberOfLines={1}>RNC: {item.rnc_proveedor}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.monto}>{monto}</Text>
        <Text style={styles.fecha}>{item.fecha_factura}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { facturas, pagination, loading, error, getAll } = useFacturas();
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    (p: number) => getAll(undefined, p, 20),
    [getAll],
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await load(1);
    setRefreshing(false);
  }, [load]);

  const handleLoadMore = useCallback(() => {
    if (!loading && page < pagination.pages) setPage((p) => p + 1);
  }, [loading, page, pagination.pages]);

  if (loading && facturas.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{pagination.total}</Text>
        </View>
      </View>

      <FlatList
        data={facturas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FacturaItem
            item={item}
            onPress={() => navigation.navigate('FacturaDetail', { id: item.id })}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay facturas registradas</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FacturaForm', {})}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { margin: 12, padding: 10, backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: 6 },
  summaryRow: { flexDirection: 'row', padding: 16, gap: 12 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 14, alignItems: 'center', elevation: 1 },
  summaryLabel: { fontSize: 12, color: '#64748b' },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: '#2563eb', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 1 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  tipoBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  tipoText: { fontSize: 12, fontWeight: '600', color: '#1e293b' },
  estado: { fontSize: 12, fontWeight: '500' },
  estadoActiva: { color: '#16a34a' },
  estadoCancelada: { color: '#64748b' },
  ncf: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  rnc: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  monto: { fontSize: 16, fontWeight: 'bold', color: '#059669' },
  fecha: { fontSize: 12, color: '#94a3b8' },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40, fontSize: 15 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
