import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import screens
import Admin from '../screens/Admin';  // Your Admin Dashboard screen
import ActiveUsersAndDriversScreen from '../components/ActiveUsersAndDriversScreen';  // The new screen

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="AdminDashboard">
                {/* Admin Dashboard Screen */}
                <Stack.Screen
                    name="AdminDashboard"
                    component={Admin}
                    options={{ title: 'Admin' }}
                />

                {/* Active Users and Drivers Screen */}
                <Stack.Screen
                    name="ActiveUsersAndDrivers"
                    component={ActiveUsersAndDriversScreen}
                    options={{ title: 'Active Users and Drivers' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
