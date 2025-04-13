import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Swiper from 'react-native-swiper';
import { Video } from 'expo-av'; // Import the video component from expo-av

const Home = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  // List of local images from the assets folder
  const images = [
    require('../assets/salute.jpeg'), // Replace with your actual image paths
    require('../assets/salute.jpeg'),
    require('../assets/salute.jpeg'),
  ];

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await SecureStore.getItemAsync('userName');
      setUsername(storedName || 'Guest');
      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#273c75" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background video */}
      <Video
        source={require('../assets/flag.mp4')} // Path to your video file
        style={styles.backgroundVideo}
        isLooping={true} // Loop the video
        isMuted={true} // Mute the video if needed
        resizeMode="cover" // Make sure it covers the entire background
        shouldPlay={true} // Auto-play the video
      />

      <Text style={styles.title}>Welcome, {username}!</Text>
      <Text style={styles.subtitle}>This is your home screen.</Text>

      {/* Image Slideshow using Swiper */}
      <Swiper
        style={styles.wrapper}
        showsButtons={false} // Disable manual navigation buttons
        autoplay={true} // Enable automatic sliding
        autoplayTimeout={3} // Time between slides in seconds
        loop={true} // Loop the slideshow
        dotColor='transparent'
        activeDotColor='transparent' // Hide the dots
      >
        {images.map((image, index) => (
          <View key={index} style={styles.slide}>
            <Image source={image} style={styles.image} />
          </View>
        ))}
      </Swiper>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    paddingTop: 70,
    position: 'relative', // Ensure the video stays as background
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2f3640',
    marginBottom: 8,
    textAlign: 'center',
    zIndex: 1, // Make sure the text appears above the video
  },
  subtitle: {
    fontSize: 16,
    color: '#718093',
    marginBottom: 32,
    textAlign: 'center',
    zIndex: 1, // Ensure subtitle appears above the video
  },
  wrapper: {
    height: 100, // Adjust the height of the slideshow
    marginBottom: 20,
    zIndex: 1, // Ensure the slideshow is above the video
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  backgroundVideo: {
    position: 'absolute', // Position it behind the content
    width: '100%',
    height: '100%',
    zIndex: 0, // Ensure the video is behind other components
    resizeMode: 'contain', // Cover the entire screen
  },
});
