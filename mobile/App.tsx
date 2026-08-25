import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getValidToken } from './src/api';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PrayerRequestsScreen from './src/screens/PrayerRequestsScreen';
import MeetingsScreen from './src/screens/MeetingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Tab = createBottomTabNavigator();

function MainTabs({ onLoggedOut }: { onLoggedOut: () => void }) {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#6d32e9' }}>
      <Tab.Screen name="Tableau de bord">{() => <DashboardScreen onLoggedOut={onLoggedOut} />}</Tab.Screen>
      <Tab.Screen name="Demandes" component={PrayerRequestsScreen} />
      <Tab.Screen name="Réunions" component={MeetingsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getValidToken().then((token) => setLoggedIn(Boolean(token)));
  }, []);

  if (loggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {loggedIn ? <MainTabs onLoggedOut={() => setLoggedIn(false)} /> : <LoginScreen onLoggedIn={() => setLoggedIn(true)} />}
    </NavigationContainer>
  );
}
