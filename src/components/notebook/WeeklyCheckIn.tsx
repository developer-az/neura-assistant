import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Attribute } from '../../types';
import { Button } from '../ui';
import { ScoreControl } from './ScoreControl';
import { Colors, Fonts, Spacing, Typography } from '../../utils/constants';
import { clampScore, formatDelta, formatScore, formatWeekLabel } from '../../utils/week';

interface WeeklyCheckInProps {
  visible: boolean;
  attributes: Attribute[];
  weekStart: string;
  alreadyRatedIds: Set<string>;
  onClose: () => void;
  onSave: (entries: { attribute_id: string; score: number; previous_score: number; note?: string }[]) => Promise<void>;
}

export function WeeklyCheckIn({
  visible,
  attributes,
  weekStart,
  alreadyRatedIds,
  onClose,
  onSave,
}: WeeklyCheckInProps) {
  const insets = useSafeAreaInsets();
  const pending = useMemo(
    () => attributes.filter((a) => !alreadyRatedIds.has(a.id)),
    [attributes, alreadyRatedIds]
  );

  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [index, setIndex] = useState(0);

  const list = pending.length > 0 ? pending : attributes;
  const current = list[index];

  React.useEffect(() => {
    if (visible) {
      const initial: Record<string, number> = {};
      for (const a of attributes) {
        initial[a.id] = Number(a.current_score);
      }
      setDrafts(initial);
      setIndex(0);
    }
  }, [visible, attributes]);

  if (!current) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={[styles.sheet, { paddingTop: insets.top + 24 }]}>
          <Text style={styles.title}>Nothing to rate</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </Modal>
    );
  }

  const draft = drafts[current.id] ?? Number(current.current_score);
  const delta = draft - Number(current.current_score);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const entries = list.map((a) => ({
        attribute_id: a.id,
        score: clampScore(drafts[a.id] ?? Number(a.current_score)),
        previous_score: Number(a.current_score),
      }));
      await onSave(entries);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.sheet, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>This week</Text>
            <Text style={styles.title}>{formatWeekLabel(weekStart)}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.skip}>Later</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.progress}>
          {index + 1} of {list.length}
        </Text>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.attrName}>{current.name}</Text>
          <Text style={styles.was}>Was {formatScore(Number(current.current_score))}</Text>

          <ScoreControl
            value={draft}
            onChange={(next) => setDrafts((d) => ({ ...d, [current.id]: next }))}
          />

          <Text style={[styles.deltaLine, delta > 0 ? styles.up : delta < 0 ? styles.down : null]}>
            {delta === 0 ? 'No change yet' : `${formatDelta(delta)} this week`}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Back"
            variant="ghost"
            onPress={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            style={styles.footerBtn}
          />
          {index < list.length - 1 ? (
            <Button
              title="Next"
              onPress={() => setIndex((i) => i + 1)}
              style={styles.footerBtn}
            />
          ) : (
            <Button
              title="Save week"
              onPress={handleSaveAll}
              loading={saving}
              style={styles.footerBtn}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: Colors.paper,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  eyebrow: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.xs,
    color: Colors.inkMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl2,
    color: Colors.ink,
    marginTop: 4,
  },
  skip: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.base,
    color: Colors.inkMuted,
    padding: Spacing.sm,
  },
  progress: {
    fontFamily: Fonts.body,
    fontSize: Typography.sm,
    color: Colors.inkFaint,
    marginBottom: Spacing.lg,
  },
  body: {
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  attrName: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl3,
    color: Colors.ink,
  },
  was: {
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    color: Colors.inkMuted,
    marginBottom: Spacing.md,
  },
  deltaLine: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.lg,
    color: Colors.inkMuted,
    marginTop: Spacing.md,
  },
  up: { color: Colors.up },
  down: { color: Colors.down },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  footerBtn: {
    flex: 1,
  },
});
