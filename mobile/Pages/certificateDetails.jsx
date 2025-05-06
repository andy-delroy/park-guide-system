import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts } from '../Styles/theme';
import API_BASE_URL from '../api.config';

// Stub for formatDate (matches Certificate.js)
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'N/A';

const CertificateDetails = ({ route }) => {
  const { certification } = route.params;
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...certification,
    guide_id: certification.guide?.id ? String(certification.guide.id) : '',
  });
  const [guides, setGuides] = useState([]);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [showGuidePicker, setShowGuidePicker] = useState(false);
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

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

  // Handle input changes
  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle date changes
  const handleDateChange = (event, selectedDate, field) => {
    const currentDate = selectedDate || new Date();
    if (Platform.OS === 'android') {
      if (field === 'issue_date') setShowIssueDatePicker(false);
      if (field === 'expiry_date') setShowExpiryDatePicker(false);
    }
    if (event.type !== 'dismissed') {
      const formattedDate = currentDate.toISOString().split('T')[0];
      handleInputChange(field, formattedDate);
    }
  };

  // Get selected guide name
  const getSelectedGuideName = () => {
    if (guidesLoading) return 'Loading guides...';
    const selectedGuide = guides.find((guide) => String(guide.id) === formData.guide_id);
    return selectedGuide ? selectedGuide.full_name : 'Select a Guide';
  };

  // Handle Save
  const handleSave = async () => {
    if (!formData.certification_name || !formData.certificate_number || !formData.guide_id) {
      Alert.alert('Validation Error', 'Certification Name, Certificate Number, and Guide are required.');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Unauthorized', 'No user token found.');
        return;
      }

      // Prepare data
      const updatedData = {
        ...formData,
        guide_id: formData.guide_id || null,
        validity_period_months: formData.validity_period_months
          ? parseInt(formData.validity_period_months, 10)
          : null,
        renewal_count: formData.renewal_count ? parseInt(formData.renewal_count, 10) : 0,
        issue_date: formData.issue_date || null,
        expiry_date: formData.expiry_date || null,
        base_url : API_BASE_URL,
      };

      await axios.put(
        `${API_BASE_URL}/api/auth/certification/${formData.id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      Alert.alert('Success', 'Certification updated successfully.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating certification:', error.response?.data || error.message);
      let errorMessage = error.response?.data?.message || 'Failed to update certification.';
      if (error.response?.data?.errors) {
        const errorDetails = Object.values(error.response.data.errors).flat().join('\n');
        Alert.alert('Validation Error', errorDetails);
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setFormData({ ...certification, guide_id: certification.guide?.id ? String(certification.guide.id) : '' });
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

      await axios.delete(`${API_BASE_URL}/api/auth/certification/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      Alert.alert('Success', 'Certification deleted successfully.');
      navigation.navigate('MainStack', {
        screen: 'Tabs',
        params: {
          screen: 'Certificates',
          params: { refresh: true },
        },
      });
    } catch (error) {
      console.error('Error deleting certification:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to delete certification.'
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Certificate Image */}
      <View style={styles.imageContainer}>
        {certification.certificate_file_url ? (
          <Image
            source={{ uri: certification.certificate_file_url }}
            style={styles.certificateImage}
            resizeMode="contain"
            onError={() => console.log('Failed to load certificate image')}
          />
        ) : (
          <Text style={styles.noImage}>No Certificate Image Available</Text>
        )}
      </View>

      {/* General Info Card */}
      <TouchableOpacity style={styles.card} activeOpacity={0.95} disabled={isEditing}>
        <Text style={styles.cardTitle}>General Information</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Guide</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.input}
              onPress={() => !guidesLoading && setShowGuidePicker(true)}
              disabled={guidesLoading}
            >
              <Text style={styles.inputText}>{getSelectedGuideName()}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>
              {formData.guide?.full_name || 'Unknown'}
            </Text>
          )}
          <Modal
            visible={showGuidePicker}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowGuidePicker(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowGuidePicker(false)}
                  >
                    <Text style={styles.modalButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={formData.guide_id}
                  onValueChange={(value) => {
                    handleInputChange('guide_id', value);
                    setShowGuidePicker(false);
                  }}
                  style={styles.modalPicker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select a Guide" value="" />
                  {guides.map((guide) => (
                    <Picker.Item
                      key={guide.id}
                      label={guide.full_name || 'Unknown Guide'}
                      value={String(guide.id)}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </Modal>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Program</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.program?.name || ''}
              onChangeText={(text) =>
                handleInputChange('program', { ...formData.program, name: text })
              }
              placeholder="Enter program name"
            />
          ) : (
            <Text style={styles.value}>
              {formData.program?.name || 'N/A'}
            </Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Certificate Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.certificate_number || ''}
              onChangeText={(text) => handleInputChange('certificate_number', text)}
              placeholder="Enter certificate number"
            />
          ) : (
            <Text style={styles.value}>
              {formData.certificate_number || 'N/A'}
            </Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Certificate Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.certification_name || ''}
              onChangeText={(text) => handleInputChange('certification_name', text)}
              placeholder="Enter certificate name"
            />
          ) : (
            <Text style={styles.value}>
              {formData.certification_name || 'Unnamed Certification'}
            </Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={formData.description || ''}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Enter description"
              multiline
            />
          ) : (
            <Text style={styles.value}>
              {formData.description || 'N/A'}
            </Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Valid Months</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.validity_period_months?.toString() || ''}
              onChangeText={(text) => handleInputChange('validity_period_months', text)}
              placeholder="Enter validity period (months)"
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>
              {formData.validity_period_months
                ? `${formData.validity_period_months} months`
                : 'N/A'}
            </Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Renewal Requirements</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={formData.renewal_requirements || ''}
              onChangeText={(text) => handleInputChange('renewal_requirements', text)}
              placeholder="Enter renewal requirements"
              multiline
            />
          ) : (
            <Text style={styles.value}>
              {formData.renewal_requirements || 'N/A'}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Dates & Status Card */}
      <TouchableOpacity style={styles.card} activeOpacity={0.95} disabled={isEditing}>
        <Text style={styles.cardTitle}>Dates & Status</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Issue Date</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowIssueDatePicker(true)}
            >
              <Text style={styles.inputText}>
                {formData.issue_date || 'Select issue date'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>
              {formatDate(formData.issue_date)}
            </Text>
          )}
          {showIssueDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={formData.issue_date ? new Date(formData.issue_date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, date) => handleDateChange(event, date, 'issue_date')}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowIssueDatePicker(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Expiry Date</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowExpiryDatePicker(true)}
            >
              <Text style={styles.inputText}>
                {formData.expiry_date || 'Select expiry date'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>
              {formatDate(formData.expiry_date)}
            </Text>
          )}
          {showExpiryDatePicker && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={formData.expiry_date ? new Date(formData.expiry_date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, date) => handleDateChange(event, date, 'expiry_date')}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowExpiryDatePicker(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Issued By</Text>
          <Text style={styles.value}>
            {formData.issuer?.full_name || 'Unknown'}
          </Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Renewal Count</Text>
          <Text style={styles.value}>
            {formData.renewal_count ?? '0'}
          </Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          {isEditing ? (
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
          ) : (
            <Text style={styles.value}>
              {formData.status || 'N/A'}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
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
          </>
        )}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: colors.white || '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    maxHeight: '50%',
  },
  modalPicker: {
    backgroundColor: colors.white || '#fff',
    color: colors.textPrimary || '#333',
    fontSize: fonts.fontSizeSmall || 16,
    fontFamily: fonts.medium || '600',
  },
  pickerItem: {
    color: colors.textPrimary || '#333',
    fontSize: fonts.fontSizeMedium || 16,
    fontFamily: fonts.medium || '600',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalButton: {
    padding: 12,
  },
  modalButtonText: {
    fontSize: fonts.fontSizeMedium || 16,
    fontFamily: fonts.medium || '600',
    color: colors.secondaryContrast || '#00693D',
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
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderColor: colors.textSecondary || '#00693D',
    borderWidth: 1,
    borderRadius: 8,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 7,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: colors.secondaryContrast || '#00693D',
    borderColor: colors.secondaryContrast || '#00693D',
  },
  statusButtonText: {
    fontSize: fonts.fontSizeSmall || 16,
    fontFamily: fonts.medium || '600',
    color: colors.textPrimary || '#333',
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
  buttonText: {
    fontSize: fonts.fontSizeMedium || 16,
    fontFamily: fonts.bold || '600',
    color: colors.buttonText || '#fff',
  },
});

export default CertificateDetails;