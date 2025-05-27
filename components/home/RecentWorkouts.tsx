import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useWorkout} from '../../context/WorkoutContext';

export default function RecentWorkouts() {
  const {savedWorkouts} = useWorkout();
  const recentWorkouts = savedWorkouts.slice(0, 5);

  if (recentWorkouts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Recent Workouts</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No workouts yet</Text>
          <Text style={styles.emptySubtext}>
            Complete your first workout to see it here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Workouts</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recentWorkouts.map(workout => (
          <View key={workout.id} style={styles.workoutCard}>
            <Text style={styles.workoutDate}>
              {new Date(workout.timestamp).toLocaleDateString()}
            </Text>
            <Text style={styles.workoutDuration}>{workout.duration} min</Text>
            <Text style={styles.exerciseCount}>
              {workout.exercises.length} exercises
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
  workoutCard: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#000',
    elevation: 4,
  },
  workoutDate: {
    color: '#00f0ff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutDuration: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  exerciseCount: {
    color: '#aaa',
    fontSize: 12,
  },
});
