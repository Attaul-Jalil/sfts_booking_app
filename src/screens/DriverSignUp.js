import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const DriverSignup = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDriverSignUp = async () => {
    console.log("Sending data:", { username, contactNumber, email, password, confirmPassword, role: "Driver" });
  
    // Basic validation checks
    if (!username || !contactNumber || !email || !password || !confirmPassword) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }
  
    // Contact number validation: must be exactly 10 digits and start with '3'
    const contactNumberRegex = /^3\d{9}$/;
    if (!contactNumberRegex.test(contactNumber)) {
      Alert.alert("Validation Error", "Contact number must be exactly 10 digits and start with '3'.");
      return;
    }
  
    // Password match validation
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }
  
    setLoading(true);  // Start loading indicator
  
    try {
      // Make the POST request to your backend server
      const response = await axios.post("http://192.168.194.148:5000/driversignup", {
        username,
        contact_number: contactNumber,
        email,
        password,
        confirmPassword,
        role: "Driver",  // You can send 'Driver' or a role ID based on your backend implementation
      });
  
      // Check for successful response
      if (response.status === 200) {
        Alert.alert("Success", "Driver signed up successfully!");
        navigation.navigate("Login");  // Navigate to the driver's dashboard or login screen after successful signup
      } else {
        Alert.alert("Signup Failed", response.data.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      // Error handling for failed request
      console.error("Signup error:", error);
      Alert.alert("Signup Failed", "An error occurred. Please check your internet connection or try again later.");
    } finally {
      setLoading(false);  // Stop loading indicator
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Driver Account</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Username" 
        value={username} 
        onChangeText={setUsername} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Contact Number" 
        value={contactNumber} 
        onChangeText={setContactNumber} 
        keyboardType="phone-pad" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Email Address" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Create Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Confirm Password" 
        value={confirmPassword} 
        onChangeText={setConfirmPassword} 
        secureTextEntry 
      />
      <TouchableOpacity style={styles.button} onPress={handleDriverSignUp} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.buttonText}>Driver Sign Up</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9', // Light gray to ensure clean and professional look
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#444',
    marginBottom: 25,
  },
  input: {
    height: 48,
    borderColor: '#c4c4c4',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#444',
  },
  button: {
    backgroundColor: '#1e90ff', // Consistent color for a professional look
    paddingVertical: 13,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#1e90ff',
    marginTop: 10,
    fontSize: 16,
  },
});

export default DriverSignup;