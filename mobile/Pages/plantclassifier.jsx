import React, { useState, useEffect } from "react";
import { View, Text, Button, Image, StyleSheet, ActivityIndicator, Alert, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function PlantClassifier() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);

  // Request permission to access media
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "We need camera roll permission to classify images.");
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setImage(asset.uri);
        await classifyImage(asset.uri);
      }
    } catch (err) {
      console.error("Image pick error:", err);
    }
  };

  const openCamera = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri);
      await classifyImage(uri);
    }
  } catch (err) {
    console.error("Camera error:", err);
  }
};


  const classifyImage = async (uri) => {
    try {
      setLoading(true);
      setPrediction("");

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "orchid.jpg",
        type: "image/jpeg",
      });

      const response = await fetch("https://orchididentity.pythonanywhere.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (result?.predictions?.length > 0) {
        const formatted = result.predictions
          .map(p => `${p.label}: ${p.confidence}`)
          .join('\n');
        setPrediction(formatted);
      } else {
        setPrediction("Prediction failed or empty response.");
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setPrediction("Failed to predict.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orchid Classifier</Text>

      <View style={styles.content}>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        {loading && <ActivityIndicator size="large" color="#4f46e5" />}
        {!loading && prediction !== "" && (
          <Text style={styles.prediction}>{prediction}</Text>
        )}
      </View>

      <View style={styles.bottomBar}>
        <Pressable style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Gallery</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={openCamera}>
          <Text style={styles.buttonText}>Camera</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  content: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  image: {
  width: 250,
  height: 250,
  borderRadius: 16,
  marginTop: 20,
  borderWidth: 2,
  borderColor: "#d1d5db", // soft gray
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 4,
  },
  prediction: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginTop: 10,
    width: "100%",
  },
  bottomBar: {
  position: "absolute",
  bottom: 30,
  left: 0,
  right: 0,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 16, // space between buttons (React Native 0.71+)
  },
  button: {
  backgroundColor: "#4f46e5", // indigo
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  marginHorizontal: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
  },
  buttonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
  },
});


