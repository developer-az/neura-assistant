import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Dimensions,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { Button } from '../../ui/Button';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface TabCreatorModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (tab: any) => void;
  isLoading?: boolean;
}

export const TabCreatorModal: React.FC<TabCreatorModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [duration, setDuration] = useState(30);

  const handleSubmit = () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (!description.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);
    const newTab = {
      title: title.trim(),
      description: description.trim(),
      difficulty_level: difficulty,
      energy_requirement: energy,
      scheduled_for: now.toISOString(),
      estimated_duration_minutes: duration,
      status: 'pending',
      is_recurring: false,
    };
    onSubmit(newTab);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDifficulty(2);
    setEnergy('medium');
    setDuration(30);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.fullscreen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.fullscreenWhite}>
          <View style={styles.centered}>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Create New Tab</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              {/* Inputs */}
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Tab name"
                placeholderTextColor={Colors.textSecondary}
                maxLength={50}
              />
              <TextInput
                style={[styles.input, styles.textarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Tab details, steps, or notes"
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={300}
              />
              {/* Quick Settings */}
              <View style={styles.row}>
                <Text style={styles.label}>Difficulty</Text>
                <View style={styles.difficultyRow}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[styles.diffBtn, difficulty === level && styles.diffBtnActive]}
                      onPress={() => setDifficulty(level)}
                    >
                      <Text style={[styles.diffBtnText, difficulty === level && styles.diffBtnTextActive]}>{level}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Energy</Text>
                <View style={styles.energyRow}>
                  {(['low', 'medium', 'high'] as const).map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[styles.energyBtn, energy === level && styles.energyBtnActive]}
                      onPress={() => setEnergy(level)}
                    >
                      <Text style={styles.energyBtnText}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Duration</Text>
                <View style={styles.durationRow}>
                  {[15, 30, 45, 60, 90].map(mins => (
                    <TouchableOpacity
                      key={mins}
                      style={[styles.durationBtn, duration === mins && styles.durationBtnActive]}
                      onPress={() => setDuration(mins)}
                    >
                      <Text style={[styles.durationBtnText, duration === mins && styles.durationBtnTextActive]}>{mins}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {/* Footer */}
              <Button
                title="Create Tab"
                onPress={handleSubmit}
                loading={isLoading}
                style={styles.submitButton}
                textStyle={styles.submitButtonText}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  fullscreenWhite: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  card: {
    width: width > 500 ? 400 : '92%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  input: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  textarea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    width: 80,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 4,
  },
  diffBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  diffBtnActive: {
    backgroundColor: Colors.primary,
  },
  diffBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  diffBtnTextActive: {
    color: Colors.white,
  },
  energyRow: {
    flexDirection: 'row',
    gap: 4,
  },
  energyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    marginHorizontal: 2,
  },
  energyBtnActive: {
    backgroundColor: Colors.primary,
  },
  energyBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: Typography.sm,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 4,
  },
  durationBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    marginHorizontal: 2,
  },
  durationBtnActive: {
    backgroundColor: Colors.primary,
  },
  durationBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: Typography.sm,
  },
  durationBtnTextActive: {
    color: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  submitButtonText: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.white,
  },
}); 