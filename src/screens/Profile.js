import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, TextInput, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const savedUserId = await AsyncStorage.getItem('userId');
      if (savedUserId) {
        setUserId(savedUserId);
        fetchUserData(savedUserId);
      } else {
        Alert.alert('Error', 'User ID not found.');
      }
    };
    fetchUserId();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://192.168.194.148:5000/api/Profile?userId=${userId}`);

      if (response.data) {
        const { username, contact_number, email } = response.data;
        setUsername(username);
        setContactNumber(contact_number);
        setEmail(email);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data.');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async () => {
    if (!username || !contactNumber || !email) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    try {
      setLoading(true);
      const updatedData = {
        userId: userId,
        username: username.trim(),
        contact_number: contactNumber.trim(),
        email: email.trim(),
      };

      console.log('Updating user data with:', updatedData);

      const response = await axios.put('http://192.168.194.148:5000/api/Profile', updatedData);

      if (response.data.success) {
        Alert.alert('Success', 'User data updated successfully.');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        Alert.alert('Error', `Failed to update user data: ${error.response.data.message || 'Check data format.'}`);
      } else {
        Alert.alert('Error', 'Failed to update user data.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : (
        <>
          <Text style={styles.header}>User Profile</Text>

          <View style={styles.profileContainer}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={styles.value}>{userId}</Text>
          </View>

          <View style={styles.profileContainer}>
            <Text style={styles.label}>Username:</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.profileContainer}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.profileContainer}>
            <Text style={styles.label}>Contact Number:</Text>
            <TextInput
              style={styles.input}
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />
          </View>

          <Button title="Update Profile" onPress={updateUserData} color="#007bff" />

          {/* Button to navigate to RideBooking screen with userId */}
          <Button 
            title="Go to Ride Booking" 
            onPress={() => navigation.navigate('RideBooking', { userId })} // Pass userId to RideBooking screen
            color="#007bff" 
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  profileContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  value: {
    fontSize: 16,
    marginTop: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  loader: {
    marginTop: 50,
  },
});

export default Profile;