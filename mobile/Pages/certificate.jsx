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
  ScrollView,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, fonts } from '../Styles/theme';
import {API_BASE_URL} from '../api.config';
import { Ionicons } from '@expo/vector-icons';

const Certificate = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await SecureStore.getItemAsync('userRole');
      setUserRole(role);
    };
    fetchUserRole();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert('Unauthorized', 'No user token found.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/certification?type=certificate`, {
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
      navigation.setParams({ updatedCertification: undefined });
    }
  }, [route.params?.updatedCertification]);

  // Fallback: Handle refresh flag
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.refresh) {
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderCertification = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CertificateDetails', { certification: item })}
    >
      <ScrollView style={styles.info}>
        <Text style={styles.name}>{item.certification_name || 'Unnamed Certification'}</Text>
        <Text style={styles.detail}>Certificate Number: {item.certificate_number || 'N/A'}</Text>
        <Text style={styles.detail}>Issued to: {item.guide?.full_name || 'Unknown'}</Text>
      </ScrollView>
      <Ionicons name="chevron-forward" size={24} color="black" style={styles.arrow} />
    </TouchableOpacity>
  );

  const handleAddCertification = () => {
    navigation.navigate('CreateCertificate');
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
      <FlatList
        data={certifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCertification}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No certifications found.</Text>
        }
      />
      {userRole === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddCertification}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  arrow: {
    alignSelf: 'center',
    margin: 10
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: 80, // Increased to accommodate FAB
  },
  card: {
    flexDirection: 'row',
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
    maxHeight: 300, // Limit height for scrollable content
  },
  name: {
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  detail: {
    fontSize: fonts.fontSizeSmall,
    color: colors.textSecondary,
    marginTop: 4,
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
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondaryContrast,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: {
    fontSize: 24,
    color: colors.buttonText,
    fontFamily: fonts.bold,
  },
});

export default Certificate;