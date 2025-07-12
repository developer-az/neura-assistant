import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Tables, InsertTables } from '../lib/supabase';

type Insight = Tables<'insights'>;
type NewInsight = InsertTables<'insights'>;

export interface InsightData {
  id: string;
  type: 'pattern_recognition' | 'behavioral_coaching' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  icon: string;
  created_at: string;
  metadata?: any;
}

export function useInsights(userId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch insights for user
  const {
    data: insights = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['insights', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as InsightData[];
    },
    enabled: !!userId,
  });

  // Generate new insights based on user data
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID required');

      // Get user's recent data for analysis
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Analyze patterns and generate insights
      const newInsights = await analyzeUserData(tasks || [], goals || []);

      // Save insights to database
      const insightsToInsert = newInsights.map(insight => ({
        ...insight,
        user_id: userId,
      }));

      const { data, error } = await supabase
        .from('insights')
        .insert(insightsToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', userId] });
    },
  });

  // Mark insight as read
  const markAsReadMutation = useMutation({
    mutationFn: async (insightId: string) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('insights')
        .update({ read_at: new Date().toISOString() })
        .eq('id', insightId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights', userId] });
    },
  });

  return {
    insights,
    isLoading,
    error,
    generateInsights: generateInsightsMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    isGenerating: generateInsightsMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
}

// AI-powered analysis function
async function analyzeUserData(tasks: any[], goals: any[]): Promise<Omit<InsightData, 'id' | 'user_id' | 'created_at'>[]> {
  const insights: Omit<InsightData, 'id' | 'user_id' | 'created_at'>[] = [];

  // Analyze completion patterns
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const skippedTasks = tasks.filter(t => t.status === 'skipped');
  const pendingTasks = tasks.filter(t => t.status === 'pending');

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  const skipRate = tasks.length > 0 ? (skippedTasks.length / tasks.length) * 100 : 0;

  // Pattern 1: High completion rate achievement
  if (completionRate >= 80 && completedTasks.length >= 5) {
    insights.push({
      type: 'achievement',
      title: 'Consistency Champion! 🏆',
      description: `You've completed ${Math.round(completionRate)}% of your tasks. Your dedication is impressive!`,
      confidence: 0.95,
      actionable: false,
      icon: '🏆',
      metadata: { completionRate, totalTasks: tasks.length }
    });
  }

  // Pattern 2: High skip rate warning
  if (skipRate >= 30 && skippedTasks.length >= 3) {
    insights.push({
      type: 'behavioral_coaching',
      title: 'Task Skipping Pattern Detected ⚠️',
      description: `You're skipping ${Math.round(skipRate)}% of tasks. Consider if tasks are too difficult or poorly timed.`,
      confidence: 0.85,
      actionable: true,
      icon: '⚠️',
      metadata: { skipRate, skippedTasks: skippedTasks.length }
    });
  }

  // Pattern 3: Time-based analysis
  const taskTimes = tasks
    .filter(t => t.scheduled_for && t.status === 'completed')
    .map(t => new Date(t.scheduled_for).getHours());

  if (taskTimes.length >= 5) {
    const hourCounts = taskTimes.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostProductiveHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostProductiveHour && mostProductiveHour[1] >= 3) {
      insights.push({
        type: 'pattern_recognition',
        title: 'Peak Productivity Time Found! 📈',
        description: `You're most productive at ${mostProductiveHour[0]}:00. Schedule important tasks during this time.`,
        confidence: 0.80,
        actionable: true,
        icon: '📈',
        metadata: { peakHour: mostProductiveHour[0], taskCount: mostProductiveHour[1] }
      });
    }
  }

  // Pattern 4: Goal progress analysis
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (activeGoals.length > 0) {
    const avgProgress = activeGoals.reduce((sum, goal) => sum + goal.completion_percentage, 0) / activeGoals.length;
    
    if (avgProgress >= 70) {
      insights.push({
        type: 'achievement',
        title: 'Goals Almost Complete! 🎯',
        description: `Your active goals are ${Math.round(avgProgress)}% complete. You're doing great!`,
        confidence: 0.90,
        actionable: false,
        icon: '🎯',
        metadata: { avgProgress, activeGoalsCount: activeGoals.length }
      });
    } else if (avgProgress <= 20 && activeGoals.length >= 2) {
      insights.push({
        type: 'suggestion',
        title: 'Need a Boost? 💪',
        description: `Your goals are only ${Math.round(avgProgress)}% complete. Try breaking them into smaller tasks.`,
        confidence: 0.75,
        actionable: true,
        icon: '💪',
        metadata: { avgProgress, activeGoalsCount: activeGoals.length }
      });
    }
  }

  // Pattern 5: Streak analysis
  const tasksWithStreaks = tasks.filter(t => t.streak_count && t.streak_count > 0);
  if (tasksWithStreaks.length > 0) {
    const maxStreak = Math.max(...tasksWithStreaks.map(t => t.streak_count));
    if (maxStreak >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Streak Master! 🔥',
        description: `You've maintained a ${maxStreak}-day streak on some tasks. Consistency is key!`,
        confidence: 0.95,
        actionable: false,
        icon: '🔥',
        metadata: { maxStreak, tasksWithStreaks: tasksWithStreaks.length }
      });
    }
  }

  // Pattern 6: Category analysis
  const categoryStats = tasks.reduce((acc, task) => {
    if (task.goal?.category) {
      acc[task.goal.category] = acc[task.goal.category] || { total: 0, completed: 0 };
      acc[task.goal.category].total++;
      if (task.status === 'completed') {
        acc[task.goal.category].completed++;
      }
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const categoryEntries = Object.entries(categoryStats);
  if (categoryEntries.length >= 2) {
    const bestCategory = categoryEntries
      .map(([category, stats]) => ({
        category,
        rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
      }))
      .sort((a, b) => b.rate - a.rate)[0];

    const worstCategory = categoryEntries
      .map(([category, stats]) => ({
        category,
        rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
      }))
      .sort((a, b) => a.rate - b.rate)[0];

    if (bestCategory.rate >= 80 && bestCategory.rate - worstCategory.rate >= 30) {
      insights.push({
        type: 'pattern_recognition',
        title: 'Category Strength Identified! 💪',
        description: `You excel in ${bestCategory.category} tasks (${Math.round(bestCategory.rate)}% completion). Consider applying similar strategies to other areas.`,
        confidence: 0.85,
        actionable: true,
        icon: '💪',
        metadata: { 
          bestCategory: bestCategory.category, 
          bestRate: bestCategory.rate,
          worstCategory: worstCategory.category,
          worstRate: worstCategory.rate
        }
      });
    }
  }

  return insights;
} 