import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { ModernTaskList } from './ModernTaskList';
import { QuickTaskCreator } from './QuickTaskCreator';
import { useTasks } from '../../../hooks/useTasks';
import { useAuth } from '../../../hooks/useAuth';
import { Task } from '../../../types';
import * as Haptics from 'expo-haptics';

export const TaskManagementScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    tasks,
    taskStats,
    isLoading,
    createTask,
    completeTask,
    skipTask,
    updateTask,
    deleteTask,
    isCreating,
    isCompleting,
  } = useTasks(user?.id);

  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleCreateTask = useCallback((taskData: any) => {
    if (!user?.id) return;

    const newTask = {
      ...taskData,
      user_id: user.id,
    };

    createTask(newTask, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowTaskCreator(false);
      },
      onError: (error) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to create task. Please try again.');
        console.error('Create task error:', error);
      },
    });
  }, [user?.id, createTask]);

  const handleCompleteTask = useCallback((taskId: string, satisfaction?: number, notes?: string) => {
    completeTask(
      { taskId, satisfaction, notes },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: (error) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Error', 'Failed to complete task. Please try again.');
          console.error('Complete task error:', error);
        },
      }
    );
  }, [completeTask]);

  const handleSkipTask = useCallback((taskId: string, reason?: string) => {
    skipTask(
      { taskId, reason },
      {
        onSuccess: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
        onError: (error) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Error', 'Failed to skip task. Please try again.');
          console.error('Skip task error:', error);
        },
      }
    );
  }, [skipTask]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    // For now, we'll show a simple alert. You can implement a full edit modal later
    Alert.alert(
      'Edit Task',
      'Edit functionality will be implemented in the next iteration.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: (error) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to delete task. Please try again.');
        console.error('Delete task error:', error);
      },
    });
  }, [deleteTask]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleAddTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowTaskCreator(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const completionRate = taskStats.completionRate;
    const pendingTasks = taskStats.pending;
    
    if (completionRate >= 80) {
      return "You're crushing it today! 🚀";
    } else if (completionRate >= 60) {
      return "Great progress! Keep it up! 💪";
    } else if (pendingTasks > 0) {
      return "Let's tackle those tasks together! ✨";
    } else {
      return "Ready to be productive? Let's go! 🌟";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.motivationalMessage}>{getMotivationalMessage()}</Text>
        </View>
        
        <TouchableOpacity
          onPress={handleAddTask}
          style={styles.addButton}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      {taskStats.total > 0 && (
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{taskStats.todayCompleted}</Text>
            <Text style={styles.statLabel}>Done Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{taskStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{taskStats.overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
      )}

      {/* Task List */}
      <ModernTaskList
        tasks={tasks}
        onComplete={handleCompleteTask}
        onSkip={handleSkipTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        isCompleting={isCompleting}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Task Creator Modal */}
      <QuickTaskCreator
        visible={showTaskCreator}
        onClose={() => setShowTaskCreator(false)}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  motivationalMessage: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.gray200,
  },
}); 