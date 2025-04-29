import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, fonts } from '../Styles/theme';
import API_BASE_URL from '../api.config';

const Certificate = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert('Unauthorized', 'No user token found.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/certification`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // Handle response data
      const certificationData = response.data.data || response.data || [];
      if (!Array.isArray(certificationData)) {
        console.warn('Certification data is not an array:', certificationData);
        setCertifications([]);
      } else {
        const sortedCertifications = certificationData.sort((a, b) => {
          const nameA = a.certification_name?.toLowerCase() || '';
          const nameB = b.certification_name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });
        setCertifications(sortedCertifications);
      }
    } catch (error) {
      console.error('Error fetching certifications:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to fetch certifications.'
      );
      setError(error.response?.data?.message || 'Failed to fetch certifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  // Handle updated certification from EditCertificate
  useEffect(() => {
    if (route.params?.updatedCertification) {
      console.log('Certificate: Received updated certification', route.params.updatedCertification);
      setCertifications((prev) =>
        prev.map((cert) =>
          cert.id === route.params.updatedCertification.id
            ? { ...cert, ...route.params.updatedCertification }
            : cert
        ).sort((a, b) => {
          const nameA = a.certification_name?.toLowerCase() || '';
          const nameB = b.certification_name?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        })
      );
      // Clear params to prevent repeated updates
      navigation.setParams({ updatedCertification: undefined });
    }
  }, [route.params?.updatedCertification]);

  // Fallback: Handle refresh flag
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Certificate: Screen focused, checking refresh flag');
      if (route.params?.refresh) {
        console.log('Certificate: Refresh flag detected, refetching data');
        fetchCertifications();
        navigation.setParams({ refresh: undefined });
      }
    });
    return unsubscribe;
  }, [navigation, route.params?.refresh]);

  const handleDelete = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Unauthorized', 'No user token found.');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/auth/certification/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // Remove the certification from the state
      setCertifications((prev) => prev.filter((cert) => cert.id !== id));
      Alert.alert('Success', 'Certification deleted successfully.');
    } catch (error) {
      console.error('Error deleting certification:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to delete certification.'
      );
    }
  };

  const renderCertification = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.certification_name || 'Unnamed Certification'}</Text>
        <Text style={styles.detail}>Certificate Number: {item.certificate_number}</Text>
        <Text style={styles.detail}>Guide: {item.guide?.full_name || 'Unknown'}</Text>
        <Text style={styles.detail}>Description: {item.description}</Text>
        <Text style={styles.detail}>Issue Date: {item.issue_date}</Text>
        <Text style={styles.detail}>Expiry Date: {item.expiry_date || 'N/A'}</Text>
        <Text style={styles.detail}>Status: {item.status}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate('EditCertificate', { certification: item })}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              'Confirm Delete',
              `Are you sure you want to delete "${item.certification_name}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) },
              ]
            );
          }}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <FlatList
        data={certifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCertification}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No certifications found.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  detail: {
    fontSize: fonts.fontSizeSmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error || '#e03131',
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: fonts.fontSizeSmall,
    fontFamily: fonts.medium,
  },
  emptyText: {
    fontSize: fonts.fontSizeMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    fontSize: fonts.fontSizeMedium,
    color: colors.error || '#e03131',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default Certificate;