import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { colors, fonts } from '../Styles/theme';
import {API_BASE_URL} from '../api.config';
import Checkbox from 'expo-checkbox';

const ManageGuides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGuides, setSelectedGuides] = useState({});
  const hasSelectedGuides = Object.values(selectedGuides).some((val) => val);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');

        if (!token) {
          Alert.alert('Unauthorized', 'No user token found.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/auth/guides`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        // Handle paginated or flat response
        const guideData = response.data.data || response.data || [];
        if (!Array.isArray(guideData)) {
          console.warn('Guide data is not an array:', guideData);
          setGuides([]);
        } else {
          // Sort alphabetically by full_name
          const sortedGuides = guideData.sort((a, b) => {
            const nameA = a.full_name?.toLowerCase() || '';
            const nameB = b.full_name?.toLowerCase() || '';
            return nameA.localeCompare(nameB);
          });
          setGuides(sortedGuides);
        }
      } catch (error) {
        console.error('Error fetching guides:', error.response?.data || error.message);
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to fetch guides.'
        );
        setError(error.response?.data?.message || 'Failed to fetch guides.');
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const renderGuide = ({ item }) => {
    const isSelected = !!selectedGuides[item.id];
  
    const toggleSelection = () => {
      setSelectedGuides((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
    };
  
    return (
      <View style={styles.card}>
        <Checkbox
          value={isSelected}
          onValueChange={toggleSelection}
          color={isSelected ? colors.primary : undefined}
          style={styles.checkbox}
        />
  
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.full_name || 'U')?.charAt(0).toUpperCase()}
          </Text>
        </View>
  
        <View style={styles.info}>
          <Text style={styles.name}>{item.full_name || 'Unnamed Guide'}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={guides}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGuide}
          contentContainerStyle={styles.list}
        />
  
        {hasSelectedGuides && (
          <View style={styles.fabContainer}>
            <Text
              style={styles.fabText}
              onPress={() => {
                const selected = guides.filter((g) => selectedGuides[g.id]);
                navigation.navigate('MainStack', {
                  screen: 'Guide QR',
                  params: { selectedGuides: selected },
                });
              }}
            >
              Get QR
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fonts.fontSizeLarge,
    fontFamily: fonts.bold,
    marginBottom: 16,
    color: colors.primary,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryContrast,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  email: {
    fontSize: fonts.fontSizeSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    marginRight: 12,
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: colors.buttonText,
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.bold,
  },
});

export default ManageGuides;