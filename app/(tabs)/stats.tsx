import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Calendar, Clock, Target, TrendingUp, Award, Flame } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MOCK_STATS = {
  todayFocus: 120,
  weeklyFocus: 840,
  totalSessions: 156,
  streakDays: 7,
  longestStreak: 23,
  productivity: 87,
  weeklyData: [
    { day: 'Mon', sessions: 6, minutes: 150 },
    { day: 'Tue', sessions: 8, minutes: 200 },
    { day: 'Wed', sessions: 4, minutes: 100 },
    { day: 'Thu', sessions: 10, minutes: 250 },
    { day: 'Fri', sessions: 6, minutes: 150 },
    { day: 'Sat', sessions: 3, minutes: 75 },
    { day: 'Sun', sessions: 5, minutes: 125 },
  ],
  achievements: [
    { id: 1, title: 'First Step', description: 'Completed your first session', unlocked: true },
    { id: 2, title: 'Dedicated', description: 'Completed 7 days in a row', unlocked: true },
    { id: 3, title: 'Focused Mind', description: 'Completed 100 sessions', unlocked: true },
    { id: 4, title: 'Master of Time', description: 'Completed 500 sessions', unlocked: false },
  ],
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const cardAnimations = Array.from({ length: 6 }, () => useSharedValue(0));
  const chartAnimation = useSharedValue(0);

  useEffect(() => {
    // Stagger card animations
    cardAnimations.forEach((animation, index) => {
      animation.value = withDelay(index * 100, withSpring(1));
    });
    
    chartAnimation.value = withDelay(600, withSpring(1));
  }, []);

  const createCardStyle = (index: number) => useAnimatedStyle(() => ({
    opacity: cardAnimations[index]?.value || 0,
    transform: [
      { translateY: (1 - (cardAnimations[index]?.value || 0)) * 50 },
      { scale: 0.8 + (cardAnimations[index]?.value || 0) * 0.2 },
    ],
  }));

  const chartStyle = useAnimatedStyle(() => ({
    opacity: chartAnimation.value,
    transform: [{ translateY: (1 - chartAnimation.value) * 30 }],
  }));

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const maxMinutes = Math.max(...MOCK_STATS.weeklyData.map(d => d.minutes));

  return (
    <LinearGradient
      colors={['#0F0F23', '#1A1A2E', '#16213E']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom + 100, 120) }]}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your focus journey</Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <Animated.View style={[styles.statCard, createCardStyle(0)]}>
              <BlurView intensity={20} style={styles.cardBlur}>
                <View style={styles.cardContent}>
                  <View style={styles.statIcon}>
                    <Clock size={24} color="#8B5CF6" strokeWidth={2} />
                  </View>
                  <Text style={styles.statValue}>{formatTime(MOCK_STATS.todayFocus)}</Text>
                  <Text style={styles.statLabel}>Today</Text>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View style={[styles.statCard, createCardStyle(1)]}>
              <BlurView intensity={20} style={styles.cardBlur}>
                <View style={styles.cardContent}>
                  <View style={styles.statIcon}>
                    <Calendar size={24} color="#3B82F6" strokeWidth={2} />
                  </View>
                  <Text style={styles.statValue}>{formatTime(MOCK_STATS.weeklyFocus)}</Text>
                  <Text style={styles.statLabel}>This Week</Text>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View style={[styles.statCard, createCardStyle(2)]}>
              <BlurView intensity={20} style={styles.cardBlur}>
                <View style={styles.cardContent}>
                  <View style={styles.statIcon}>
                    <Target size={24} color="#10B981" strokeWidth={2} />
                  </View>
                  <Text style={styles.statValue}>{MOCK_STATS.totalSessions}</Text>
                  <Text style={styles.statLabel}>Total Sessions</Text>
                </View>
              </BlurView>
            </Animated.View>

            <Animated.View style={[styles.statCard, createCardStyle(3)]}>
              <BlurView intensity={20} style={styles.cardBlur}>
                <View style={styles.cardContent}>
                  <View style={styles.statIcon}>
                    <Flame size={24} color="#F59E0B" strokeWidth={2} />
                  </View>
                  <Text style={styles.statValue}>{MOCK_STATS.streakDays}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </BlurView>
            </Animated.View>
          </View>

          {/* Weekly Chart */}
          <Animated.View style={[styles.chartContainer, chartStyle]}>
            <BlurView intensity={20} style={styles.chartBlur}>
              <View style={styles.chartContent}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>Weekly Activity</Text>
                  <TrendingUp size={20} color="#8B5CF6" strokeWidth={2} />
                </View>
                
                <View style={styles.chart}>
                  {MOCK_STATS.weeklyData.map((day, index) => (
                    <View key={day.day} style={styles.chartBar}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: (day.minutes / maxMinutes) * 120,
                            backgroundColor: day.minutes > 150 ? '#8B5CF6' : '#3B82F6',
                          },
                        ]}
                      />
                      <Text style={styles.barLabel}>{day.day}</Text>
                      <Text style={styles.barValue}>{day.sessions}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* Productivity Score */}
          <Animated.View style={[styles.productivityCard, createCardStyle(4)]}>
            <BlurView intensity={20} style={styles.cardBlur}>
              <View style={styles.cardContent}>
                <View style={styles.productivityHeader}>
                  <Text style={styles.productivityTitle}>Productivity Score</Text>
                  <Text style={styles.productivityScore}>{MOCK_STATS.productivity}%</Text>
                </View>
                <View style={styles.productivityBar}>
                  <View
                    style={[
                      styles.productivityFill,
                      { width: `${MOCK_STATS.productivity}%` },
                    ]}
                  />
                </View>
                <Text style={styles.productivityDescription}>
                  Based on session completion and consistency
                </Text>
              </View>
            </BlurView>
          </Animated.View>

          {/* Achievements */}
          <Animated.View style={[styles.achievementsContainer, createCardStyle(5)]}>
            <BlurView intensity={20} style={styles.cardBlur}>
              <View style={styles.cardContent}>
                <View style={styles.achievementsHeader}>
                  <Text style={styles.achievementsTitle}>Achievements</Text>
                  <Award size={20} color="#F59E0B" strokeWidth={2} />
                </View>
                
                <View style={styles.achievements}>
                  {MOCK_STATS.achievements.map((achievement) => (
                    <View key={achievement.id} style={styles.achievement}>
                      <View style={[
                        styles.achievementIcon,
                        !achievement.unlocked && styles.achievementIconLocked
                      ]}>
                        <Award
                          size={16}
                          color={achievement.unlocked ? '#F59E0B' : '#64748B'}
                          strokeWidth={2}
                        />
                      </View>
                      <View style={styles.achievementContent}>
                        <Text style={[
                          styles.achievementTitle,
                          !achievement.unlocked && styles.achievementTitleLocked
                        ]}>
                          {achievement.title}
                        </Text>
                        <Text style={styles.achievementDescription}>
                          {achievement.description}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardBlur: {
    flex: 1,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  chartContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  chartBlur: {
    flex: 1,
  },
  chartContent: {
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 32,
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  productivityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  productivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productivityTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  productivityScore: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#8B5CF6',
  },
  productivityBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  productivityFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  productivityDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  achievementsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  achievements: {
    gap: 16,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconLocked: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  achievementTitleLocked: {
    color: '#64748B',
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
});