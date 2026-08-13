import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus } from 'lucide-react-native';
import type { FocusWithAttributes, WeeklyRating } from '../../types';
import { AttributeRow } from './AttributeRow';
import { Button, Input } from '../ui';
import { DrawingOverlay } from '../drawing/DrawingOverlay';
import { DrawingToolbar } from '../drawing/DrawingToolbar';
import { useDrawing } from '../../hooks/useDrawing';
import { Colors, Fonts, Spacing, Typography, SCORE_MAX } from '../../utils/constants';
import { clampScore, getWeekStart } from '../../utils/week';

interface FocusScreenProps {
  userId: string;
  focus: FocusWithAttributes;
  ratings: WeeklyRating[];
  onBack: () => void;
  onAddAttribute: (name: string, score: number) => Promise<void>;
  onStartCheckIn: () => void;
  onArchiveFocus: () => Promise<void>;
}

export function FocusScreen({
  userId,
  focus,
  ratings,
  onBack,
  onAddAttribute,
  onStartCheckIn,
  onArchiveFocus,
}: FocusScreenProps) {
  const insets = useSafeAreaInsets();
  const drawing = useDrawing(userId, `focus:${focus.id}`);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [scoreText, setScoreText] = useState('5');
  const [saving, setSaving] = useState(false);

  const weekStart = getWeekStart();
  const deltaByAttr = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of ratings) {
      if (r.week_start === weekStart) {
        map.set(r.attribute_id, r.delta);
      }
    }
    return map;
  }, [ratings, weekStart]);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const score = clampScore(parseFloat(scoreText) || 5, 0, SCORE_MAX);
      await onAddAttribute(name.trim(), score);
      setName('');
      setScoreText('5');
      setAddOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.back} onPress={onBack} hitSlop={8}>
          <ArrowLeft size={20} color={Colors.ink} strokeWidth={2} />
          <Text style={styles.backText}>All focuses</Text>
        </TouchableOpacity>
        <DrawingToolbar
          drawMode={drawing.drawMode}
          onToggle={() => drawing.setDrawMode(!drawing.drawMode)}
          onUndo={drawing.undo}
          onClear={drawing.clear}
          strokeCount={drawing.strokes.length}
        />
      </View>

      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
          scrollEnabled={!drawing.drawMode}
        >
          <Text style={styles.title}>{focus.title}</Text>
          {focus.notes ? <Text style={styles.notes}>{focus.notes}</Text> : null}
          <Text style={styles.lede}>
            Break mastery into the pieces that matter. Your latest score always sits here.
          </Text>

          {focus.attributes.length === 0 ? (
            <Text style={styles.empty}>Add attributes — forehand, serve, footwork… whatever the craft is made of.</Text>
          ) : (
            focus.attributes.map((attr) => (
              <AttributeRow
                key={attr.id}
                attribute={attr}
                delta={deltaByAttr.get(attr.id) ?? null}
              />
            ))
          )}

          <TouchableOpacity
            style={styles.addRow}
            onPress={() => setAddOpen(true)}
            disabled={drawing.drawMode}
          >
            <Plus size={18} color={Colors.accent} strokeWidth={2} />
            <Text style={styles.addText}>Add attribute</Text>
          </TouchableOpacity>

          {focus.attributes.length > 0 ? (
            <Button
              title="Weekly check-in"
              onPress={onStartCheckIn}
              style={{ marginTop: Spacing.lg }}
              disabled={drawing.drawMode}
            />
          ) : null}

          <TouchableOpacity
            style={styles.archive}
            onPress={onArchiveFocus}
            disabled={drawing.drawMode}
          >
            <Text style={styles.archiveText}>Archive this focus</Text>
          </TouchableOpacity>
        </ScrollView>

        <DrawingOverlay
          strokes={drawing.strokes}
          enabled={drawing.drawMode}
          onStrokeEnd={drawing.addStroke}
        />
      </View>

      <Modal visible={addOpen} animationType="fade" transparent onRequestClose={() => setAddOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New attribute</Text>
            <Input
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Forehand"
              autoFocus
            />
            <Input
              label="Starting score (0–10)"
              value={scoreText}
              onChangeText={setScoreText}
              keyboardType="decimal-pad"
              placeholder="5"
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setAddOpen(false)} style={{ flex: 1 }} />
              <Button title="Add" onPress={submit} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paperLine,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.ink,
  },
  page: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl3,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  notes: {
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    color: Colors.inkMuted,
    marginBottom: Spacing.sm,
  },
  lede: {
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    color: Colors.inkMuted,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  empty: {
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    color: Colors.inkFaint,
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
  },
  addText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.base,
    color: Colors.accent,
  },
  archive: {
    marginTop: Spacing.xl2,
    paddingVertical: Spacing.md,
  },
  archiveText: {
    fontFamily: Fonts.body,
    fontSize: Typography.sm,
    color: Colors.inkFaint,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26,35,50,0.35)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.paper,
    borderRadius: 8,
    padding: Spacing.lg,
    gap: Spacing.md,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl,
    color: Colors.ink,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
