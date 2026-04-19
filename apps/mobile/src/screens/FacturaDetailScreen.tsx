import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFacturas } from '../hooks/useFacturas';
import type { FacturaDetailScreenProps } from '../navigation/types';
import type { Factura } from '../types';

const fmt = (value: string | number) => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-RD', { style: 'currency', currency: 'DOP' }).format(n);
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-RD', { year: 'numeric', month: 'long', day: 'numeric' });

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function FacturaDetailScreen({ route, navigation }: FacturaDetailScreenProps) {
  const { id } = route.params;
  const { getById, remove, loading } = useFacturas();
  const [factura, setFactura] = useState<Factura | null>(null);

  useEffect(() => {
    getById(id).then(setFactura);
  }, [id, getById]);

  const handleDelete = () => {
    Alert.alert('Eliminar Factura', '¿Estás seguro de que deseas eliminar esta factura?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const ok = await remove(id);
          if (ok) navigation.goBack();
        },
      },
    ]);
  };

  if (loading && !factura) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!factura) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Factura no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.ncf}>{factura.ncf}</Text>
        <Text style={[styles.estado, factura.estado === 'activa' ? styles.activa : styles.cancelada]}>
          {factura.estado}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información General</Text>
        <InfoRow label="RNC Proveedor" value={factura.rnc_proveedor} />
        <InfoRow label="Tipo Factura" value={factura.tipo_factura} />
        <InfoRow label="Fecha Factura" value={fmtDate(factura.fecha_factura)} />
        {factura.fecha_vencimiento && (
          <InfoRow label="Fecha Vencimiento" value={fmtDate(factura.fecha_vencimiento)} />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Montos</Text>
        <View style={styles.montoRow}>
          <View style={[styles.montoCard, { backgroundColor: '#dbeafe' }]}>
            <Text style={styles.montoLabel}>Monto</Text>
            <Text style={[styles.montoValue, { color: '#2563eb' }]}>{fmt(factura.monto)}</Text>
          </View>
          <View style={[styles.montoCard, { backgroundColor: '#f3e8ff' }]}>
            <Text style={styles.montoLabel}>ITBIS</Text>
            <Text style={[styles.montoValue, { color: '#7c3aed' }]}>{fmt(factura.itbis || 0)}</Text>
          </View>
          <View style={[styles.montoCard, { backgroundColor: '#ffedd5' }]}>
            <Text style={styles.montoLabel}>ISR</Text>
            <Text style={[styles.montoValue, { color: '#ea580c' }]}>{fmt(factura.isr || 0)}</Text>
          </View>
        </View>
      </View>

      {factura.descripcion ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.desc}>{factura.descripcion}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('FacturaForm', { facturaId: factura.id })}
        >
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { color: '#64748b', fontSize: 16 },
  header: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 14, elevation: 1 },
  ncf: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 6 },
  estado: { fontSize: 13, fontWeight: '600', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  activa: { backgroundColor: '#dcfce7', color: '#16a34a' },
  cancelada: { backgroundColor: '#f1f5f9', color: '#64748b' },
  section: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 14, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLabel: { fontSize: 13, color: '#64748b' },
  rowValue: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  montoRow: { flexDirection: 'row', gap: 10 },
  montoCard: { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  montoLabel: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  montoValue: { fontSize: 14, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#475569', lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  editBtn: { flex: 1, backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  editBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  deleteBtn: { flex: 1, backgroundColor: '#fee2e2', padding: 14, borderRadius: 8, alignItems: 'center' },
  deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
});
