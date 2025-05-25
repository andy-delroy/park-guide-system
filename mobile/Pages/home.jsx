import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Swiper from 'react-native-swiper';
import {API_BASE_URL} from '../api.config';
import styles from '../Styles/styles'; 

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
      <View style={styles.homeCentered}>
        <ActivityIndicator size="large" color="#273c75" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.homeContainer}>
      <Text style={styles.homeTitle}>Welcome, {fullname}!</Text>
      <Text style={styles.homeSubtitle}>Sarawak Forestry Corporation (SFC) is a statutory body of the Sarawak Government formed under Sarawak Forestry Corporation Ordinance, 1995. {"\n\n"}Our main functions are to manage Totally Protected Areas (TPAs) and to conserve Biodiversity of Sarawak. We have been entrusted to protect the wildlife of Sarawak, particularly the totally protected and protected species. In doing this, we are governed by National Parks and Nature Reserves Ordinance 1998 and Wild Life Protection Ordinance, 1998.</Text>

      {/* Image Slideshow using Swiper */}
      <Swiper
        style={styles.homeWrapper}
        showsButtons={false} // Disable manual navigation buttons
        autoplay={true} // Enable automatic sliding
        autoplayTimeout={5} // Time between slides in seconds
        loop={true} // Loop the slideshow
        dotColor='transparent'
        activeDotColor='transparent'
        scrollEnabled={false}
      >
        {images.map((imageUrl, index) => (
          <View key={index} style={styles.homeSlide}>
            <Image source={{ uri: imageUrl }} style={styles.homeImage} />
          </View>
        ))}
      </Swiper>

      {/* Text Slideshow */}
      <Swiper
        style={styles.homeTextWrapper}
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
          <View key={index} style={styles.homeTextSlide}>
            <Text style={styles.homeQuote}>{quote}</Text>
          </View>
        ))}
      </Swiper>

    </ScrollView>
  );
};

export default Home;
