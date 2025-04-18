import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Swiper from 'react-native-swiper';
import API_BASE_URL from '../api.config';

const Home = () => {
  const [fullname, setFullName] = useState('');
  const [loading, setLoading] = useState(true);

  // List of filenames stored in your Laravel backend
  const imageFilenames = ['slide1.jpg', 'slide2.jpg', 'slide3.jpg', 'slide4.jpg'];

  // Generate full URLs
  const images = imageFilenames.map(filename => `${API_BASE_URL}/mobile/media/${filename}`);

  useEffect(() => {
    const loadUser = async () => {
      const storedName = await SecureStore.getItemAsync('fullName');
      setFullName(storedName || 'Distinguished Guest');
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome, {fullname}!</Text>
      <Text style={styles.subtitle}>Sarawak Forestry Corporation (SFC) is a statutory body of the Sarawak Government formed under Sarawak Forestry Corporation Ordinance, 1995. {"\n\n"}Our main functions are to manage Totally Protected Areas (TPAs) and to conserve Biodiversity of Sarawak. We have been entrusted to protect the wildlife of Sarawak, particularly the totally protected and protected species. In doing this, we are governed by National Parks and Nature Reserves Ordinance 1998 and Wild Life Protection Ordinance, 1998.</Text>

      {/* Image Slideshow using Swiper */}
      <Swiper
        style={styles.wrapper}
        showsButtons={false} // Disable manual navigation buttons
        autoplay={true} // Enable automatic sliding
        autoplayTimeout={5} // Time between slides in seconds
        loop={true} // Loop the slideshow
        dotColor='transparent'
        activeDotColor='transparent'
        scrollEnabled={false}
      >
        {images.map((imageUrl, index) => (
          <View key={index} style={styles.slide}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
          </View>
        ))}
      </Swiper>

      {/* Text Slideshow */}
      <Swiper
        style={styles.textWrapper}
        showsButtons={false}
        autoplay={true}
        autoplayTimeout={5}
        loop={true}
        dotColor="transparent"
        activeDotColor="transparent"
        scrollEnabled={false}
      >
        {[
          `"To be an agency of excellence in the conservation of Sarawak's wildlife and its totally protected areas for all people, for all time." - Our Vision`,
          `"To create, maintain totally protected areas and to conserve wildlife through innovation and best practices for the equitable benefits for all." - Our Mission`,
          `"Integrity, Kind and Caring, Professionalism, Sense of Urgency and Ownership, Team Spirit & Result-Oriented." - Our Values`,
          `"New Frontier in Biodiversity Conservation." - Our Tagline`
        ].map((quote, index) => (
          <View key={index} style={styles.textSlide}>
            <Text style={styles.quote}>{quote}</Text>
          </View>
        ))}
      </Swiper>

    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f6fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    paddingTop: 50,
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
    marginBottom: 20,
    textAlign: 'left',
    paddingHorizontal: 20, // Add padding for better line breaks
    lineHeight: 40, // Improve readability
  },
  subtitle: {
    fontSize: 16,
    color: '#718093',
    marginBottom: 32,
    textAlign: 'justify',
    paddingHorizontal: 20, // Add padding for better line breaks
    lineHeight: 24, // Add line height for readability
  },
  wrapper: {
    height: 200, // Adjust the height of the slideshow
    marginBottom: 20,
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
  textWrapper: {
    height: 100,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center', // Center swiper itself
    zIndex: 1,
  },
  textSlide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  quote: {
    fontSize: 16,
    color: '#2f3640',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  
  
});
