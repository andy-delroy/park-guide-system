import React, { useState, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, Button, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import API_BASE_URL from '../api.config';
import { TextInput } from 'react-native';
import styles from '../Styles/styles';

export default function GuideScanner() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [showGuideDetails, setShowGuideDetails] = useState(false);
  const [guideDetails, setGuideDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [startScanning, setStartScanning] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.cameraMainContainer}>
        <Text style={styles.cameraMessage}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);

    const guideId = data?.trim(); // QR code contains guide ID (e.g., "1")

    if (!guideId || isNaN(parseInt(guideId))) {
      alert('Invalid QR Code: Guide ID required');
      setScanned(false);
      return;
    }

    setLoading(true);
    setShowGuideDetails(true);

    try {
      // Public endpoint, no token needed
      const response = await axios.get(`${API_BASE_URL}/api/auth/guides/${guideId}`, {
        headers: {
          Accept: 'application/json',
        },
      });

      // Check for nested data structure
      const guideData = response.data.data || response.data;

      // Verify guide role (use == to handle string vs number)
      if (guideData.role_id == null || guideData.role_id != 2) {
        console.error('Role ID Check Failed:', guideData.role_id);
        throw new Error('User is not a guide');
      }

      setGuideDetails(guideData); // Use guideData (handles nested or direct data)

      // Fetch feedbacks (authenticated)
      await fetchFeedbacks(guideId);
    } catch (err) {
      console.error('Guide Fetch Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch guide details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async (guideId) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        console.warn('No token for feedbacks, skipping');
        setFeedbacks([]);
        return;
      }
      const feedbackResponse = await axios.get(`${API_BASE_URL}/api/auth/guides/${guideId}/feedbacks`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      setFeedbacks(feedbackResponse.data.feedbacks || []);
    } catch (err) {
      console.error('Feedbacks Fetch Error:', err.response?.data || err.message);
      setFeedbacks([]);
    }
  };

  // Custom Star Rating Component (for input)
  const CustomStarRating = ({ rating, setRating }) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => {
              console.log('CustomStarRating: Rated', star);
              setRating(star);
            }}
          >
            <Text style={{ fontSize: 30, color: star <= rating ? '#FFD700' : '#D3D3D3', marginHorizontal: 5 }}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Feedback Star Display Component (for display)
  const FeedbackStarDisplay = ({ rating }) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
        <Text style={{ fontWeight: 'bold', marginRight: 10 }}>Rating:</Text>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={{ fontSize: 20, color: star <= rating ? '#FFD700' : '#D3D3D3', marginHorizontal: 2 }}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  const renderCamera = () => (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      >
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity style={styles.cameraButton} onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}>
            <Text style={styles.cameraText}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );

  const renderGuideDetails = () => (
    <ScrollView
      contentContainerStyle={styles.cameraScrollContainer}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode='on-drag'
    >
      <View style={styles.cameraGuideContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center', fontSize: 16, marginVertical: 20 }}>{error}</Text>
        ) : guideDetails ? (
          <View style={[styles.cameraCard, { backgroundColor: '#fff' }]}>
            {guideDetails.profile_image_url && (
              <View style={styles.cameraImageWrapper}>
                <Image
                  source={{ uri: guideDetails.profile_image_url }}
                  style={styles.cameraProfileImage}
                  onError={() => console.warn('Failed to load profile image')}
                />
              </View>
            )}
            <Text style={styles.cameraName}>{guideDetails.full_name || 'Unnamed Guide'}</Text>
            <Text style={styles.cameraRole}>Guide</Text>
            <View style={styles.cameraInfoBlock}>
              <Text style={styles.cameraLabel}>Email:</Text>
              <Text style={styles.cameraValue}>{guideDetails.email || 'N/A'}</Text>
            </View>
            <View style={styles.cameraInfoBlock}>
              <Text style={styles.cameraLabel}>Phone:</Text>
              <Text style={styles.cameraValue}>{guideDetails.phone_number || 'N/A'}</Text>
            </View>
            {guideDetails.biography && (
              <View style={styles.cameraInfoBlock}>
                <Text style={styles.cameraLabel}>Biography:</Text>
                <Text style={styles.cameraValue}>{guideDetails.biography}</Text>
              </View>
            )}
            {guideDetails.languages_spoken && (
              <View style={styles.cameraInfoBlock}>
                <Text style={styles.cameraLabel}>Languages Spoken:</Text>
                <Text style={styles.cameraValue}>{guideDetails.languages_spoken}</Text>
              </View>
            )}
            {guideDetails.years_of_experience && (
              <View style={styles.cameraInfoBlock}>
                <Text style={styles.cameraLabel}>Years of Experience:</Text>
                <Text style={styles.cameraValue}>{guideDetails.years_of_experience}</Text>
              </View>
            )}
            {guideDetails.specializations && (
              <View style={styles.cameraInfoBlock}>
                <Text style={styles.cameraLabel}>Specializations:</Text>
                <Text style={styles.cameraValue}>{guideDetails.specializations}</Text>
              </View>
            )}

            {/* Rating Form */}
            {showRatingForm && (
              <View style={{ marginTop: 30, width: '100%' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
                  Rate this Guide
                </Text>
                <CustomStarRating rating={rating} setRating={setRating} />
                <Text style={{ marginTop: 10, fontWeight: '500' }}>Comments (optional):</Text>
                <TextInput
                  placeholder="Leave your feedback..."
                  value={comments}
                  onChangeText={setComments}
                  multiline
                  style={{
                    height: 80,
                    borderColor: '#ccc',
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 5,
                  }}
                />
              </View>
            )}

            {/* Button Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, width: '100%' }}>
              <TouchableOpacity
                style={[styles.cameraBackButton, { flex: 1, marginRight: 10 }]}
                onPress={() => {
                  setShowGuideDetails(false);
                  setScanned(false);
                  setGuideDetails(null);
                  setError(null);
                  setShowRatingForm(false);
                  setStartScanning(false);
                }}
              >
                <Text style={styles.cameraBackButtonText}>Back to Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cameraBackButton, { flex: 1, marginLeft: 10, backgroundColor: '#FF8C00' }]}
                onPress={async () => {
                  if (!showRatingForm) {
                    setShowRatingForm(true);
                  } else {
                    if (!rating) {
                      alert('Please select a rating.');
                      return;
                    }
                    setSubmitting(true);
                    try {
                      const token = await SecureStore.getItemAsync('userToken');
                      if (!token) {
                        alert('Please log in to submit feedback.');
                        return;
                      }
                      const payload = {
                        rating,
                        comments: comments || null,
                      };
                      const response = await axios.post(
                        `${API_BASE_URL}/api/auth/guides/${guideDetails.id}/feedback`,
                        payload,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                          },
                        }
                      );
                      alert('Feedback submitted successfully!');
                      setRating(0);
                      setComments('');
                      setShowRatingForm(false);
                      await fetchFeedbacks(guideDetails.id);
                    } catch (err) {
                      console.error('Feedback Submit Error:', err.response?.data || err.message);
                      alert(err.response?.data?.message || 'Failed to submit feedback.');
                    } finally {
                      setSubmitting(false);
                    }
                  }
                }}
                disabled={submitting}
              >
                <Text style={styles.cameraBackButtonText}>
                  {submitting ? 'Submitting...' : showRatingForm ? 'Submit' : 'Rate'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Feedbacks Section */}
            {feedbacks.length > 0 && (
              <View style={{ width: '100%', marginTop: 30 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                  Visitor Feedback
                </Text>
                {feedbacks.map((fb, index) => (
                  <View
                    key={index}
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 10,
                      padding: 10,
                      marginBottom: 10,
                      backgroundColor: '#f9f9f9',
                      position: 'relative',
                    }}
                  >
                    {fb.submitted_date && (
                      <Text style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontSize: 12,
                        color: '#999',
                      }}>
                        {new Date(fb.submitted_date).toLocaleDateString()}
                      </Text>
                    )}
                    <FeedbackStarDisplay rating={fb.rating} />
                    {fb.comments ? (
                      <Text style={{ marginTop: 5 }}>{fb.comments}</Text>
                    ) : (
                      <Text style={{ fontStyle: 'italic', color: '#777' }}>No comments</Text>
                    )}
                    <Text style={{ fontSize: 12, color: '#888', marginTop: 5 }}>
                      {fb.tour_date ? `Tour Date: ${new Date(fb.tour_date).toLocaleDateString()}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.cameraGuideContent}>No guide data found.</Text>
        )}
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {showGuideDetails ? (
          <ScrollView
            contentContainerStyle={styles.cameraScrollContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.cameraMainContainer}>
              {renderGuideDetails()}
            </View>
          </ScrollView>
        ) : startScanning ? (
          <View style={styles.cameraMainContainer}>
            {renderCamera()}
          </View>
        ) : (
          <View style={[styles.cameraMainContainer, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }]}>
            <Text style={styles.cameraInstructionText}>
              Please click the button below to scan the QR code of the park guide to provide feedback.
            </Text>
            <TouchableOpacity
              style={styles.cameraScanButton}
              onPress={() => setStartScanning(true)}
            >
              <Text style={styles.cameraScanButtonText}>Scan Guide QR</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}