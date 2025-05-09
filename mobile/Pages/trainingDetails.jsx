import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts } from '../Styles/theme';
import API_BASE_URL from '../api.config';

// Format date to match CertificateDetails
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

const TrainingDetails = () => {
  const route = useRoute();
  const { training } = route.params;
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: training.title || '',
    description: training.description || '',
    location: training.location || '',
    start_date: training.start_date || new Date().toISOString().split('T')[0],
    end_date: training.end_date || '',
    capacity: training.capacity?.toString() || '',
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(training.is_enrolled || false);

    // Fetch user role from SecureStore
    useEffect(() => {
        const fetchUserRole = async () => {
        try {
            const role = await SecureStore.getItemAsync('userRole');
            setUserRole(role);
        } catch (error) {
            console.error('Error fetching user role:', error);
            Alert.alert('Error', 'Failed to load user role.');
        }
        };
        fetchUserRole();
    }, []);
    
  // Handle input changes
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle date changes
  const handleDateChange = (event, selectedDate, field) => {
    const currentDate = selectedDate || new Date();
    if (Platform.OS === 'android') {
      if (field === 'start_date') setShowStartDatePicker(false);
      if (field === 'end_date') setShowEndDatePicker(false);
    }
    if (event.type !== 'dismissed') {
      const formattedDate = currentDate.toISOString().split('T')[0];
      handleInputChange(field, formattedDate);
    }
  };

  // Handle Save
  const handleSave = async () => {
    if (saving) return;

    // Validate required fields
    if (
      !formData.title?.trim() ||
      !formData.start_date?.trim() ||
      !formData.capacity?.trim() ||
      !formData.location?.trim() ||
      !formData.end_date?.trim()
    ) {
      Alert.alert(
        'Validation Error',
        'Title, Location, Start Date, End Date, and Capacity are required and cannot be empty.'
      );
      return;
    }

    setSaving(true);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Unauthorized', 'No user token found.');
        setSaving(false);
        return;
      }

      const filteredFormData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        capacity: parseInt(formData.capacity, 10), // Ensure capacity is an integer
      };

      console.log('Sending JSON:', filteredFormData);
      const response = await axios.put(
        `${API_BASE_URL}/api/auth/trainings/${training.id}`,
        filteredFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setIsEditing(false);
        Alert.alert('Success', 'Training updated successfully.');
      }
    } catch (error) {
      console.error('Error updating training:', error.response?.data || error.message);
      let errorMessage = 'Failed to update training.';
      if (error.response?.data?.errors) {
        const errorDetails = Object.values(error.response.data.errors).flat().join('\n');
        Alert.alert('Validation Error', errorDetails);
      } else {
        Alert.alert('Error', error.response?.data?.message || errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setFormData({
      title: training.title || '',
      description: training.description || '',
      location: training.location || '',
      start_date: training.start_date || new Date().toISOString().split('T')[0],
      end_date: training.end_date || '',
      capacity: training.capacity?.toString() || '',
    });
    setIsEditing(false);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Unauthorized', 'No user token found.');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/auth/trainings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      Alert.alert('Success', 'Training deleted successfully.');
      navigation.navigate('MainStack', {
        screen: 'Tabs',
        params: {
          screen: 'Trainings',
          params: { refresh: true },
        },
      });
    } catch (error) {
      console.error('Error deleting training:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to delete training.'
      );
    }
  };
  
  const handleEnroll = async (trainingId) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/trainings/${trainingId}/enroll`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      
        setIsEnrolled(true);
      Alert.alert('Success', response.data.message || 'Successfully enrolled!');
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message || 'Enrollment failed.');
      } else {
        Alert.alert('Error', 'Network or server error.');
      }
    }
  };
  
  const handleUnenroll = async (trainingId) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
  
      const response = await axios.delete(
        `${API_BASE_URL}/api/auth/trainings/${trainingId}/unenroll`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
  
        setIsEnrolled(false);
      Alert.alert('Success', response.data.message || 'Unenrolled successfully!');
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message || 'Unenrollment failed.');
      } else {
        Alert.alert('Error', 'Network or server error.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* General Info Card */}
        <TouchableOpacity style={styles.card} activeOpacity={0.95} disabled={isEditing}>
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                placeholder="Enter training title"
              />
            ) : (
              <Text style={styles.value}>{formData.title || 'N/A'}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                placeholder="Enter description"
                multiline
              />
            ) : (
              <Text style={styles.value}>{formData.description || 'N/A'}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => handleInputChange('location', text)}
                placeholder="Enter location"
              />
            ) : (
              <Text style={styles.value}>{formData.location || 'N/A'}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Start Date</Text>
            {isEditing ? (
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {formData.start_date || 'Select start date'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.value}>{formatDate(formData.start_date)}</Text>
            )}
            {showStartDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={formData.start_date ? new Date(formData.start_date) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, date) => handleDateChange(event, date, 'start_date')}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowStartDatePicker(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>End Date</Text>
            {isEditing ? (
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.inputText}>
                  {formData.end_date || 'Select end date'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.value}>{formatDate(formData.end_date)}</Text>
            )}
            {showEndDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={formData.end_date ? new Date(formData.end_date) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, date) => handleDateChange(event, date, 'end_date')}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowEndDatePicker(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Capacity</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.capacity}
                onChangeText={(text) => handleInputChange('capacity', text)}
                placeholder="Enter capacity"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{formData.capacity || 'N/A'}</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing && userRole === 'admin' ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : userRole === 'admin' ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    'Confirm Delete',
                    `Are you sure you want to delete "${training.title}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => handleDelete(training.id),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </>
          ) : userRole === 'guide' ? (
            isEnrolled ? (
              <TouchableOpacity
                style={[styles.button, styles.unenrollButton]}
                onPress={() => handleUnenroll(training.id)}
              >
                <Text style={styles.buttonText}>Unenroll</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.enrollButton]}
                onPress={() => handleEnroll(training.id)}
              >
                <Text style={styles.buttonText}>Enroll</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={styles.noAccessText}>No actions available for your role.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  input: {
    fontSize: fonts.fontSizeSmall || 16,
    color: colors.textPrimary || '#333',
    backgroundColor: colors.white || '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textSecondary || '#00693D',
    marginBottom: 16,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: fonts.fontSizeSmall || 16,
    color: colors.textPrimary || '#333',
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: colors.secondaryContrast || '#00693D',
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: fonts.fontSizeMedium || 16,
    fontFamily: fonts.medium || '600',
    color: colors.buttonText || '#fff',
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
  editButton: {
    backgroundColor: '#00693D',
  },
  saveButton: {
    backgroundColor: '#00693D',
  },
  cancelButton: {
    backgroundColor: colors.textSecondary || '#757575',
  },
  deleteButton: {
    backgroundColor: colors.error || '#d32f2f',
  },
  enrollButton: {
    backgroundColor: '#00693D', // Match editButton and saveButton
  },
  unenrollButton: {
    backgroundColor: colors.error || '#d32f2f', // Match deleteButton
  },
  buttonText: {
    fontSize: fonts.fontSizeMedium || 16,
    fontFamily: fonts.bold || '600',
    color: colors.buttonText || '#fff',
  },
});

export default TrainingDetails;