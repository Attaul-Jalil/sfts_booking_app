import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import MainScreen from './src/screens/MainScreen';
import Login from './src/screens/Login'; // Ensure this matches the file name
import ForgotPassword from './src/screens/ForgotPassword';
import Profile from './src/screens/Profile';
import DriverProfile from './src/screens/DriverProfile';
import RideBooking from './src/screens/RideBookingScreen'; 
import VehicleRegistration from './src/screens/VehicleRegistrationScreen'; 
import DashboardScreen from './src/screens/DashboardScreen'; 
import Signup from './src/screens/SignUp';
import DriverSignup from './src/screens/DriverSignUp';
import GetRidesScreen from './src/screens/GetRidesScreen';
import RideHistoryScreen from './src/screens/RideHistoryScreen';
// import SplashScreen from './src/screens/SplashScreen';
import ViewAvailableRidesScreen from './src/screens/ViewAvailableRidesScreen';
import UserChat from './src/screens/UserChat';
import DriverChat from './src/screens/DriverChat';
import ActiveUsersAndDriversScreen from './src/screens/ActiveUsersAndDriversScreen';


// Create a Stack Navigator
const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="MainScreen">
      <Stack.Screen name="MainScreen" component={MainScreen} />
      <Stack.Screen name="SignUp" component={Signup} />
      <Stack.Screen name="DriverSignUp" component={DriverSignup} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="DriverProfile" component={DriverProfile} />
      <Stack.Screen name="RideBooking" component={RideBooking} />
      <Stack.Screen name="VehicleRegistration" component={VehicleRegistration} />
      <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
      <Stack.Screen name="GetRidesScreen" component={GetRidesScreen} />
      <Stack.Screen name="RideHistoryScreen" component={RideHistoryScreen} />
      {/* <Stack.Screen name="SplashScreen" component={SplashScreen} /> */}
      <Stack.Screen name="ViewAvailableRidesScreen" component={ViewAvailableRidesScreen} />
      <Stack.Screen name="UserChat" component={UserChat} />
      <Stack.Screen name="DriverChat" component={DriverChat} />
      <Stack.Screen name="ActiveUsersAndDriversScreen" component={ActiveUsersAndDriversScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

// Register the root component
registerRootComponent(App);

export default App;
