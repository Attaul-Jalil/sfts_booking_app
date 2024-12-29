import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNotification } from '../context/NotificationContext';  // Ensure correct import path

export default function Notification() {
  const { notification } = useNotification();

  return (
    notification ? (
      <View style={styles.notificationContainer}>
        <Text style={styles.notificationText}>{notification.message}</Text>
      </View>
    ) : null
  );
}

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  notificationText: {
    color: '#fff',
    fontSize: 16,
  },
});
