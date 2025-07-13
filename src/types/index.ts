export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  timezone: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    inApp: boolean;
  };
  aiAssistance: {
    proactiveSuggestions: boolean;
    difficultyAdaptation: boolean;
    motivationCoaching: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    reducedMotion: boolean;
    highContrast: boolean;
  };
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetDate?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  completionPercentage: number;
  aiGenerated: boolean;
  originalPrompt?: string;
  successCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  goalId?: string;
  title: string;
  description?: string;
  scheduledFor?: string;
  estimatedDurationMinutes?: number;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  energyRequirement: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: string;
  skippedAt?: string;
  aiGenerated: boolean;
  context: TaskContext;
  createdAt: string;
  updatedAt: string;
  // Additional fields for recurring tasks
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  recurrenceConfig?: RecurrenceConfig | null;
  streakCount?: number;
  completionCount?: number;
  totalCompletionTimeMinutes?: number;
  averageCompletionTimeMinutes?: number;
}

export interface TaskContext {
  optimalTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  requiredTools?: string[];
  locationPreference?: string;
  prerequisites?: string[];
  motivationBooster?: string;
  lastSatisfaction?: number;
  lastNotes?: string;
  completionHistory?: Array<{
    completedAt: string;
    satisfaction: number;
    notes?: string;
    timeSpent: number;
  }>;
  skipReason?: string;
}

export interface RecurrenceConfig {
  interval?: number;
  endDate?: string;
  maxOccurrences?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

export type GoalCategory = 
  | 'health' 
  | 'career' 
  | 'learning' 
  | 'habits' 
  | 'finance' 
  | 'relationships' 
  | 'personal';

export interface Insight {
  id: string;
  type: 'pattern_recognition' | 'behavioral_coaching' | 'achievement' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  icon: string;
  createdAt: string;
}

export interface UserPattern {
  id: string;
  userId: string;
  patternType: string;
  patternData: any;
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}
