import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fonts } from '../Styles/theme';
import {API_BASE_URL} from '../api.config';

const CreateLicense = () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [formData, setFormData] = useState({
    guide_id: '',
    park_name: '',
    description: '',
    renewal_requirements: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    status: 'active',
    base_url: API_BASE_URL,
    type: 'license',
  });
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [showGuidePicker, setShowGuidePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  // Fetch guides for guide_id dropdown
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        setGuidesLoading(true);
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          console.warn('No token for fetching guides');
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

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  // Measure content height whenever layout changes
  const handleContentLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  // Toggle pickers and ensure layout recalculation
  const handlePickerToggle = (pickerType, isVisible) => {
    if (pickerType === 'issue_date') setShowIssueDatePicker(isVisible);
    if (pickerType === 'expiry_date') setShowExpiryDatePicker(isVisible);
    if (pickerType === 'status') setShowStatusPicker(isVisible);
    // Force layout recalculation
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSubmit = async () => {
    if (!formData.guide_id || !formData.description) {
      Alert.alert('Validation Error', 'Guide, and Description are required.');
      return;
    }

    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        console.warn('handleSubmit: No token found');
        Alert.alert('Unauthorized', 'No user token found.');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        guide_id: formData.guide_id || null,
        expiry_date: formData.expiry_date || null,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/certification`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      setLoading(false);
      Alert.alert('Success', response.data.message || 'Certification created successfully.', [
        {
          text: 'OK',
          onPress: () => {
            try {
              navigation.navigate('License', { refresh: true });
            } catch (navError) {
              console.error('Navigation error:', navError);
              navigation.goBack();
            }
          },
        },
      ]);
    } catch (error) {
      console.error('handleSubmit: Error', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setLoading(false);
      let errorMessage = error.response?.data?.message || 'Failed to create certification.';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your network and try again.';
      } else if (error.response?.data?.errors) {
        const errorDetails = Object.values(error.response.data.errors).flat().join('\n');
        Alert.alert('Validation Error', errorDetails);
        return;
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const getSelectedGuideName = () => {
    if (guidesLoading) return 'Loading guides...';
    const selectedGuide = guides.find((guide) => String(guide.id) === formData.guide_id);
    return selectedGuide ? selectedGuide.full_name : 'Select a Guide';
  };

  const handleGuideSelect = (value) => {
    handleInputChange('guide_id', value);
    setShowGuidePicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.form, { minHeight: contentHeight }]}
          keyboardShouldPersistTaps="handled"
        >
          <View onLayout={handleContentLayout}>
            <Text style={styles.label}>Guide</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => !guidesLoading && setShowGuidePicker(true)}
              disabled={guidesLoading}
            >
              <Text style={styles.inputText}>{getSelectedGuideName()}</Text>
            </TouchableOpacity>

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
                    onValueChange={handleGuideSelect}
                    style={styles.modalPicker}
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
            
            {/* Park Name */}
            <Text style={styles.label}>Park Name</Text>
            <TextInput
            style={styles.input}
            value={formData.park_name}
            onChangeText={(text) => handleInputChange('park_name', text)}
            placeholder="Enter park name"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Enter description"
              multiline
            />
            
            {/* Renewal Requirements */}
            <Text style={styles.label}>Requirements for renewal</Text>
            <TextInput
            style={[styles.input, { height: 80 }]}
            value={formData.renewal_requirements}
            onChangeText={(text) => handleInputChange('renewal_requirements', text)}
            placeholder="Enter renewal requirements"
            multiline
            />

            <Text style={styles.label}>Issue Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => handlePickerToggle('issue_date', true)}
            >
              <Text style={styles.dateText}>
                {formData.issue_date || 'Select issue date'}
              </Text>
            </TouchableOpacity>
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
                    onPress={() => handlePickerToggle('issue_date', false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Expiry Date */}
            <Text style={styles.label}>Expiry Date</Text>
            <TouchableOpacity
            style={styles.input}
            onPress={() => handlePickerToggle('expiry_date', true)}
            >
            <Text style={styles.dateText}>
                {formData.expiry_date || 'Select expiry date'}
            </Text>
            </TouchableOpacity>
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
                    onPress={() => handlePickerToggle('expiry_date', false)}
                >
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                )}
            </View>
            )}
            
            {/* Status Picker */}
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => handlePickerToggle('status', true)}
            >
              <Text style={styles.inputText}>{formData.status}</Text>
            </TouchableOpacity>
            <Modal
              visible={showStatusPicker}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowStatusPicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setShowStatusPicker(false)}
                    >
                      <Text style={styles.modalButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <Picker
                    selectedValue={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                    style={styles.modalPicker}
                  >
                    <Picker.Item label="Active" value="active" />
                    <Picker.Item label="Inactive" value="inactive" />
                  </Picker>
                </View>
              </View>
            </Modal>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  form: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
    justifyContent: 'center',
  },
  inputText: {
    fontSize: fonts.fontSizeSmall,
    color: colors.textPrimary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    maxHeight: '50%',
  },
  modalPicker: {
    backgroundColor: colors.white,
    color: colors.textPrimary,
    fontSize: fonts.fontSizeSmall,
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
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.medium,
    color: colors.secondaryContrast,
  },
  dateText: {
    fontSize: fonts.fontSizeSmall,
    color: colors.textPrimary,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: colors.secondaryContrast,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.medium,
    color: colors.buttonText,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderColor: colors.textSecondary,
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
    backgroundColor: colors.secondaryContrast,
    borderColor: colors.secondaryContrast,
  },
  statusButtonText: {
    fontSize: fonts.fontSizeSmall,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  submitButtonText: {
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.bold,
    color: colors.buttonText,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.textSecondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fonts.fontSizeMedium,
    fontFamily: fonts.bold,
    color: colors.buttonText,
  },
});

export default CreateLicense;