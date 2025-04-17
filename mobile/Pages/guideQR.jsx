import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRoute } from '@react-navigation/native';
import { colors, fonts } from '../Styles/theme';

const GuideQR = () => {
  const route = useRoute();
  const { selectedGuides } = route.params || {};

  if (!selectedGuides) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No guides selected.</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContainer}>
        <Text style={styles.name}>{item.full_name}</Text>
        <View style={styles.qrWrapper}>
          <QRCode value={item.username} size={140} />
        </View>
      </View>
    </View>
  );
  

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={selectedGuides}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  name: {
    fontSize: fonts.fontSizeLarge,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: fonts.fontSizeMedium,
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    },
    cardContainer: {
        width: '100%',
        backgroundColor: colors.secondaryContrast,
        borderRadius: 20,
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      },
      
});

export default GuideQR;
