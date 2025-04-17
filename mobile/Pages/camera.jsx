import React, { useState, useEffect } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { View, Text, Button, TouchableOpacity, StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../api.config';
import { AirbnbRating } from '@rneui/themed';
import { TextInput } from 'react-native';

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
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}>
            <Text style={styles.text}>Flip Camera</Text>
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
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode='on-drag'
    >
      <View style={styles.guideContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : error ? (
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        ) : guideDetails ? (
          <View style={styles.card}>
            {guideDetails.profile_image_url && (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: guideDetails.profile_image_url }}
                  style={styles.profileImage}
                />
              </View>
            )}
            <Text style={styles.name}>{guideDetails.full_name}</Text>
            <Text style={styles.role}>
              {guideDetails.role_name?.charAt(0).toUpperCase() + guideDetails.role_name.slice(1)}
            </Text>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{guideDetails.email}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{guideDetails.phone_number}</Text>
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
                style={[styles.backButton, { flex: 1, marginRight: 10 }]}
                onPress={() => {
                  setShowGuideDetails(false);
                  setScanned(false);
                  setGuideDetails(null);
                  setError(null);
                  setShowRatingForm(false);
                  setStartScanning(false);
                }}
              >
                <Text style={styles.backButtonText}>Back to Camera</Text>
              </TouchableOpacity>
    
              <TouchableOpacity
                style={[styles.backButton, { flex: 1, marginLeft: 10, backgroundColor: '#FF8C00' }]}
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
                <Text style={styles.backButtonText}>
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
          <Text style={styles.guideContent}>No guide data found.</Text>
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
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <View style={styles.container}>
              {renderGuideDetails()}
            </View>
          </ScrollView>
        ) : startScanning ? (
          <View style={styles.container}>
            {renderCamera()}
          </View>
        ) : (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }]}>
            <Text style={styles.instructionText}>
              Please click the button below to scan the QR code of the park guide to provide feedback.
            </Text>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setStartScanning(true)}
            >
              <Text style={styles.scanButtonText}>Scan Guide QR</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );   
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  guideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  guideContent: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',
  },
  
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 15,
  },
  
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  
  role: {
    fontSize: 16,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  infoBlock: {
    width: '100%',
    marginBottom: 10,
  },
  
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  
  value: {
    fontSize: 14,
    color: '#666',
  },
  
  backButton: {
    marginTop: 20,
    backgroundColor: '#00693D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#00693D',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 2,
  },
  
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  
});
