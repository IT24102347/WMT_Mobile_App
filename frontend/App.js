import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/LoginScreen';
import DashboardScreen from './src/DashboardScreen';
import AdminDashboardScreen from './src/AdminDashboardScreen';
import RegisterScreen from './src/RegisterScreen';
import StudentManagementScreen from './src/StudentManagementScreen';
import MyProfileScreen from './src/MyProfileScreen';
import AdminRoomScreen from './src/Adminroomscreen';
import StudentRoomsScreen from './src/StudentRoomsScreen';
import AdminBookingScreen from './src/AdminBookingScreen';
import AdminPaymentScreen from './src/AdminPaymentScreen';
import StudentPaymentScreen from './src/StudentPaymentScreen';
import StudentComplaintScreen from './src/StudentComplaintScreen';
import AdminComplaintScreen from './src/AdminComplaintScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StudentManagement" component={StudentManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyProfile" component={MyProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminRooms" component={AdminRoomScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StudentRooms" component={StudentRoomsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminBookings" component={AdminBookingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminPayments" component={AdminPaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StudentPayments" component={StudentPaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StudentComplaints" component={StudentComplaintScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminComplaints" component={AdminComplaintScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}