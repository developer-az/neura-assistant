import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Tables, InsertTables, UpdateTables } from '../lib/supabase';

type Goal = Tables<'goals'>;
type NewGoal = InsertTables<'goals'>;
type UpdateGoal = UpdateTables<'goals'>;

export function useGoals(userId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch all goals for user
  const {
    data: goals = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['goals', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!userId,
  });

  // Get active goals only
  const activeGoals = goals.filter(goal => goal.status === 'active');

  // Create new goal
  const createGoalMutation = useMutation({
    mutationFn: async (newGoal: NewGoal) => {
      const { data, error } = await supabase
        .from('goals')
        .insert(newGoal)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  // Update goal
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateGoal }) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  // Update goal progress
  const updateGoalProgressMutation = useMutation({
    mutationFn: async ({ goalId, percentage }: { goalId: string; percentage: number }) => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('goals')
        .update({ 
          completion_percentage: Math.min(100, Math.max(0, percentage)),
          status: percentage >= 100 ? 'completed' : 'active'
        })
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  // Delete goal
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      if (!userId) throw new Error('User ID required');

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);

      if (error) throw error;
      return goalId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    },
  });

  // Calculate goal stats
  const goalStats = {
    total: goals.length,
    active: activeGoals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    paused: goals.filter(g => g.status === 'paused').length,
    averageProgress: goals.length > 0 
      ? Math.round(goals.reduce((sum, goal) => sum + goal.completion_percentage, 0) / goals.length)
      : 0,
  };

  return {
    // Data
    goals,
    activeGoals,
    goalStats,
    
    // Loading states
    isLoading,
    error,
    
    // Mutations
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    updateGoalProgress: updateGoalProgressMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    
    // Mutation states
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isUpdatingProgress: updateGoalProgressMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  };
}