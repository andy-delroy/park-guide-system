import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import * as SecureStore from 'expo-secure-store';
import styles from '../Styles/styles';
import { resetToTab } from '../Utils/navigationHelpers'; 

const CustomDrawerContent = ({ navigation, role }) => {
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('userName');
          await SecureStore.deleteItemAsync('userRole');
          await SecureStore.deleteItemAsync('fullName');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView>
        <View style={{ padding: 20 }}>
            <DrawerItem
                label="Home"
                onPress={() => navigation.dispatch(resetToTab('Home'))}
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Map"
                onPress={() => navigation.dispatch(resetToTab('Map'))}
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Camera"
                onPress={() => navigation.dispatch(resetToTab('Camera'))}
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Training"
                onPress={() =>
                navigation.navigate('MainStack', {
                    screen: 'Training',
                })
                }
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Certificate"
                onPress={() =>
                navigation.navigate('MainStack', {
                    screen: 'Certificate',
                })
                }
                labelStyle={styles.drawerLabel}
            />
            {(role === 'admin') && (
                <>
                  <DrawerItem
                      label="Manage Guides"
                      onPress={() =>
                      navigation.navigate('MainStack', {
                          screen: 'Manage Guides',
                      })
                      }
                      labelStyle={styles.drawerLabel}
                  />
                </>
            )}
            <DrawerItem
                label="Generate QR"
                onPress={() =>
                navigation.navigate('MainStack', {
                    screen: 'Generate QR',
                })
                }
                labelStyle={styles.drawerLabel}
            />
            <DrawerItem
                label="Profile"
                onPress={() => navigation.dispatch(resetToTab('Profile'))}
                labelStyle={styles.drawerLabel}
            />
        </View>
      </DrawerContentScrollView>
      <View style={styles.logoutContainer}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawerContent;
