import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const Signup = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    console.log("Sending data:", { username, contactNumber, email, password, confirmPassword, role: "User" });

    if (!username || !contactNumber || !email || !password || !confirmPassword) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    // Contact number validation
    const contactNumberRegex = /^3\d{9}$/;
    if (!contactNumberRegex.test(contactNumber)) {
      Alert.alert("Validation Error", "Contact number must be exactly 10 digits and start with '3'.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid Gmail address.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }

    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://192.168.194.148:5000/signup", {
        username,
        contact_number: contactNumber,
        email,
        password,
        confirmPassword,
        role: "User",
      });

      console.log("Response data:", response.data);

      if (response.data.success) {
        Alert.alert("SignUp successful!");
        // navigation.navigate("Login"); // Navigate to profile page on success
      } else {
        Alert.alert("Signup successfully", response.data.message || "User registered successfully.");
        navigation.navigate("Login"); // Navigate to profile page on success
      }
    } catch (error) {
      console.error("Signup failed:", error);
      Alert.alert("Signup Failed", error.response?.data || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Account</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
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
    justifyContent: "center",
    backgroundColor: "#f7f7f7", // Updated to soft background for elegance
  },
  header: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    color: "#444", // Softer color for a professional header
    marginBottom: 30,
  },
  input: {
    height: 48,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1e90ff", // Professional blue for buttons
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    color: "#1e90ff",
    fontSize: 16,
  },
});

export default Signup;