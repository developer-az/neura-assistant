import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../ui';
import { Colors, Fonts, Spacing, Typography } from '../../utils/constants';

interface ClaimNotebookProps {
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  onSignUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  configured: boolean;
}

export function ClaimNotebook({ onSignIn, onSignUp, configured }: ClaimNotebookProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'claim' | 'open'>('claim');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Email and password keep this notebook yours.');
      return;
    }
    setLoading(true);
    try {
      const result =
        mode === 'claim'
          ? await onSignUp(email.trim(), password, name.trim() || undefined)
          : await onSignIn(email.trim(), password);
      if (result.error) {
        setError(result.error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Baseline</Text>
        <Text style={styles.line}>
          Your focuses. Your scores. Yours alone.
        </Text>
        <Text style={styles.sub}>
          Claim this notebook once — it stays with your account, not as a task list chasing you.
        </Text>

        {!configured ? (
          <View style={styles.warnBox}>
            <Text style={styles.warn}>
              Connect Supabase in your env file to claim a notebook. Until then, the pages stay locked.
            </Text>
          </View>
        ) : (
          <View style={styles.form}>
            {mode === 'claim' ? (
              <Input
                label="What should we call you"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                placeholder="Optional"
              />
            ) : null}
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title={mode === 'claim' ? 'Claim notebook' : 'Open notebook'}
              onPress={submit}
              loading={loading}
              size="large"
            />
            <Button
              title={mode === 'claim' ? 'Already claimed? Open it' : 'Need one? Claim a notebook'}
              variant="ghost"
              onPress={() => {
                setMode(mode === 'claim' ? 'open' : 'claim');
                setError(null);
              }}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.paper,
    paddingHorizontal: Spacing.lg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing.md,
  },
  brand: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl4,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  line: {
    fontFamily: Fonts.displayRegular,
    fontSize: Typography.xl,
    color: Colors.ink,
    lineHeight: 30,
  },
  sub: {
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    color: Colors.inkMuted,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  form: {
    gap: Spacing.md,
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: Typography.sm,
    color: Colors.danger,
  },
  warnBox: {
    padding: Spacing.md,
    backgroundColor: Colors.accentSoft,
    borderRadius: 6,
  },
  warn: {
    fontFamily: Fonts.body,
    fontSize: Typography.sm,
    color: Colors.ink,
    lineHeight: 20,
  },
});
