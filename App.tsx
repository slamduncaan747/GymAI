// App.tsx

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {WorkoutProvider} from './context/WorkoutContext';
import HomeScreen from './screens/HomeScreen';
import WorkoutSelectScreen from './screens/WorkoutSelectScreen';
import WorkoutPreviewScreen from './screens/WorkoutPreviewScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import SettingsScreen from './screens/SettingsScreen';
import ExercisePreviewScreen from './components/workout/ExercisePreviewScreen';
import {WorkoutExercise} from './types/workout';

export type RootStackParamList = {
  Home: undefined;
  WorkoutSelect: undefined;
  WorkoutPreview: {
    duration: number;
    focusAreas?: string[];
    useAI?: boolean;
  };
  Workout: {
    duration: number;
    focusAreas?: string[];
    useAI?: boolean;
    exercises?: WorkoutExercise[];
    preGenerated?: boolean;
  };
  ExercisePreview: {
    exerciseName: string;
    exerciseId: string;
  };
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <WorkoutProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="WorkoutSelect" component={WorkoutSelectScreen} />
          <Stack.Screen
            name="WorkoutPreview"
            component={WorkoutPreviewScreen}
          />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen
            name="ExercisePreview"
            component={ExercisePreviewScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WorkoutProvider>
  );
}
