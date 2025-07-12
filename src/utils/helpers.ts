export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }
  
  return dateObj.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if it's today, tomorrow, or yesterday
  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (dateObj.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else if (dateObj.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return dateObj.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
};

export const calculateStreakDays = (tasks: any[]): number => {
  // Sort tasks by completion date (most recent first)
  const completedTasks = tasks
    .filter(t => t.status === 'completed' && t.completed_at)
    .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

  if (completedTasks.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const task of completedTasks) {
    const taskDate = new Date(task.completed_at);
    taskDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
};

export const getMotivationalMessage = (completionRate: number): string => {
  if (completionRate === 0) {
    return "Ready to make today extraordinary? Your future self will thank you! 💪";
  } else if (completionRate === 100) {
    return "Outstanding! You've mastered today's challenges. You're unstoppable! 🌟";
  } else if (completionRate >= 80) {
    return "Incredible momentum! You're crushing your goals! 🚀";
  } else if (completionRate >= 60) {
    return "Great progress! You're building excellent habits! ⭐";
  } else if (completionRate >= 40) {
    return "Good start! Keep pushing forward, you've got this! 💪";
  } else {
    return "Every journey begins with a single step. You're on your way! 🎯";
  }
};

export const getDifficultyColor = (level: number): string => {
  if (level <= 2) return '#10b981'; // Easy - green
  if (level <= 3) return '#f59e0b'; // Medium - yellow/orange
  return '#ef4444'; // Hard - red
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    health: '#10b981',      // Green
    learning: '#6366f1',    // Blue
    career: '#f59e0b',      // Orange
    habits: '#818cf8',      // Light blue
    finance: '#8b5cf6',     // Purple
    relationships: '#ec4899', // Pink
    personal: '#6b7280',    // Gray
  };
  return colors[category] || '#6b7280';
};

export const getEnergyIcon = (energy: string): string => {
  const energyIcons = {
    low: '🌱',
    medium: '⚡',
    high: '🔥'
  };
  return energyIcons[energy as keyof typeof energyIcons] || '⚡';
};

export const getDifficultyEmoji = (level: number): string => {
  if (level <= 2) return '🟢'; // Easy
  if (level <= 3) return '🟡'; // Medium
  return '🔴'; // Hard
};

export const isTaskOverdue = (scheduledFor: string, bufferHours: number = 1): boolean => {
  const taskTime = new Date(scheduledFor);
  const now = new Date();
  const diffHours = (now.getTime() - taskTime.getTime()) / (1000 * 60 * 60);
  return diffHours > bufferHours;
};

export const getTaskStatus = (task: any): 'completed' | 'overdue' | 'pending' | 'upcoming' => {
  if (task.status === 'completed') return 'completed';
  if (task.status === 'skipped') return 'overdue';
  
  if (task.scheduled_for) {
    if (isTaskOverdue(task.scheduled_for)) {
      return 'overdue';
    }
    
    const taskTime = new Date(task.scheduled_for);
    const now = new Date();
    const hoursUntil = (taskTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil > 2) {
      return 'upcoming';
    }
  }
  
  return 'pending';
};

export const calculateCompletionRate = (tasks: any[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
};

export const groupTasksByDate = (tasks: any[]): Record<string, any[]> => {
  const grouped: Record<string, any[]> = {};
  
  tasks.forEach(task => {
    if (task.scheduled_for) {
      const date = new Date(task.scheduled_for).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    }
  });
  
  // Sort tasks within each date by scheduled time
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => 
      new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
    );
  });
  
  return grouped;
};

export const getWeeklyStats = (tasks: any[]) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weeklyTasks = tasks.filter(task => 
    task.created_at && new Date(task.created_at) >= oneWeekAgo
  );
  
  const completed = weeklyTasks.filter(t => t.status === 'completed').length;
  const total = weeklyTasks.length;
  
  return {
    totalTasks: total,
    completedTasks: completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    averagePerDay: Math.round(total / 7),
  };
};