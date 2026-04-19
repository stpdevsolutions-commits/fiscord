import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFacturas } from '../hooks/useFacturas';
import { ocrAPI } from '../services/api';
import type { FacturaFormScreenProps } from '../navigation/types';
import type { Factura } from '../types';

type FormData = {
  ncf: string;
  rnc_proveedor: string;
  tipo_factura: string;
  monto: string;
  itbis: string;
  isr: string;
  fecha_factura: string;
  fecha_vencimiento: string;
  descripcion: string;
  estado: string;
};

const TIPOS = ['B01', 'B02', 'E31', 'E32'];
const ESTADOS = ['activa', 'cancelada'];

const emptyForm = (): FormData => ({
  ncf: '',
  rnc_proveedor: '',
  tipo_factura: 'B01',
  monto: '',
  itbis: '',
  isr: '',
  fecha_factura: new Date().toISOString().split('T')[0],
  fecha_vencimiento: '',
  descripcion: '',
  estado: 'activa',
});

export default function FacturaFormScreen({ route, navigation }: FacturaFormScreenProps) {
  const { facturaId } = route.params ?? {};
  const { getById, create, update, loading } = useFacturas();
  const [form, setForm] = useState<FormData>(emptyForm());
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrFields, setOcrFields] = useState<Set<string>>(new Set());
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (facturaId) {
      getById(facturaId).then((f) => {
        if (f) {
          setForm({
            ncf: f.ncf,
            rnc_proveedor: f.rnc_proveedor,
            tipo_factura: f.tipo_factura,
            monto: String(f.monto),
            itbis: String(f.itbis ?? ''),
            isr: String(f.isr ?? ''),
            fecha_factura: f.fecha_factura,
            fecha_vencimiento: f.fecha_vencimiento ?? '',
            descripcion: f.descripcion ?? '',
            estado: f.estado,
          });
        }
      });
    }
  }, [facturaId, getById]);

  const set = (field: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitas permitir el acceso a la galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitas permitir el acceso a la cámara');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleOcr = async () => {
    if (!imageUri) {
      Alert.alert('Sin imagen', 'Primero selecciona o captura una imagen');
      return;
    }
    setOcrLoading(true);
    try {
      const result = await ocrAPI.scan(imageUri);
      const filled = new Set<string>();
      if (result.ncf) { setForm((p) => ({ ...p, ncf: result.ncf! })); filled.add('ncf'); }
      if (result.rnc) { setForm((p) => ({ ...p, rnc_proveedor: result.rnc! })); filled.add('rnc_proveedor'); }
      if (result.monto) { setForm((p) => ({ ...p, monto: String(result.monto) })); filled.add('monto'); }
      if (result.fecha) { setForm((p) => ({ ...p, fecha_factura: result.fecha! })); filled.add('fecha_factura'); }
      setOcrFields(filled);
      if (filled.size === 0) Alert.alert('OCR', 'No se detectaron campos. Intenta con una imagen más clara.');
    } catch {
      Alert.alert('Error', 'No se pudo procesar la imagen');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.ncf || !form.rnc_proveedor || !form.monto || !form.fecha_factura) {
      Alert.alert('Error', 'NCF, RNC, monto y fecha son requeridos');
      return;
    }

    const payload: Omit<Factura, 'id' | 'usuario_id' | 'created_at' | 'updated_at' | 'deleted_at'> = {
      ncf: form.ncf.trim(),
      rnc_proveedor: form.rnc_proveedor.trim(),
      tipo_factura: form.tipo_factura,
      monto: parseFloat(form.monto),
      itbis: form.itbis ? parseFloat(form.itbis) : undefined,
      isr: form.isr ? parseFloat(form.isr) : undefined,
      fecha_factura: form.fecha_factura,
      fecha_vencimiento: form.fecha_vencimiento || undefined,
      descripcion: form.descripcion || undefined,
      estado: form.estado,
    };

    const result = facturaId ? await update(facturaId, payload) : await create(payload);
    if (result) navigation.goBack();
  };

  const inputStyle = (field: string) => [
    styles.input,
    ocrFields.has(field) && styles.inputOcr,
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Foto + OCR */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Escanear Factura (OCR)</Text>
        <View style={styles.imgButtons}>
          <TouchableOpacity style={styles.imgBtn} onPress={handleCamera}>
            <Text style={styles.imgBtnText}>📷 Cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imgBtn} onPress={handlePickImage}>
            <Text style={styles.imgBtnText}>🖼 Galería</Text>
          </TouchableOpacity>
        </View>
        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity style={styles.ocrBtn} onPress={handleOcr} disabled={ocrLoading}>
              {ocrLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ocrBtnText}>🔍 Extraer datos con OCR</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Campos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos de la Factura</Text>

        <Text style={styles.label}>NCF *</Text>
        <TextInput style={inputStyle('ncf')} value={form.ncf} onChangeText={set('ncf')} autoCapitalize="characters" placeholderTextColor="#94a3b8" placeholder="E31..." />

        <Text style={styles.label}>RNC Proveedor *</Text>
        <TextInput style={inputStyle('rnc_proveedor')} value={form.rnc_proveedor} onChangeText={set('rnc_proveedor')} keyboardType="numeric" placeholderTextColor="#94a3b8" placeholder="123456789" />

        <Text style={styles.label}>Tipo Factura</Text>
        <View style={styles.pills}>
          {TIPOS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.pill, form.tipo_factura === t && styles.pillActive]}
              onPress={() => set('tipo_factura')(t)}
            >
              <Text style={[styles.pillText, form.tipo_factura === t && styles.pillTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Fecha Factura *</Text>
        <TextInput style={inputStyle('fecha_factura')} value={form.fecha_factura} onChangeText={set('fecha_factura')} placeholder="YYYY-MM-DD" placeholderTextColor="#94a3b8" />

        <Text style={styles.label}>Monto *</Text>
        <TextInput style={inputStyle('monto')} value={form.monto} onChangeText={set('monto')} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#94a3b8" />

        <Text style={styles.label}>ITBIS</Text>
        <TextInput style={styles.input} value={form.itbis} onChangeText={set('itbis')} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#94a3b8" />

        <Text style={styles.label}>ISR</Text>
        <TextInput style={styles.input} value={form.isr} onChangeText={set('isr')} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor="#94a3b8" />

        <Text style={styles.label}>Fecha Vencimiento</Text>
        <TextInput style={styles.input} value={form.fecha_vencimiento} onChangeText={set('fecha_vencimiento')} placeholder="YYYY-MM-DD (opcional)" placeholderTextColor="#94a3b8" />

        <Text style={styles.label}>Estado</Text>
        <View style={styles.pills}>
          {ESTADOS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.pill, form.estado === e && styles.pillActive]}
              onPress={() => set('estado')(e)}
            >
              <Text style={[styles.pillText, form.estado === e && styles.pillTextActive]}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={form.descripcion}
          onChangeText={set('descripcion')}
          multiline
          numberOfLines={3}
          placeholder="Descripción opcional..."
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>{facturaId ? 'Guardar' : 'Crear Factura'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  section: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 14, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: '#475569', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  inputOcr: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  textarea: { height: 80, textAlignVertical: 'top' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  pillActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  pillText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  pillTextActive: { color: '#fff' },
  imgButtons: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  imgBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  imgBtnText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  preview: { width: '100%', height: 180, borderRadius: 8, marginBottom: 10 },
  ocrBtn: { backgroundColor: '#7c3aed', padding: 13, borderRadius: 8, alignItems: 'center' },
  ocrBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  formActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#f1f5f9', padding: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: '600', fontSize: 15 },
  submitBtn: { flex: 2, backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
