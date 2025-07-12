import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { Card } from '../../ui/Card';
import { AchievementModal } from './AchievementModal';

interface AchievementCardProps {
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
  onViewAchievements?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  taskStats,
  onViewAchievements,
}) => {
  const [showModal, setShowModal] = useState(false);

  const getAchievementLevel = () => {
    if (taskStats.completionRate >= 90) return { level: 'Master', icon: '👑', color: Colors.gold };
    if (taskStats.completionRate >= 80) return { level: 'Expert', icon: '🏆', color: Colors.ruby };
    if (taskStats.completionRate >= 70) return { level: 'Pro', icon: '⭐', color: Colors.emerald };
    if (taskStats.completionRate >= 50) return { level: 'Intermediate', icon: '🎯', color: Colors.primary };
    return { level: 'Beginner', icon: '🌱', color: Colors.gray500 };
  };

  const getMotivationalMessage = () => {
    if (taskStats.todayCompletionRate === 100) return "Perfect day! You're unstoppable! 🚀";
    if (taskStats.todayCompletionRate >= 80) return "Amazing progress today! Keep it up! 💪";
    if (taskStats.todayCompletionRate >= 60) return "Great work! You're building momentum! 🔥";
    if (taskStats.todayCompletionRate >= 40) return "Good start! Every task completed is progress! ✨";
    if (taskStats.todayCompletionRate > 0) return "You've started! That's the hardest part! 🌟";
    return "Ready to make today productive? Let's go! 🎯";
  };

  const achievement = getAchievementLevel();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const handleViewAchievements = () => {
    setShowModal(true);
    if (onViewAchievements) {
      onViewAchievements();
    }
  };

  return (
    <>
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <TouchableOpacity onPress={handleViewAchievements} style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Achievement Level */}
        <View style={styles.achievementSection}>
          <View style={[styles.achievementBadge, { backgroundColor: achievement.color + '20' }]}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <Text style={[styles.achievementLevel, { color: achievement.color }]}>
              {achievement.level}
            </Text>
          </View>
          <Text style={styles.motivationalMessage}>{getMotivationalMessage()}</Text>
        </View>

        {/* Today's Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${taskStats.todayCompletionRate}%`,
                  backgroundColor: taskStats.todayCompletionRate >= 80 ? Colors.success : 
                                 taskStats.todayCompletionRate >= 60 ? Colors.emerald : Colors.primary
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {taskStats.todayCompleted} of {taskStats.todayTotal} tasks completed ({taskStats.todayCompletionRate}%)
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{taskStats.completed}</Text>
            <Text style={styles.statLabel}>Total Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{taskStats.completionRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(taskStats.totalCompletionTime)}</Text>
            <Text style={styles.statLabel}>Time Invested</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {taskStats.averageSatisfaction > 0 ? `⭐ ${taskStats.averageSatisfaction}/5` : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Avg Satisfaction</Text>
          </View>
        </View>

        {/* Quick Stats */}
        {taskStats.recurring > 0 && (
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatIcon}>🔄</Text>
              <Text style={styles.quickStatText}>{taskStats.recurring} recurring tasks</Text>
            </View>
          </View>
        )}
      </Card>

      <AchievementModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        taskStats={taskStats}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  viewAllButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary + '20',
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: Typography.sm,
    fontWeight: '500',
    color: Colors.primary,
  },
  achievementSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 24,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.glassWhite,
  },
  achievementIcon: {
    fontSize: Typography.xl,
    marginRight: Spacing.sm,
  },
  achievementLevel: {
    fontSize: Typography.lg,
    fontWeight: 'bold',
  },
  motivationalMessage: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.gray200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  progressText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.gray50,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  statValue: {
    fontSize: Typography.xl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quickStats: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    paddingTop: Spacing.md,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatIcon: {
    fontSize: Typography.base,
    marginRight: Spacing.xs,
  },
  quickStatText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
}); 