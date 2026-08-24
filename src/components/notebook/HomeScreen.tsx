import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import type { FocusWithAttributes } from '../../types';
import { AttributeRow } from './AttributeRow';
import { Button, Input } from '../ui';
import { NotebookScroll } from './NotebookScroll';
import { DrawingToolbar } from '../drawing/DrawingToolbar';
import { useDrawing } from '../../hooks/useDrawing';
import { Colors, Fonts, Spacing, Typography } from '../../utils/constants';
import { formatWeekLabel, getWeekStart } from '../../utils/week';

interface HomeScreenProps {
  userId: string;
  focuses: FocusWithAttributes[];
  loading: boolean;
  needsCheckIn: boolean;
  isDemoMode?: boolean;
  onOpenFocus: (focusId: string) => void;
  onCreateFocus: (title: string) => Promise<void>;
  onStartCheckIn: () => void;
  onSignOut: () => void;
}

export function HomeScreen({
  userId,
  focuses,
  loading,
  needsCheckIn,
  isDemoMode,
  onOpenFocus,
  onCreateFocus,
  onStartCheckIn,
  onSignOut,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const drawing = useDrawing(userId, 'home');

  const weekLabel = useMemo(() => formatWeekLabel(getWeekStart()), []);

  const submitFocus = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onCreateFocus(title.trim());
      setTitle('');
      setAddOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brand}>Baseline</Text>
          <Text style={styles.week}>{weekLabel}</Text>
        </View>
        <View style={styles.topActions}>
          <DrawingToolbar
            drawMode={drawing.drawMode}
            onToggle={() => drawing.setDrawMode(!drawing.drawMode)}
            onUndo={drawing.undo}
            onClear={drawing.clear}
            strokeCount={drawing.strokes.length}
          />
          <TouchableOpacity onPress={onSignOut} hitSlop={8}>
            <Text style={styles.signOut}>{isDemoMode ? 'Reset demo' : 'Leave'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.page}>
        <NotebookScroll
          strokes={drawing.strokes}
          drawMode={drawing.drawMode}
          onStrokeEnd={drawing.addStroke}
          contentContainerStyle={styles.scroll}
          scrollBottomInset={insets.bottom + 100}
        >
          <Text style={styles.headline}>Your focuses</Text>
          <Text style={styles.lede}>
            Score what you care about. Rate yourself again each week — big jumps by typing, small shifts with +/−.
          </Text>

          {needsCheckIn && focuses.some((f) => f.attributes.length > 0) ? (
            <TouchableOpacity style={styles.checkBanner} onPress={onStartCheckIn} activeOpacity={0.85}>
              <Text style={styles.checkTitle}>This week’s check-in is open</Text>
              <Text style={styles.checkSub}>Take a minute. Honest numbers only.</Text>
            </TouchableOpacity>
          ) : null}

          {loading ? (
            <Text style={styles.empty}>Opening notebook…</Text>
          ) : focuses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.empty}>
                Start with one focus — tennis, writing, health, whatever you’re actually building.
              </Text>
              <Button title="Add a focus" onPress={() => setAddOpen(true)} />
            </View>
          ) : (
            focuses.map((focus) => (
              <TouchableOpacity
                key={focus.id}
                style={styles.focusBlock}
                onPress={() => onOpenFocus(focus.id)}
                activeOpacity={0.8}
                disabled={drawing.drawMode}
              >
                <Text style={styles.focusTitle}>{focus.title}</Text>
                {focus.attributes.length === 0 ? (
                  <Text style={styles.noAttrs}>No attributes yet — open to add them</Text>
                ) : (
                  focus.attributes.map((attr) => (
                    <AttributeRow key={attr.id} attribute={attr} compact />
                  ))
                )}
              </TouchableOpacity>
            ))
          )}

          {focuses.length > 0 ? (
            <TouchableOpacity style={styles.addRow} onPress={() => setAddOpen(true)} disabled={drawing.drawMode}>
              <Plus size={18} color={Colors.accent} strokeWidth={2} />
              <Text style={styles.addText}>Another focus</Text>
            </TouchableOpacity>
          ) : null}
        </NotebookScroll>
      </View>

      <Modal visible={addOpen} animationType="fade" transparent onRequestClose={() => setAddOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New focus</Text>
            <Input
              label="What are you mastering"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Tennis mastery"
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setAddOpen(false)} style={{ flex: 1 }} />
              <Button title="Add" onPress={submitFocus} loading={saving} style={{ flex: 1 }} />
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
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.paperLine,
  },
  brand: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl2,
    color: Colors.ink,
  },
  week: {
    fontFamily: Fonts.body,
    fontSize: Typography.sm,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  topActions: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  signOut: {
    fontFamily: Fonts.body,
    fontSize: Typography.sm,
    color: Colors.inkFaint,
  },
  page: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  headline: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl3,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  lede: {
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    color: Colors.inkMuted,
    lineHeight: 24,
    marginBottom: Spacing.lg,
    maxWidth: 520,
  },
  checkBanner: {
    backgroundColor: Colors.accentSoft,
    padding: Spacing.md,
    borderRadius: 6,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  checkTitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: Typography.base,
    color: Colors.ink,
  },
  checkSub: {
    fontFamily: Fonts.body,
    fontSize: Typography.sm,
    color: Colors.inkMuted,
    marginTop: 4,
  },
  focusBlock: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.margin,
  },
  focusTitle: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  noAttrs: {
    fontFamily: Fonts.body,
    fontSize: Typography.sm,
    color: Colors.inkFaint,
    fontStyle: 'italic',
  },
  empty: {
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    color: Colors.inkMuted,
    lineHeight: 24,
  },
  emptyBox: {
    gap: Spacing.lg,
    marginTop: Spacing.md,
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
