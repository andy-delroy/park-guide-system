import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { colors, fonts } from '../Styles/theme';
import {API_BASE_URL} from '../api.config';

// Stub for formatDate (matches Certificate.js)
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

const LicenseDetails = ({ route }) => {
  const { certification } = route.params;
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    ...certification,
    guide_id: certification.guide?.id ? String(certification.guide.id) : '',
    program_name: certification.program?.name || '',
    status: certification.status || 'active',
    issue_date: certification.issue_date || new Date().toISOString().split('T')[0],
  });
  const [guides, setGuides] = useState([]);
  const [guidesLoading, setGuidesLoading] = useState(true);
  
  const expiryDate = new Date(certification.expiry_date);
    const today = new Date();
    const oneMonthFromToday = new Date();
    oneMonthFromToday.setMonth(oneMonthFromToday.getMonth() + 1);

    const showRenewButton = expiryDate <= oneMonthFromToday;

  // Fetch guides
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setGuidesLoading(true);
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert('Unauthorized', 'No user token found.');
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/api/auth/guides`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        let guidesData = response.data;
        if (!Array.isArray(guidesData)) {
          guidesData = response.data.data || [];
          if (!Array.isArray(guidesData)) {
            console.warn('Guides data is not an array:', guidesData);
            guidesData = [];
          }
        }
        setGuides(guidesData);
      } catch (error) {
        console.error('Error fetching guides:', error.response?.data || error.message);
        Alert.alert('Error', 'Failed to fetch guides.');
        setGuides([]);
      } finally {
        setGuidesLoading(false);
      }
    };
    fetchGuides();
  }, []);
    
  const handleRenew = async (id) => {
    try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
        Alert.alert('Unauthorized', 'No user token found.');
        return;
        }

        const response = await axios.post(`${API_BASE_URL}/api/auth/certification/${id}/renew`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
        });

        Alert.alert('Success', 'License renewed successfully.');

        // Optionally navigate back or refresh
        navigation.navigate('MainStack', {
        screen: 'Tabs',
        params: {
            screen: 'License',
            params: { refresh: true },
        },
        });
    } catch (error) {
        console.error('Error renewing license:', error.response?.data || error.message);
        Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to renew license.'
        );
    }
    };

  // Handle Delete
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

      Alert.alert('Success', 'License deleted successfully.');
      navigation.navigate('MainStack', {
        screen: 'Tabs',
        params: {
          screen: 'License',
          params: { refresh: true },
        },
      });
    } catch (error) {
      console.error('Error deleting license:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to delete license.'
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* License Image */}
      <View style={styles.imageContainer}>
        {certification.certificate_file_url ? (
          <Image
            source={{ uri: certification.certificate_file_url }}
            style={styles.certificateImage}
            resizeMode="contain"
            onError={() => console.log('Certificate image URI:', certification.certificate_file_url)}
          />
        ) : (
          <Text style={styles.noImage}>No License Image Available</Text>
        )}
      </View>

      {/* Guide Info Card */}
      <TouchableOpacity style={styles.card} activeOpacity={0.95}>
        <Text style={styles.cardTitle}>Guide Info</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Guide ID:</Text>
          <Text style={styles.value}>
                {formData.guide?.identification_number || 'Unknown'}
            </Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Guide Name:</Text>
          <Text style={styles.value}>
                {formData.guide?.full_name || 'Unknown'}
            </Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Phone Number:</Text>
          <Text style={styles.value}>
                {formData.guide?.phone_number || 'Unknown'}
            </Text>
        </View>
      </TouchableOpacity>
          <TouchableOpacity style={styles.card} activeOpacity={0.95}>
            <Text style={styles.cardTitle}>License</Text>
            <View style={styles.field}>
                <Text style={styles.label}>License Name:</Text>
                <Text style={styles.value}>
                    {formData.certification_name || 'Unnamed License'}
                </Text>
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>License Number:</Text>
                <Text style={styles.value}>
                    {formData.certificate_number || 'N/A'}
                </Text>
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Description:</Text>
                <Text style={styles.value}>
                    {formData.description || 'N/A'}
                </Text>
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Issued By:</Text>
                <Text style={styles.value}>
                    {formData.issuer?.full_name || 'Unknown'}
                </Text>
            </View>
        </TouchableOpacity>

      {/* Dates & Status Card */}
      <TouchableOpacity style={styles.card} activeOpacity={0.95}>
        <Text style={styles.cardTitle}>Dates</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Issue Date:</Text>
          <Text style={styles.value}>
              {formatDate(formData.issue_date)}
            </Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Expiry Date:</Text>
          <Text style={styles.value}>
              {formatDate(formData.expiry_date)}
            </Text>
        </View>
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {showRenewButton && (
            <TouchableOpacity
                style={[styles.button, styles.renewButton]}
                onPress={() => {
                Alert.alert(
                    'Confirm Renew',
                    `Are you sure you want to renew "${certification.certification_name}"?`,
                    [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Renew',
                        onPress: () => handleRenew(certification.id),
                    },
                    ]
                );
                }}
            >
                <Text style={styles.buttonText}>Renew</Text>
            </TouchableOpacity>
        )}
        <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => {
            Alert.alert(
                'Confirm Delete',
                `Are you sure you want to delete "${certification.certification_name}"?`,
                [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDelete(certification.id),
                },
                ]
            );
            }}
        >
            <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#f0f2f5',
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  imageContainer: {
    backgroundColor: colors.white || '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  certificateImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textSecondary || '#e0e0e0',
  },
  noImage: {
    fontSize: fonts.fontSizeMedium || 16,
    color: colors.textSecondary || '#888',
    textAlign: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.white || '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: fonts.fontSizeLarge || 18,
    fontFamily: fonts.bold || '700',
    color: '#00693D',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    fontSize: fonts.fontSizeMedium || 16,
    fontFamily: fonts.medium || '600',
    color: colors.textPrimary || '#333',
    marginBottom: 4,
  },
  value: {
    fontSize: fonts.fontSizeMedium || 16,
    color: colors.textSecondary || '#555',
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 35,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  renewButton: {
    backgroundColor: colors.primary || '#00693D',
    },

  deleteButton: {
    backgroundColor: colors.error || '#d32f2f',
  },
  buttonText: {
    fontSize: fonts.fontSizeMedium || 16,
    fontFamily: fonts.bold || '600',
    color: colors.buttonText || '#fff',
  },
});

export default LicenseDetails;