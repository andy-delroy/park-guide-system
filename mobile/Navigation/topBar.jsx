import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import styles from '../Styles/styles';

const TopBar = ({ navigation, route, role }) => {
  // Get the currently focused screen name inside MainStack
  const currentScreen = getFocusedRouteNameFromRoute(route) || 'Home';
  
  const isTabsScreen = currentScreen === 'Tabs';
  let tabScreen = currentScreen; // Default to current screen
  
  if (isTabsScreen) {
    const tabState = route?.state; // Access the tab state
    const tabIndex = tabState?.index ?? 0; // Get the active tab index
    tabScreen = tabState?.routes?.[tabIndex]?.name ?? 'Home'; // Get the active tab screen name
  }

  const isHome = tabScreen === 'Home';

  // Handle back navigation safely
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainStack', { screen: 'Tabs', params: { screen: 'Home' } });
    }
  };

  return (
    <View style={styles.topNavContainer}>
      {isHome && (role === 'admin' || role === 'guide') ? (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="bars" size={22} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleBack}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
      )}

      {isHome ? (
        <Image
          source={require('../assets/sfc_logo_long.png')}
          style={styles.topNavImage}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.topNavTitle}>{tabScreen}</Text>
      )}

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('MainStack', {
            screen: 'Notification',
          })
        }>
        <Icon name="bell" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;