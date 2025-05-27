import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import styles from '../Styles/styles';
import { useNotifications } from '../Pages/NotificationContext'

const TopBar = ({ navigation, route, role }) => {
  const { unreadCount } = useNotifications();
  console.log(' Unread Count from context:', unreadCount);
  const currentScreen = getFocusedRouteNameFromRoute(route) || 'Home';
  const isTabsScreen = currentScreen === 'Tabs';
  let tabScreen = currentScreen;

  if (isTabsScreen) {
    const tabState = route?.state;
    const tabIndex = tabState?.index ?? 0;
    tabScreen = tabState?.routes?.[tabIndex]?.name ?? 'Home';
  }

  const isHome = tabScreen === 'Home';

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
        }
        style={{ position: 'relative' }}
      >
        <Icon name="bell" size={22} color="#fff" />
        {unreadCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: 'red',
            borderRadius: 6,
            width: 12,
            height: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 8, fontWeight: 'bold' }}>{unreadCount < 10 ? unreadCount : '9+'}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;
