import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const ForgotPassword = ({ navigation }) => {
  const [contactNumber, setContactNumber] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const sendSmsNotification = async (message) => {
    try {
      await axios.post('http://192.168.194.148:5000/send-sms', {
        recipient: `92${contactNumber}`,
        message,
      });
      console.log("SMS notification sent successfully.");
    } catch (error) {
      console.error("Error sending SMS notification:", error.message);
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://192.168.194.148:5000/forgot-password', { contactNumber });
      console.log("Response data:", response.data);

      if (response.data.success) {
        const message = `Dear user, your verification code is: ${response.data.verificationCode}`;
        await sendSmsNotification(message);
        Alert.alert('Verification Code Sent', 'A verification code has been sent to your contact number.');
        setVerificationSent(true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send the code.');
      }
    } catch (error) {
      console.error("Error during password reset request:", error.response ? error.response.data : error.message);
      Alert.alert('Error', 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }
    if (!verificationCode) {
      Alert.alert('Validation Error', 'Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://192.168.194.148:5000/reset-password', {
        contactNumber,
        password,
        verificationCode,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Your password has been reset.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reset password.');
      }
    } catch (error) {
      console.error("Error resetting password:", error.response ? error.response.data : error.message);
      Alert.alert('Error', 'An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Forgot Password</Text>

      {!verificationSent ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />
          {loading ? (
            <ActivityIndicator size="large" color="#1e90ff" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSendCode}>
              <Text style={styles.buttonText}>Send Code</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter Verification Code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {loading ? (
            <ActivityIndicator size="large" color="#1e90ff" />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9', // Soft background color for elegance
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
    color: '#444', // For better visibility and focus
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#1e90ff', // Uniform button color
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgotPassword;