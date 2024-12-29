import React, { useState, useEffect } from 'react';
import { 
    View, 
    TextInput, 
    Alert, 
    StyleSheet, 
    TouchableOpacity, 
    Text, 
    Keyboard, 
    TouchableWithoutFeedback, 
    Modal, 
    FlatList 
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const RideBookingScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [location, setLocation] = useState(null);
    const [pickupLocation, setPickupLocation] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
    const [bidAmount, setBidAmount] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [pickupCoords, setPickupCoords] = useState(null);
    const [dropoffCoords, setDropoffCoords] = useState(null);
    const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
    const [routeCoordinates, setRouteCoordinates] = useState([]); // Store polyline coordinates

    const userId = route.params.userId; 
    const GOOGLE_API_KEY = 'AIzaSyCqbKrepIG_BC1bzvzfWqRN3YrXawe-sOw'; // Your new Google Maps API key

    useEffect(() => {
        const requestLocationPermission = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                setLocation(currentLocation.coords);
                const address = await Location.reverseGeocodeAsync(currentLocation.coords);
                if (address.length > 0) {
                    const { name, street, city } = address[0];
                    setPickupLocation(`${name} ${street}, ${city}`);
                }
            } else {
                Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
            }
        };

        requestLocationPermission();
    }, []);

    const getCoordinates = async (address) => {
        console.log("Fetching coordinates for address:", address);
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    address: address,
                    key: GOOGLE_API_KEY,
                },
            });

            console.log('Geocoding Response:', response.data); // Log geocoding response

            if (response.data.status === 'OK') {
                return response.data.results[0].geometry.location;
            } else {
                console.error('Geocoding Error:', response.data.status);
                throw new Error('Location not found');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to retrieve coordinates. Please try again.');
            console.error("Geocoding Error:", error);
        }
    };

    const fetchDropoffSuggestions = async (inputText) => {
        if (!inputText) {
            setDropoffSuggestions([]);
            return; // No input; clear suggestions
        }

        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json`, {
                params: {
                    input: inputText,
                    key: GOOGLE_API_KEY,
                },
            });

            if (response.data.status === 'OK') {
                setDropoffSuggestions(response.data.predictions); // Set suggestions based on input
            } else {
                setDropoffSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching dropoff suggestions:", error);
            setDropoffSuggestions([]);
        }
    };

    const getRoute = async (pickupCoords, dropoffCoords) => {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
                params: {
                    origin: `${pickupCoords.latitude},${pickupCoords.longitude}`,
                    destination: `${dropoffCoords.latitude},${dropoffCoords.longitude}`,
                    key: GOOGLE_API_KEY,
                },
            });

            if (response.data.status === 'OK') {
                const points = decodePolyline(response.data.routes[0].overview_polyline.points);
                setRouteCoordinates(points); // Set the route polyline coordinates
            } else {
                Alert.alert('Error', 'Could not fetch directions. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to retrieve route. Please try again.');
            console.error('Directions API Error:', error);
        }
    };

    // Decode polyline from Google Directions API
    const decodePolyline = (encoded) => {
        let polyline = [];
        let index = 0;
        let len = encoded.length;
        let lat = 0;
        let lng = 0;

        while (index < len) {
            let shift = 0;
            let result = 0;
            let byte;
            do {
                byte = encoded.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;

            shift = 0;
            result = 0;
            do {
                byte = encoded.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;

            polyline.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
        }

        return polyline;
    };

    const handleGetRide = async () => {
        console.log("Pickup Location:", pickupLocation);
        console.log("Dropoff Location:", dropoffLocation);

        if (!pickupLocation || !dropoffLocation) {
            Alert.alert('Error', 'Please enter both pickup and dropoff locations.');
            return;
        }

        try {
            const pickup = await getCoordinates(pickupLocation);
            const dropoff = await getCoordinates(dropoffLocation);

            console.log("Pickup Coordinates:", pickup);
            console.log("Dropoff Coordinates:", dropoff);

            if (!pickup || !dropoff) {
                Alert.alert('Error', 'Could not find the specified locations. Please check your input.');
                return;
            }

            setPickupCoords(pickup);
            setDropoffCoords(dropoff);

            // Fetch the route
            await getRoute(pickup, dropoff);

            setModalVisible(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to convert locations to coordinates. Please try again.');
        }
    };

    const handleBidSubmit = async () => {
        if (!bidAmount) {
            Alert.alert('Error', 'Please enter a bid amount.');
            return;
        }

        const rideData = {
            pickUp: pickupLocation,
            dropOff: dropoffLocation,
            UBID: bidAmount,
            U_Bid_Id: 1, // Preset for demo; consider adjusting logic as needed
            userId: userId,
            pickupCoords,
            dropoffCoords,
        };
        
        try {
            const response = await axios.post('http://192.168.194.148:5000/api/rides', rideData);
            if (response.data && response.data.success) {
                Alert.alert('Bid Submitted', `Your bid of PKR ${bidAmount} has been submitted.`);
                navigation.navigate('ViewAvailableRidesScreen', {
                    pickupLocation: pickupCoords,
                    dropoffLocation: dropoffCoords,
                });
            } else {
                Alert.alert('Error', response.data.message || 'Failed to submit your bid. Please try again.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to submit your bid. Please check your internet connection and try again.');
        } finally {
            setModalVisible(false);
            setBidAmount('');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    showsUserLocation
                    region={{
                        latitude: location ? location.latitude : 37.78825,
                        longitude: location ? location.longitude : -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {location && (
                        <Marker
                            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                            title="You are here"
                        />
                    )}

                    {/* Show polyline for the route */}
                    {routeCoordinates.length > 0 && (
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#4ecdc4"
                            strokeWidth={5}
                        />
                    )}
                </MapView>

                <View style={styles.detailsContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Pickup Location"
                        value={pickupLocation}
                        onChangeText={setPickupLocation}
                        placeholderTextColor="#888"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Dropoff Location"
                        value={dropoffLocation}
                        onChangeText={text => {
                            setDropoffLocation(text);
                            fetchDropoffSuggestions(text); // Fetch suggestions as text changes
                        }}
                        placeholderTextColor="#888"
                    />
                    {/* Render dropoff suggestions if they exist */}
                    {dropoffSuggestions.length > 0 && (
                        <FlatList
                            data={dropoffSuggestions}
                            keyExtractor={(item) => item.place_id}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => {
                                    setDropoffLocation(item.description);
                                    setDropoffSuggestions([]); // Clear suggestions after selection
                                }}>
                                    <Text style={styles.suggestionText}>{item.description}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                    <TouchableOpacity style={styles.button} onPress={handleGetRide}>
                        <Text style={styles.buttonText}>Get a Ride</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.bottomRightIcon}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Ionicons name="person-circle-outline" size={50} color="#4ecdc4" />
                </TouchableOpacity>

                {/* Bid Dialog Box */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Enter Your Bid</Text>
                            <TextInput
                                style={styles.bidInput}
                                placeholder="Enter bid amount"
                                value={bidAmount}
                                onChangeText={setBidAmount}
                                keyboardType="numeric"
                                placeholderTextColor="#888"
                            />
                            <TouchableOpacity style={styles.modalButton} onPress={handleBidSubmit}>
                                <Text style={styles.modalButtonText}>Submit Bid</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    detailsContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        borderRadius: 10,
        elevation: 5,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
    },
    button: {
        backgroundColor: '#4ecdc4',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    suggestionText: {
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    bottomRightIcon: {
        position: 'absolute',
        bottom: 30,
        right: 30,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    bidInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
    },
    modalButton: {
        backgroundColor: '#4ecdc4',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default RideBookingScreen;
