import { isSupabaseConfigured } from './supabase';

/** True when Supabase env vars are missing — app runs on device-local storage. */
export const isDemoMode = !isSupabaseConfigured;

export const DEMO_USER_ID = 'baseline-demo-user';
