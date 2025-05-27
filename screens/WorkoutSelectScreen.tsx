import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';

type WorkoutSelectNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WorkoutSelect'
>;

const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export default function WorkoutSelectScreen() {
  const navigation = useNavigation<WorkoutSelectNavigationProp>();

  const handleDurationSelect = (duration: number) => {
    navigation.navigate('Workout', {duration});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How long do you want to workout?</Text>
        <Text style={styles.subtitle}>Select your available time</Text>

        <View style={styles.optionsContainer}>
          {DURATION_OPTIONS.map(duration => (
            <TouchableOpacity
              key={duration}
              style={styles.durationCard}
              onPress={() => handleDurationSelect(duration)}>
              <Text style={styles.durationNumber}>{duration}</Text>
              <Text style={styles.durationLabel}>minutes</Text>
              <View style={styles.cardGlow} />
            </TouchableOpacity>
          ))}
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  durationCard: {
    width: '45%',
    backgroundColor: '#2c2c2e',
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowColor: '#000',
    elevation: 8,
  },
  durationNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00f0ff',
    marginBottom: 4,
  },
  durationLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00f0ff',
    opacity: 0.1,
  },
});
