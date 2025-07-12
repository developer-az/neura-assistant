export interface AIAnalysisResult {
  type: 'goal_suggestion' | 'task_optimization' | 'behavioral_insight' | 'motivational_message';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  metadata?: any;
}

export class AIService {
  private static instance: AIService;
  private apiKey: string | null = null;

  private constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || null;
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Parse natural language into structured goal data
   */
  async parseGoalFromText(text: string): Promise<{
    title: string;
    description?: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    successCriteria: string[];
  }> {
    // For now, use simple parsing logic
    // In the future, this would use OpenAI's GPT-4 for natural language understanding
    
    const categories = ['health', 'career', 'learning', 'habits', 'finance', 'relationships', 'personal'];
    
    // Simple keyword-based categorization
    const textLower = text.toLowerCase();
    let category = 'personal';
    
    if (textLower.includes('work') || textLower.includes('job') || textLower.includes('career')) {
      category = 'career';
    } else if (textLower.includes('learn') || textLower.includes('study') || textLower.includes('read')) {
      category = 'learning';
    } else if (textLower.includes('exercise') || textLower.includes('workout') || textLower.includes('health')) {
      category = 'health';
    } else if (textLower.includes('habit') || textLower.includes('routine')) {
      category = 'habits';
    } else if (textLower.includes('money') || textLower.includes('save') || textLower.includes('invest')) {
      category = 'finance';
    } else if (textLower.includes('friend') || textLower.includes('family') || textLower.includes('relationship')) {
      category = 'relationships';
    }

    // Determine priority based on urgency words
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (textLower.includes('urgent') || textLower.includes('asap') || textLower.includes('critical')) {
      priority = 'high';
    } else if (textLower.includes('sometime') || textLower.includes('eventually') || textLower.includes('maybe')) {
      priority = 'low';
    }

    // Extract success criteria
    const successCriteria: string[] = [];
    if (textLower.includes('complete') || textLower.includes('finish')) {
      successCriteria.push('Complete the task');
    }
    if (textLower.includes('improve') || textLower.includes('better')) {
      successCriteria.push('See measurable improvement');
    }

    return {
      title: text.trim(),
      category,
      priority,
      successCriteria: successCriteria.length > 0 ? successCriteria : ['Achieve the stated objective'],
    };
  }

  /**
   * Generate task suggestions based on a goal
   */
  async generateTasksForGoal(goal: {
    title: string;
    description?: string;
    category: string;
  }): Promise<Array<{
    title: string;
    description?: string;
    difficulty: number;
    energy: 'low' | 'medium' | 'high';
    estimatedDuration: number;
  }>> {
    // Simple task generation logic
    // In the future, this would use AI to generate contextual tasks
    
    const baseTasks = [
      {
        title: `Research ${goal.title}`,
        description: `Gather information about ${goal.title.toLowerCase()}`,
        difficulty: 2,
        energy: 'medium' as const,
        estimatedDuration: 30,
      },
      {
        title: `Plan ${goal.title}`,
        description: `Create a detailed plan for achieving ${goal.title.toLowerCase()}`,
        difficulty: 3,
        energy: 'high' as const,
        estimatedDuration: 45,
      },
      {
        title: `Start ${goal.title}`,
        description: `Begin working on ${goal.title.toLowerCase()}`,
        difficulty: 4,
        energy: 'high' as const,
        estimatedDuration: 60,
      },
    ];

    // Add category-specific tasks
    const categoryTasks = this.getCategorySpecificTasks(goal.category);
    
    return [...baseTasks, ...categoryTasks];
  }

