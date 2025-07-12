import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card } from '../../ui';
import { Colors, Typography, Spacing } from '../../../utils/constants';
import type { InsightData } from '../../../hooks/useInsights';

interface InsightsCardProps {
  insights: InsightData[];
  onGenerateInsights: () => void;
  onMarkAsRead: (insightId: string) => void;
  isGenerating: boolean;
}

export function InsightsCard({ 
  insights, 
  onGenerateInsights, 
  onMarkAsRead, 
  isGenerating 
}: InsightsCardProps) {
  const unreadInsights = insights.filter(insight => !insight.read_at);

  const getInsightStyle = (type: InsightData['type']) => {
    switch (type) {
      case 'achievement':
        return {
          backgroundColor: '#10b981',
          borderColor: '#059669',
        };
      case 'pattern_recognition':
        return {
          backgroundColor: '#6366f1',
          borderColor: '#4f46e5',
        };
      case 'behavioral_coaching':
        return {
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
        };
      case 'suggestion':
        return {
          backgroundColor: '#8b5cf6',
          borderColor: '#7c3aed',
        };
      default:
        return {
          backgroundColor: Colors.gray200,
          borderColor: Colors.gray300,
        };
    }
  };

  const handleMarkAsRead = (insight: InsightData) => {
    if (!insight.read_at) {
      onMarkAsRead(insight.id);
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Insights</Text>
        <TouchableOpacity
          onPress={onGenerateInsights}
          disabled={isGenerating}
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Analyzing...' : 'Generate Insights'}
          </Text>
        </TouchableOpacity>
      </View>

      {insights.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🤖</Text>
          <Text style={styles.emptyStateTitle}>No insights yet</Text>
          <Text style={styles.emptyStateDescription}>
            Generate AI-powered insights based on your task and goal patterns
          </Text>
        </View>
      ) : (
        <View style={styles.insightsList}>
          {insights.slice(0, 3).map((insight) => (
            <TouchableOpacity
              key={insight.id}
              onPress={() => handleMarkAsRead(insight)}
              style={[
                styles.insightItem,
                getInsightStyle(insight.type),
                insight.read_at && styles.insightRead
              ]}
            >
              <View style={styles.insightHeader}>
                <Text style={styles.insightIcon}>{insight.icon}</Text>
                <View style={styles.insightMeta}>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightConfidence}>
                    {Math.round(insight.confidence * 100)}% confidence
                  </Text>
                </View>
                {insight.actionable && (
                  <View style={styles.actionableBadge}>
                    <Text style={styles.actionableText}>Actionable</Text>
                  </View>
                )}
              </View>
              <Text style={styles.insightDescription}>{insight.description}</Text>
              {!insight.read_at && (
                <View style={styles.unreadIndicator}>
                  <Text style={styles.unreadText}>Tap to mark as read</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          
          {insights.length > 3 && (
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>
                View {insights.length - 3} more insights
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {unreadInsights.length > 0 && (
        <View style={styles.unreadCount}>
          <Text style={styles.unreadCountText}>
            {unreadInsights.length} new insight{unreadInsights.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  generateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  generateButtonDisabled: {
    backgroundColor: Colors.gray300,
  },
  generateButtonText: {
    ...Typography.button,
    color: Colors.background,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyStateTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyStateDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
  },
  insightsList: {
    gap: Spacing.sm,
  },
  insightItem: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  insightRead: {
    opacity: 0.7,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  insightMeta: {
    flex: 1,
  },
  insightTitle: {
    ...Typography.h4,
    color: Colors.background,
    marginBottom: 2,
  },
  insightConfidence: {
    ...Typography.caption,
    color: Colors.background,
    opacity: 0.8,
  },
  actionableBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  actionableText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  insightDescription: {
    ...Typography.body,
    color: Colors.background,
    lineHeight: 20,
  },
  unreadIndicator: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  unreadText: {
    ...Typography.caption,
    color: Colors.background,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  viewMoreText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  unreadCount: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  unreadCountText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
}); 