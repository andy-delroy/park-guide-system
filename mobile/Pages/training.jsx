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
import API_BASE_URL from '../api.config';
import { Ionicons } from '@expo/vector-icons';

const Trainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();

  const handleAddTraining = () => {
    navigation.navigate('CreateTraining');
  };

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const role = await SecureStore.getItemAsync('userRole'); 
      setUserRole(role); 

      if (!token) {
        Alert.alert('Unauthorized', 'No user token found.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/trainings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const trainingData = response.data.data || response.data || [];
      if (!Array.isArray(trainingData)) {
        console.warn('Trainings data is not an array:', trainingData);
        setTrainings([]);
      } else {
        const sortedTrainings = trainingData.sort((a, b) =>
          a.start_date.localeCompare(b.start_date)
        );
        setTrainings(sortedTrainings);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to fetch trainings.'
      );
      setError(error.response?.data?.message || 'Failed to fetch trainings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.refresh) {
        fetchTrainings();
        navigation.setParams({ refresh: undefined });
      }
    });
    return unsubscribe;
  }, [navigation, route.params?.refresh]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTraining = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TrainingDetails', { training: item })}
    >
      <ScrollView style={styles.info}>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.detail}>Location: {item.location}</Text>
        <Text style={styles.detail}>Start: {formatDate(item.start_date)}</Text>
        <Text style={styles.detail}>End: {formatDate(item.end_date)}</Text>
      </ScrollView>
      <Ionicons name="chevron-forward" size={24} color="black" style={styles.arrow} />
    </TouchableOpacity>
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
        data={trainings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTraining}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No trainings found.</Text>}
      />

      {/* FAB button */}
      {userRole === 'admin' && (
        <TouchableOpacity style={styles.fab} onPress={handleAddTraining}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  arrow: {
    alignSelf: 'center',
    margin: 10,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: 20,
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
    maxHeight: 300,
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

export default Trainings;
