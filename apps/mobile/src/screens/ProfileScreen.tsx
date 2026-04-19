import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuthContext } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout },
    ]);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.nombre.charAt(0).toUpperCase()}</Text>
      </View>

      <Text style={styles.nombre}>{user.nombre}</Text>
      <Text style={styles.email}>{user.email}</Text>

      {user.empresa && <Text style={styles.empresa}>{user.empresa}</Text>}
      {user.rnc && <Text style={styles.rnc}>RNC: {user.rnc}</Text>}

      <View style={styles.card}>
        <InfoRow label="Correo" value={user.email} />
        {user.rnc && <InfoRow label="RNC" value={user.rnc} />}
        {user.empresa && <InfoRow label="Empresa" value={user.empresa} />}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', padding: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  nombre: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  email: { fontSize: 14, color: '#64748b', marginTop: 4 },
  empresa: { fontSize: 14, color: '#475569', marginTop: 2 },
  rnc: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 10, padding: 16, marginTop: 24, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowLabel: { fontSize: 13, color: '#64748b' },
  rowValue: { fontSize: 13, fontWeight: '500', color: '#1e293b', flex: 1, textAlign: 'right' },
  logoutBtn: { marginTop: 32, backgroundColor: '#fee2e2', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 8 },
  logoutText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
});
