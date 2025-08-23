import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Premium Colors (based on the app's color scheme)
const Colors = {
  primary: '#6C63FF',
  secondary: '#FF6B6B', 
  success: '#00D4AA',
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  textPrimary: '#1A1D29',
  textSecondary: '#4A5568',
  gold: '#D4AF37',
  emerald: '#50C878',
  ruby: '#E0115F',
  platinum: '#E5E4E2',
  glassWhite: 'rgba(255, 255, 255, 0.9)',
  glassBg: 'rgba(255, 255, 255, 0.1)',
};

interface Task {
  id: string;
  title: string;
  completed: boolean;
  difficulty: number;
  energy: 'low' | 'medium' | 'high';
  satisfaction?: number;
}

// Premium Task Card Component
const TaskCard = ({ task, onComplete, onDelete }: { task: Task, onComplete: (id: string) => void, onDelete: (id: string) => void }) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const getDifficultyColor = () => {
    if (task.difficulty >= 8) return Colors.ruby;
    if (task.difficulty >= 6) return Colors.secondary;
    if (task.difficulty >= 4) return Colors.primary;
    return Colors.emerald;
  };

  const getEnergyIcon = () => {
    switch (task.energy) {
      case 'low': return '🌱';
      case 'medium': return '⚡';
      case 'high': return '🔥';
      default: return '⚡';
    }
  };

  return (
    <Animated.View style={[styles.taskCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={[styles.taskTitle, task.completed && styles.completedText]}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={styles.energyIcon}>{getEnergyIcon()}</Text>
            <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor() }]} />
          </View>
        </View>
        
        {task.completed && task.satisfaction && (
          <View style={styles.satisfactionContainer}>
            <Text style={styles.satisfactionText}>
              {'⭐'.repeat(task.satisfaction)} ({task.satisfaction}/5)
            </Text>
          </View>
        )}

        <View style={styles.taskActions}>
          {!task.completed ? (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => onComplete(task.id)}
            >
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓ Completed</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => onDelete(task.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Achievement Card Component
const AchievementCard = ({ taskStats }: { taskStats: any }) => {
  const getAchievementLevel = () => {
    if (taskStats.completionRate >= 90) return { level: 'Master', icon: '👑', color: Colors.gold };
    if (taskStats.completionRate >= 80) return { level: 'Expert', icon: '🏆', color: Colors.ruby };
    if (taskStats.completionRate >= 70) return { level: 'Pro', icon: '⭐', color: Colors.emerald };
    if (taskStats.completionRate >= 50) return { level: 'Intermediate', icon: '🎯', color: Colors.primary };
    return { level: 'Beginner', icon: '🌱', color: Colors.platinum };
  };

  const achievement = getAchievementLevel();

  return (
    <View style={styles.achievementCard}>
      <Text style={styles.achievementTitle}>Your Progress</Text>
      <View style={styles.achievementContent}>
        <View style={[styles.achievementBadge, { backgroundColor: achievement.color + '20' }]}>
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          <Text style={[styles.achievementLevel, { color: achievement.color }]}>
            {achievement.level}
          </Text>
        </View>
        <Text style={styles.completionRate}>
          {Math.round(taskStats.completionRate)}% completion rate
        </Text>
      </View>
    </View>
  );
};

// Quick Add Task Component
const QuickAddTask = ({ onSubmit }: { onSubmit: (task: Omit<Task, 'id' | 'completed'>) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState(5);
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [expandAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        difficulty,
        energy,
      });
      setTitle('');
      setIsExpanded(false);
      Animated.timing(expandAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  };

  return (
    <View style={styles.quickAddContainer}>
      <Animated.View style={[styles.quickAddButton, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity onPress={toggleExpanded} style={styles.quickAddTouchable}>
          <Text style={styles.quickAddIcon}>✨</Text>
          <Text style={styles.quickAddText}>Quick Add Task</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[
        styles.quickAddForm,
        {
          height: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200],
          }),
          opacity: expandAnim,
        }
      ]}>
        <TextInput
          style={styles.taskInput}
          placeholder="Enter task title..."
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={Colors.textSecondary}
        />
        
        <View style={styles.optionsRow}>
          <Text style={styles.optionLabel}>Difficulty: {difficulty}/10</Text>
          <View style={styles.difficultySelector}>
            {[1, 3, 5, 7, 10].map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.difficultyOption,
                  difficulty === level && styles.selectedDifficulty
                ]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={styles.difficultyText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.optionsRow}>
          <Text style={styles.optionLabel}>Energy:</Text>
          <View style={styles.energySelector}>
            {['low', 'medium', 'high'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.energyOption,
                  energy === level && styles.selectedEnergy
                ]}
                onPress={() => setEnergy(level as 'low' | 'medium' | 'high')}
              >
                <Text style={styles.energyText}>
                  {level === 'low' ? '🌱' : level === 'medium' ? '⚡' : '🔥'} {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleSubmit}>
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Main Demo App Component
export default function NeuraDemo() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Review quarterly performance metrics',
      completed: true,
      difficulty: 7,
      energy: 'high',
      satisfaction: 5,
    },
    {
      id: '2', 
      title: 'Morning workout routine',
      completed: false,
      difficulty: 4,
      energy: 'medium',
    },
    {
      id: '3',
      title: 'Call mom and catch up',
      completed: false,
      difficulty: 2,
      energy: 'low',
    },
  ]);

  const [completionAnimation] = useState(new Animated.Value(1));

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    completionRate: tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0,
  };

  const handleCompleteTask = (taskId: string) => {
    Alert.alert(
      'Complete Task',
      'How satisfied are you with completing this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '⭐ (1/5)', onPress: () => completeWithSatisfaction(taskId, 1) },
        { text: '⭐⭐ (2/5)', onPress: () => completeWithSatisfaction(taskId, 2) },
        { text: '⭐⭐⭐ (3/5)', onPress: () => completeWithSatisfaction(taskId, 3) },
        { text: '⭐⭐⭐⭐ (4/5)', onPress: () => completeWithSatisfaction(taskId, 4) },
        { text: '⭐⭐⭐⭐⭐ (5/5)', onPress: () => completeWithSatisfaction(taskId, 5) },
      ]
    );
  };

  const completeWithSatisfaction = (taskId: string, satisfaction: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: true, satisfaction }
        : task
    ));
    
    // Celebration animation
    Animated.sequence([
      Animated.timing(completionAnimation, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(completionAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setTasks(prev => prev.filter(t => t.id !== taskId))
        },
      ]
    );
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'completed'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
    };
    setTasks(prev => [...prev, task]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Good morning! 🌅</Text>
        <Text style={styles.headerSubtitle}>Ready to make today productive?</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ transform: [{ scale: completionAnimation }] }}>
          <AchievementCard taskStats={taskStats} />
        </Animated.View>

        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
          />
        ))}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateText}>No tasks yet</Text>
            <Text style={styles.emptyStateSubtext}>Add your first task below!</Text>
          </View>
        )}
      </ScrollView>

      <QuickAddTask onSubmit={handleAddTask} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  achievementCard: {
    backgroundColor: Colors.glassWhite,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  achievementContent: {
    alignItems: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  achievementLevel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionRate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: Colors.glassWhite,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  taskContent: {
    padding: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  satisfactionContainer: {
    marginBottom: 12,
  },
  satisfactionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  completeButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  completedBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    marginRight: 8,
  },
  completedBadgeText: {
    color: Colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  quickAddContainer: {
    padding: 20,
  },
  quickAddButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  quickAddTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  quickAddIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  quickAddText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickAddForm: {
    backgroundColor: Colors.glassWhite,
    borderRadius: 16,
    marginTop: 12,
    padding: 16,
    overflow: 'hidden',
  },
  taskInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.backgroundSecondary,
  },
  optionsRow: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  difficultySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDifficulty: {
    backgroundColor: Colors.primary,
  },
  difficultyText: {
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  energySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  energyOption: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedEnergy: {
    backgroundColor: Colors.emerald,
  },
  energyText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});