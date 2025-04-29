import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import BottomTabs from './bottomTabs';
import Notification from '../Pages/notification';
import Training from '../Pages/training';
import Certificate from '../Pages/certificate';
import CreateCertificate from '../Pages/createCertificate';
import EditCertificate from '../Pages/editCertificate';
import GenerateQR from '../Pages/generateQR';
import ManageGuides from '../Pages/manageGuides';
import GuideQR from '../Pages/guideQR';

const Stack = createStackNavigator();

const MainStack = ({ role }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={BottomTabs} />
    {(role === 'admin' || role === 'guide') && (
      <>
        <Stack.Screen name="Training" component={Training} />
        <Stack.Screen name="Certificate" component={Certificate} />
        <Stack.Screen name="CreateCertificate" component={CreateCertificate} />
        <Stack.Screen name="EditCertificate" component={EditCertificate} />
      </>
    )}
    <Stack.Screen name="Notification" component={Notification} />
    <Stack.Screen name="Generate QR" component={GenerateQR} />
    <Stack.Screen name="Manage Guides" component={ManageGuides} />
    <Stack.Screen name="Guide QR" component={GuideQR} />
  </Stack.Navigator>
);

export default MainStack;
