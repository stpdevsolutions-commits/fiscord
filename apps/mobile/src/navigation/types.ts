import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Facturas: undefined;
  NuevaFactura: undefined;
  Perfil: undefined;
};

export type FacturasStackParamList = {
  Dashboard: undefined;
  FacturaDetail: { id: string };
  FacturaForm: { facturaId?: string };
};

export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type DashboardScreenProps = NativeStackScreenProps<FacturasStackParamList, 'Dashboard'>;
export type FacturaDetailScreenProps = NativeStackScreenProps<FacturasStackParamList, 'FacturaDetail'>;
export type FacturaFormScreenProps = NativeStackScreenProps<FacturasStackParamList, 'FacturaForm'>;
