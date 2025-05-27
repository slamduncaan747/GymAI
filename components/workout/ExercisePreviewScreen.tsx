import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';
import {colors} from '../../themes/colors';
import {VictoryChart, VictoryLine} from 'victory-native';

type ExercisePreviewScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ExercisePreview'
>;
type ExercisePreviewScreenRouteProp = RouteProp<
  RootStackParamList,
  'ExercisePreview'
>;

interface HistoryEntry {
  date: string;
  sets: Array<{
    weight: number;
    reps: number;
    volume: number;
  }>;
  bestSet: {
    weight: number;
    reps: number;
    volume: number;
  };
  totalVolume: number;
}

interface ProgressData {
  date: string;
  maxWeight: number;
  totalVolume: number;
  bestSet: number;
}

export default function ExercisePreviewScreen() {
  const navigation = useNavigation<ExercisePreviewScreenNavigationProp>();
  const route = useRoute<ExercisePreviewScreenRouteProp>();
  const {exerciseName, exerciseId} = route.params;

  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'progress'>(
    'info',
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    generateFakeData();
  }, []);

  const generateFakeData = () => {
    // Generate fake history data
    const historyData: HistoryEntry[] = [];
    const progressData: ProgressData[] = [];

    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 3);
      const dateStr = date.toLocaleDateString();

      const numSets = Math.floor(Math.random() * 3) + 2; // 2-4 sets
      const sets = [];
      let totalVolume = 0;
      let maxWeight = 0;
      let bestVolume = 0;

      for (let j = 0; j < numSets; j++) {
        const weight = Math.floor(Math.random() * 50) + 100 + i * 2; // Progressive weight
        const reps = Math.floor(Math.random() * 5) + 6; // 6-10 reps
        const volume = weight * reps;

        sets.push({weight, reps, volume});
        totalVolume += volume;
        maxWeight = Math.max(maxWeight, weight);
        bestVolume = Math.max(bestVolume, volume);
      }

      const bestSet = sets.find(s => s.volume === bestVolume) || sets[0];

      historyData.push({
        date: dateStr,
        sets,
        bestSet,
        totalVolume,
      });

      progressData.push({
        date: dateStr,
        maxWeight,
        totalVolume,
        bestSet: bestVolume,
      });
    }

    setHistory(historyData.reverse());
    setProgressData(progressData.reverse());
  };

  const getExerciseInfo = () => {
    // Mock exercise information
    return {
      category: 'Chest',
      equipment: 'Barbell',
      muscles: ['Pectorals', 'Anterior Deltoids', 'Triceps'],
      description:
        "A compound upper body exercise that primarily targets the chest muscles. Lie on a bench and press the barbell from chest level to arm's length.",
      instructions: [
        'Lie flat on a bench with your feet on the floor',
        'Grip the barbell with hands slightly wider than shoulder-width',
        'Lower the bar to your chest with control',
        'Press the bar back up to the starting position',
        'Keep your core engaged throughout the movement',
      ],
    };
  };

  const exerciseInfo = getExerciseInfo();

  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Exercise Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Category:</Text>
          <Text style={styles.infoValue}>{exerciseInfo.category}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Equipment:</Text>
          <Text style={styles.infoValue}>{exerciseInfo.equipment}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Primary Muscles:</Text>
          <Text style={styles.infoValue}>
            {exerciseInfo.muscles.join(', ')}
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{exerciseInfo.description}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {exerciseInfo.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionRow}>
            <Text style={styles.instructionNumber}>{index + 1}.</Text>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      {history.map((entry, index) => (
        <View key={index} style={styles.historyEntry}>
          <Text style={styles.historyDate}>{entry.date}</Text>
          <View style={styles.historyStats}>
            <Text style={styles.historyStat}>
              Best Set: {entry.bestSet.weight}lbs × {entry.bestSet.reps}
            </Text>
            <Text style={styles.historyStat}>
              Volume: {entry.totalVolume.toLocaleString()}lbs
            </Text>
          </View>
          <View style={styles.setsContainer}>
            {entry.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <Text style={styles.setNumber}>{setIndex + 1}</Text>
                <Text style={styles.setData}>
                  {set.weight}lbs × {set.reps}
                </Text>
                <Text style={styles.setVolume}>{set.volume}lbs</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderProgressTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.max(...progressData.map(p => p.maxWeight))}lbs
          </Text>
          <Text style={styles.statLabel}>Max Weight</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.max(...progressData.map(p => p.totalVolume)).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Best Volume</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{history.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Weight Progress</Text>
      <View style={styles.chartContainer}>
        <Text style={styles.chartPlaceholder}>
          📈 Progress Chart
          {'\n'}Max Weight Over Time
          {'\n\n'}
          {progressData
            .slice(-5)
            .map((data, index) => `${data.date}: ${data.maxWeight}lbs\n`)
            .join('')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {exerciseName}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'info' && styles.activeTabText,
            ]}>
            Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.activeTabText,
            ]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'progress' && styles.activeTabText,
            ]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'progress' && renderProgressTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.accent,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    width: 120,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    width: 24,
  },
  instructionText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  historyEntry: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyStat: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  setsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 24,
  },
  setData: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  setVolume: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
