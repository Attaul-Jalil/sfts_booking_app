import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const words = ['Secure', 'Family', 'Transport', 'Solutions'];

const MainScreen = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % words.length);
      Animated.timing(scrollY, {
        toValue: -index * 50,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 2500);

    return () => clearInterval(interval);
  }, [index, scrollY]);

  return (
    <LinearGradient
      colors={['#283048', '#859398']}
      style={styles.container}
    >
      <View style={styles.textContainer}>
        <Animated.View
          style={[styles.wordWrapper, { transform: [{ translateY: scrollY }] }]}
        >
          {words.map((word, i) => (
            <Text key={i} style={styles.movingText}>
              {word}
            </Text>
          ))}
        </Animated.View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome to Our Service!</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Login to Continue</Text>
        </TouchableOpacity>

        <Text style={styles.cardSubtitle}>
          Create an account to access all features
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.buttonText}>Continue to SignUp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('DriverSignUp')}
        >
          <Text style={styles.buttonText}>Driver SignUp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.adminButton]}
          onPress={() => navigation.navigate('DashboardScreen')}
        >
          <Text style={styles.buttonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
    height: 50,
    marginVertical: 20,
    overflow: 'hidden',
  },
  wordWrapper: {
    height: 200,
  },
  movingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 50,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#444',
  },
  button: {
    backgroundColor: '#56b5d1',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginVertical: 10,
  },
  adminButton: {
    backgroundColor: '#FF7043',
  },
});

export default MainScreen;