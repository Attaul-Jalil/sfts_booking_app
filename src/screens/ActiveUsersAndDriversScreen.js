// ActiveUsersAndDriversScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Icon

const API_URL = 'http://192.168.194.148:5000';

const ActiveUsersAndDriversScreen = () => {
  const [driverId, setDriverId] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Inactive');

  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const fetchDriverId = async () => {
      try {
        const savedDriverId = await AsyncStorage.getItem('driverId');
        if (savedDriverId) {
          setDriverId(savedDriverId);
          fetchUserInfo(savedDriverId);
        } else {
          Alert.alert('Error', 'Driver ID not found. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching driver ID:', error);
        Alert.alert('Error', 'Failed to retrieve Driver ID.');
      }
    };

    fetchDriverId();
  }, []);

  const fetchUserInfo = async (driverId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users/${driverId}`);
      setUserInfo(response.data);
      setStatus(response.data.status || 'Inactive');
    } catch (error) {
      console.error("Error fetching user information:", error);
      Alert.alert('Error', 'Could not fetch user information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountStatus = () => {
    const newStatus = status === 'active' ? 'inactive' : 'active';
    setStatus(newStatus);
    Alert.alert("Success", `User status changed to ${newStatus}.`, [{
      text: "OK",
      onPress: () => {
        navigation.navigate('GetRidesScreen', { driverId }); // Pass driverId to GetRidesScreen
      }
    }]);
  };

  const goToProfile = () => {
    navigation.navigate('Profile'); // Navigate to the Profile screen
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Icon Button */}
      <TouchableOpacity onPress={goToProfile} style={styles.profileIconContainer}>
        <Icon name="person-circle-outline" size={40} color="#007bff" />
        <Text style={styles.profileIconText}>Profile</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : userInfo ? (
        <View style={styles.card}>
          <Text style={styles.title}>Driver Information</Text>
          <Text style={styles.label}>Driver ID:</Text>
          <Text style={styles.value}>{driverId}</Text>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{userInfo.username}</Text>
          <Text style={styles.label}>Contact Number:</Text>
          <Text style={styles.value}>{userInfo.contact_number}</Text>
          <Text style={styles.label}>Status:</Text>
          <TouchableOpacity
            style={[
              styles.statusButton,
              status === 'Inactive' ? styles.activeButton : styles.inactiveButton
            ]}
            onPress={toggleAccountStatus}
          >
            <Text style={styles.buttonText}>
              {status === 'active' ? 'Set Inactive' : 'Set Active'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.errorMessage}>No user data available.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  profileIconContainer: {
    alignSelf: 'flex-end', // Position the icon
    marginBottom: 15,
    flexDirection: 'row', // Allow for horizontal arrangement of icon and text
    alignItems: 'center', // Center align the content vertically
  },
  profileIconText: {
    marginLeft: 5, // Space between icon and text
    fontSize: 16,
    color: '#007bff'
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  statusButton: {
    borderRadius: 5,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  activeButton: {
    backgroundColor: '#28a745', // Green for active
  },
  inactiveButton: {
    backgroundColor: '#dc3545', // Red for inactive
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: '#ff0000',
  },
});

export default ActiveUsersAndDriversScreen;