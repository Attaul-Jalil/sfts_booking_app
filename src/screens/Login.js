import React, { useState } from 'react';
import { View, TextInput, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

const API_URL = 'http://192.168.194.148:5000'; // Replace with your actual API URL
const socket = io(API_URL);

export default function Login({ navigation }) {
  const [emailOrContact, setEmailOrContact] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default role is set to 'user'

  const handleLogin = async () => {
    if (!emailOrContact || !password) {
      Alert.alert('Invalid input', 'Please enter both email/contact number and password.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/login`, {
        emailOrContact,
        password,
        role,
      });

      if (response.data.success) {
        const { userId, flag, role } = response.data;

        // Storing userId in AsyncStorage
        await AsyncStorage.setItem('userId', userId.toString());

        if (role === 'driver') {
          await AsyncStorage.setItem('driverId', userId.toString());
          socket.emit('driverConnect', userId);
        }

        Alert.alert('Login successful!');

        // Navigate based on role and flag  
        if (role === 'driver') {
          if (flag === 0) {
            navigation.navigate('VehicleRegistration');
          } else {
            navigation.navigate('ActiveUsersAndDriversScreen');
          }
        } else if (role === 'user') {
          navigation.navigate('RideBooking', { userId: userId }); // Pass userId to the RideBooking screen
        }
      } else {
        // Display the message from the backend response
        Alert.alert('Login failed', response.data.message || 'Invalid credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Show specific error messages if available
      if (error.response && error.response.data) {
        Alert.alert('Error', error.response.data.message || 'Something went wrong, please try again.');
      } else {
        Alert.alert('Error', 'Something went wrong, please try again.');
      }
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen or show modal to reset password
    navigation.navigate('ForgotPassword'); // Ensure 'ForgotPassword' screen is defined in your navigator
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder='Email or Contact Number'
        value={emailOrContact}
        onChangeText={setEmailOrContact}
      />
      <TextInput
        style={styles.input}
        placeholder='Password'
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder='Role (user/driver)'
        value={role}
        onChangeText={setRole}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Forgot Password Button */}
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  forgotPasswordText: {
    color: '#007bff',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
