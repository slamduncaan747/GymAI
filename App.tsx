// App.tsx

import React from 'react';
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
import ExercisePreviewScreen from './components/workout/ExercisePreviewScreen';
import {WorkoutExercise, Workout} from './types/workout';
import {colors} from './themes/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import {View, StyleSheet} from 'react-native';

// Ensure icon font is loaded
Icon.loadFont();

export type RootStackParamList = {
  MainTabs: undefined;
  WorkoutSelect: undefined;
  WorkoutPreview: {
    duration: number;
    focusAreas?: string[];
  };
  Workout: {
    duration: number;
    focusAreas?: string[];
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
  Progress: undefined;
  Workout: undefined;
  History: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Workout"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}>
      <Tab.Screen
        name="Progress"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <View style={styles.tabIconContainer}>
              <Icon
                name={focused ? 'trending-up' : 'trending-up-outline'}
                size={24}
                color={color}
              />
              {focused && (
                <View
                  style={[styles.activeIndicator, {backgroundColor: color}]}
                />
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutSelectScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <View style={styles.tabIconContainer}>
              <View
                style={[
                  styles.centerTabButton,
                  focused && styles.centerTabButtonActive,
                ]}>
                <Icon
                  name="add"
                  size={28}
                  color={focused ? colors.buttonText : colors.textPrimary}
                />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <View style={styles.tabIconContainer}>
              <Icon
                name={focused ? 'time' : 'time-outline'}
                size={24}
                color={color}
              />
              {focused && (
                <View
                  style={[styles.activeIndicator, {backgroundColor: color}]}
                />
              )}
            </View>
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
            cardStyleInterpolator: ({current: {progress}}) => ({
              cardStyle: {
                opacity: progress,
              },
            }),
          }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="WorkoutSelect" component={WorkoutSelectScreen} />
          <Stack.Screen
            name="WorkoutPreview"
            component={WorkoutPreviewScreen}
          />
          <Stack.Screen
            name="Workout"
            component={WorkoutScreen}
            options={{gestureEnabled: false}}
          />
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

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -12,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  centerTabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  centerTabButtonActive: {
    backgroundColor: colors.primary,
  },
});
