import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { Task, RecurrenceConfig } from '../../../types';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string, satisfaction?: number, notes?: string) => void;
  onSkip: (taskId: string, reason?: string) => void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isCompleting: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onComplete,
  onSkip,
  onEdit,
  onDelete,
  isCompleting,
}) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [satisfaction, setSatisfaction] = useState(3);
  const [notes, setNotes] = useState('');
  const [scaleAnim] = useState(new Animated.Value(1));
  const [checkmarkAnim] = useState(new Animated.Value(0));

  const isOverdue = task.scheduledFor && new Date(task.scheduledFor) < new Date();
  const isRecurring = task.isRecurring;

  const handleCompletePress = () => {
    if (task.status === 'completed') return;

    // Animate the button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Show completion modal for better feedback
    setShowCompletionModal(true);
  };

  const handleCompleteConfirm = () => {
    onComplete(task.id, satisfaction, notes);
    setShowCompletionModal(false);
    
    // Animate checkmark
    Animated.timing(checkmarkAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Task',
      'Why are you skipping this task?',
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
    if (!onDelete) return;
    
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(task.id)
        },
      ]
    );
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return Colors.success;
    if (level === 3) return Colors.warning; // Orange instead of yellow
    return Colors.danger;
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'low': return '🌱';
      case 'medium': return '⚡';
      case 'high': return '🔥';
      default: return '⚡';
    }
  };

  const getRecurrenceText = (pattern: string, config: RecurrenceConfig) => {
    switch (pattern) {
      case 'daily':
        return '🔄 Daily';
      case 'weekly':
        return '🔄 Weekly';
      case 'monthly':
        return '🔄 Monthly';
      case 'custom':
        return '🔄 Custom';
      default:
        return '';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          task.status === 'completed' && styles.completedContainer,
          isOverdue && task.status === 'pending' && styles.overdueContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Task Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text
              style={[
                styles.title,
                task.status === 'completed' && styles.completedTitle,
              ]}
            >
              {task.title}
            </Text>
            {isRecurring && (
              <Text style={styles.recurrenceBadge}>
                {getRecurrenceText(task.recurrencePattern!, task.recurrenceConfig!)}
              </Text>
            )}
          </View>
          
          <View style={styles.metaSection}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(task.difficultyLevel) }]}>
              <Text style={styles.difficultyText}>{task.difficultyLevel}</Text>
            </View>
            <Text style={styles.energyIcon}>{getEnergyIcon(task.energyRequirement)}</Text>
            {onDelete && (
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Task Description */}
        {task.description && (
          <Text style={styles.description}>{task.description}</Text>
        )}

        {/* Task Footer */}
        <View style={styles.footer}>
          <View style={styles.infoSection}>
            {task.scheduledFor && (
              <Text style={[styles.timeText, isOverdue && styles.overdueText]}>
                ⏰ {formatTime(task.scheduledFor)}
                {isOverdue && ' (Overdue)'}
              </Text>
            )}
            {task.estimatedDurationMinutes && (
              <Text style={styles.durationText}>
                ⏱️ {task.estimatedDurationMinutes}min
              </Text>
            )}
            {task.streakCount > 0 && (
              <Text style={styles.streakText}>
                🔥 {task.streakCount} day streak
              </Text>
            )}
            {task.completionCount > 0 && (
              <Text style={styles.completionCountText}>
                ✅ Completed {task.completionCount} times
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            {task.status === 'pending' && (
              <>
                <TouchableOpacity
                  onPress={handleCompletePress}
                  disabled={isCompleting}
                  style={[styles.actionButton, styles.completeButton]}
                >
                  <Animated.Text
                    style={[
                      styles.actionButtonText,
                      { transform: [{ scale: checkmarkAnim }] },
                    ]}
                  >
                    ✓
                  </Animated.Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleSkip}
                  style={[styles.actionButton, styles.skipButton]}
                >
                  <Text style={styles.actionButtonText}>⏭</Text>
                </TouchableOpacity>
              </>
            )}
            
            {task.status === 'completed' && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓ Completed</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Great job! 🎉</Text>
            <Text style={styles.modalSubtitle}>
              How satisfied are you with completing "{task.title}"?
            </Text>
            
            {/* Satisfaction Rating */}
            <View style={styles.satisfactionSection}>
              <Text style={styles.satisfactionLabel}>Satisfaction Level:</Text>
              <View style={styles.satisfactionButtons}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => setSatisfaction(rating)}
                    style={[
                      styles.satisfactionButton,
                      satisfaction === rating && styles.satisfactionButtonActive,
                    ]}
                  >
                    <Text style={[
                      styles.satisfactionButtonText,
                      satisfaction === rating && styles.satisfactionButtonTextActive,
                    ]}>
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.satisfactionHint}>
                {satisfaction <= 2 ? '😔' : satisfaction <= 3 ? '😐' : satisfaction <= 4 ? '😊' : '😍'}
                {satisfaction <= 2 ? ' Not great' : satisfaction <= 3 ? ' Okay' : satisfaction <= 4 ? ' Good' : ' Excellent!'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowCompletionModal(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCompleteConfirm}
                style={[styles.modalButton, styles.confirmButton]}
              >
                <Text style={styles.confirmButtonText}>Complete Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  completedContainer: {
    backgroundColor: Colors.success + '10',
    borderLeftColor: Colors.success,
    opacity: 0.8,
  },
  overdueContainer: {
    backgroundColor: Colors.danger + '10',
    borderLeftColor: Colors.danger,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleSection: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  recurrenceBadge: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 4,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  difficultyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: Typography.xs,
    fontWeight: 'bold',
    color: Colors.background,
  },
  energyIcon: {
    fontSize: Typography.base,
  },
  description: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoSection: {
    flex: 1,
  },
  timeText: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  overdueText: {
    color: Colors.danger,
  },
  durationText: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  streakText: {
    fontSize: Typography.xs,
    color: Colors.warning,
    fontWeight: '500',
    marginTop: 2,
  },
  completionCountText: {
    fontSize: Typography.xs,
    color: Colors.success,
    fontWeight: '500',
    marginTop: 2,
  },
  actionSection: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  skipButton: {
    backgroundColor: Colors.gray400,
  },
  actionButtonText: {
    color: Colors.background,
    fontWeight: 'bold',
    fontSize: Typography.lg,
  },
  completedBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: Colors.background,
    fontSize: Typography.xs,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.xl2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  satisfactionSection: {
    marginBottom: Spacing.lg,
  },
  satisfactionLabel: {
    fontSize: Typography.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  satisfactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  satisfactionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  satisfactionButtonActive: {
    backgroundColor: Colors.primary,
  },
  satisfactionButtonText: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  satisfactionButtonTextActive: {
    color: Colors.background,
  },
  satisfactionHint: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.gray200,
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
  cancelButtonText: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmButtonText: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.background,
  },
  deleteButton: {
    padding: Spacing.xs,
    borderRadius: 8,
    backgroundColor: Colors.danger + '15',
  },
  deleteButtonText: {
    fontSize: Typography.sm,
  },
}); 