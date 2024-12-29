// src/screens/TestNotificationScreen.js

import React, { useEffect } from 'react';
import { Button, View } from 'react-native';
import { useNotification } from '../context/NotificationContext';

const TestNotificationScreen = () => {
  const { setNotification } = useNotification();

  useEffect(() => {
    // Optionally set a notification when the component mounts
    setNotification({ message: 'New Notification on load!' });
  }, [setNotification]);

  return (
    <View>
      <Button
        title="Send Notification"
        onPress={() => setNotification({ message: 'Hello h r u' })}
      />
    </View>
  );
};

export default TestNotificationScreen;
