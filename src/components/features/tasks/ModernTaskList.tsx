import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { TaskCard } from './TaskCard';
import { Task } from '../../../types';
import * as Haptics from 'expo-haptics';

interface ModernTaskListProps {
  tasks: Task[];
  onComplete: (taskId: string, satisfaction?: number, notes?: string) => void;
  onSkip: (taskId: string, reason?: string) => void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isCompleting: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const ModernTaskList: React.FC<ModernTaskListProps> = ({
  tasks,
  onComplete,
  onSkip,
  onEdit,
  onDelete,
  isCompleting,
  onRefresh,
  refreshing = false,
}) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedTabs, setExpandedTabs] = useState<Set<string>>(new Set());
  const [hideOldTabs, setHideOldTabs] = useState(false);

  // Categorize tabs
  const overdueTabs = tasks.filter(task => {
    if (task.status === 'completed' || !task.scheduledFor) return false;
    const taskTime = new Date(task.scheduledFor);
    const now = new Date();
    return taskTime < now;
  });

  const todayTabs = tasks.filter(task => {
    if (task.status === 'completed' || !task.scheduledFor) return false;
    const taskDate = new Date(task.scheduledFor);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  });

  const upcomingTabs = tasks.filter(task => {
    if (task.status === 'completed' || !task.scheduledFor) return false;
    const taskTime = new Date(task.scheduledFor);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return taskTime > now && taskTime < tomorrow;
  });

  const completedTabs = tasks.filter(task => task.status === 'completed');

  // Filter out old completed tabs if hideOldTabs is enabled
  const filteredCompletedTabs = hideOldTabs 
    ? completedTabs.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        const now = new Date();
        const daysDiff = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7; // Show only tabs completed in the last 7 days
      })
    : completedTabs;

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTabs.length / tasks.length) * 100);
  };

  const getAverageSatisfaction = () => {
    const completedWithSatisfaction = completedTabs.filter(task => task.context?.lastSatisfaction);
    if (completedWithSatisfaction.length === 0) return 0;
    
    const totalSatisfaction = completedWithSatisfaction.reduce((sum, task) => 
      sum + (task.context?.lastSatisfaction || 0), 0
    );
    return Math.round(totalSatisfaction / completedWithSatisfaction.length);
  };

  const handleToggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTabs);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTabs(newExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleHideOldTabs = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHideOldTabs(!hideOldTabs);
  };

  const handleDeleteOldTabs = () => {
    Alert.alert(
      'Delete Old Tabs',
      'This will permanently delete all completed tabs older than 7 days. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => {
            const oldTabs = completedTabs.filter(task => {
              if (!task.completedAt) return false;
              const completedDate = new Date(task.completedAt);
              const now = new Date();
              const daysDiff = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
              return daysDiff > 7;
            });
            
            oldTabs.forEach(task => {
              if (onDelete) onDelete(task.id);
            });
            
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      ]
    );
  };

  const renderTabSection = (title: string, tabs: Task[], icon: string, color: string) => {
    if (tabs.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>{icon}</Text>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={[styles.sectionBadge, { backgroundColor: color }]}>
              <Text style={styles.sectionBadgeText}>{tabs.length}</Text>
            </View>
          </View>
        </View>
        
        {tabs.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onSkip={onSkip}
            onEdit={onEdit}
            onDelete={onDelete}
            isCompleting={isCompleting}
            isExpanded={expandedTabs.has(task.id)}
            onToggleExpand={() => handleToggleExpand(task.id)}
          />
        ))}
      </View>
    );
  };

  const renderCompletedSection = () => {
    if (filteredCompletedTabs.length === 0) return null;

    const tabsToShow = showCompleted ? filteredCompletedTabs : filteredCompletedTabs.slice(0, 3);
    const hasMore = filteredCompletedTabs.length > 3;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>✅</Text>
            <Text style={styles.sectionTitle}>Completed</Text>
            <View style={[styles.sectionBadge, { backgroundColor: Colors.success }]}>
              <Text style={styles.sectionBadgeText}>{filteredCompletedTabs.length}</Text>
            </View>
          </View>
          
          {/* Old Tabs Management */}
          <View style={styles.completedActions}>
            <TouchableOpacity
              onPress={handleHideOldTabs}
              style={[styles.actionButton, hideOldTabs && styles.actionButtonActive]}
            >
              <Text style={[styles.actionButtonText, hideOldTabs && styles.actionButtonTextActive]}>
                {hideOldTabs ? 'Show All' : 'Hide Old'}
              </Text>
            </TouchableOpacity>
            
            {completedTabs.length > filteredCompletedTabs.length && (
              <TouchableOpacity
                onPress={handleDeleteOldTabs}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <Text style={styles.deleteButtonText}>Delete Old</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {tabsToShow.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={onComplete}
            onSkip={onSkip}
            onEdit={onEdit}
            onDelete={onDelete}
            isCompleting={isCompleting}
            isExpanded={expandedTabs.has(task.id)}
            onToggleExpand={() => handleToggleExpand(task.id)}
          />
        ))}
        
        {!showCompleted && hasMore && (
          <TouchableOpacity
            onPress={() => setShowCompleted(true)}
            style={styles.moreIndicator}
          >
            <Text style={styles.moreText}>
              +{filteredCompletedTabs.length - 3} more completed tabs
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => {
    if (tasks.length > 0) return null;

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>📝</Text>
        <Text style={styles.emptyStateTitle}>No tabs yet</Text>
        <Text style={styles.emptyStateText}>
          Create your first tab to get started on your productivity journey!
        </Text>
      </View>
    );
  };

  const renderStats = () => {
    if (tasks.length === 0) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedTabs.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{getCompletionRate()}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
        
        {getAverageSatisfaction() > 0 && (
          <View style={styles.satisfactionContainer}>
            <Text style={styles.satisfactionText}>
              ⭐ Average satisfaction: {getAverageSatisfaction()}/5
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        ) : undefined
      }
    >
      {/* Stats */}
      {renderStats()}

      {/* Empty State */}
      {renderEmptyState()}

      {/* Overdue Tabs */}
      {renderTabSection('Overdue', overdueTabs, '⚠️', Colors.danger)}

      {/* Today's Tabs */}
      {renderTabSection('Today', todayTabs, '📅', Colors.primary)}

      {/* Upcoming Tabs */}
      {renderTabSection('Upcoming', upcomingTabs, '⏰', Colors.warning)}

      {/* Completed Tabs */}
      {renderCompletedSection()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsContainer: {
    backgroundColor: Colors.white,
    margin: Spacing.md,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.gray200,
  },
  satisfactionContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    alignItems: 'center',
  },
  satisfactionText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionIcon: {
    fontSize: Typography.md,
  },
  sectionTitle: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  sectionBadgeText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  completedActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
  },
  actionButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: Colors.primary,
  },
  deleteButton: {
    backgroundColor: Colors.danger + '20',
    borderColor: Colors.danger,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: Typography.xs,
    color: Colors.danger,
    fontWeight: '600',
  },
  moreIndicator: {
    marginHorizontal: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderStyle: 'dashed',
  },
  moreText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyStateTitle: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyStateText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 