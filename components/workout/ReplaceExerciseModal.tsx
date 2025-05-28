// components/workout/ReplaceExerciseModal.tsx

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import {WorkoutExercise, Exercise} from '../../types/workout';
import {exerciseService} from '../../service/exerciseService';
import {colors} from '../../themes/colors';

interface ReplaceExerciseModalProps {
  visible: boolean;
  onClose: () => void;
  onReplace: (exercise: WorkoutExercise) => void;
  currentExerciseId: string;
}

const ReplaceExerciseModal: React.FC<ReplaceExerciseModalProps> = ({
  visible,
  onClose,
  onReplace,
  currentExerciseId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    Exercise['category'] | 'all'
  >('all');

  // Get related exercises and all exercises
  const relatedExercises = useMemo(
    () => exerciseService.getRelatedExercises(currentExerciseId, 10),
    [currentExerciseId],
  );

  const allExercises = useMemo(
    () =>
      exerciseService
        .getAllExercises()
        .filter(ex => ex.id !== currentExerciseId),
    [currentExerciseId],
  );

  // Filter exercises based on search and category
  const filteredExercises = useMemo(() => {
    let exercises =
      selectedCategory === 'all'
        ? allExercises
        : allExercises.filter(ex => ex.category === selectedCategory);

    if (searchQuery) {
      exercises = exerciseService
        .searchExercises(searchQuery)
        .filter(ex => ex.id !== currentExerciseId);
    }

    return exercises;
  }, [searchQuery, selectedCategory, allExercises, currentExerciseId]);

  const handleSelectExercise = (exercise: Exercise) => {
    const workoutExercise = exerciseService.toWorkoutExercise(exercise);
    onReplace(workoutExercise);
  };

  const categories: (Exercise['category'] | 'all')[] = [
    'all',
    'chest',
    'back',
    'shoulders',
    'legs',
    'arms',
    'core',
    'full_body',
  ];

  const renderExercise = ({item}: {item: Exercise}) => (
    <TouchableOpacity
      style={styles.exerciseItem}
      onPress={() => handleSelectExercise(item)}>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDetails}>
          {item.category} • {item.equipment} • {item.difficulty}
        </Text>
        <Text style={styles.exerciseMuscles}>
          {item.muscleGroups.primary.join(', ')}
        </Text>
      </View>
      <View style={styles.exerciseStats}>
        <Text style={styles.statText}>
          {item.defaultSets} × {item.defaultReps}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}>
                {item === 'all'
                  ? 'All'
                  : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Related Exercises Section */}
      {!searchQuery &&
        selectedCategory === 'all' &&
        relatedExercises.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Similar Exercises</Text>
          </View>
        )}
    </View>
  );

  const exercisesToShow =
    !searchQuery && selectedCategory === 'all' && relatedExercises.length > 0
      ? [
          ...relatedExercises,
          ...filteredExercises.filter(
            ex => !relatedExercises.find(rel => rel.id === ex.id),
          ),
        ]
      : filteredExercises;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Replace Exercise</Text>
          </View>

          <FlatList
            data={exercisesToShow}
            renderItem={renderExercise}
            keyExtractor={item => item.id}
            ListHeaderComponent={renderHeader}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  categoryContainer: {
    paddingVertical: 12,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.buttonText,
  },
  relatedSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  exerciseMuscles: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  exerciseStats: {
    marginLeft: 12,
  },
  statText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.inputBackground,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
  },
});

export default ReplaceExerciseModal;
