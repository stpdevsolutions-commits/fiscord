import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { FacturasNavigator } from './FacturasNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import type { AppTabParamList } from './types';

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen
        name="Facturas"
        component={FacturasNavigator}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🧾</Text> }}
      />
      <Tab.Screen
        name="NuevaFactura"
        component={FacturasNavigator}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>➕</Text>,
          tabBarLabel: 'Nueva',
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Facturas', {
              screen: 'FacturaForm',
              params: {},
            });
          },
        })}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}
