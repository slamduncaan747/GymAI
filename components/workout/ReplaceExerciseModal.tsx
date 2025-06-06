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
import {colors, typography, spacing} from '../../themes';
import Icon from 'react-native-vector-icons/Ionicons';

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

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSelectedCategory('all');
      setIsLoading(false);
    }
  }, [visible]);

  const allExercises = useMemo(() => {
    try {
      const exercises = exerciseService.getAllExercises();
      if (!exercises || exercises.length === 0) {
        return [];
      }
      if (currentExerciseId) {
        return exercises.filter(ex => ex.id !== currentExerciseId);
      }
      return exercises;
    } catch (error) {
      console.error('Error getting exercises:', error);
      return [];
    }
  }, [currentExerciseId]);

  const relatedExercises = useMemo(() => {
    if (!currentExerciseId) return [];
    try {
      return exerciseService.getRelatedExercises(currentExerciseId, 10);
    } catch (error) {
      console.error('Error getting related exercises:', error);
      return [];
    }
  }, [currentExerciseId]);

  const filteredExercises = useMemo(() => {
    let exercises = allExercises;

    if (selectedCategory !== 'all') {
      exercises = exercises.filter(ex => ex.category === selectedCategory);
    }

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

  const exercisesToShow = useMemo(() => {
    if (searchQuery.trim() || selectedCategory !== 'all') {
      return filteredExercises;
    }

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
        <View style={styles.exerciseTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {item.equipment.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.exerciseMuscles}>
          {item.muscleGroups.primary.map(mg => mg.replace('_', ' ')).join(', ')}
        </Text>
      </View>
      <View style={styles.exerciseStats}>
        <Text style={styles.statText}>
          {item.defaultSets} × {item.defaultReps}
        </Text>
        <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {currentExerciseId ? 'Replace Exercise' : 'Add Exercise'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={exercisesToShow}
              renderItem={renderExercise}
              keyExtractor={(item, index) => `exercise-${item.id}-${index}`}
              ListHeaderComponent={() => (
                <View>
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
                  <Icon name="search" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? 'No exercises found matching your search'
                      : 'No exercises available'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes.headline,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.xs,
    margin: -spacing.xs,
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.body,
    color: colors.textPrimary,
  },
  categoryContainer: {
    paddingVertical: spacing.sm,
    paddingLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  categoryTextActive: {
    color: colors.buttonText,
  },
  relatedSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.sizes.bodyLarge,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  exerciseTags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: typography.sizes.caption,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  exerciseMuscles: {
    fontSize: typography.sizes.caption,
    color: colors.textTertiary,
    textTransform: 'capitalize',
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statText: {
    fontSize: typography.sizes.body,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default ReplaceExerciseModal;
