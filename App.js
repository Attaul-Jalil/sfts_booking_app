// App.js

import React, { useEffect } from 'react';
import { Alert, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

// Import screens
import Signup from './src/screens/SignUp';
import DriverSignup from './src/screens/DriverSignUp';
import Login from './src/screens/Login';
import DashboardScreen from './src/screens/DashboardScreen';
import Profile from './src/screens/Profile';
import DriverProfile from './src/screens/DriverProfile';
import GetRidesScreen from './src/screens/GetRidesScreen';
import ViewAvailableRidesScreen from './src/screens/ViewAvailableRidesScreen';
import MainScreen from './src/screens/MainScreen';
import UserChat from './src/screens/UserChat';
import DriverChat from './src/screens/DriverChat';
import ActiveUsersAndDriversScreen from './src/screens/ActiveUsersAndDriversScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location permission is required to access this feature.',
          [{ text: 'OK' }]
        );
      } else {
        let location = await Location.getCurrentPositionAsync({});
        console.log('User location:', location);
      }
    };

    requestLocationPermission();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="Signup" component={Signup} options={headerOptions('Sign Up')} />
        <Stack.Screen name="DriverSignup" component={DriverSignup} options={headerOptions('Driver Sign Up')} />
        <Stack.Screen name="Login" component={Login} options={headerOptions('Login')} />
        <Stack.Screen name="Profile" component={Profile} options={headerOptions('Profile')} />
        <Stack.Screen name="DriverProfile" component={DriverProfile} options={headerOptions('DriverProfile')} />
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} options={headerOptions('DashboardScreen')} />
        <Stack.Screen name="GetRidesScreen" component={GetRidesScreen} options={headerOptions('Available Rides')} />
        <Stack.Screen name="ViewAvailableRides" component={ViewAvailableRidesScreen} options={headerOptions('Available Rides')} />
        <Stack.Screen name="UserChat" component={UserChat} options={headerOptions('UserChat')} />
        <Stack.Screen name="DriverChat" component={DriverChat} options={headerOptions('DriverChat')} />
        <Stack.Screen name="ActiveUsersAndDriversScreen" component={Chat} options={headerOptions('ActiveUsersAndDriversScreen')} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const headerOptions = (title) => ({
  title,
  headerStyle: { backgroundColor: '#1e90ff' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
  headerShown: true,
  headerBackImage: () => (
    <Image
      source={require('./assets/back-icon.png')} // Adjust path if needed
      style={{ width: 24, height: 24, tintColor: '#fff' }} // Tint to match header text color
    />
  ),
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e90ff',
  },
});
