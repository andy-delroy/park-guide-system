import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Map = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the map page</Text>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  text: {
    fontSize: 20,
    color: '#2f3640',
    fontWeight: '600',
  },
});
