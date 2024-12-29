import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://192.168.194.148:5000';

const DashboardScreen = () => {
  const [usersAndDrivers, setUsersAndDrivers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchActiveUsersAndDrivers();
  }, []);

  const fetchActiveUsersAndDrivers = async () => {
    try {
      const response = await axios.get(`${API_URL}/DashboardScreen/ActiveUsersAndDriversScreen`);
      if (Array.isArray(response.data)) {
        setUsersAndDrivers(response.data); // Store both users and drivers
      } else {
        console.error('Invalid response data:', response.data);
        Alert.alert('Error', 'Unexpected response data format.');
      }
    } catch (error) {
      console.error('Error fetching active users and drivers:', error);
      Alert.alert('Error', 'Failed to fetch data. Please try again later.');
    }
  };

  const toggleAccountStatus = async (userId, currentStatus, role) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.patch(`${API_URL}/DashboardScreen/manage-account/${role}/${userId}`, { status: newStatus });

      if (response.status === 200) {
        // Update local state
        setUsersAndDrivers((prev) =>
          prev.map((item) => item.userId === userId ? { ...item, status: newStatus } : item)
        );

        Alert.alert('Success', `${role.charAt(0).toUpperCase() + role.slice(1)} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`);
      }
    } catch (error) {
      console.error('Error toggling account status:', error);
      Alert.alert('Error', 'Failed to toggle account status.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.userName}>{item.username}</Text>
      <Text style={styles.userRole}>{item.role}</Text>
      <Text style={styles.userContact}>{item.contact_number}</Text>
      <TouchableOpacity
        style={[
          styles.statusButton,
          item.status === 'active' ? styles.activeButton : styles.inactiveButton,
        ]}
        onPress={() => toggleAccountStatus(item.userId, item.status, item.role)}
      >
        <Text style={styles.statusButtonText}>
          {item.status === 'active' ? 'Deactivate' : 'Activate'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <Button
        title="View Ride History"
        onPress={() => navigation.navigate('RideHistoryScreen')}
        color="#4ecdc4"
      />

      <Text style={styles.sectionHeader}>Users & Drivers</Text>
      <FlatList
        data={usersAndDrivers}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={<Text style={styles.noItemsText}>No users or drivers available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f4f8',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#34495e',
    marginVertical: 15,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  userItem: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  userContact: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 10,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeButton: {
    backgroundColor: '#1abc9c',
  },
  inactiveButton: {
    backgroundColor: '#e74c3c',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  noItemsText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 16,
  },
});

export default DashboardScreen;