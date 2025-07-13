import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { Button } from '../../ui/Button';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface QuickTaskCreatorProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (task: any) => void;
  isLoading?: boolean;
}

export const QuickTaskCreator: React.FC<QuickTaskCreatorProps> = ({
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter a tab title');
      return;
    }

    if (!description.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please add details to your tab');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Set default time to 1 hour from now
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0); // Round to nearest hour

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      difficulty_level: difficulty,
      energy_requirement: energy,
      scheduled_for: now.toISOString(),
      estimated_duration_minutes: duration,
      status: 'pending',
      is_recurring: false,
    };

    onSubmit(newTask);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDifficulty(2);
    setEnergy('medium');
    setDuration(30);
    setShowAdvanced(false);
    onClose();
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return '#10b981';
      case 2: return '#10b981';
      case 3: return '#f59e0b';
      case 4: return '#ef4444';
      case 5: return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'low': return '🌱';
      case 'medium': return '⚡';
      case 'high': return '🔥';
      default: return '⚡';
    }
  };

  const getExampleTabs = () => {
    return [
      { title: 'Wash Face', description: '1. Use gentle cleanser\n2. Apply toner\n3. Moisturize with SPF\n4. Pat dry gently' },
      { title: 'Morning Exercise', description: '1. 10 min stretching\n2. 20 min cardio\n3. 10 min strength training\n4. Cool down stretches' },
      { title: 'Study Session', description: '1. Review notes from yesterday\n2. Read new chapter\n3. Take practice quiz\n4. Summarize key points' },
    ];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create New Tab</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Tab Title */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>What's your tab called?</Text>
              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Wash Face, Morning Exercise, Study Session"
                placeholderTextColor={Colors.textSecondary}
                autoFocus
                maxLength={50}
              />
            </View>

            {/* Tab Details */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>What's inside your tab?</Text>
              <Text style={styles.subLabel}>
                Add your specific routine, steps, or details
              </Text>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="1. First step...\n2. Second step...\n3. Third step..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={6}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Examples */}
            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>💡 Examples:</Text>
              {getExampleTabs().map((example, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.exampleItem}
                  onPress={() => {
                    setTitle(example.title);
                    setDescription(example.description);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.exampleTitle}>{example.title}</Text>
                  <Text style={styles.exampleDescription} numberOfLines={2}>
                    {example.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Settings */}
            <View style={styles.quickSettings}>
              {/* Difficulty */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Difficulty</Text>
                <View style={styles.difficultyButtons}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => {
                        setDifficulty(level);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[
                        styles.difficultyButton,
                        difficulty === level && {
                          backgroundColor: getDifficultyColor(level),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.difficultyButtonText,
                          difficulty === level && styles.difficultyButtonTextActive,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Energy Level */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Energy Level</Text>
                <View style={styles.energyButtons}>
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => {
                        setEnergy(level);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[
                        styles.energyButton,
                        energy === level && styles.energyButtonActive,
                      ]}
                    >
                      <Text style={styles.energyButtonText}>
                        {getEnergyIcon(level)}
                      </Text>
                      <Text
                        style={[
                          styles.energyButtonLabel,
                          energy === level && styles.energyButtonLabelActive,
                        ]}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.settingSection}>
                <Text style={styles.settingLabel}>Duration</Text>
                <View style={styles.durationButtons}>
                  {[15, 30, 45, 60, 90].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      onPress={() => {
                        setDuration(mins);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[
                        styles.durationButton,
                        duration === mins && styles.durationButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.durationButtonText,
                          duration === mins && styles.durationButtonTextActive,
                        ]}
                      >
                        {mins}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Create Tab"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
              textStyle={styles.submitButtonText}
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.md,
    maxHeight: '90%',
    // Add shadow for popup effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
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
  content: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  inputSection: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  titleInput: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
    padding: Spacing.sm,
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    fontWeight: '600',
  },
  descriptionInput: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    padding: Spacing.sm,
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  examplesSection: {
    marginBottom: Spacing.md,
  },
  examplesTitle: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  exampleItem: {
    backgroundColor: Colors.gray50,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  exampleTitle: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  exampleDescription: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  quickSettings: {
    gap: Spacing.md,
  },
  settingSection: {
    gap: Spacing.xs,
  },
  settingLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  difficultyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  difficultyButtonTextActive: {
    color: Colors.white,
  },
  energyButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  energyButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  energyButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  energyButtonText: {
    fontSize: Typography.md,
  },
  energyButtonLabel: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  energyButtonLabelActive: {
    color: Colors.primary,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  durationButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  durationButtonText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  durationButtonTextActive: {
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.md,
  },
  submitButtonText: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.white,
  },
}); 