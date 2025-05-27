import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import {useWorkout} from '../context/WorkoutContext';
import RecentWorkouts from '../components/home/RecentWorkouts';
import PerformanceOverview from '../components/home/PerformanceOverview';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const {width} = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {loadSavedWorkouts} = useWorkout();

  useEffect(() => {
    loadSavedWorkouts();
  }, []);

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutSelect');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, Alex!</Text>
          <Text style={styles.subtitleText}>Ready to crush your workout?</Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>START WORKOUT</Text>
          <View style={styles.buttonGlow} />
        </TouchableOpacity>

        <PerformanceOverview />
        <RecentWorkouts />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitleText: {
    fontSize: 16,
    color: '#aaa',
  },
  startButton: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowColor: '#00f0ff',
    elevation: 8,
  },
  startButtonText: {
    color: '#00f0ff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00f0ff',
    opacity: 0.3,
  },
});
