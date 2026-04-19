import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import FacturaDetailScreen from '../screens/FacturaDetailScreen';
import FacturaFormScreen from '../screens/FacturaFormScreen';
import type { FacturasStackParamList } from './types';

const Stack = createNativeStackNavigator<FacturasStackParamList>();

export function FacturasNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Mis Facturas' }}
      />
      <Stack.Screen
        name="FacturaDetail"
        component={FacturaDetailScreen}
        options={{ title: 'Detalle' }}
      />
      <Stack.Screen
        name="FacturaForm"
        component={FacturaFormScreen}
        options={({ route }) => ({
          title: route.params?.facturaId ? 'Editar Factura' : 'Nueva Factura',
        })}
      />
    </Stack.Navigator>
  );
}