  private getCategorySpecificTasks(category: string) {
    const taskMap: Record<string, Array<{
      title: string;
      description?: string;
      difficulty: number;
      energy: 'low' | 'medium' | 'high';
      estimatedDuration: number;
    }>> = {
      health: [
        {
          title: 'Schedule doctor appointment',
          description: 'Book a check-up or consultation',
          difficulty: 1,
          energy: 'low',
          estimatedDuration: 15,
        },
        {
          title: 'Create workout routine',
          description: 'Design a personalized exercise plan',
          difficulty: 3,
          energy: 'medium',
          estimatedDuration: 30,
        },
      ],
      career: [
        {
          title: 'Update resume',
          description: 'Refresh your professional profile',
          difficulty: 2,
          energy: 'medium',
          estimatedDuration: 45,
        },
        {
          title: 'Network outreach',
          description: 'Connect with professionals in your field',
          difficulty: 4,
          energy: 'high',
          estimatedDuration: 30,
        },
      ],
      learning: [
        {
          title: 'Find learning resources',
          description: 'Identify books, courses, or materials',
          difficulty: 2,
          energy: 'medium',
          estimatedDuration: 20,
        },
        {
          title: 'Create study schedule',
          description: 'Plan dedicated learning time',
          difficulty: 3,
          energy: 'medium',
          estimatedDuration: 25,
        },
      ],
      habits: [
        {
          title: 'Set up habit tracker',
          description: 'Create a system to monitor progress',
          difficulty: 2,
          energy: 'low',
          estimatedDuration: 15,
        },
        {
          title: 'Create reminder system',
          description: 'Set up notifications and cues',
          difficulty: 1,
          energy: 'low',
          estimatedDuration: 10,
        },
      ],
      finance: [
        {
          title: 'Review current finances',
          description: 'Analyze income, expenses, and savings',
          difficulty: 3,
          energy: 'medium',
          estimatedDuration: 60,
        },
        {
          title: 'Create budget plan',
          description: 'Develop a spending and saving strategy',
          difficulty: 4,
          energy: 'high',
          estimatedDuration: 45,
        },
      ],
      relationships: [
        {
          title: 'Reach out to friends/family',
          description: 'Initiate contact with loved ones',
          difficulty: 2,
          energy: 'medium',
          estimatedDuration: 20,
        },
        {
          title: 'Plan social activities',
          description: 'Organize meetups or events',
          difficulty: 3,
          energy: 'high',
          estimatedDuration: 30,
        },
      ],
    };

    return taskMap[category] || [];
  }

  /**
   * Generate motivational messages based on user progress
   */
  async generateMotivationalMessage(stats: {
    completionRate: number;
    streakDays: number;
    totalTasks: number;
    recentAchievements: string[];
  }): Promise<string> {
    const messages = [
      "Every step forward is progress, no matter how small! 💪",
      "You're building momentum with each completed task! 🚀",
      "Consistency is the key to success - you've got this! 🔑",
      "Your dedication is inspiring! Keep up the great work! ✨",
      "Small actions compound into big results! 📈",
    ];

    if (stats.completionRate >= 80) {
      messages.push("You're absolutely crushing it! 🏆");
      messages.push("Your productivity is off the charts! 📊");
    }

    if (stats.streakDays >= 7) {
      messages.push(`Amazing ${stats.streakDays}-day streak! 🔥`);
      messages.push("You're building unstoppable momentum! ⚡");
    }

    if (stats.totalTasks >= 50) {
      messages.push("You've completed so many tasks - incredible dedication! 🎯");
    }

    // Return a random motivational message
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Analyze user behavior patterns for insights
   */
  async analyzeBehaviorPatterns(userData: {
    tasks: any[];
    goals: any[];
    completionHistory: any[];
  }): Promise<AIAnalysisResult[]> {
    const insights: AIAnalysisResult[] = [];

    // Analyze completion patterns
    const completionRate = userData.tasks.length > 0 
      ? (userData.tasks.filter(t => t.status === 'completed').length / userData.tasks.length) * 100 
      : 0;

    if (completionRate >= 85) {
      insights.push({
        type: 'behavioral_insight',
        title: 'High Performer Detected! 🏆',
        description: `You're completing ${Math.round(completionRate)}% of your tasks. Consider taking on more challenging goals!`,
        confidence: 0.9,
        actionable: true,
        metadata: { completionRate }
      });
    }

    // Analyze time patterns
    const taskTimes = userData.tasks
      .filter(t => t.scheduled_for && t.status === 'completed')
      .map(t => new Date(t.scheduled_for).getHours());

    if (taskTimes.length >= 5) {
      const hourCounts = taskTimes.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const peakHour = Object.entries(hourCounts)
        .sort(([,a], [,b]) => b - a)[0];

      if (peakHour && peakHour[1] >= 3) {
        insights.push({
          type: 'task_optimization',
          title: 'Peak Performance Time Identified! 📈',
          description: `You're most productive at ${peakHour[0]}:00. Schedule important tasks during this window.`,
          confidence: 0.8,
          actionable: true,
          metadata: { peakHour: peakHour[0], taskCount: peakHour[1] }
        });
      }
    }

    return insights;
  }

  /**
   * Check if OpenAI integration is available
   */
  isOpenAIAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Set OpenAI API key (for future use)
   */
  setOpenAIKey(key: string): void {
    this.apiKey = key;
  }
}

export const aiService = AIService.getInstance(); 