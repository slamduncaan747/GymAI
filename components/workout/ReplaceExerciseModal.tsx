// components/workout/ReplaceExerciseModal.tsx

import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Platform,
  ActivityIndicator,
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
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSelectedCategory('all');
      setIsLoading(false);
    }
  }, [visible]);

  // Get all exercises and filter
  const allExercises = useMemo(() => {
    try {
      const exercises = exerciseService.getAllExercises();
      console.log(
        'ReplaceExerciseModal - Total exercises from service:',
        exercises.length,
      );

      // Make sure we have valid exercises
      if (!exercises || exercises.length === 0) {
        console.error(
          'No exercises returned from exerciseService.getAllExercises()',
        );
        return [];
      }

      // Filter out current exercise if we have an ID
      if (currentExerciseId) {
        return exercises.filter(ex => ex.id !== currentExerciseId);
      }
      return exercises;
    } catch (error) {
      console.error('Error getting exercises:', error);
      return [];
    }
  }, [currentExerciseId]);

  // Get related exercises if we have a current exercise
  const relatedExercises = useMemo(() => {
    if (!currentExerciseId) return [];
    try {
      return exerciseService.getRelatedExercises(currentExerciseId, 10);
    } catch (error) {
      console.error('Error getting related exercises:', error);
      return [];
    }
  }, [currentExerciseId]);

  // Filter exercises based on search and category
  const filteredExercises = useMemo(() => {
    let exercises = allExercises;

    // Apply category filter
    if (selectedCategory !== 'all') {
      exercises = exercises.filter(ex => ex.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      exercises = exercises.filter(
        ex =>
          ex.name.toLowerCase().includes(query) ||
          ex.muscleGroups.primary.some(mg =>
            mg.toLowerCase().includes(query),
          ) ||
          ex.equipment.toLowerCase().includes(query),
      );
    }

    return exercises;
  }, [searchQuery, selectedCategory, allExercises]);

  // Determine which exercises to show
  const exercisesToShow = useMemo(() => {
    // If searching or filtering by category, show filtered results
    if (searchQuery.trim() || selectedCategory !== 'all') {
      return filteredExercises;
    }

    // Otherwise, show related exercises first if available
    if (relatedExercises.length > 0) {
      const relatedIds = new Set(relatedExercises.map(ex => ex.id));
      const otherExercises = filteredExercises.filter(
        ex => !relatedIds.has(ex.id),
      );
      return [...relatedExercises, ...otherExercises];
    }

    return filteredExercises;
  }, [searchQuery, selectedCategory, filteredExercises, relatedExercises]);

  const handleSelectExercise = (exercise: Exercise) => {
    try {
      const workoutExercise = exerciseService.toWorkoutExercise(exercise);
      onReplace(workoutExercise);
      onClose();
    } catch (error) {
      console.error('Error selecting exercise:', error);
    }
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
      onPress={() => handleSelectExercise(item)}
      activeOpacity={0.7}>
      <View style={styles.exerciseContent}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseDetails}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)} •{' '}
          {item.equipment.replace('_', ' ')} • {item.difficulty}
        </Text>
        <Text style={styles.exerciseMuscles}>
          {item.muscleGroups.primary.map(mg => mg.replace('_', ' ')).join(', ')}
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
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => `category-${item}`}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}>
                {item === 'all'
                  ? 'All'
                  : item === 'full_body'
                  ? 'Full Body'
                  : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Related Exercises Section */}
      {!searchQuery &&
        selectedCategory === 'all' &&
        relatedExercises.length > 0 &&
        currentExerciseId && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Similar Exercises</Text>
          </View>
        )}
    </View>
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {currentExerciseId ? 'Replace Exercise' : 'Add Exercise'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Move Search Bar Here */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : (
            <FlatList
              data={exercisesToShow}
              renderItem={renderExercise}
              keyExtractor={(item, index) => `exercise-${item.id}-${index}`}
              ListHeaderComponent={() => (
                <View>
                  {/* Category Filter */}
                  <View style={styles.categoryContainer}>
                    <FlatList
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      data={categories}
                      keyExtractor={item => `category-${item}`}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={[
                            styles.categoryChip,
                            selectedCategory === item &&
                              styles.categoryChipActive,
                          ]}
                          onPress={() => setSelectedCategory(item)}
                          activeOpacity={0.7}>
                          <Text
                            style={[
                              styles.categoryText,
                              selectedCategory === item &&
                                styles.categoryTextActive,
                            ]}>
                            {item === 'all'
                              ? 'All'
                              : item === 'full_body'
                              ? 'Full Body'
                              : item.charAt(0).toUpperCase() + item.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>

                  {/* Related Exercises Section */}
                  {!searchQuery &&
                    selectedCategory === 'all' &&
                    relatedExercises.length > 0 &&
                    currentExerciseId && (
                      <View style={styles.relatedSection}>
                        <Text style={styles.sectionTitle}>
                          Similar Exercises
                        </Text>
                      </View>
                    )}
                </View>
              )}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={10}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? 'No exercises found matching your search'
                      : 'No exercises available'}
                  </Text>
                </View>
              }
            />
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 16,
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
