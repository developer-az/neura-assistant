import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isDemoMode, DEMO_USER_ID } from '../lib/demoMode';
import { localStore } from '../lib/localStore';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const demoUser = {
  id: DEMO_USER_ID,
  email: 'demo@local.baseline',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    if (isDemoMode) {
      setAuthState({ user: demoUser, session: null, loading: false });
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut();
      }
      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && !session) {
        await supabase.auth.signOut();
        return;
      }

      setAuthState({
        session,
        user: session?.user ?? null,
        loading: false,
      });

      if (event === 'SIGNED_IN' && session?.user) {
        await ensureProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
        });
      } else if (profile) {
        // profile exists
      }
    } catch {
      // non-blocking
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (isDemoMode) {
      return { data: null, error: new Error('Supabase is not configured') };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error: unknown) {
      return { data: null, error: error as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    if (isDemoMode) {
      return { data: null, error: new Error('Supabase is not configured') };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || '' } },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error: unknown) {
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      await localStore.reset();
      setAuthState({ user: demoUser, session: null, loading: false });
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: unknown) {
      return { error: error as Error };
    }
  };

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isAuthenticated: isDemoMode || !!authState.user,
    isConfigured: isSupabaseConfigured,
    isDemoMode,
  };
}
