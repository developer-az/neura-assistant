import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';

const { width } = Dimensions.get('window');

interface QuickAddTaskProps {
  onSubmit: (task: { 
    title: string; 
    difficulty_level: number; 
    energy_requirement: string;
    scheduled_for: string;
    is_recurring: boolean;
    recurrence_pattern: string | null;
    estimated_duration_minutes: number;
  }) => void;
  isLoading: boolean;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({ onSubmit, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState(2);
  const [selectedEnergy, setSelectedEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduledTime, setScheduledTime] = useState<Date>(new Date());
  
  const [expandAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  React.useEffect(() => {
    // Glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, []);

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(expandAnim, {
        toValue,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(scaleAnim, {
        toValue: isExpanded ? 1 : 0.98,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleSubmit = () => {
    if (!taskTitle.trim()) return;

    // Success animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 3,
      }),
    ]).start();

    onSubmit({
      title: taskTitle.trim(),
      difficulty_level: selectedDifficulty,
      energy_requirement: selectedEnergy,
      scheduled_for: scheduledTime.toISOString(),
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern : null,
      estimated_duration_minutes: 30,
    });

    // Reset form
    setTaskTitle('');
    setSelectedDifficulty(2);
    setSelectedEnergy('medium');
    setIsRecurring(false);
    setRecurrencePattern('daily');
    setScheduledTime(new Date());
    setIsExpanded(false);
    
    Animated.timing(expandAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return Colors.success;
      case 2: return Colors.emerald;
      case 3: return Colors.primary;
      case 4: return Colors.warning;
      case 5: return Colors.danger;
      default: return Colors.primary;
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy) {
      case 'low': return Colors.success;
      case 'medium': return Colors.primary;
      case 'high': return Colors.danger;
      default: return Colors.primary;
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

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Main Button */}
      <TouchableOpacity
        onPress={toggleExpand}
        style={[
          styles.mainButton,
          isExpanded && styles.mainButtonExpanded
        ]}
        activeOpacity={0.8}
      >
        <Animated.View style={[
          styles.buttonContent,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <Text style={styles.plusIcon}>
            {isExpanded ? '✨' : '+'}
          </Text>
          <Text style={styles.buttonText}>
            {isExpanded ? 'Quick Add' : 'Add Task'}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Expanded Form */}
      <Animated.View
        style={[
          styles.expandedContent,
          {
            height: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 420],
            }),
            opacity: expandAnim,
          },
        ]}
      >
        <View style={styles.formContent}>
          {/* Task Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.taskInput}
              placeholder="What do you want to accomplish? ✨"
              placeholderTextColor={Colors.textTertiary}
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus={isExpanded}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
            />
          </View>

          {/* Difficulty Selector */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Difficulty</Text>
            <View style={styles.difficultyContainer}>
              {[1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setSelectedDifficulty(level)}
                  style={[
                    styles.difficultyButton,
                    {
                      backgroundColor: selectedDifficulty === level 
                        ? getDifficultyColor(level) 
                        : Colors.gray200,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      {
                        color: selectedDifficulty === level 
                          ? Colors.background 
                          : Colors.textSecondary,
                      },
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Energy Selector */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Energy</Text>
            <View style={styles.energyContainer}>
              {(['low', 'medium', 'high'] as const).map((energy) => (
                <TouchableOpacity
                  key={energy}
                  onPress={() => setSelectedEnergy(energy)}
                  style={[
                    styles.energyButton,
                    {
                      backgroundColor: selectedEnergy === energy 
                        ? getEnergyColor(energy) + '20'
                        : Colors.gray200,
                      borderColor: selectedEnergy === energy 
                        ? getEnergyColor(energy)
                        : 'transparent',
                    },
                  ]}
                >
                  <Text style={styles.energyIcon}>
                    {getEnergyIcon(energy)}
                  </Text>
                  <Text
                    style={[
                      styles.energyText,
                      {
                        color: selectedEnergy === energy 
                          ? getEnergyColor(energy)
                          : Colors.textSecondary,
                      },
                    ]}
                  >
                    {energy.charAt(0).toUpperCase() + energy.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Selector */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>When? ⏰</Text>
            <View style={styles.timeContainer}>
              <TouchableOpacity
                onPress={() => {
                  const now = new Date();
                  setScheduledTime(now);
                }}
                style={[
                  styles.timeButton,
                  scheduledTime.getTime() - new Date().getTime() < 60000 && styles.timeButtonActive,
                ]}
              >
                <Text style={styles.timeButtonText}>Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const inHour = new Date();
                  inHour.setHours(inHour.getHours() + 1);
                  setScheduledTime(inHour);
                }}
                style={[
                  styles.timeButton,
                  Math.abs(scheduledTime.getTime() - (new Date().getTime() + 3600000)) < 60000 && styles.timeButtonActive,
                ]}
              >
                <Text style={styles.timeButtonText}>1 Hour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(9, 0, 0, 0);
                  setScheduledTime(tomorrow);
                }}
                style={[
                  styles.timeButton,
                  scheduledTime.toDateString() === new Date(Date.now() + 86400000).toDateString() && styles.timeButtonActive,
                ]}
              >
                <Text style={styles.timeButtonText}>Tomorrow</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recurring Toggle */}
          <View style={styles.selectorContainer}>
            <View style={styles.toggleRow}>
              <Text style={styles.selectorLabel}>Recurring Task 🔄</Text>
              <TouchableOpacity
                onPress={() => setIsRecurring(!isRecurring)}
                style={[
                  styles.toggle,
                  isRecurring && styles.toggleActive,
                ]}
              >
                <View style={[
                  styles.toggleIndicator,
                  isRecurring && styles.toggleIndicatorActive,
                ]} />
              </TouchableOpacity>
            </View>
            
            {isRecurring && (
              <View style={styles.recurrenceContainer}>
                {(['daily', 'weekly', 'monthly'] as const).map((pattern) => (
                  <TouchableOpacity
                    key={pattern}
                    onPress={() => setRecurrencePattern(pattern)}
                    style={[
                      styles.recurrenceButton,
                      recurrencePattern === pattern && styles.recurrenceButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.recurrenceButtonText,
                      recurrencePattern === pattern && styles.recurrenceButtonTextActive,
                    ]}>
                      {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!taskTitle.trim() || isLoading}
            style={[
              styles.submitButton,
              (!taskTitle.trim() || isLoading) && styles.submitButtonDisabled,
            ]}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? '✨ Creating...' : '🚀 Create Task'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    opacity: 0.1,
  },
  mainButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  mainButtonExpanded: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: Typography.xl2,
    marginRight: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.lg,
    fontWeight: 'bold',
    color: Colors.background,
  },
  expandedContent: {
    backgroundColor: Colors.background,
    borderTopWidth: 2,
    borderTopColor: Colors.primary + '20',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formContent: {
    padding: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  taskInput: {
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectorContainer: {
    marginBottom: Spacing.lg,
  },
  selectorLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  difficultyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  difficultyText: {
    fontSize: Typography.base,
    fontWeight: 'bold',
  },
  energyContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  energyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  energyIcon: {
    fontSize: Typography.base,
    marginRight: Spacing.xs,
  },
  energyText: {
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.success,
    borderRadius: 16,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray400,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: Typography.base,
    fontWeight: 'bold',
    color: Colors.background,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  timeButtonText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray300,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleIndicatorActive: {
    transform: [{ translateX: 22 }],
  },
  recurrenceContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  recurrenceButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recurrenceButtonActive: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  recurrenceButtonText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  recurrenceButtonTextActive: {
    color: Colors.success,
  },
}); 