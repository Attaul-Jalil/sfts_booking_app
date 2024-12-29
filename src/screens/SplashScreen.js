// import React, { useEffect, useRef } from 'react';
// import { View, Animated, StyleSheet, Image, Dimensions } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// const { width, height } = Dimensions.get('window'); // Get screen dimensions

// const SplashScreen = () => {
//   const navigation = useNavigation();
//   // const opacityAnim = useRef(new Animated.Value(0)).current; // Initial opacity set to 0 (invisible)

//   // useEffect(() => {
//   //   // Fade-in animation
//   //   Animated.timing(opacityAnim, {
//   //     toValue: 1, // Final opacity
//   //     duration: 800, // Duration of the fade-in effect in ms
//   //     useNativeDriver: true,
//   //   }).start(() => {
//   //     // Navigate to MainScreen after the animation
//   //     setTimeout(() => {
//         navigation.navigate('MainScreen');
//   //     }, 1000); // Small delay before navigating
//   //   });
//   // }, [opacityAnim, navigation]);

//   // return (
//   //   <View style={styles.container}>
//   //     <Animated.Image
//   //       source={require('../assets/logo.png')} // Use your transparent logo image here
//   //       style={[styles.logo, { opacity: opacityAnim }]} // Fade-in effect controlled by opacityAnim
//   //       resizeMode="contain"
//   //     />
//   //   </View>
//   // );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#a8e6cf', // Light green background color
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logo: {
//     width: width * 0.6, // Adjust size to cover 60% of screen width
//     height: width * 0.6, // Make height proportional to width
//   },
// });

// export default SplashScreen;
