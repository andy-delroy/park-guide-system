import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as SecureStore from 'expo-secure-store';

import TopBar from './topBar';
import MainStack from './mainStack';
import CustomDrawerContent from './customDrawerContent';
import { colors } from '../Styles/theme';
import styles from '../Styles/styles';

const Drawer = createDrawerNavigator();

const Main = () => {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedRole = await SecureStore.getItemAsync('userRole');
      setRole(storedRole || 'guest');
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} role={role} />}
    >
      <Drawer.Screen name="MainStack">
        {({ navigation, route }) => (
          <View style={{ flex: 1 }}>
            <SafeAreaView style={{ backgroundColor: colors.primary }}>
              <TopBar navigation={navigation} route={route} role={role} />
            </SafeAreaView>
            <MainStack role={role} />
          </View>
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

export default Main;
