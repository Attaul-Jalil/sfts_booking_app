import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Alert, Button, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

const VehicleRegistration = () => {
  const navigation = useNavigation(); // Get navigation object
  const [driverId, setDriverId] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('driverId')
      .then((storedDriverId) => {
        if (storedDriverId) {
          setDriverId(storedDriverId);
        } else {
          Alert.alert('Error', 'Driver ID not available. Please log in.');
        }
      })
      .catch((error) => {
        console.error('Error retrieving driver ID:', error);
        Alert.alert('Error', 'There was an issue retrieving the driver ID.');
      });
  }, []);

  const handleVehicleRegistration = async () => {
    if (!vehicleType || !brand || !model || !vehicleNumber || !year || !color) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://192.168.194.148:5000/registerVehicle', {
        driverId,
        vehicleType,
        brand,
        model,
        vehicleNumber,
        year,
        color,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Vehicle registered successfully.');
        navigation.navigate('ActiveUsersAndDriversScreen'); // Navigate to the home screen
      } else {
        Alert.alert('Error', 'Vehicle registration failed.');
      }
    } catch (error) {
      console.error('Error registering vehicle:', error);
      Alert.alert('Error', 'There was an issue with the registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Vehicle Registration</Text>
      <TextInput
        style={styles.input}
        value={driverId}
        editable={false}
      />
      <TextInput
        style={styles.input}
        value={vehicleType}
        onChangeText={setVehicleType}
        placeholder="Vehicle Type (Car, Bike, etc.)"
      />
      <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholder="Brand" />
      <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Model" />
      <TextInput style={styles.input} value={vehicleNumber} onChangeText={setVehicleNumber} placeholder="Vehicle Number" />
      <TextInput style={styles.input} value={year} onChangeText={setYear} placeholder="Year" />
      <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="Color" />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Register Vehicle" onPress={handleVehicleRegistration} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
});

export default VehicleRegistration;
