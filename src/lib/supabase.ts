import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
          subscription_tier: string;
          preferences: any;
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          subscription_tier?: string;
          preferences?: any;
          push_token?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          subscription_tier?: string;
          preferences?: any;
          push_token?: string | null;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: 'health' | 'career' | 'learning' | 'habits' | 'finance' | 'relationships' | 'personal';
          priority: string;
          target_date: string | null;
          status: 'active' | 'paused' | 'completed' | 'archived';
          completion_percentage: number;
          ai_generated: boolean;
          original_prompt: string | null;
          success_criteria: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          description?: string | null;
          category: 'health' | 'career' | 'learning' | 'habits' | 'finance' | 'relationships' | 'personal';
          priority?: string;
          target_date?: string | null;
          status?: 'active' | 'paused' | 'completed' | 'archived';
          completion_percentage?: number;
          ai_generated?: boolean;
          original_prompt?: string | null;
          success_criteria?: any;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: 'health' | 'career' | 'learning' | 'habits' | 'finance' | 'relationships' | 'personal';
          priority?: string;
          target_date?: string | null;
          status?: 'active' | 'paused' | 'completed' | 'archived';
          completion_percentage?: number;
          success_criteria?: any;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          title: string;
          description: string | null;
          scheduled_for: string | null;
          estimated_duration_minutes: number | null;
          difficulty_level: number;
          energy_requirement: 'low' | 'medium' | 'high';
          status: 'pending' | 'in_progress' | 'completed' | 'skipped';
          completed_at: string | null;
          skipped_at: string | null;
          streak_count: number;
          ai_generated: boolean;
          context: any;
          is_recurring: boolean;
          recurrence_pattern: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
          recurrence_config: any;
          parent_task_id: string | null;
          next_occurrence: string | null;
          completion_count: number;
          total_completion_time_minutes: number;
          average_completion_time_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          goal_id?: string | null;
          title: string;
          description?: string | null;
          scheduled_for?: string | null;
          estimated_duration_minutes?: number | null;
          difficulty_level?: number;
          energy_requirement?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in_progress' | 'completed' | 'skipped';
          streak_count?: number;
          ai_generated?: boolean;
          context?: any;
          is_recurring?: boolean;
          recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
          recurrence_config?: any;
          parent_task_id?: string | null;
          next_occurrence?: string | null;
          completion_count?: number;
          total_completion_time_minutes?: number;
          average_completion_time_minutes?: number;
        };
        Update: {
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
          recurrence_config?: any;
          parent_task_id?: string | null;
          next_occurrence?: string | null;
          completion_count?: number;
          total_completion_time_minutes?: number;
          average_completion_time_minutes?: number;
        };
      };
      insights: {
        Row: {
          id: string;
          user_id: string;
          type: 'pattern_recognition' | 'behavioral_coaching' | 'achievement' | 'suggestion';
          title: string;
          description: string;
          confidence: number;
          actionable: boolean;
          icon: string;
          metadata: any;
          read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          type: 'pattern_recognition' | 'behavioral_coaching' | 'achievement' | 'suggestion';
          title: string;
          description: string;
          confidence: number;
          actionable: boolean;
          icon: string;
          metadata?: any;
          read_at?: string | null;
        };
        Update: {
          type?: 'pattern_recognition' | 'behavioral_coaching' | 'achievement' | 'suggestion';
          title?: string;
          description?: string;
          confidence?: number;
          actionable?: boolean;
          icon?: string;
          metadata?: any;
          read_at?: string | null;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];