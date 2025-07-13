import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { Task } from '../../../types';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string, satisfaction?: number, notes?: string) => void;
  onSkip: (taskId: string, reason?: string) => void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isCompleting: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onSkip,
  onEdit,
  onDelete,
  isCompleting,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  const isOverdue = task.scheduledFor && new Date(task.scheduledFor) < new Date();
  const isCompleted = task.status === 'completed';

  // Animate the center circle on mount
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(circleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(circleAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Animate expansion
  React.useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const handlePressIn = () => {
    if (isCompleted) return;
    
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: false,
    }).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (isCompleted) return;
    
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const handleComplete = () => {
    if (isCompleted) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Animate completion
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();

    // Animate checkmark
    Animated.timing(checkmarkAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    onComplete(task.id);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      task.title,
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => onEdit(task) },
        { text: 'Skip', onPress: () => handleSkip() },
        ...(onDelete ? [{ text: 'Delete', style: 'destructive', onPress: () => handleDelete() }] : []),
      ]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Tab',
      'Why are you skipping this tab?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Too busy', onPress: () => onSkip(task.id, 'Too busy') },
        { text: 'Not motivated', onPress: () => onSkip(task.id, 'Not motivated') },
        { text: 'Too difficult', onPress: () => onSkip(task.id, 'Too difficult') },
        { text: 'Other', onPress: () => onSkip(task.id, 'Other') },
      ]
    );
  };

  const handleDelete = () => {
    console.log('TaskCard: Delete button clicked for task:', task.id, task.title);
    if (!onDelete) {
      console.log('TaskCard: onDelete prop is not provided');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(task.id);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeStatus = () => {
    if (!task.scheduledFor) return null;
    
    const now = new Date();
    const taskTime = new Date(task.scheduledFor);
    const diffHours = (taskTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (isOverdue) {
      return { text: 'Overdue', color: '#ef4444', icon: '⚠️' };
    } else if (diffHours < 1) {
      return { text: 'Due soon', color: '#f59e0b', icon: '⏰' };
    } else {
      return { text: formatTime(task.scheduledFor), color: '#6b7280', icon: '🕐' };
    }
  };

  const timeStatus = getTimeStatus();

  return (
    <Animated.View
      style={[
        styles.container,
        isCompleted && styles.completedContainer,
        isOverdue && !isCompleted && styles.overdueContainer,
        { 
          transform: [
            { scale: scaleAnim },
          ],
          maxHeight: expandAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [120, 300],
          }),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onToggleExpand || handleComplete}
        onLongPress={handleLongPress}
        activeOpacity={0.9}
        disabled={isCompleting}
      >
        {/* Main Content */}
        <View style={styles.content}>
          {/* Header with Animated Circle */}
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text
                style={[
                  styles.title,
                  isCompleted && styles.completedTitle,
                ]}
                numberOfLines={2}
              >
                {task.title}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              {/* Delete Button */}
              {onDelete && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.headerDeleteButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.headerDeleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}
              
              {/* Animated Center Circle */}
              <View style={styles.circleContainer}>
                <Animated.View
                  style={[
                    styles.outerCircle,
                    {
                      transform: [
                        {
                          scale: circleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.1],
                          }),
                        },
                      ],
                      opacity: circleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.6],
                      }),
                    },
                  ]}
                />
                <View style={styles.innerCircle}>
                  {isCompleted ? (
                    <Animated.View
                      style={[
                        styles.checkmarkContainer,
                        {
                          opacity: checkmarkAnim,
                          transform: [
                            {
                              scale: checkmarkAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.checkmarkText}>✓</Text>
                    </Animated.View>
                  ) : (
                    <Text style={styles.expandIcon}>
                      {isExpanded ? '▼' : '▶'}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Expanded Content */}
          <Animated.View
            style={[
              styles.expandedContent,
              {
                opacity: expandAnim,
                maxHeight: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 150],
                }),
              },
            ]}
          >
            {task.description && (
              <Text style={styles.description}>{task.description}</Text>
            )}
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={handleComplete}
                style={[styles.actionButton, styles.completeButton]}
              >
                <Text style={styles.actionButtonText}>Complete</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSkip}
                style={[styles.actionButton, styles.skipButton]}
              >
                <Text style={styles.actionButtonText}>Skip</Text>
              </TouchableOpacity>
              
              {onDelete && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[styles.actionButton, styles.deleteButton]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonText}>🗑️ Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.metaSection}>
              {/* Difficulty */}
              <View style={[styles.badge, { backgroundColor: getDifficultyColor(task.difficultyLevel) }]}>
                <Text style={styles.badgeText}>Level {task.difficultyLevel}</Text>
              </View>
              
              {/* Energy */}
              <View style={styles.energyBadge}>
                <Text style={styles.energyText}>{getEnergyIcon(task.energyRequirement)}</Text>
              </View>
              
              {/* Duration */}
              {task.estimatedDurationMinutes && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>⏱️ {task.estimatedDurationMinutes}m</Text>
                </View>
              )}
            </View>

            {/* Time Status */}
            {timeStatus && (
              <View style={[styles.timeBadge, { backgroundColor: timeStatus.color + '20' }]}>
                <Text style={[styles.timeText, { color: timeStatus.color }]}>
                  {timeStatus.icon} {timeStatus.text}
                </Text>
              </View>
            )}
          </View>

          {/* Streak Indicator */}
          {task.streakCount > 0 && (
            <View style={styles.streakContainer}>
              <Text style={styles.streakText}>🔥 {task.streakCount} day streak</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.gray100,
    overflow: 'hidden',
  },
  completedContainer: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
    opacity: 0.8,
  },
  overdueContainer: {
    borderColor: Colors.danger,
    borderWidth: 2,
  },
  touchable: {
    padding: Spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerDeleteButton: {
    padding: Spacing.xs,
    borderRadius: 8,
    backgroundColor: Colors.danger + '20',
    borderWidth: 1,
    borderColor: Colors.danger + '30',
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
  headerDeleteButtonText: {
    fontSize: Typography.sm,
    color: Colors.danger,
    fontWeight: '600',
  },
  title: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  circleContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '30',
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  expandIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  expandedContent: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  description: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  skipButton: {
    backgroundColor: Colors.warning,
  },
  deleteButton: {
    backgroundColor: Colors.danger,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: Typography.xs,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.white,
  },
  energyBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
  },
  energyText: {
    fontSize: Typography.xs,
  },
  durationBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
  },
  durationText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  timeBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timeText: {
    fontSize: Typography.xs,
    fontWeight: '600',
  },
  streakContainer: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakText: {
    fontSize: Typography.xs,
    color: Colors.warning,
    fontWeight: '600',
  },
}); 