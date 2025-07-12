import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Task, RecurrenceConfig, TaskCompletion } from '../types';

export interface NewTask {
  user_id: string;
  goal_id?: string | null;
  title: string;
  description?: string | null;
  scheduled_for?: string | null;
  estimated_duration_minutes?: number | null;
  difficulty_level?: number;
  energy_requirement?: 'low' | 'medium' | 'high';
  is_recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  recurrence_config?: RecurrenceConfig | null;
}

export interface UpdateTask {
  title?: string;
  description?: string | null;
  scheduled_for?: string | null;
  estimated_duration_minutes?: number | null;
  difficulty_level?: number;
  energy_requirement?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at?: string | null;
  skipped_at?: string | null;
  streak_count?: number;
  context?: any;
  is_recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  recurrence_config?: RecurrenceConfig | null;
  next_occurrence?: string | null;
  completion_count?: number;
  total_completion_time_minutes?: number;
  average_completion_time_minutes?: number;
}

export function useTasks(userId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch all tasks for user
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tasks', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          goal:goals(id, title, category)
        `)
        .eq('user_id', userId)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data as (Task & { goal?: any })[];
    },
    enabled: !!userId,
  });

  // Get today's tasks (based on scheduled date, not just today)
  const todaysTasks = tasks.filter(task => {
    if (!task.scheduledFor) return false;
    const taskDate = new Date(task.scheduledFor);
    const today = new Date();
    
    // Consider a task "today's task" if it's scheduled for today or overdue from previous days
    const taskDateString = taskDate.toDateString();
    const todayString = today.toDateString();
    
    return taskDateString === todayString || taskDate < today;
  });

  // Get overdue tasks (more than 2 hours past scheduled time and not completed)
  const overdueTasks = tasks.filter(task => {
    if (!task.scheduledFor || task.status === 'completed') return false;
    const taskTime = new Date(task.scheduledFor);
    const now = new Date();
    const hoursOverdue = (now.getTime() - taskTime.getTime()) / (1000 * 60 * 60);
    return hoursOverdue > 2; // Only consider overdue after 2 hours
  });

  // Get upcoming tasks (scheduled for future)
  const upcomingTasks = tasks.filter(task => {
    if (!task.scheduledFor) return false;
    const taskTime = new Date(task.scheduledFor);
    const now = new Date();
    return taskTime > now && task.status === 'pending';
  });

  // Get recurring tasks
  const recurringTasks = tasks.filter(task => task.isRecurring);

  // Create new task
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: NewTask) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  // Complete task with satisfaction rating
  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, satisfaction = 3, notes }: { taskId: string; satisfaction?: number; notes?: string }) => {
      if (!userId) throw new Error('User ID required');

      // First get the current task to update streak and check if it's recurring
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask) throw new Error('Task not found');

      const now = new Date();
      const completionTime = currentTask.estimatedDurationMinutes || 30; // Default to estimated time
      
      // Calculate new completion stats
      const newCompletionCount = (currentTask.completionCount || 0) + 1;
      const newTotalTime = (currentTask.totalCompletionTimeMinutes || 0) + completionTime;
      const newAverageTime = Math.round(newTotalTime / newCompletionCount);

      // Update the current task
      const updateData: UpdateTask = {
        status: 'completed',
        completed_at: now.toISOString(),
        streak_count: (currentTask.streakCount || 0) + 1,
        completion_count: newCompletionCount,
        total_completion_time_minutes: newTotalTime,
        average_completion_time_minutes: newAverageTime,
        context: {
          ...currentTask.context,
          lastSatisfaction: satisfaction,
          lastNotes: notes,
          completionHistory: [
            ...(currentTask.context?.completionHistory || []),
            {
              completedAt: now.toISOString(),
              satisfaction,
              notes,
              timeSpent: completionTime,
            }
          ]
        }
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // If this is a recurring task, create the next occurrence
      if (currentTask.isRecurring && currentTask.recurrencePattern) {
        await createNextRecurrence(currentTask);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
  });

  // Create next occurrence for recurring tasks
  const createNextRecurrence = async (completedTask: Task) => {
    if (!completedTask.recurrencePattern || !completedTask.scheduledFor) return;

    const nextDate = calculateNextOccurrence(
      new Date(completedTask.scheduledFor),
      completedTask.recurrencePattern,
      completedTask.recurrenceConfig
    );

    if (nextDate) {
      const nextTask: NewTask = {
        user_id: userId!,
        goal_id: completedTask.goalId,
        title: completedTask.title,
        description: completedTask.description,
        scheduled_for: nextDate.toISOString(),
        estimated_duration_minutes: completedTask.estimatedDurationMinutes,
        difficulty_level: completedTask.difficultyLevel,
        energy_requirement: completedTask.energyRequirement,
        is_recurring: true,
        recurrence_pattern: completedTask.recurrencePattern,
        recurrence_config: completedTask.recurrenceConfig,
        status: 'pending',
      };

      await supabase
        .from('tasks')
        .insert(nextTask);
    }
  };

  // Calculate next occurrence date for recurring tasks
  const calculateNextOccurrence = (
    currentDate: Date,
    pattern: string,
    config?: RecurrenceConfig
  ): Date | null => {
    const nextDate = new Date(currentDate);

    switch (pattern) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + (config?.interval || 1));
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * (config?.interval || 1)));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + (config?.interval || 1));
        break;
      default:
        return null;
    }

    // Check if we've reached the end date or max occurrences
    if (config?.endDate && nextDate > new Date(config.endDate)) {
      return null;
    }

    return nextDate;
  };

  // Skip task
  const skipTaskMutation = useMutation({
    mutationFn: async ({ taskId, reason }: { taskId: string; reason?: string }) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'skipped',
          skipped_at: new Date().toISOString(),
          context: { skipReason: reason },
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
  });

  // Update task
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTask }) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
  });

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!userId) throw new Error('User ID required');

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', userId);

      if (error) throw error;
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
  });

  // Reschedule overdue task to next available time
  const rescheduleTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!userId) throw new Error('User ID required');

      // Schedule for next hour
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

      const { data, error } = await supabase
        .from('tasks')
        .update({
          scheduled_for: nextHour.toISOString(),
          status: 'pending',
        })
        .eq('id', taskId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
  });

  // Helper function to calculate average satisfaction
  const calculateAverageSatisfaction = (taskList: Task[]): number => {
    const completedTasks = taskList.filter(t => t.status === 'completed' && t.context?.lastSatisfaction);
    if (completedTasks.length === 0) return 0;
    
    const totalSatisfaction = completedTasks.reduce((sum, task) => sum + (task.context?.lastSatisfaction || 0), 0);
    return Math.round(totalSatisfaction / completedTasks.length);
  };

  // Calculate comprehensive stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    skipped: tasks.filter(t => t.status === 'skipped').length,
    todayTotal: todaysTasks.length,
    todayCompleted: todaysTasks.filter(t => t.status === 'completed').length,
    todayPending: todaysTasks.filter(t => t.status === 'pending').length,
    overdue: overdueTasks.length,
    upcoming: upcomingTasks.length,
    recurring: recurringTasks.length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) 
      : 0,
    todayCompletionRate: todaysTasks.length > 0
      ? Math.round((todaysTasks.filter(t => t.status === 'completed').length / todaysTasks.length) * 100)
      : 0,
    totalCompletionTime: tasks.reduce((sum, task) => sum + (task.totalCompletionTimeMinutes || 0), 0),
    averageSatisfaction: calculateAverageSatisfaction(tasks),
  };

  // Helper function to check if task is overdue
  const isTaskOverdue = (task: Task): boolean => {
    if (!task.scheduledFor || task.status === 'completed') return false;
    const taskTime = new Date(task.scheduledFor);
    const now = new Date();
    const hoursOverdue = (now.getTime() - taskTime.getTime()) / (1000 * 60 * 60);
    return hoursOverdue > 2; // 2 hour buffer before considering overdue
  };

  // Get task status with proper overdue logic
  const getTaskStatus = (task: Task): 'completed' | 'overdue' | 'pending' | 'upcoming' => {
    if (task.status === 'completed') return 'completed';
    if (task.status === 'skipped') return 'overdue';
    
    if (task.scheduledFor) {
      if (isTaskOverdue(task)) {
        return 'overdue';
      }
      
      const taskTime = new Date(task.scheduledFor);
      const now = new Date();
      const hoursUntil = (taskTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntil > 1) {
        return 'upcoming';
      }
    }
    
    return 'pending';
  };

  return {
    // Data
    tasks,
    todaysTasks,
    overdueTasks,
    upcomingTasks,
    recurringTasks,
    taskStats,
    
    // Helper functions
    isTaskOverdue,
    getTaskStatus,
    
    // Loading states
    isLoading,
    error,
    
    // Mutations
    createTask: createTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    skipTask: skipTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    rescheduleTask: rescheduleTaskMutation.mutate,
    
    // Mutation states
    isCreating: createTaskMutation.isPending,
    isCompleting: completeTaskMutation.isPending,
    isSkipping: skipTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isRescheduling: rescheduleTaskMutation.isPending,
  };
}