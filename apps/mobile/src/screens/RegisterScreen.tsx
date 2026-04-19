import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import type { RegisterScreenProps } from '../navigation/types';

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register, loading } = useAuthContext();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rnc, setRnc] = useState('');
  const [empresa, setEmpresa] = useState('');

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      Alert.alert('Error', 'Nombre, correo y contraseña son requeridos');
      return;
    }
    try {
      await register(email.trim(), password, nombre.trim(), rnc || undefined, empresa || undefined);
    } catch {
      Alert.alert('Error', 'No se pudo crear la cuenta');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear Cuenta</Text>

        {([
          { label: 'Nombre completo *', value: nombre, setter: setNombre, autoCapitalize: 'words' as const },
          { label: 'Correo electrónico *', value: email, setter: setEmail, autoCapitalize: 'none' as const, keyboardType: 'email-address' as const },
          { label: 'Contraseña *', value: password, setter: setPassword, secure: true },
          { label: 'RNC (opcional)', value: rnc, setter: setRnc, keyboardType: 'numeric' as const },
          { label: 'Empresa (opcional)', value: empresa, setter: setEmpresa },
        ] as const).map(({ label, value, setter, autoCapitalize, keyboardType, secure }) => (
          <View key={label}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setter as (v: string) => void}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              secureTextEntry={secure}
              placeholderTextColor="#94a3b8"
              placeholder={label.replace(' *', '').replace(' (opcional)', '')}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Crear Cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  inner: { padding: 24, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '500', color: '#475569', marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 13,
    marginBottom: 14,
    fontSize: 15,
    color: '#1e293b',
  },
  btn: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', color: '#2563eb', fontSize: 14 },
});
