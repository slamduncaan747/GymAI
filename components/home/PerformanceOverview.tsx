import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useWorkout} from '../../context/WorkoutContext';

export default function PerformanceOverview() {
  const {savedWorkouts} = useWorkout();

  const getPersonalRecords = () => {
    const prs: {[key: string]: {weight: number; reps: number}} = {};

    savedWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.actual > 0 && set.weight > 0) {
            const key = exercise.name;
            if (!prs[key] || set.weight > prs[key].weight) {
              prs[key] = {weight: set.weight, reps: set.actual};
            }
          }
        });
      });
    });

    return Object.entries(prs).slice(0, 3);
  };

  const personalRecords = getPersonalRecords();

  if (personalRecords.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Performance Overview</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No records yet</Text>
          <Text style={styles.emptySubtext}>
            Complete workouts to track your progress
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Records</Text>
      <View style={styles.recordsContainer}>
        {personalRecords.map(([exercise, record]) => (
          <View key={exercise} style={styles.recordCard}>
            <Text style={styles.exerciseName}>{exercise}</Text>
            <Text style={styles.recordValue}>
              {record.weight}lbs × {record.reps}
            </Text>
            <View style={styles.cardGlow} />
          </View>
        ))}
      </View>
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#000',
    elevation: 4,
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
  recordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recordCard: {
    width: '30%',
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: '#000',
    elevation: 4,
  },
  exerciseName: {
    color: '#00f0ff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  recordValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00f0ff',
    opacity: 0.1,
  },
});
