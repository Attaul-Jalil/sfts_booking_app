import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const RideHistoryScreen = () => {
    const [rideHistory, setRideHistory] = useState([]);

    // Load demo ride history data
    useEffect(() => {
        setRideHistory([
            { id: 1, userName: 'John Doe', driverName: 'Jane Smith', status: 'Completed', date: new Date() },
            { id: 2, userName: 'Alice Brown', driverName: 'Tom Johnson', status: 'Canceled', date: new Date() },
            { id: 3, userName: 'Emma Davis', driverName: 'Chris Lee', status: 'Completed', date: new Date() },
        ]);
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.rideItem}>
            <Text style={styles.rideDetails}>Ride ID: {item.id}</Text>
            <Text style={styles.rideDetails}>User: {item.userName}</Text>
            <Text style={styles.rideDetails}>Driver: {item.driverName}</Text>
            <Text style={[
                styles.rideDetails,
                item.status === 'Completed' ? styles.completedStatus : styles.canceledStatus
            ]}>Status: {item.status}</Text>
            <Text style={styles.rideDetails}>Date: {new Date(item.date).toLocaleString()}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Ride History</Text>
            <FlatList
                data={rideHistory}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
            />
        </View>
    );
};

// Styling for the screen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f7f7f7', // Softer background for professionalism
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 20,
        color: '#2c3e50',
        textAlign: 'center',
    },
    rideItem: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginBottom: 15,
        borderRadius: 10,
        borderColor: '#ddd',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    rideDetails: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    completedStatus: {
        color: '#27ae60', // Green color for completed rides
        fontWeight: 'bold',
    },
    canceledStatus: {
        color: '#c0392b', // Red color for canceled rides
        fontWeight: 'bold',
    },
});

export default RideHistoryScreen;