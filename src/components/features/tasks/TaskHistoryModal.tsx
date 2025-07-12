import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Colors } from '../../../../app/constants/colors';
import { Typography, Spacing } from '../../../utils/constants';
import { TaskItem } from './TaskItem';
import { Task } from '../../../types';

interface TaskHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  tasks: Task[];
  onComplete: (taskId: string, satisfaction?: number, notes?: string) => void;
  onSkip: (taskId: string, reason?: string) => void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isCompleting: boolean;
}

export const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({
  visible,
  onClose,
  tasks,
  onComplete,
  onSkip,
  onEdit,
  onDelete,
  isCompleting,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'skipped'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(task => task.status === selectedFilter);
    }

    // Filter by timeframe
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (selectedTimeframe) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(now.getDate() - 30);
          break;
      }
      
      filtered = filtered.filter(task => {
        // Use the most relevant date for filtering
        let taskDate: Date;
        
        if (task.status === 'completed' && task.completedAt) {
          taskDate = new Date(task.completedAt);
        } else if (task.status === 'skipped' && task.skippedAt) {
          taskDate = new Date(task.skippedAt);
        } else if (task.scheduledFor) {
          taskDate = new Date(task.scheduledFor);
        } else {
          taskDate = new Date(task.createdAt);
        }
        
        return taskDate >= startDate;
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort by completion/skip date (most recent first)
    return filtered.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt) : 
                   a.skippedAt ? new Date(a.skippedAt) :
                   new Date(a.createdAt);
      const dateB = b.completedAt ? new Date(b.completedAt) : 
                   b.skippedAt ? new Date(b.skippedAt) :
                   new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  }, [tasks, searchQuery, selectedFilter, selectedTimeframe]);

  const completedTasks = filteredTasks.filter(task => task.status === 'completed');
  const skippedTasks = filteredTasks.filter(task => task.status === 'skipped');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getTaskCompletionInfo = (task: Task) => {
    if (task.status === 'completed' && task.completedAt) {
      return {
        date: formatDate(task.completedAt),
        satisfaction: task.context?.lastSatisfaction,
        notes: task.context?.lastNotes,
      };
    }
    if (task.status === 'skipped' && task.skippedAt) {
      return {
        date: formatDate(task.skippedAt),
        reason: task.context?.skipReason,
      };
    }
    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Task History</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            {/* Status Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.filterButtons}>
                {[
                  { key: 'all', label: 'All', count: filteredTasks.length },
                  { key: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length },
                  { key: 'skipped', label: 'Skipped', count: tasks.filter(t => t.status === 'skipped').length },
                ].map(filter => (
                  <TouchableOpacity
                    key={filter.key}
                    onPress={() => setSelectedFilter(filter.key as any)}
                    style={[
                      styles.filterButton,
                      selectedFilter === filter.key && styles.filterButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedFilter === filter.key && styles.filterButtonTextActive
                    ]}>
                      {filter.label} ({filter.count})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Timeframe Filter */}
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Timeframe:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterButtons}>
                  {[
                    { key: 'all', label: 'All Time' },
                    { key: 'today', label: 'Today' },
                    { key: 'week', label: 'This Week' },
                    { key: 'month', label: 'This Month' },
                  ].map(timeframe => (
                    <TouchableOpacity
                      key={timeframe.key}
                      onPress={() => setSelectedTimeframe(timeframe.key as any)}
                      style={[
                        styles.filterButton,
                        selectedTimeframe === timeframe.key && styles.filterButtonActive
                      ]}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        selectedTimeframe === timeframe.key && styles.filterButtonTextActive
                      ]}>
                        {timeframe.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </Text>
          </View>

          {/* Task List */}
          <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
            {filteredTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No tasks found matching your criteria
                </Text>
              </View>
            ) : (
              filteredTasks.map(task => {
                const completionInfo = getTaskCompletionInfo(task);
                return (
                  <View key={task.id} style={styles.taskContainer}>
                    <TaskItem
                      task={task}
                      onComplete={onComplete}
                      onSkip={onSkip}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isCompleting={isCompleting}
                    />
                    {completionInfo && (
                      <View style={styles.taskMeta}>
                        <Text style={styles.taskMetaDate}>{completionInfo.date}</Text>
                        {completionInfo.satisfaction && (
                          <Text style={styles.taskMetaSatisfaction}>
                            ⭐ {completionInfo.satisfaction}/5 satisfaction
                          </Text>
                        )}
                        {completionInfo.reason && (
                          <Text style={styles.taskMetaReason}>
                            Reason: {completionInfo.reason}
                          </Text>
                        )}
                        {completionInfo.notes && (
                          <Text style={styles.taskMetaNotes}>
                            Note: {completionInfo.notes}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 600,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  title: {
    fontSize: Typography.xl2,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: Typography.lg,
    color: Colors.textSecondary,
  },
  searchContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchInput: {
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterGroup: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray200,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.background,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  resultsText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl2,
  },
  emptyStateText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  taskContainer: {
    marginBottom: Spacing.md,
  },
  taskMeta: {
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  taskMetaDate: {
    fontSize: Typography.xs,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  taskMetaSatisfaction: {
    fontSize: Typography.xs,
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  taskMetaReason: {
    fontSize: Typography.xs,
    color: Colors.warning,
    marginBottom: Spacing.xs,
  },
  taskMetaNotes: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
}); 