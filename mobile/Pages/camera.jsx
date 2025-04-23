import React, { useState, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, Button, TouchableOpacity, StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../api.config';
import { AirbnbRating } from '@rneui/themed';
import { TextInput } from 'react-native';
import styles from '../Styles/styles'; // Import your styles

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
  
    const username = data?.trim(); // assume the QR code contains the username directly
  
    if (!username) {
      alert('Invalid QR Code');
      setScanned(false);
      return;
    }
  
    setLoading(true);
    setShowGuideDetails(true);
  
    try {
      const response = await axios.get(`${API_BASE_URL}/api/guides/${username}`);
      setGuideDetails(response.data.guide); 

      await fetchFeedbacks(username);
    } catch (err) {
      setError('Failed to fetch guide details.');
    } finally {
      setLoading(false);
    }
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

  const fetchFeedbacks = async (username) => {
    try {
      const feedbackResponse = await axios.get(`${API_BASE_URL}/api/guides/${username}/feedbacks`);
      setFeedbacks(feedbackResponse.data.feedbacks || []);
    } catch (err) {
      console.error('Failed to refetch feedbacks:', err);
    }
  };  

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
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        ) : guideDetails ? (
          <View style={styles.cameraCard}>
            {guideDetails.profile_image_url && (
              <View style={styles.cameraImageWrapper}>
                <Image
                  source={{ uri: guideDetails.profile_image_url }}
                  style={styles.cameraProfileImage}
                />
              </View>
            )}
            <Text style={styles.cameraName}>{guideDetails.full_name}</Text>
            <Text style={styles.cameraRole}>
              {guideDetails.role_name?.charAt(0).toUpperCase() + guideDetails.role_name.slice(1)}
            </Text>
            <View style={styles.cameraInfoBlock}>
              <Text style={styles.cameraLabel}>Email:</Text>
              <Text style={styles.cameraValue}>{guideDetails.email}</Text>
            </View>
            <View style={styles.cameraInfoBlock}>
              <Text style={styles.cameraLabel}>Phone:</Text>
              <Text style={styles.cameraValue}>{guideDetails.phone_number}</Text>
            </View>
    
            {/* ⭐ Show rating form only when triggered */}
            {showRatingForm && (
              <View style={{ marginTop: 30, width: '100%' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
                  Rate this Guide
                </Text>
    
                <AirbnbRating
                  count={5}
                  reviews={['Terrible', 'Bad', 'Okay', 'Good', 'Excellent']}
                  defaultRating={0}
                  size={30}
                  onFinishRating={setRating}
                />
    
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
    
            {/* 🔘 Button Row */}
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
                    if (!rating) return alert('Please give a rating first.');
                    setSubmitting(true);
                    try {
                      const payload = {
                        rating,
                        comments,
                      };
                      await axios.post(`${API_BASE_URL}/api/guides/${guideDetails.username}/feedback`, payload);
                      alert('Feedback submitted!');
                      setRating(0);
                      setComments('');
                      setShowRatingForm(false);

                      await fetchFeedbacks(guideDetails.username);
                    } catch (err) {
                      alert('Failed to submit feedback.');
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
                    {/* Top-right date */}
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
                    
                    <Text style={{ fontWeight: 'bold' }}>Rating: {fb.rating} ⭐</Text>
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