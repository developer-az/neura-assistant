import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useGoals } from '../hooks/useGoals';
import { useInsights } from '../hooks/useInsights';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Input, Card } from './ui';
import { InsightsCard } from './features/insights/InsightsCard';
import { Colors, Typography, Spacing } from '../utils/constants';
import { formatTime, getMotivationalMessage } from '../utils/helpers';
import { notificationService } from '../services/notifications/NotificationService';
import { TaskItem } from './features/tasks/TaskItem';
import { TaskList } from './features/tasks/TaskList';
import { CreateTaskForm } from './features/tasks/CreateTaskForm';
import { AchievementCard } from './features/tasks/AchievementCard';
import { TaskHistoryModal } from './features/tasks/TaskHistoryModal';
import { QuickAddTask } from './features/tasks/QuickAddTask';
import { ModernTaskList } from './features/tasks/ModernTaskList';
import { QuickTaskCreator } from './features/tasks/QuickTaskCreator';


// Authentication Component
function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const handleAuth = async () => {
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();
    const trimmedFullName = fullName.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isSignUp && !trimmedFullName) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(trimmedEmail, trimmedPassword, trimmedFullName);
        if (error) throw error;
        Alert.alert('Success', 'Account created! You can now sign in.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        const { error } = await signInWithEmail(trimmedEmail, trimmedPassword);
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.authContainer}>
        <View style={styles.authHeader}>
          <Text style={styles.logo}>🧠 Neura</Text>
          <Text style={styles.tagline}>Your AI Productivity Assistant</Text>
        </View>

        <Card style={styles.authCard}>
          <Text style={styles.authTitle}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>

          {isSignUp && (
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              required
            />
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Use your real email or test@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            required
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password (min 6 characters)"
            secureTextEntry
            required
          />

          <Button
            title={loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            onPress={handleAuth}
            disabled={loading}
            style={{ marginTop: Spacing.md }}
          />

          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            style={styles.switchAuth}
          >
            <Text style={styles.switchAuthText}>
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Create Goal Form
function CreateGoalForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (goal: any) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'health' | 'career' | 'learning' | 'habits' | 'finance' | 'relationships' | 'personal'>('habits');

  const categories = [
    { key: 'health', label: 'Health', emoji: '🏃' },
    { key: 'career', label: 'Career', emoji: '💼' },
    { key: 'learning', label: 'Learning', emoji: '📚' },
    { key: 'habits', label: 'Habits', emoji: '⭐' },
    { key: 'finance', label: 'Finance', emoji: '💰' },
    { key: 'relationships', label: 'Relationships', emoji: '👥' },
    { key: 'personal', label: 'Personal', emoji: '🎯' },
  ] as const;

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    const newGoal = {
      title: title.trim(),
      description: description.trim() || null,
      category,
      priority: 'medium',
      status: 'active',
      completion_percentage: 0,
    };

    onSubmit(newGoal);
    onClose();
  };

  return (
    <Card style={styles.createForm}>
      <Text style={styles.formTitle}>Create New Goal</Text>
      
      <Input
        label="Goal Title"
        value={title}
        onChangeText={setTitle}
        placeholder="What do you want to achieve?"
        required
      />

      <Input
        label="Description (Optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Add details about your goal..."
        multiline
      />

      <View style={styles.categorySection}>
        <Text style={styles.formLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setCategory(cat.key)}
              style={[
                styles.categoryButton,
                { backgroundColor: category === cat.key ? Colors.primary : Colors.gray200 }
              ]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[
                styles.categoryText,
                { color: category === cat.key ? Colors.background : Colors.textSecondary }
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formButtons}>
        <Button
          title="Cancel"
          onPress={onClose}
          variant="secondary"
          style={{ flex: 1, marginRight: Spacing.sm }}
        />
        <Button
          title="Create Goal"
          onPress={handleSubmit}
          style={{ flex: 1, marginLeft: Spacing.sm }}
        />
      </View>
    </Card>
  );
}

// Main Dashboard Component
function Dashboard() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const { 
    tasks,
    todaysTasks, 
    taskStats, 
    isLoading: tasksLoading, 
    createTask, 
    completeTask, 
    skipTask,
    deleteTask,
    isCreating: isCreatingTask,
    isCompleting 
  } = useTasks(user?.id);
  
  const {
    goals,
    isLoading: goalsLoading,
    createGoal,
    isCreating: isCreatingGoal
  } = useGoals(user?.id);

  const {
    insights,
    isLoading: insightsLoading,
    generateInsights,
    markAsRead,
    isGenerating
  } = useInsights(user?.id);
  

  const [showCreateGoalForm, setShowCreateGoalForm] = useState(false);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [showTaskHistoryModal, setShowTaskHistoryModal] = useState(false);

  // Initialize notifications when component mounts
  React.useEffect(() => {
    if (user) {
      notificationService.initialize();
    }
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const handleCreateTask = (taskData: any) => {
    if (!user?.id) return;
    
    createTask({
      ...taskData,
      user_id: user.id,
    });
  };

  const handleCreateGoal = (goalData: any) => {
    if (!user?.id) return;
    
    createGoal({
      ...goalData,
      user_id: user.id,
    });
  };

  const handleCompleteTask = (taskId: string, satisfaction?: number, notes?: string) => {
    completeTask({ taskId, satisfaction, notes });
  };

  const handleSkipTask = (taskId: string) => {
    Alert.alert(
      'Skip Task',
      'Why are you skipping this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Too busy', onPress: () => skipTask({ taskId, reason: 'Too busy' }) },
        { text: 'Not motivated', onPress: () => skipTask({ taskId, reason: 'Not motivated' }) },
        { text: 'Too difficult', onPress: () => skipTask({ taskId, reason: 'Too difficult' }) },
        { text: 'Other', onPress: () => skipTask({ taskId, reason: 'Other' }) },
      ]
    );
  };

  const handleDeleteTask = (taskId: string) => {
    console.log('MainApp handleDeleteTask called with:', taskId);
    const taskToDelete = tasks.find(task => task.id === taskId);
    console.log('Task to delete:', taskToDelete);
    
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskToDelete?.title || 'this task'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            console.log('Delete confirmed, calling deleteTask function');
            deleteTask(taskId);
          }
        },
      ]
    );
  };

  const handleGenerateInsights = () => {
    generateInsights();
  };

  const handleMarkInsightAsRead = (insightId: string) => {
    markAsRead(insightId);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: '#10b981',
      learning: '#6366f1',
      career: '#f59e0b',
      habits: '#818cf8',
      finance: '#8b5cf6',
      relationships: '#ec4899',
      personal: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  const isTaskOverdue = (scheduledFor: string) => {
    const taskTime = new Date(scheduledFor);
    const now = new Date();
    const diffHours = (now.getTime() - taskTime.getTime()) / (1000 * 60 * 60);
    return diffHours > 1; // Only overdue after 1 hour past scheduled time
  };

  if (tasksLoading || goalsLoading || insightsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your workspace...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Luxurious Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>✨ Neura</Text>
          <View style={styles.luxuryBadge}>
            <Text style={styles.luxuryBadgeText}>AI</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.welcomeText}>
            Hello, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}
          </Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutText}>👋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Achievement Card */}
        <AchievementCard
          taskStats={taskStats}
          onViewAchievements={() => {
            // Achievement screen will be implemented in the future
          }}
        />

        {/* Task Management */}
        <View style={styles.modernTaskSection}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskHeaderTitle}>Today's Tasks</Text>
            <TouchableOpacity
              onPress={() => setShowCreateTaskForm(true)}
              style={styles.addTaskButton}
            >
              <Text style={styles.addTaskButtonText}>+ New Task</Text>
            </TouchableOpacity>
          </View>
          
          <TaskList
            tasks={todaysTasks}
            title=""
            onComplete={handleCompleteTask}
            onSkip={handleSkipTask}
            onEdit={(task) => {
              // Edit functionality will be implemented in the future
              Alert.alert('Edit Task', 'Edit functionality will be implemented in the next iteration.');
            }}
            onDelete={handleDeleteTask}
            isCompleting={isCompleting}
            emptyMessage="No tasks scheduled for today. Create one to get started!"
            showStats={true}
          />
        </View>

        {/* Create Task Form Modal */}
        <Modal
          visible={showCreateTaskForm}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCreateTaskForm(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <CreateTaskForm
                onClose={() => setShowCreateTaskForm(false)}
                onSubmit={handleCreateTask}
                goals={goals}
                isLoading={isCreatingTask}
              />
            </View>
          </View>
        </Modal>

        {/* Secondary Action Buttons */}
        <View style={styles.secondaryActionRow}>
          <Button
            title="🎯 New Goal"
            onPress={() => setShowCreateGoalForm(true)}
            style={styles.secondaryActionButton}
          />
          <Button
            title="📚 View History"
            onPress={() => setShowTaskHistoryModal(true)}
            style={styles.secondaryActionButton}
          />
        </View>

        {/* Create Forms */}

        {showCreateGoalForm && (
          <CreateGoalForm
            onClose={() => setShowCreateGoalForm(false)}
            onSubmit={handleCreateGoal}
          />
        )}

        {/* AI Insights */}
        <InsightsCard
          insights={insights}
          onGenerateInsights={handleGenerateInsights}
          onMarkAsRead={handleMarkInsightAsRead}
          isGenerating={isGenerating}
        />

        {/* Goals Overview */}
        {goals.length > 0 && (
          <Card style={styles.goalsCard}>
            <Text style={styles.cardTitle}>Your Goals</Text>
            {goals.slice(0, 3).map(goal => (
              <View key={goal.id} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(goal.category) }
                  ]}>
                    <Text style={styles.categoryBadgeText}>{goal.category}</Text>
                  </View>
                </View>
                <View style={styles.goalProgress}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      { 
                        width: `${goal.completion_percentage}%`,
                        backgroundColor: getCategoryColor(goal.category)
                      }
                    ]} />
                  </View>
                  <Text style={styles.progressText}>{goal.completion_percentage}%</Text>
                </View>
              </View>
            ))}
          </Card>
        )}



        {/* Stats Overview */}
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>Performance Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>{taskStats.total}</Text>
              <Text style={styles.statCardLabel}>Total Tasks</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>{taskStats.completed}</Text>
              <Text style={styles.statCardLabel}>Completed</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>{taskStats.pending}</Text>
              <Text style={styles.statCardLabel}>Pending</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>{taskStats.overdue}</Text>
              <Text style={styles.statCardLabel}>Overdue</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {(isCreatingTask || isCreatingGoal) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {isCreatingTask ? 'Creating task...' : 'Creating goal...'}
          </Text>
        </View>
      )}

              <TaskHistoryModal
          visible={showTaskHistoryModal}
          onClose={() => setShowTaskHistoryModal(false)}
          tasks={tasks}
          onComplete={handleCompleteTask}
          onSkip={handleSkipTask}
          onEdit={(task) => {
            // Edit functionality will be implemented in the future
          }}
          onDelete={handleDeleteTask}
          isCompleting={isCompleting}
        />
    </SafeAreaView>
  );
}

