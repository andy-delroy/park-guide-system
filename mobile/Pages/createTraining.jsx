import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../Styles/theme';
import {API_BASE_URL} from '../api.config';

const CreateTraining = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    capacity: '',
  });
  const [saving, setSaving] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

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

  const handlePickerToggle = (pickerType, isVisible) => {
    if (pickerType === 'start_date') setShowStartDatePicker(isVisible);
    if (pickerType === 'end_date') setShowEndDatePicker(isVisible);
    // Scroll to end to ensure picker is visible
    if (isVisible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleCreate = async () => {
    if (saving) return;

    const { title, location, start_date, end_date, capacity } = formData;
    if (!title || !location || !start_date || !end_date || !capacity) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    setSaving(true);

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Unauthorized', 'User token not found.');
        setSaving(false);
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        capacity: parseInt(formData.capacity, 10),
      };

      await axios.post(`${API_BASE_URL}/api/auth/trainings`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Success', 'Training created successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MainStack', {
            screen: 'Tabs',
            params: {
              screen: 'Trainings',
              params: { refresh: true },
            },
          }),
        },
      ]);
    } catch (error) {
      console.error('Create error:', error.response?.data || error.message);
      if (error.response?.data?.errors) {
        const message = Object.values(error.response.data.errors).flat().join('\n');
        Alert.alert('Validation Error', message);
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to create training.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Title */}
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter title"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Enter description"
            multiline
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
          />

          {/* Location */}
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
          />

          {/* Start Date */}
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => handlePickerToggle('start_date', true)}
          >
            <Text style={styles.inputText}>
              {formData.start_date || 'Select start date'}
            </Text>
          </TouchableOpacity>
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
                  onPress={() => handlePickerToggle('start_date', false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* End Date */}
          <Text style={styles.label}>End Date *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => handlePickerToggle('end_date', true)}
          >
            <Text style={styles.inputText}>
              {formData.end_date || 'Select end date'}
            </Text>
          </TouchableOpacity>
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
                  onPress={() => handlePickerToggle('end_date', false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Capacity */}
          <Text style={styles.label}>Capacity *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter capacity"
            keyboardType="numeric"
            value={formData.capacity}
            onChangeText={(text) => handleInputChange('capacity', text)}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleCreate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Training</Text>
          )}
        </TouchableOpacity>
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
  content: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white || '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: fonts.fontSizeLarge || 18,
    fontFamily: fonts.bold || '700',
    marginBottom: 16,
    color: colors.primary || '#00693D',
  },
  label: {
    fontSize: fonts.fontSizeMedium || 16,
    fontFamily: fonts.medium || '600',
    marginBottom: 6,
    color: colors.textPrimary || '#333',
  },
  input: {
    fontSize: fonts.fontSizeSmall || 16,
    backgroundColor: colors.white || '#fff',
    borderColor: colors.textSecondary || '#00693D',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  inputText: {
    color: colors.textPrimary || '#333',
    fontSize: fonts.fontSizeSmall || 16,
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
  submitButton: {
    backgroundColor: colors.primary || '#00693D',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary || '#757575',
  },
  submitButtonText: {
    color: colors.buttonText || '#fff',
    fontFamily: fonts.bold || '600',
    fontSize: fonts.fontSizeMedium || 16,
  },
});

export default CreateTraining;