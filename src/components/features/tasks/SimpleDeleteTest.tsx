import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';

interface TestTask {
  id: string;
  title: string;
}

const SimpleDeleteTest: React.FC = () => {
  const [tasks, setTasks] = useState<TestTask[]>([
    { id: '1', title: 'Task 1' },
    { id: '2', title: 'Task 2' },
    { id: '3', title: 'Task 3' },
  ]);

  const handleDelete = (taskId: string) => {
    console.log('=== SIMPLE DELETE TEST ===');
    console.log('Deleting task:', taskId);
    console.log('Before delete - Tasks count:', tasks.length);
    
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            console.log('Delete confirmed for task:', taskId);
            setTasks(prevTasks => {
              const newTasks = prevTasks.filter(task => task.id !== taskId);
              console.log('After delete - Tasks count:', newTasks.length);
              console.log('Remaining tasks:', newTasks.map(t => t.title));
              return newTasks;
            });
            console.log('=== DELETE COMPLETE ===');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Simple Delete Test</Text>
      <Text style={styles.subtitle}>Tasks: {tasks.length}</Text>
      
      {tasks.map(task => (
        <View key={task.id} style={styles.taskItem}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <TouchableOpacity
            onPress={() => handleDelete(task.id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <TouchableOpacity
        onPress={() => {
          const newTask = { id: Date.now().toString(), title: `Task ${tasks.length + 1}` };
          setTasks(prev => [...prev, newTask]);
        }}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Add Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskTitle: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: Colors.background,
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  addButtonText: {
    color: Colors.background,
    fontSize: Typography.base,
    fontWeight: '600',
  },
});

export default SimpleDeleteTest; 