import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { TaskItem } from './TaskItem';
import { Task } from '../../../types';

interface TaskListProps {
  tasks: Task[];
  title: string;
  onComplete: (taskId: string, satisfaction?: number, notes?: string) => void;
  onSkip: (taskId: string, reason?: string) => void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isCompleting: boolean;
  emptyMessage?: string;
  showStats?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  title,
  onComplete,
  onSkip,
  onEdit,
  onDelete,
  isCompleting,
  emptyMessage = "No tasks to show",
  showStats = false,
}) => {
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'completed' || !task.scheduledFor) return false;
    const taskTime = new Date(task.scheduledFor);
    const now = new Date();
    const hoursOverdue = (now.getTime() - taskTime.getTime()) / (1000 * 60 * 60);
    return hoursOverdue > 2;
  });

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks.length / tasks.length) * 100);
  };

  const getAverageSatisfaction = () => {
    const completedWithSatisfaction = completedTasks.filter(task => task.context?.lastSatisfaction);
    if (completedWithSatisfaction.length === 0) return 0;
    
    const totalSatisfaction = completedWithSatisfaction.reduce((sum, task) => 
      sum + (task.context?.lastSatisfaction || 0), 0
    );
    return Math.round(totalSatisfaction / completedWithSatisfaction.length);
  };

  // Determine how many completed tasks to show
  const completedTasksToShow = showAllCompleted ? completedTasks : completedTasks.slice(0, 3);
  const hasMoreCompleted = completedTasks.length > 3;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showStats && tasks.length > 0 && (
          <View style={styles.stats}>
            <Text style={styles.statText}>
              {completedTasks.length}/{tasks.length} completed
            </Text>
            <Text style={styles.statText}>
              {getCompletionRate()}% success rate
            </Text>
            {getAverageSatisfaction() > 0 && (
              <Text style={styles.statText}>
                ⭐ {getAverageSatisfaction()}/5 satisfaction
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Empty State */}
      {tasks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{emptyMessage}</Text>
        </View>
      )}

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Overdue ({overdueTasks.length})</Text>
          {overdueTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onSkip={onSkip}
              onEdit={onEdit}
              onDelete={onDelete}
              isCompleting={isCompleting}
            />
          ))}
        </View>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Pending ({pendingTasks.length})</Text>
          {pendingTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onSkip={onSkip}
              onEdit={onEdit}
              onDelete={onDelete}
              isCompleting={isCompleting}
            />
          ))}
        </View>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✅ Completed ({completedTasks.length})</Text>
            {hasMoreCompleted && (
              <TouchableOpacity
                onPress={() => setShowAllCompleted(!showAllCompleted)}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleButtonText}>
                  {showAllCompleted ? 'Show Less' : 'Show All'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {completedTasksToShow.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={onComplete}
              onSkip={onSkip}
              onEdit={onEdit}
              onDelete={onDelete}
              isCompleting={isCompleting}
            />
          ))}
          
          {!showAllCompleted && hasMoreCompleted && (
            <TouchableOpacity
              onPress={() => setShowAllCompleted(true)}
              style={styles.moreIndicator}
            >
              <Text style={styles.moreText}>
                +{completedTasks.length - 3} more completed tasks
              </Text>
              <Text style={styles.tapToViewText}>Tap to view all</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
     toggleButton: {
     paddingHorizontal: Spacing.sm,
     paddingVertical: Spacing.xs,
     backgroundColor: Colors.primary + '20',
     borderRadius: 8,
   },
  toggleButtonText: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  moreIndicator: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    marginTop: Spacing.sm,
  },
  moreText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  tapToViewText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
}); 