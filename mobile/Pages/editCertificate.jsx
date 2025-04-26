import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, fonts } from '../Styles/theme';
import API_BASE_URL from '../api.config';

const EditCertificate = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { certification } = route.params;

  const [formData, setFormData] = useState({
    certification_name: certification.certification_name || '',
    certificate_number: certification.certificate_number || '',
    description: certification.description || '',
    issue_date: certification.issue_date || '',
    expiry_date: certification.expiry_date || '',
    status: certification.status || 'active',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert('Unauthorized', 'No user token found.');
        setLoading(false);
        return;
      }

      // Ensure guide_id is included
      const payload = {
        ...formData,
        guide_id: certification.guide_id, // Retain original guide_id
      };

      await axios.put(`${API_BASE_URL}/api/certification/${certification.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      Alert.alert('Success', 'Certification updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating certification:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Failed to update certification.';
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        const errorDetails = Object.values(validationErrors).flat().join('\n');
        Alert.alert('Validation Error', errorDetails);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Certification</Text>
      <View style={styles.form}>
        <Text style={styles.label}>Certification Name</Text>
        <TextInput
          style={styles.input}
          value={formData.certification_name}
          onChangeText={(text) => handleInputChange('certification_name', text)}
          placeholder="Enter certification name"
        />
        <Text style={styles.label}>Certificate Number</Text>
        <TextInput
          style={styles.input}
          value={formData.certificate_number}
          onChangeText={(text) => handleInputChange('certificate_number', text)}
          placeholder="Enter certificate number"
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          placeholder="Enter description"
          multiline
        />
        <Text style={styles.label}>Issue Date</Text>
        <TextInput
          style={styles.input}
          value={formData.issue_date}
          onChangeText={(text) => handleInputChange('issue_date', text)}
          placeholder="YYYY-MM-DD"
        />
        <Text style={styles.label}>Expiry Date (optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.expiry_date}
          onChangeText={(text) => handleInputChange('expiry_date', text)}
          placeholder="YYYY-MM-DD"
        />
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              formData.status === 'active' && styles.statusButtonActive,
            ]}
            onPress={() => handleInputChange('status', 'active')}
          >
            <Text style={styles.statusButtonText}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusButton,
              formData.status === 'inactive' && styles.statusButtonActive,
            ]}
            onPress={() => handleInputChange('status', 'inactive')}
          >
            <Text style={styles.statusButtonText}>Inactive</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Updating...' : 'Update Certification'}
          </Text>
        </TouchableOpacity>
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
  form: {
    flex: 1,
  },
  label: {
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    fontSize: fonts.fontSizeSmall,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    marginRight: 8,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: fonts.fontSizeSmall,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  submitButtonText: {
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.bold,
    color: colors.white,
  },
});

export default EditCertificate;