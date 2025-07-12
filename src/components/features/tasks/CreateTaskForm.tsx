import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { RecurrenceConfig } from '../../../types';

interface CreateTaskFormProps {
  onClose: () => void;
  onSubmit: (task: any) => void;
  goals: any[];
  isLoading?: boolean;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  onClose,
  onSubmit,
  goals,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [goalId, setGoalId] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>({});

  // Set default time to 1 hour from now
  React.useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const timeString = now.toTimeString().slice(0, 5); // HH:MM format
    setScheduledTime(timeString);
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!scheduledTime) {
      Alert.alert('Error', 'Please set a scheduled time');
      return;
    }

    // Create scheduled date - default to today with specified time
    const today = new Date();
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    today.setHours(hours, minutes, 0, 0);

    const newTask = {
      title: title.trim(),
      description: description.trim() || null,
      difficulty_level: difficulty,
      energy_requirement: energy,
      goal_id: goalId,
      scheduled_for: today.toISOString(),
      estimated_duration_minutes: parseInt(duration) || 30,
      status: 'pending',
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      recurrence_config: isRecurring ? recurrenceConfig : null,
    };

    onSubmit(newTask);
    onClose();
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return '#10b981';
    if (level === 3) return '#f59e0b';
    return '#ef4444';
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'low': return '🌱';
      case 'medium': return '⚡';
      case 'high': return '🔥';
      default: return '⚡';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: '#10b981',
      learning: '#6366f1',
      career: '#f59e0b',
      habits: '#818cf8',
      finance: '#8b5cf6',
      relationships: '#ec4899',
      personal: '#6b7280',
    };
    return colors[category] || '#6b7280';
  };

  return (
    <Card style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create New Task</Text>
        
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Details</Text>
          
          <Input
            label="Task Title"
            value={title}
            onChangeText={setTitle}
            placeholder="What do you want to accomplish?"
            required
          />

          <Input
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Add any additional details..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Scheduling */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          
          <View style={styles.row}>
            <View style={styles.column}>
              <Input
                label="Time (HH:MM)"
                value={scheduledTime}
                onChangeText={setScheduledTime}
                placeholder="14:30"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Input
                label="Duration (minutes)"
                value={duration}
                onChangeText={setDuration}
                placeholder="30"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Recurring Settings */}
        <View style={styles.section}>
          <View style={styles.recurringHeader}>
            <Text style={styles.sectionTitle}>Recurring</Text>
            <TouchableOpacity
              onPress={() => setIsRecurring(!isRecurring)}
              style={[styles.toggleButton, isRecurring && styles.toggleButtonActive]}
            >
              <Text style={[styles.toggleText, isRecurring && styles.toggleTextActive]}>
                {isRecurring ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {isRecurring && (
            <View style={styles.recurringOptions}>
              <Text style={styles.label}>Repeat every:</Text>
              <View style={styles.patternButtons}>
                {(['daily', 'weekly', 'monthly'] as const).map((pattern) => (
                  <TouchableOpacity
                    key={pattern}
                    onPress={() => setRecurrencePattern(pattern)}
                    style={[
                      styles.patternButton,
                      recurrencePattern === pattern && styles.patternButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.patternButtonText,
                      recurrencePattern === pattern && styles.patternButtonTextActive,
                    ]}>
                      {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Goal Linking */}
        {goals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Link to Goal (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.goalButtons}>
                <TouchableOpacity
                  onPress={() => setGoalId(null)}
                  style={[
                    styles.goalButton,
                    !goalId && styles.goalButtonActive,
                  ]}
                >
                  <Text style={[
                    styles.goalButtonText,
                    !goalId && styles.goalButtonTextActive,
                  ]}>
                    None
                  </Text>
                </TouchableOpacity>
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => setGoalId(goal.id)}
                    style={[
                      styles.goalButton,
                      { backgroundColor: getCategoryColor(goal.category) + '20' },
                      goalId === goal.id && styles.goalButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.goalButtonText,
                      { color: getCategoryColor(goal.category) },
                      goalId === goal.id && styles.goalButtonTextActive,
                    ]}>
                      {goal.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Difficulty and Energy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Task Properties</Text>
          
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Difficulty Level</Text>
              <View style={styles.difficultyButtons}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setDifficulty(level)}
                    style={[
                      styles.difficultyButton,
                      { backgroundColor: getDifficultyColor(level) },
                      difficulty === level && styles.difficultyButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      difficulty === level && styles.difficultyButtonTextActive,
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Energy Level</Text>
              <View style={styles.energyButtons}>
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setEnergy(level)}
                    style={[
                      styles.energyButton,
                      energy === level && styles.energyButtonActive,
                    ]}
                  >
                    <Text style={styles.energyButtonText}>
                      {getEnergyIcon(level)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            style={styles.cancelButton}
          />
          <Button
            title="Create Task"
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  title: {
    fontSize: Typography.xl2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: Colors.gray200,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.background,
  },
  recurringOptions: {
    marginTop: Spacing.md,
  },
  patternButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  patternButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
  },
  patternButtonActive: {
    backgroundColor: Colors.primary,
  },
  patternButtonText: {
    fontSize: Typography.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  patternButtonTextActive: {
    color: Colors.background,
  },
  goalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  goalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.gray200,
    minWidth: 80,
    alignItems: 'center',
  },
  goalButtonActive: {
    backgroundColor: Colors.primary,
  },
  goalButtonText: {
    fontSize: Typography.xs,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  goalButtonTextActive: {
    color: Colors.background,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  difficultyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    borderWidth: 2,
    borderColor: Colors.background,
  },
  difficultyButtonText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.background,
  },
  difficultyButtonTextActive: {
    color: Colors.background,
  },
  energyButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  energyButton: {
    width: 40,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyButtonActive: {
    backgroundColor: Colors.primary,
  },
  energyButtonText: {
    fontSize: Typography.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.success,
  },
}); 