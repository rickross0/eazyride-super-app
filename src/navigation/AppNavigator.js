import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ROLE_COLORS } from '../config';

// Auth
import RoleSelectScreen from '../screens/Auth/RoleSelectScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// Rider
import RiderHomeScreen from '../screens/Rider/RiderHomeScreen';
import RideRequestScreen from '../screens/Rider/RideRequestScreen';
import RideTrackingScreen from '../screens/Rider/RideTrackingScreen';
import RideHistoryScreen from '../screens/Rider/RideHistoryScreen';
import RideReceiptScreen from '../screens/Rider/RideReceiptScreen';
import CarRentalScreen from '../screens/Rider/CarRentalScreen';
import CarDetailScreen from '../screens/Rider/CarDetailScreen';
import CarBookingScreen from '../screens/Rider/CarBookingScreen';
import StoresScreen from '../screens/Rider/StoresScreen';
import StoreDetailScreen from '../screens/Rider/StoreDetailScreen';
import CartScreen from '../screens/Rider/CartScreen';
import ServiceCategoriesScreen from '../screens/Rider/ServiceCategoriesScreen';
import ServiceListingsScreen from '../screens/Rider/ServiceListingsScreen';
import ServiceRequestScreen from '../screens/Rider/ServiceRequestScreen';
import WalletScreen from '../screens/Rider/WalletScreen';
import LotteryScreen from '../screens/Rider/LotteryScreen';
import ProfileScreen from '../screens/Rider/ProfileScreen';

// Driver
import DriverHomeScreen from '../screens/Driver/DriverHomeScreen';
import DriverOrdersScreen from '../screens/Driver/DriverOrdersScreen';
import DriverEarningsScreen from '../screens/Driver/DriverEarningsScreen';
import DriverProfileScreen from '../screens/Driver/ProfileScreen';
import ActiveRideScreen from '../screens/Driver/ActiveRideScreen';
import RideRequestsScreen from '../screens/Driver/RideRequestsScreen';
import DeliveryPickupScreen from '../screens/Driver/DeliveryPickupScreen';
import DeliveryDropoffScreen from '../screens/Driver/DeliveryDropoffScreen';
import VehicleInfoScreen from '../screens/Driver/VehicleInfoScreen';

// Store Owner
import StoreOwnerHomeScreen from '../screens/StoreOwner/StoreOwnerHomeScreen';
import StoreInventoryScreen from '../screens/StoreOwner/StoreInventoryScreen';
import StoreOrdersScreen from '../screens/StoreOwner/StoreOrdersScreen';

// Provider
import ProviderHomeScreen from '../screens/Provider/ProviderHomeScreen';
import ProviderServicesScreen from '../screens/Provider/ProviderServicesScreen';
import ProviderOrdersScreen from '../screens/Provider/ProviderOrdersScreen';

// Shared
import ChatScreen from '../screens/Shared/ChatScreen';
import SharedProfileScreen from '../screens/Shared/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PlaceholderScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Feather name="tool" size={48} color={colors.textSecondary} />
      <Text style={{ fontSize: 18, color: colors.textSecondary, marginTop: 16, fontWeight: '600' }}>Feature Under Development</Text>
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function RiderTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: ROLE_COLORS.RIDER,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: 'navigation', History: 'clock', Wallet: 'dollar-sign', Profile: 'user' };
        return <Feather name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={RiderHomeScreen} />
      <Tab.Screen name="History" component={RideHistoryScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RiderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RiderTabs" component={RiderTabs} />
      <Stack.Screen name="RideRequest" component={RideRequestScreen} />
      <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
      <Stack.Screen name="RideReceipt" component={RideReceiptScreen} />
      <Stack.Screen name="CarRental" component={CarRentalScreen} />
      <Stack.Screen name="CarDetail" component={CarDetailScreen} />
      <Stack.Screen name="CarBooking" component={CarBookingScreen} />
      <Stack.Screen name="Stores" component={StoresScreen} />
      <Stack.Screen name="StoreDetail" component={StoreDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="ServiceCategories" component={ServiceCategoriesScreen} />
      <Stack.Screen name="ServiceListings" component={ServiceListingsScreen} />
      <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} />
      <Stack.Screen name="Lottery" component={LotteryScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function DriverTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: ROLE_COLORS.DRIVER,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: 'truck', Rides: 'list', Earnings: 'dollar-sign', Profile: 'user' };
        return <Feather name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={DriverHomeScreen} />
      <Tab.Screen name="Rides" component={DriverOrdersScreen} />
      <Tab.Screen name="Earnings" component={DriverEarningsScreen} />
      <Tab.Screen name="Profile" component={DriverProfileScreen} />
    </Tab.Navigator>
  );
}

function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverTabs" component={DriverTabs} />
      <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
      <Stack.Screen name="RideRequests" component={RideRequestsScreen} />
      <Stack.Screen name="DeliveryPickup" component={DeliveryPickupScreen} />
      <Stack.Screen name="DeliveryDropoff" component={DeliveryDropoffScreen} />
      <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}

function StoreTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: ROLE_COLORS.STORE_OWNER,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: 'shopping-bag', Inventory: 'package', Orders: 'shopping-cart', Profile: 'user' };
        return <Feather name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={StoreOwnerHomeScreen} />
      <Tab.Screen name="Inventory" component={StoreInventoryScreen} />
      <Tab.Screen name="Orders" component={StoreOrdersScreen} />
      <Tab.Screen name="Profile" component={SharedProfileScreen} />
    </Tab.Navigator>
  );
}

function StoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StoreTabs" component={StoreTabs} />
    </Stack.Navigator>
  );
}

function ProviderTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: ROLE_COLORS.SERVICE_PROVIDER,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: 'briefcase', Profile: 'user' };
        return <Feather name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={ProviderHomeScreen} />
      <Tab.Screen name="Profile" component={SharedProfileScreen} />
    </Tab.Navigator>
  );
}

function ProviderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
      <Stack.Screen name="Services" component={ProviderServicesScreen} />
      <Stack.Screen name="Requests" component={ProviderOrdersScreen} />
    </Stack.Navigator>
  );
}

function RoleNavigator() {
  const { user } = useAuth();
  const role = user?.role;

  switch (role) {
    case 'DRIVER':
      return <DriverStack />;
    case 'STORE_OWNER':
      return <StoreStack />;
    case 'SERVICE_PROVIDER':
      return <ProviderStack />;
    case 'RIDER':
    default:
      return <RiderStack />;
  }
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.text, fontSize: 16 }}>Loading Session...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <RoleNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
