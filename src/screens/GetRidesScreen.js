import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, ActivityIndicator, Button, TextInput } from 'react-native';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://192.168.194.148:5000'; // Your API URL

const GetRidesScreen = ({ route, navigation }) => {
    const { driverId } = route.params; // Get driverId from navigation params
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bids, setBids] = useState({}); // Store bids for each ride
    const socket = io(API_URL); // Initialize socket connection

    // Fetch rides function
    const fetchRides = async () => {
        setLoading(true); // Start loading before fetching
        try {
            const response = await axios.get(`${API_URL}/api/rides/bid`);
            if (response.data.success) {
                setRides(response.data.rides); // Assuming UBID is part of the ride data
            } else {
                Alert.alert('Error', response.data.message || 'Failed to fetch rides.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while fetching the rides.');
        } finally {
            setLoading(false); // End loading after fetching
        }
    };

    useEffect(() => {
        fetchRides(); // Initial fetch of rides

        // Listen for real-time events via Socket.IO
        socket.on('newRide', (ride) => {
            setRides((prevRides) => [ride, ...prevRides]); // Prepend new ride
        });

        socket.on('rideTaken', (rideId) => {
            // Remove ride from the list when it's taken
            setRides((prevRides) => prevRides.filter(ride => ride.RID !== rideId));
        });

        socket.on('bidPlaced', (rideId, bidAmount) => {
            // Update bid for the specific ride
            setRides((prevRides) => 
                prevRides.map(ride => 
                    ride.RID === rideId ? { ...ride, UBID: bidAmount } : ride
                )
            );
        });

        return () => {
            socket.off('newRide');
            socket.off('rideTaken');
            socket.off('bidPlaced');
        };
    }, []);

    const handleChat = (userId) => {
        navigation.navigate('DriverChat', { driverId, userId }); // Navigate to DriverChat with driverId and userId
    };

    const handlePlaceBid = async (rideId) => {
        const bidAmount = bids[rideId];
        if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
            Alert.alert('Invalid Bid', 'Please enter a valid bid amount.');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/rides/driverBid`, {
                driverId,
                rideId,
                bidAmount,
            });

            if (response.data.success) {
                Alert.alert('Bid Placed', `Your bid of ${bidAmount} has been placed successfully.`);
                // Emit the bid placed event to the other side
                socket.emit('bidPlaced', rideId, bidAmount);
            } else {
                Alert.alert('Error', response.data.message || 'Failed to place the bid.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while placing the bid.');
        }
    };

    const renderRide = ({ item }) => (
        <View style={styles.rideItem}>
            <Text style={styles.rideText}>Ride ID: {item.RID}</Text>
            <Text style={styles.rideText}>User ID (UID): {item.UID}</Text>
            <Text style={styles.rideText}>Pickup Location: {item.PickUp || 'Loading...'}</Text>
            <Text style={styles.rideText}>Dropoff Location: {item.DropOff || 'Loading...'}</Text>
            
            {/* Display UBID (User's Bid) */}
            <Text style={styles.rideText}>User Bid (UBID): {item.UBID ? item.UBID : 'No bid placed'}</Text>

            {/* Chat button */}
            <Button title="Chat" onPress={() => handleChat(item.UID)} />

            {/* Bidding section */}
            <View style={styles.bidSection}>
                <TextInput
                    style={styles.bidInput}
                    placeholder="Enter your bid"
                    keyboardType="numeric"
                    value={bids[item.RID] || ''}
                    onChangeText={(text) => setBids({ ...bids, [item.RID]: text })}
                />
                <Button title="Place Bid" onPress={() => handlePlaceBid(item.RID)} />
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4ecdc4" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Available Rides for Bidding</Text>

            {/* Refresh Button */}
            <Button title="Refresh Rides" onPress={fetchRides} />

            <FlatList
                data={rides}
                keyExtractor={(item) => item.RID.toString()}
                renderItem={renderRide}
                ListEmptyComponent={<Text style={styles.noRidesText}>No rides available at the moment.</Text>}
            />
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
        fontWeight: '600',
        marginBottom: 20,
        color: '#333',
    },
    rideItem: {
        padding: 15,
        marginVertical: 10,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        elevation: 2,
    },
    rideText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    noRidesText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#777',
    },
    bidSection: {
        marginTop: 10,
        marginBottom: 10,
    },
    bidInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginBottom: 10,
    },
});

export default GetRidesScreen;
