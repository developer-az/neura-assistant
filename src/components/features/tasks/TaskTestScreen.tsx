import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { ModernTaskList } from './ModernTaskList';
import { TabCreatorModal } from './TabCreatorModal';
import { Task } from '../../../types';
import * as Haptics from 'expo-haptics';
import SimpleDeleteTest from './SimpleDeleteTest';

// Mock data for testing with detailed tab descriptions
const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Wash Face',
    description: '1. Use gentle cleanser with warm water\n2. Apply toner with cotton pad\n3. Moisturize with SPF 30\n4. Pat dry gently with clean towel\n5. Apply eye cream if needed',
    scheduledFor: new Date().toISOString(),
    estimatedDurationMinutes: 10,
    difficultyLevel: 1,
    energyRequirement: 'low',
    status: 'pending',
    aiGenerated: false,
    context: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Morning Exercise',
    description: '1. 5 min warm-up stretches\n2. 20 min cardio (running/cycling)\n3. 10 min strength training\n4. 5 min cool-down stretches\n5. Hydrate with water',
    scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    estimatedDurationMinutes: 40,
    difficultyLevel: 3,
    energyRequirement: 'high',
    status: 'pending',
    aiGenerated: false,
    context: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Complete Project Proposal',
    description: '1. Review client requirements\n2. Research market data\n3. Create project timeline\n4. Calculate budget estimates\n5. Write executive summary\n6. Prepare presentation slides',
    scheduledFor: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (overdue)
    estimatedDurationMinutes: 120,
    difficultyLevel: 4,
    energyRequirement: 'high',
    status: 'pending',
    aiGenerated: false,
    context: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    userId: 'user1',
    title: 'Meditation Session',
    description: '1. Find quiet space\n2. Sit in comfortable position\n3. Close eyes and breathe deeply\n4. Focus on breath for 10 min\n5. Practice mindfulness for 5 min\n6. Gradually return to awareness',
    scheduledFor: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    estimatedDurationMinutes: 15,
    difficultyLevel: 1,
    energyRequirement: 'low',
    status: 'completed',
    completedAt: new Date().toISOString(),
    aiGenerated: false,
    context: { lastSatisfaction: 4 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    userId: 'user1',
    title: 'Study React Native',
    description: '1. Read documentation on navigation\n2. Practice with sample app\n3. Watch tutorial videos\n4. Complete coding exercises\n5. Take notes on key concepts\n6. Build small test project',
    scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    estimatedDurationMinutes: 60,
    difficultyLevel: 3,
    energyRequirement: 'medium',
    status: 'pending',
    aiGenerated: false,
    context: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    userId: 'user1',
    title: 'Cook Dinner',
    description: '1. Plan meal and check ingredients\n2. Prep vegetables and meat\n3. Cook rice/pasta\n4. Prepare main dish\n5. Set table and serve\n6. Clean up kitchen',
    scheduledFor: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    estimatedDurationMinutes: 45,
    difficultyLevel: 2,
    energyRequirement: 'medium',
    status: 'pending',
    aiGenerated: false,
    context: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Old completed tasks to test hide functionality
  {
    id: '7',
    userId: 'user1',
    title: 'Old Task 1',
    description: 'This task was completed 10 days ago',
    scheduledFor: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDurationMinutes: 30,
    difficultyLevel: 2,
    energyRequirement: 'medium',
    status: 'completed',
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    aiGenerated: false,
    context: { lastSatisfaction: 3 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    userId: 'user1',
    title: 'Old Task 2',
    description: 'This task was completed 15 days ago',
    scheduledFor: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDurationMinutes: 45,
    difficultyLevel: 3,
    energyRequirement: 'high',
    status: 'completed',
    completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    aiGenerated: false,
    context: { lastSatisfaction: 5 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '9',
    userId: 'user1',
    title: 'Old Task 3',
    description: 'This task was completed 20 days ago',
    scheduledFor: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDurationMinutes: 20,
    difficultyLevel: 1,
    energyRequirement: 'low',
    status: 'completed',
    completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    aiGenerated: false,
    context: { lastSatisfaction: 4 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const TaskTestScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Debug: Log tasks whenever they change
  React.useEffect(() => {
    console.log('TaskTestScreen: Tasks state updated:', tasks.length, 'tasks');
  }, [tasks]);

  const handleCompleteTask = (taskId: string, satisfaction?: number, notes?: string) => {
    setIsCompleting(true);
    
    // Simulate API call
    setTimeout(() => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                status: 'completed',
                completedAt: new Date().toISOString(),
                context: {
                  ...task.context,
                  lastSatisfaction: satisfaction,
                  lastNotes: notes,
                },
              }
            : task
        )
      );
      setIsCompleting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 500);
  };

  const handleSkipTask = (taskId: string, reason?: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: 'skipped',
              skippedAt: new Date().toISOString(),
              context: {
                ...task.context,
                skipReason: reason,
              },
            }
          : task
      )
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const handleEditTask = (task: Task) => {
    Alert.alert(
      'Edit Tab',
      `Edit functionality for: ${task.title}\n\nThis will be implemented in the next iteration.`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteTask = (taskId: string) => {
    console.log('TaskTestScreen: Delete button clicked for task:', taskId);
    
    // Direct delete without confirmation for testing
    console.log('TaskTestScreen: Directly deleting task:', taskId);
    setTasks(prevTasks => {
      const newTasks = prevTasks.filter(task => task.id !== taskId);
      console.log('TaskTestScreen: Tasks after delete:', newTasks.length, 'Previous:', prevTasks.length);
      return newTasks;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCreateTask = (taskData: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      userId: 'user1',
      title: taskData.title,
      description: taskData.description,
      scheduledFor: taskData.scheduled_for,
      estimatedDurationMinutes: taskData.estimated_duration_minutes,
      difficultyLevel: taskData.difficulty_level,
      energyRequirement: taskData.energy_requirement,
      status: 'pending',
      aiGenerated: false,
      context: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks(prevTasks => [newTask, ...prevTasks]);
    setShowTaskCreator(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRefresh = () => {
    // Simulate refresh
    setTimeout(() => {
      // Could reload data here
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Neura Tabs</Text>
        <Text style={styles.subtitle}>Modern Tab Management</Text>
      </View>

      {/* Add Tab Button */}
      <TouchableOpacity
        onPress={() => setShowTaskCreator(true)}
        style={styles.addButton}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>+ Create New Tab</Text>
      </TouchableOpacity>

      {/* Test Delete Button */}
      <TouchableOpacity
        onPress={() => {
          if (tasks.length > 0) {
            console.log('Test: Deleting first task');
            handleDeleteTask(tasks[0].id);
          }
        }}
        style={[styles.addButton, { backgroundColor: Colors.danger, marginTop: Spacing.sm }]}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>🗑️ Test Delete First Task</Text>
      </TouchableOpacity>

      {/* Debug Button */}
      <TouchableOpacity
        onPress={() => {
          console.log('Current tasks:', tasks.map(t => ({ id: t.id, title: t.title })));
        }}
        style={[styles.addButton, { backgroundColor: Colors.warning, marginTop: Spacing.sm }]}
        activeOpacity={0.8}
      >
        <Text style={styles.addButtonText}>🔍 Debug: Show Tasks</Text>
      </TouchableOpacity>

      {/* Tab List */}
      <ModernTaskList
        tasks={tasks}
        onComplete={handleCompleteTask}
        onSkip={handleSkipTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        isCompleting={isCompleting}
        onRefresh={handleRefresh}
        refreshing={false}
      />

      {/* Tab Creator Modal */}
      <TabCreatorModal
        visible={showTaskCreator}
        onClose={() => setShowTaskCreator(false)}
        onSubmit={handleCreateTask}
        isLoading={false}
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
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    margin: Spacing.md,
    padding: Spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: Typography.sm,
    fontWeight: '600',
  },
}); 