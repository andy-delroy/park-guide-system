import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as SecureStore from 'expo-secure-store';
import { colors, fonts } from '../Styles/theme';

import Home from '../Pages/home';
import Map from '../Pages/map';
import Camera from '../Pages/camera';
import Profile from '../Pages/profile';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await SecureStore.getItemAsync('userRole');
      setRole(storedRole);
    };
    fetchRole();
  }, []);

  const getCameraLabel = () => {
    if (role === 'visitor') return 'Guide';
    if (role === 'admin' || role === 'guide') return 'Camera';
    return 'Scan'; // fallback
  };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const iconName = {
            Home: 'home',
            Map: 'map',
            Camera: 'camera',
            Guide: 'tree',
            Profile: 'user',
          }[route.name];
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 75,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: fonts.fontSizeSmall,
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Map" component={Map} />
      {role && (
        <Tab.Screen
          name={getCameraLabel()} // Either 'Guide' or 'Camera'
          component={Camera}
        />
      )}
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
