// App.tsx

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {WorkoutProvider} from './context/WorkoutContext';
import HomeScreen from './screens/HomeScreen';
import WorkoutSelectScreen from './screens/WorkoutSelectScreen';
import WorkoutPreviewScreen from './screens/WorkoutPreviewScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import WorkoutSummaryScreen from './screens/WorkoutSummaryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ExercisePreviewScreen from './components/workout/ExercisePreviewScreen';
import {WorkoutExercise, Workout} from './types/workout';
import {colors} from './themes/colors';
import {Text} from 'react-native';

export type RootStackParamList = {
  MainTabs: undefined;
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
  WorkoutSummary: {
    workout: Workout;
  };
  ExercisePreview: {
    exerciseName: string;
    exerciseId: string;
  };
};

export type TabParamList = {
  Home: undefined;
  Workouts: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function WorkoutsScreen() {
  return <WorkoutSelectScreen />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>💪</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>📊</Text>
          ),
          tabBarLabel: 'Progress',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <WorkoutProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="WorkoutSelect" component={WorkoutSelectScreen} />
          <Stack.Screen
            name="WorkoutPreview"
            component={WorkoutPreviewScreen}
          />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
          <Stack.Screen
            name="WorkoutSummary"
            component={WorkoutSummaryScreen}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="ExercisePreview"
            component={ExercisePreviewScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WorkoutProvider>
  );
}
