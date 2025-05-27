import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {WorkoutProvider} from './context/WorkoutContext';
import HomeScreen from './screens/HomeScreen';
import WorkoutSelectScreen from './screens/WorkoutSelectScreen';
import WorkoutScreen from './screens/WorkoutScreen';

export type RootStackParamList = {
  Home: undefined;
  WorkoutSelect: undefined;
  Workout: {duration: number};
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <WorkoutProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false, // Disable the default stack header
          }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="WorkoutSelect" component={WorkoutSelectScreen} />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </WorkoutProvider>
  );
}