// Main App Component
export default function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return user ? <Dashboard /> : <AuthScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  
  // Auth Styles
  authContainer: {
    padding: Spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl2,
  },
  logo: {
    fontSize: Typography.xl4,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: Typography.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  authCard: {
    padding: Spacing.xl,
  },
  authTitle: {
    fontSize: Typography.xl2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  switchAuth: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  switchAuthText: {
    fontSize: Typography.sm,
    color: Colors.primary,
  },
  
  // Luxurious Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: {
    fontSize: Typography.xl2,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  luxuryBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  luxuryBadgeText: {
    fontSize: Typography.xs,
    fontWeight: 'bold',
    color: Colors.background,
  },
  welcomeText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  signOutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  signOutText: {
    fontSize: Typography.lg,
  },
  
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  
  // Welcome Card
  welcomeCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: Typography.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.xl2,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  
  // Secondary Action Row
  secondaryActionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  
  // Form Styles
  createForm: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  formTitle: {
    fontSize: Typography.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  formColumn: {
    flex: 1,
  },
  formLabel: {
    fontSize: Typography.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  
  // Category Section
  categorySection: {
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryEmoji: {
    fontSize: Typography.base,
  },
  categoryText: {
    fontSize: Typography.sm,
    fontWeight: '500',
  },
  
  // Goal Section
  goalSection: {
    marginBottom: Spacing.md,
  },
  goalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  goalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  goalButtonText: {
    fontSize: Typography.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Difficulty and Energy
  difficultyButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  difficultyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  energyButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  energyButton: {
    width: 40,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyButtonText: {
    fontSize: Typography.lg,
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
  },
  
  // Goals Card
  goalsCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  goalItem: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  goalTitle: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.background,
    textTransform: 'capitalize',
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    minWidth: 35,
    textAlign: 'right',
  },
  
  // Tasks Card
  tasksCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Task Item
  taskItem: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  taskCompleted: {
    backgroundColor: Colors.success + '15',
    borderLeftColor: Colors.success,
  },
  taskOverdue: {
    backgroundColor: Colors.danger + '10',
    borderLeftColor: Colors.danger,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  taskTitle: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  difficultyBadge: {
    fontSize: Typography.sm,
  },
  energyBadge: {
    fontSize: Typography.sm,
  },
  taskDescription: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  taskFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  taskTime: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  taskDuration: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  taskStreak: {
    fontSize: Typography.xs,
    color: Colors.warning,
    fontWeight: '500',
  },
  taskActions: {
    flexDirection: 'column',
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  taskActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: Colors.primary,
  },
  skipButton: {
    backgroundColor: Colors.gray400,
  },
  taskActionText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: Typography.base,
  },
  
  // Stats Card
  statsCard: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl2,
    padding: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    backgroundColor: Colors.gray100,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    width: '47%',
  },
  statCardValue: {
    fontSize: Typography.xl2,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Modern Task Management Styles
  modernTaskSection: {
    flex: 1,
    marginBottom: Spacing.lg,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  taskHeaderTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addTaskButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  addTaskButtonText: {
    color: Colors.background,
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
});