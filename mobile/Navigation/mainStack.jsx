import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import BottomTabs from './bottomTabs';
import Notification from '../Pages/notification';
import Training from '../Pages/training';
import TrainingDetails from '../Pages/trainingDetails';
import CreateTraining from '../Pages/createTraining';
import Certificate from '../Pages/certificate';
import CertificateDetails from '../Pages/certificateDetails';
import CreateCertificate from '../Pages/createCertificate';
import GenerateQR from '../Pages/generateQR';
import ManageGuides from '../Pages/manageGuides';
import GuideQR from '../Pages/guideQR';
import PlantClassifier from "../Pages/plantclassifier";
import License from '../Pages/license';
import LicenseDetails from '../Pages/licenseDetails';
import CreateLicense from '../Pages/createLicense';

const Stack = createStackNavigator();

const MainStack = ({ role }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={BottomTabs} />
    {(role === 'admin' || role === 'guide') && (
      <>
        <Stack.Screen name="Certificate" component={Certificate} />
        <Stack.Screen name="CertificateDetails" component={CertificateDetails} />
        <Stack.Screen name="CreateCertificate" component={CreateCertificate} />

        <Stack.Screen name="License" component={License} />
        <Stack.Screen name="LicenseDetails" component={LicenseDetails} />
        <Stack.Screen name="CreateLicense" component={CreateLicense} />

        <Stack.Screen name="Training" component={Training} />
        <Stack.Screen name="TrainingDetails" component={TrainingDetails} />
        <Stack.Screen name="CreateTraining" component={CreateTraining} />
        <Stack.Screen name="PlantClassifier" component={PlantClassifier} />
      </>
    )}
    <Stack.Screen name="Notification" component={Notification} />
    <Stack.Screen name="Generate QR" component={GenerateQR} />
    <Stack.Screen name="Manage Guides" component={ManageGuides} />
    <Stack.Screen name="Guide QR" component={GuideQR} />
  </Stack.Navigator>
);

export default MainStack;
