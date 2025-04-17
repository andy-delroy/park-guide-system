// Pages/generateQR.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const GenerateQR = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  const handleGenerate = () => {
    setQrUrl(inputUrl.trim());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter URL to generate QR Code:</Text>
      <TextInput
        style={styles.input}
        placeholder="https://yourapp.com/guide/123"
        value={inputUrl}
        onChangeText={setInputUrl}
      />
      <Button title="Generate QR Code" onPress={handleGenerate} color="#00693D" />
      <View style={styles.qrContainer}>
        {qrUrl !== '' && <QRCode value={qrUrl} size={200} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default GenerateQR;
