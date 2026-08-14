import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DrawingStroke } from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your_supabase'));

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

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
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          preferences?: Record<string, unknown>;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          preferences?: Record<string, unknown>;
        };
      };
      focuses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string;
          sort_order: number;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          notes?: string;
          sort_order?: number;
          archived?: boolean;
        };
        Update: {
          title?: string;
          notes?: string;
          sort_order?: number;
          archived?: boolean;
        };
      };
      attributes: {
        Row: {
          id: string;
          user_id: string;
          focus_id: string;
          name: string;
          current_score: number;
          sort_order: number;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          focus_id: string;
          name: string;
          current_score?: number;
          sort_order?: number;
          archived?: boolean;
        };
        Update: {
          name?: string;
          current_score?: number;
          sort_order?: number;
          archived?: boolean;
        };
      };
      weekly_ratings: {
        Row: {
          id: string;
          user_id: string;
          attribute_id: string;
          week_start: string;
          score: number;
          delta: number;
          note: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          attribute_id: string;
          week_start: string;
          score: number;
          delta?: number;
          note?: string;
        };
        Update: {
          score?: number;
          delta?: number;
          note?: string;
        };
      };
      page_drawings: {
        Row: {
          id: string;
          user_id: string;
          page_key: string;
          strokes: DrawingStroke[];
          updated_at: string;
        };
        Insert: {
          user_id: string;
          page_key: string;
          strokes?: DrawingStroke[];
        };
        Update: {
          strokes?: DrawingStroke[];
          updated_at?: string;
        };
      };
    };
  };
}
