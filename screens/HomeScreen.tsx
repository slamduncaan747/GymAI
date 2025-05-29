// screens/HomeScreen.tsx

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {useWorkout} from '../context/WorkoutContext';
import RecentWorkouts from '../components/home/RecentWorkouts';
import PerformanceOverview from '../components/home/PerformanceOverview';
import {colors} from '../themes/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const {width} = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {loadSavedWorkouts, savedWorkouts} = useWorkout();
  const [userName, setUserName] = useState('Champion');
  const [quickStartOptions] = useState([
    {id: '15', duration: 15, title: 'Quick Hit', icon: '⚡'},
    {id: '30', duration: 30, title: 'Power 30', icon: '💪'},
    {id: '45', duration: 45, title: 'Focused', icon: '🎯'},
    {id: '60', duration: 60, title: 'Full Hour', icon: '🔥'},
  ]);

  useEffect(() => {
    loadSavedWorkouts();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutSelect');
  };

  const handleQuickStart = (duration: number) => {
    navigation.navigate('WorkoutPreview', {
      duration,
      useAI: false, // Quick workouts use standard generation
    });
  };

  const getMotivationalMessage = () => {
    const messages = [
      'Ready to crush your workout?',
      'Time to unleash your potential!',
      "Let's make today count!",
      'Your future self will thank you!',
      'Progress starts now!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getTotalWorkouts = () => savedWorkouts.length;
  const getStreak = () => {
    // Simple streak calculation - consecutive days
    if (savedWorkouts.length === 0) return 0;

    let streak = 1;
    const sortedWorkouts = [...savedWorkouts].sort(
      (a, b) => b.timestamp - a.timestamp,
    );

    for (let i = 0; i < sortedWorkouts.length - 1; i++) {
      const dayDiff = Math.floor(
        (sortedWorkouts[i].timestamp - sortedWorkouts[i + 1].timestamp) /
          (1000 * 60 * 60 * 24),
      );
      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome back, {userName}!</Text>
              <Text style={styles.subtitleText}>
                {getMotivationalMessage()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Settings' as any)}>
              <Text style={styles.profileIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{getTotalWorkouts()}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={[styles.statCard, styles.statCardMiddle]}>
              <Text style={styles.statNumber}>{getStreak()}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>💪</Text>
              <Text style={styles.statLabel}>Feeling Strong</Text>
            </View>
          </View>
        </View>

        {/* Main CTA Button */}
        <TouchableOpacity
          style={styles.mainCTAButton}
          onPress={handleStartWorkout}
          activeOpacity={0.9}>
          <View style={styles.ctaGradient}>
            <Text style={styles.ctaText}>START AI WORKOUT</Text>
            <Text style={styles.ctaSubtext}>Personalized for you</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Start Options */}
        <View style={styles.quickStartSection}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickStartGrid}>
            {quickStartOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={styles.quickStartCard}
                onPress={() => handleQuickStart(option.duration)}
                activeOpacity={0.8}>
                <Text style={styles.quickStartIcon}>{option.icon}</Text>
                <Text style={styles.quickStartTitle}>{option.title}</Text>
                <Text style={styles.quickStartDuration}>
                  {option.duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Performance & Recent Workouts */}
        <PerformanceOverview />
        <RecentWorkouts />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: colors.cardBackground,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statCardMiddle: {
    marginHorizontal: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  mainCTAButton: {
    marginHorizontal: 20,
    marginTop: -10,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaGradient: {
    backgroundColor: colors.accent,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.buttonText,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  ctaSubtext: {
    color: colors.buttonText,
    fontSize: 14,
    opacity: 0.9,
  },
  quickStartSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  quickStartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickStartCard: {
    width: (width - 50) / 2,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickStartIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickStartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  quickStartDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
