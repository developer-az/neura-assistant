import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../../lib/supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Get push token
      if (Device.isDevice) {
        try {
          const token = await Notifications.getExpoPushTokenAsync({
            projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
          });
          this.expoPushToken = token.data;
          
          // Store token in user profile
          await this.updateUserPushToken(token.data);
        } catch (error) {
          // Handle VAPID key error for web
          if (error instanceof Error && error.message.includes('vapidPublicKey')) {
            console.log('Push notifications not configured for web. Skipping token generation.');
            return;
          }
          console.error('Error getting push token:', error);
        }
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Set up notification categories
      await this.setupNotificationCategories();

      // Listen for notification responses
      Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);
      
      // Listen for notifications received while app is running
      Notifications.addNotificationReceivedListener(this.handleNotificationReceived);

    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private async updateUserPushToken(token: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating push token:', error);
    }
  }

  private async setupNotificationCategories(): Promise<void> {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('task-reminder', [
        {
          identifier: 'complete',
          buttonTitle: 'Complete',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'snooze',
          buttonTitle: 'Snooze 15min',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'skip',
          buttonTitle: 'Skip',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          },
        },
      ]);
    }
  }

  async scheduleTaskReminder(taskId: string, taskTitle: string, scheduledFor: Date): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: `Time to work on: ${taskTitle}`,
          data: { taskId, type: 'task-reminder' },
          categoryIdentifier: 'task-reminder',
          sound: 'default',
        },
        trigger: {
          date: scheduledFor,
        },
      });
      
      return identifier;
    } catch (error) {
      console.error('Error scheduling task reminder:', error);
      throw error;
    }
  }

  async scheduleInsightNotification(insightTitle: string, insightDescription: string): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'New AI Insight',
          body: insightTitle,
          data: { type: 'insight' },
          sound: 'default',
        },
        trigger: {
          seconds: 1, // Show immediately
        },
      });
      
      return identifier;
    } catch (error) {
      console.error('Error scheduling insight notification:', error);
      throw error;
    }
  }

  async scheduleMotivationalReminder(): Promise<string> {
    const messages = [
      "Time to check your goals! 🎯",
      "How are your tasks coming along? 💪",
      "Don't forget to track your progress! 📊",
      "Ready for your next achievement? 🚀",
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Neura Reminder',
          body: randomMessage,
          data: { type: 'motivational' },
          sound: 'default',
        },
        trigger: {
          hour: 18, // 6 PM
          minute: 0,
          repeats: true,
        },
      });
      
      return identifier;
    } catch (error) {
      console.error('Error scheduling motivational reminder:', error);
      throw error;
    }
  }

  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  private handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { taskId, type } = response.notification.request.content.data as any;
    
    if (type === 'task-reminder' && taskId) {
      const action = response.actionIdentifier;
      
      switch (action) {
        case 'complete':
          this.handleTaskComplete(taskId);
          break;
        case 'snooze':
          this.handleTaskSnooze(taskId);
          break;
        case 'skip':
          this.handleTaskSkip(taskId);
          break;
      }
    }
  };

  private handleNotificationReceived = (notification: Notifications.Notification) => {
    const { type } = notification.request.content.data as any;
    
    if (type === 'insight') {
      // Handle insight notification
      console.log('Insight notification received');
    }
  };

  private async handleTaskComplete(taskId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('tasks')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', taskId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error completing task from notification:', error);
    }
  }

  private async handleTaskSnooze(taskId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const snoozeTime = new Date();
        snoozeTime.setMinutes(snoozeTime.getMinutes() + 15);
        
        await supabase
          .from('tasks')
          .update({
            scheduled_for: snoozeTime.toISOString(),
          })
          .eq('id', taskId)
          .eq('user_id', user.id);
        
        // Schedule new reminder
        const task = await supabase
          .from('tasks')
          .select('title')
          .eq('id', taskId)
          .single();
        
        if (task.data) {
          await this.scheduleTaskReminder(taskId, task.data.title, snoozeTime);
        }
      }
    } catch (error) {
      console.error('Error snoozing task from notification:', error);
    }
  }

  private async handleTaskSkip(taskId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('tasks')
          .update({
            status: 'skipped',
            skipped_at: new Date().toISOString(),
          })
          .eq('id', taskId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error skipping task from notification:', error);
    }
  }

  async sendLocalNotification(title: string, body: string, data?: any): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: {
          seconds: 1,
        },
      });
      
      return identifier;
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }
}

export const notificationService = NotificationService.getInstance(); 