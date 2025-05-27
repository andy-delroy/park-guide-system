import React, { useState, useEffect } from "react";
import { View, Text, Button, Image, StyleSheet, ActivityIndicator, Alert, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function PlantClassifier() {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("orchid"); // or "fauna"

  // Request permission to access media
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "We need camera roll permission to classify images.");
      }
    })();
  }, []);

  const clearAll = () => {
    setImage(null);
    setPrediction("");
    Alert.alert("Cleared", "Image and prediction have been reset.");
  };

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
        name: "upload.jpg",
        type: "image/jpeg",
      });
      formData.append("mode", mode);  // "orchid" or "fauna"

      const response = await fetch("https://orchididentity.pythonanywhere.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const text = await response.text();
      console.log("Response Text:", text);

      const result = JSON.parse(text);

      if (result?.predictions?.length > 0) {
        const top = result.predictions[0];
        setPrediction(
          `This image is most likely a ${top.label}! I am ${top.confidence} confident.`
        );
      } else {
        setPrediction("Prediction failed or empty response.");
      }
    } catch (error) {
      console.error("Prediction error:", error);
      setPrediction("Prediction failed.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Species Classifier</Text>
        <Text style={styles.subtitle}>Select a category and upload an image</Text>
      </View>

      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, mode === "orchid" && styles.toggleButtonActive]}
          onPress={() => setMode("orchid")}
        >
          <Text style={styles.toggleText}>Orchid</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, mode === "fauna" && styles.toggleButtonActive]}
          onPress={() => setMode("fauna")}
        >
          <Text style={styles.toggleText}>Fauna</Text>
        </Pressable>
      </View>

      <View style={styles.topActions}>
  <Pressable style={styles.button} onPress={openCamera}>
    <Text style={styles.buttonText}>Camera</Text>
  </Pressable>
  <Pressable style={styles.button} onPress={pickImage}>
    <Text style={styles.buttonText}>Gallery</Text>
  </Pressable>
</View>

{/* Image, Prediction, etc. */}
<View style={styles.imageContainer}>
  {image && <Image source={{ uri: image }} style={styles.image} />}
  {loading && <ActivityIndicator size="large" color="#4f46e5" />}
  {!loading && prediction !== "" && (
    <Text style={styles.prediction}>{prediction}</Text>
  )}
</View>

{/* Clear Button at the bottom */}
<View style={styles.bottomBar}>
  <Pressable style={[styles.button, styles.clearButton]} onPress={clearAll}>
    <Text style={styles.buttonText}>Clear</Text>
  </Pressable>
</View>

    </View>
  );
}

const styles = StyleSheet.create({
  topActions: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
    paddingHorizontal: 12,
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 24,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#6b7280",
  },
  toggleButtonActive: {
    backgroundColor: "#4f46e5",
  },
  toggleText: {
    color: "#ffffffff",
    fontWeight: "600",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingBottom: 20,
  },
  image: {
    width: 300,
    height: 285,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 8,
  },
  prediction: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    color: "#1e293b",
    elevation: 3,
    fontWeight:"bold",
  },
  bottomBar: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
  },
  button: {
    flex:1,
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
clearButton: {
  backgroundColor: "#6b7280",
  width: "60%",
  alignSelf: "center",
  flex: 0,
},
buttonText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "600",
},
});