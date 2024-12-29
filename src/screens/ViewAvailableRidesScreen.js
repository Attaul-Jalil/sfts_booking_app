import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, FlatList, TouchableOpacity, Button, TextInput, Modal } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://192.168.194.148:5000'; // Your API URL
const GOOGLE_MAPS_API_KEY = 'AIzaSyCqbKrepIG_BC1bzvzfWqRN3YrXawe-sOw'; // Add your Google Maps API Key

const ViewAvailableRidesScreen = () => {
  const navigation = useNavigation();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [userBid, setUserBid] = useState('');

  const userId = 2; // Replace with actual userId logic

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      } else {
        return 'Address not found';
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Address not found';
    }
  };

  const fetchRides = async () => {
    setLoading(true); // Start loading before fetching
    try {
      const response = await axios.get(`${API_URL}/api/rides/d_bid/1`);
      if (response.data.success) {
        if (response.data.rides.length > 0) {
          const fetchedRides = response.data.rides.map(ride => ({
            ...ride,
            Pickup: typeof ride.Pickup === 'string' ? JSON.parse(ride.Pickup) : ride.Pickup,
            Dropoff: typeof ride.Dropoff === 'string' ? JSON.parse(ride.Dropoff) : ride.Dropoff,
          }));
          setRides(fetchedRides);

          const newAddresses = {};
          for (let ride of fetchedRides) {
            const pickupAddress = await getAddressFromCoordinates(ride.Pickup.lat, ride.Pickup.lng);
            const dropoffAddress = await getAddressFromCoordinates(ride.Dropoff.lat, ride.Dropoff.lng);
            newAddresses[ride.RID] = { pickup: pickupAddress, dropoff: dropoffAddress };
          }
          setAddresses(newAddresses);
        }
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch available rides.');
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      if (error.response) {
        Alert.alert('Error', error.response.data.message || 'Failed to fetch rides.');
      } else {
        Alert.alert('Error', 'An error occurred while fetching rides.');
      }
    } finally {
      setLoading(false); // End loading after fetching
    }
  };

  useEffect(() => {
    fetchRides(); // Fetch rides when the component mounts
  }, []);

  const handleBid = (rideId) => {
    setSelectedRideId(rideId);
    setIsModalVisible(true);
  };

  const submitBid = async () => {
    if (!userBid) {
      Alert.alert('Error', 'Please enter a valid bid amount.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/rides/bid`, {
        rideId: selectedRideId,
        userId,
        bidAmount: userBid,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Bid submitted successfully!');
        setIsModalVisible(false);
        setUserBid('');
        fetchRides(); // Refresh rides
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit bid.');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      Alert.alert('Error', 'An error occurred while submitting your bid.');
    }
  };

  const handleCancel = async (rideId) => {
    Alert.alert(
      'Ride Canceled',
      `You have canceled ride ${rideId}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('RideBooking', { userId }); // Pass the userId here
          },
        },
      ]
    );
  };

  const handleAccept = async (rideId, driverId) => {
    try {
      const response = await axios.post(`${API_URL}/api/rides/accept`, { rideId });
      if (response.data.success) {
        Alert.alert('Success', 'Ride accepted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('UserChat', { userId: driverId, chatWithId: userId }); // Navigate to UserChat
            },
          },
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to accept ride.');
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      Alert.alert('Error', 'An error occurred while accepting the ride.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ecdc4" />
      </View>
    );
  }

  if (rides.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.searchingText}>We are currently looking for drivers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Rides (D_Bid_Id = 1)</Text>

      {/* Refresh Button */}
      <Button title="Refresh Rides" onPress={fetchRides} />

      <FlatList
        data={rides}
        keyExtractor={(item) => item.RID.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Driver ID: {item.DID || 'N/A'}</Text>
            <Text style={styles.cardText}>Driver Bid Amount: {item.DBID || 'N/A'}</Text>
            <Text style={styles.cardText}>
              Pickup Address: {addresses[item.RID]?.pickup || 'Loading...'}
            </Text>
            <Text style={styles.cardText}>
              Dropoff Address: {addresses[item.RID]?.dropoff || 'Loading...'}
            </Text>

            {/* Button row */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => handleBid(item.RID)}
              >
                <Text style={styles.buttonText}>Bid</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => handleCancel(item.RID)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => handleAccept(item.RID, item.DID)} // Pass driverId when accepting the ride
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal for Bid Input */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Your Bid</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter bid amount"
              keyboardType="numeric"
              value={userBid}
              onChangeText={setUserBid}
            />
            <View style={styles.modalButtonContainer}>
              <Button title="Submit" onPress={submitBid} />
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      <MapView
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude: (rides[0]?.Pickup?.lat + rides[0]?.Dropoff?.lat) / 2 || 0,
          longitude: (rides[0]?.Pickup?.lng + rides[0]?.Dropoff?.lng) / 2 || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >
        {rides.map((ride) => {
          const pickup = ride.Pickup;
          const dropoff = ride.Dropoff;

          // Validate if the pickup and dropoff coordinates are present and correct
          if (pickup && pickup.lat && pickup.lng && dropoff && dropoff.lat && dropoff.lng) {
            return (
              <React.Fragment key={ride.RID}>
                <Marker
                  coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
                  title="Pickup Location"
                  pinColor="green"
                />
                <Marker
                  coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
                  title="Dropoff Location"
                  pinColor="red"
                />
                <Polyline
                  coordinates={[{ latitude: pickup.lat, longitude: pickup.lng }, { latitude: dropoff.lat, longitude: dropoff.lng }]}
                  strokeColor="#000"
                  strokeWidth={4}
                />
              </React.Fragment>
            );
          } else {
            return null;
          }
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 3,
  },
  searchingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#007bff',
  },
  map: {
    flex: 1,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#4ecdc4',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default ViewAvailableRidesScreen;