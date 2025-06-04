// App.tsx

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {WorkoutProvider} from './context/WorkoutContext';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import WorkoutSelectScreen from './screens/WorkoutSelectScreen';
import WorkoutPreviewScreen from './screens/WorkoutPreviewScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import WorkoutSummaryScreen from './screens/WorkoutSummaryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ExercisePreviewScreen from './components/workout/ExercisePreviewScreen';
import {WorkoutExercise, Workout} from './types/workout';
import {colors} from './themes/colors';
import Icon from 'react-native-vector-icons/Ionicons';

// Ensure icon font is loaded
Icon.loadFont();

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
  Settings: undefined;
};

export type TabParamList = {
  WorkoutTab: undefined;
  Progress: undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="WorkoutTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 88,
        },
        tabBarActiveTintColor: colors.tabIconActive,
        tabBarInactiveTintColor: colors.tabIconInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="WorkoutTab"
        component={WorkoutSelectScreen}
        options={{
          tabBarLabel: 'Workout',
          tabBarIcon: ({color, size}) => (
            <Icon name="barbell" size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="trending-up" size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar" size={26} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="person" size={26} color={color} />
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
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </WorkoutProvider>
  );
}
