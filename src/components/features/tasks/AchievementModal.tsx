import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';

interface AchievementModalProps {
  visible: boolean;
  onClose: () => void;
  taskStats: {
    total: number;
    completed: number;
    todayCompleted: number;
    todayTotal: number;
    completionRate: number;
    todayCompletionRate: number;
    totalCompletionTime: number;
    averageSatisfaction: number;
    recurring: number;
  };
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  onClose,
  taskStats,
}) => {
  const getAchievementLevel = () => {
    if (taskStats.completionRate >= 90) return { level: 'Master', icon: '👑', color: '#fbbf24' };
    if (taskStats.completionRate >= 80) return { level: 'Expert', icon: '🏆', color: '#f59e0b' };
    if (taskStats.completionRate >= 70) return { level: 'Pro', icon: '⭐', color: '#10b981' };
    if (taskStats.completionRate >= 50) return { level: 'Intermediate', icon: '🎯', color: '#6366f1' };
    return { level: 'Beginner', icon: '🌱', color: '#6b7280' };
  };

  const achievement = getAchievementLevel();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getBadges = () => {
    const badges = [];
    
    if (taskStats.completed >= 10) badges.push({ icon: '🎖️', title: 'Task Warrior', desc: 'Completed 10+ tasks' });
    if (taskStats.completed >= 50) badges.push({ icon: '🏅', title: 'Productivity Hero', desc: 'Completed 50+ tasks' });
    if (taskStats.completed >= 100) badges.push({ icon: '🏆', title: 'Task Master', desc: 'Completed 100+ tasks' });
    
    if (taskStats.completionRate >= 80) badges.push({ icon: '🎯', title: 'Consistent Performer', desc: '80%+ completion rate' });
    if (taskStats.completionRate >= 95) badges.push({ icon: '💎', title: 'Perfectionist', desc: '95%+ completion rate' });
    
    if (taskStats.totalCompletionTime >= 600) badges.push({ icon: '⏰', title: 'Time Investor', desc: '10+ hours invested' });
    if (taskStats.totalCompletionTime >= 1800) badges.push({ icon: '🔥', title: 'Dedication Master', desc: '30+ hours invested' });
    
    if (taskStats.averageSatisfaction >= 4) badges.push({ icon: '😊', title: 'Happy Achiever', desc: '4+ average satisfaction' });
    if (taskStats.recurring >= 5) badges.push({ icon: '🔄', title: 'Habit Builder', desc: '5+ recurring tasks' });
    
    return badges;
  };

  const badges = getBadges();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Achievements</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Level */}
            <View style={styles.levelSection}>
              <View style={[styles.levelBadge, { backgroundColor: achievement.color + '20' }]}>
                <Text style={styles.levelIcon}>{achievement.icon}</Text>
                <Text style={[styles.levelText, { color: achievement.color }]}>
                  {achievement.level}
                </Text>
              </View>
              <Text style={styles.levelDescription}>
                Your current productivity level based on {taskStats.completionRate}% completion rate
              </Text>
            </View>

            {/* Detailed Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Detailed Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{taskStats.total}</Text>
                  <Text style={styles.statLabel}>Total Tasks</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{taskStats.completed}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{taskStats.completionRate}%</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{formatTime(taskStats.totalCompletionTime)}</Text>
                  <Text style={styles.statLabel}>Time Invested</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {taskStats.averageSatisfaction > 0 ? `${taskStats.averageSatisfaction}/5` : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Avg Satisfaction</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{taskStats.recurring}</Text>
                  <Text style={styles.statLabel}>Recurring Tasks</Text>
                </View>
              </View>
            </View>

            {/* Badges & Achievements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏆 Earned Badges</Text>
              {badges.length === 0 ? (
                <View style={styles.emptyBadges}>
                  <Text style={styles.emptyBadgesText}>
                    Complete more tasks to earn your first badge! 🌟
                  </Text>
                </View>
              ) : (
                <View style={styles.badgesGrid}>
                  {badges.map((badge, index) => (
                    <View key={index} style={styles.badgeCard}>
                      <Text style={styles.badgeIcon}>{badge.icon}</Text>
                      <Text style={styles.badgeTitle}>{badge.title}</Text>
                      <Text style={styles.badgeDesc}>{badge.desc}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Progress Levels */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📈 Progress Levels</Text>
              <View style={styles.levelsContainer}>
                {[
                  { level: 'Beginner', icon: '🌱', min: 0, max: 49, color: '#6b7280' },
                  { level: 'Intermediate', icon: '🎯', min: 50, max: 69, color: '#6366f1' },
                  { level: 'Pro', icon: '⭐', min: 70, max: 79, color: '#10b981' },
                  { level: 'Expert', icon: '🏆', min: 80, max: 89, color: '#f59e0b' },
                  { level: 'Master', icon: '👑', min: 90, max: 100, color: '#fbbf24' },
                ].map((level, index) => {
                  const isCurrentLevel = taskStats.completionRate >= level.min && taskStats.completionRate <= level.max;
                  const isUnlocked = taskStats.completionRate >= level.min;
                  
                  return (
                    <View key={index} style={[
                      styles.levelItem,
                      isCurrentLevel && styles.currentLevelItem,
                      !isUnlocked && styles.lockedLevelItem
                    ]}>
                      <Text style={[
                        styles.levelItemIcon,
                        !isUnlocked && styles.lockedIcon
                      ]}>
                        {isUnlocked ? level.icon : '🔒'}
                      </Text>
                      <View style={styles.levelItemInfo}>
                        <Text style={[
                          styles.levelItemTitle,
                          isCurrentLevel && { color: level.color },
                          !isUnlocked && styles.lockedText
                        ]}>
                          {level.level}
                        </Text>
                        <Text style={[
                          styles.levelItemRange,
                          !isUnlocked && styles.lockedText
                        ]}>
                          {level.min}-{level.max}% completion rate
                        </Text>
                      </View>
                      {isCurrentLevel && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>CURRENT</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
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
    padding: Spacing.lg,
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: Typography.xl2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: Typography.lg,
    color: Colors.textSecondary,
  },
  levelSection: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    marginBottom: Spacing.sm,
  },
  levelIcon: {
    fontSize: Typography.xl2,
    marginRight: Spacing.sm,
  },
  levelText: {
    fontSize: Typography.xl,
    fontWeight: 'bold',
  },
  levelDescription: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.gray100,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.lg,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyBadges: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
  },
  emptyBadgesText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badgeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.success + '10',
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.success + '30',
  },
  badgeIcon: {
    fontSize: Typography.xl,
    marginBottom: Spacing.xs,
  },
  badgeTitle: {
    fontSize: Typography.sm,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  levelsContainer: {
    gap: Spacing.sm,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
  },
  currentLevelItem: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 2,
    borderColor: Colors.primary + '30',
  },
  lockedLevelItem: {
    opacity: 0.5,
  },
  levelItemIcon: {
    fontSize: Typography.xl,
    marginRight: Spacing.md,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  levelItemInfo: {
    flex: 1,
  },
  levelItemTitle: {
    fontSize: Typography.base,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  levelItemRange: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  lockedText: {
    opacity: 0.5,
  },
  currentBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: Typography.xs,
    fontWeight: 'bold',
    color: Colors.background,
  },
}); 