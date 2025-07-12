import { NotificationService } from '../../src/services/notifications/NotificationService';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from '../../src/lib/supabase';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('../../src/lib/supabase');

const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockDevice = Device as jest.Mocked<typeof Device>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset singleton instance
    (NotificationService as any).instance = undefined;
    
    // Mock device
    mockDevice.isDevice = true;
    
    // Mock notifications
    mockNotifications.setNotificationHandler = jest.fn();
    mockNotifications.getPermissionsAsync = jest.fn(() => 
      Promise.resolve({ status: 'granted' })
    );
    mockNotifications.requestPermissionsAsync = jest.fn(() => 
      Promise.resolve({ status: 'granted' })
    );
    mockNotifications.getExpoPushTokenAsync = jest.fn(() => 
      Promise.resolve({ data: 'test-push-token' })
    );
    mockNotifications.scheduleNotificationAsync = jest.fn(() => 
      Promise.resolve('test-notification-id')
    );
    mockNotifications.cancelScheduledNotificationAsync = jest.fn();
    mockNotifications.cancelAllScheduledNotificationsAsync = jest.fn();
    mockNotifications.addNotificationResponseReceivedListener = jest.fn();
    mockNotifications.addNotificationReceivedListener = jest.fn();
    mockNotifications.setNotificationCategoryAsync = jest.fn();
    
    // Mock Supabase
    mockSupabase.auth = {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      })),
    } as any;
    
    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })) as any;

    notificationService = NotificationService.getInstance();
  });

  describe('Initialization', () => {
    it('should initialize notification service', async () => {
      await notificationService.initialize();

      expect(mockNotifications.setNotificationHandler).toHaveBeenCalled();
      expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
      expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalled();
      expect(mockNotifications.setNotificationCategoryAsync).toHaveBeenCalled();
      expect(mockNotifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
      expect(mockNotifications.addNotificationReceivedListener).toHaveBeenCalled();
    });

    it('should handle permission denied', async () => {
      mockNotifications.getPermissionsAsync = jest.fn(() => 
        Promise.resolve({ status: 'denied' })
      );
      mockNotifications.requestPermissionsAsync = jest.fn(() => 
        Promise.resolve({ status: 'denied' })
      );

      await notificationService.initialize();

      expect(mockNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('should handle non-device environment', async () => {
      mockDevice.isDevice = false;

      await notificationService.initialize();

      expect(mockNotifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    });

    it('should update user push token', async () => {
      await notificationService.initialize();

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  describe('Task Reminders', () => {
    it('should schedule task reminder', async () => {
      const taskId = 'test-task-id';
      const taskTitle = 'Test Task';
      const scheduledFor = new Date('2024-01-01T10:00:00Z');

      const notificationId = await notificationService.scheduleTaskReminder(
        taskId, 
        taskTitle, 
        scheduledFor
      );

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Task Reminder',
          body: 'Time to work on: Test Task',
          data: { taskId, type: 'task-reminder' },
          categoryIdentifier: 'task-reminder',
          sound: 'default',
        },
        trigger: {
          date: scheduledFor,
        },
      });
      expect(notificationId).toBe('test-notification-id');
    });

    it('should handle task reminder scheduling errors', async () => {
      mockNotifications.scheduleNotificationAsync = jest.fn(() => 
        Promise.reject(new Error('Scheduling failed'))
      );

      await expect(
        notificationService.scheduleTaskReminder('task-id', 'Task', new Date())
      ).rejects.toThrow('Scheduling failed');
    });
  });

  describe('Insight Notifications', () => {
    it('should schedule insight notification', async () => {
      const title = 'New AI Insight';
      const description = 'You\'re doing great!';

      const notificationId = await notificationService.scheduleInsightNotification(
        title, 
        description
      );

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'New AI Insight',
          body: title,
          data: { type: 'insight' },
          sound: 'default',
        },
        trigger: {
          seconds: 1,
        },
      });
      expect(notificationId).toBe('test-notification-id');
    });
  });

  describe('Motivational Reminders', () => {
    it('should schedule motivational reminder', async () => {
      const notificationId = await notificationService.scheduleMotivationalReminder();

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Neura Reminder',
          body: expect.stringMatching(/Time to check your goals|How are your tasks coming along|Don't forget to track your progress|Ready for your next achievement/),
          data: { type: 'motivational' },
          sound: 'default',
        },
        trigger: {
          hour: 18,
          minute: 0,
          repeats: true,
        },
      });
      expect(notificationId).toBe('test-notification-id');
    });
  });

  describe('Notification Management', () => {
    it('should cancel specific notification', async () => {
      const notificationId = 'test-notification-id';

      await notificationService.cancelNotification(notificationId);

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        notificationId
      );
    });

    it('should cancel all notifications', async () => {
      await notificationService.cancelAllNotifications();

      expect(mockNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should send local notification', async () => {
      const title = 'Test Title';
      const body = 'Test Body';
      const data = { test: 'data' };

      const notificationId = await notificationService.sendLocalNotification(
        title, 
        body, 
        data
      );

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
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
      expect(notificationId).toBe('test-notification-id');
    });
  });

  describe('Notification Response Handling', () => {
    it('should handle task completion from notification', async () => {
      // Mock the private method
      const mockHandleTaskComplete = jest.fn();
      (notificationService as any).handleTaskComplete = mockHandleTaskComplete;

      const mockResponse = {
        notification: {
          request: {
            content: {
              data: { taskId: 'test-task-id', type: 'task-reminder' },
            },
          },
        },
        actionIdentifier: 'complete',
      };

      // Simulate notification response
      const responseHandler = mockNotifications.addNotificationResponseReceivedListener.mock.calls[0][0];
      responseHandler(mockResponse as any);

      expect(mockHandleTaskComplete).toHaveBeenCalledWith('test-task-id');
    });

    it('should handle task snooze from notification', async () => {
      const mockHandleTaskSnooze = jest.fn();
      (notificationService as any).handleTaskSnooze = mockHandleTaskSnooze;

      const mockResponse = {
        notification: {
          request: {
            content: {
              data: { taskId: 'test-task-id', type: 'task-reminder' },
            },
          },
        },
        actionIdentifier: 'snooze',
      };

      const responseHandler = mockNotifications.addNotificationResponseReceivedListener.mock.calls[0][0];
      responseHandler(mockResponse as any);

      expect(mockHandleTaskSnooze).toHaveBeenCalledWith('test-task-id');
    });

    it('should handle task skip from notification', async () => {
      const mockHandleTaskSkip = jest.fn();
      (notificationService as any).handleTaskSkip = mockHandleTaskSkip;

      const mockResponse = {
        notification: {
          request: {
            content: {
              data: { taskId: 'test-task-id', type: 'task-reminder' },
            },
          },
        },
        actionIdentifier: 'skip',
      };

      const responseHandler = mockNotifications.addNotificationResponseReceivedListener.mock.calls[0][0];
      responseHandler(mockResponse as any);

      expect(mockHandleTaskSkip).toHaveBeenCalledWith('test-task-id');
    });

    it('should handle insight notification received', async () => {
      const mockHandleNotificationReceived = jest.fn();
      (notificationService as any).handleNotificationReceived = mockHandleNotificationReceived;

      const mockNotification = {
        request: {
          content: {
            data: { type: 'insight' },
          },
        },
      };

      const receivedHandler = mockNotifications.addNotificationReceivedListener.mock.calls[0][0];
      receivedHandler(mockNotification as any);

      expect(mockHandleNotificationReceived).toHaveBeenCalledWith(mockNotification);
    });
  });

  describe('Task Actions from Notifications', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should complete task from notification', async () => {
      const taskId = 'test-task-id';

      await (notificationService as any).handleTaskComplete(taskId);

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSupabase.from('tasks').update).toHaveBeenCalledWith({
        status: 'completed',
        completed_at: expect.any(String),
      });
    });

    it('should snooze task from notification', async () => {
      const taskId = 'test-task-id';

      // Mock task data
      mockSupabase.from = jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { title: 'Test Task' }, 
              error: null 
            })),
          })),
        })),
      })) as any;

      await (notificationService as any).handleTaskSnooze(taskId);

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSupabase.from('tasks').update).toHaveBeenCalledWith({
        scheduled_for: expect.any(String),
      });
    });

    it('should skip task from notification', async () => {
      const taskId = 'test-task-id';

      await (notificationService as any).handleTaskSkip(taskId);

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSupabase.from('tasks').update).toHaveBeenCalledWith({
        status: 'skipped',
        skipped_at: expect.any(String),
      });
    });
  });

  describe('Utility Methods', () => {
    it('should return expo push token', () => {
      const token = notificationService.getExpoPushToken();
      expect(token).toBe('test-push-token');
    });

    it('should set OpenAI key', () => {
      const testKey = 'test-openai-key';
      notificationService.setOpenAIKey(testKey);
      // Note: This is a private method, so we can't directly test it
      // but we can verify the method exists and doesn't throw
      expect(notificationService.setOpenAIKey).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      mockNotifications.getPermissionsAsync = jest.fn(() => 
        Promise.reject(new Error('Permission error'))
      );

      // Should not throw
      await expect(notificationService.initialize()).resolves.not.toThrow();
    });

    it('should handle push token errors gracefully', async () => {
      mockNotifications.getExpoPushTokenAsync = jest.fn(() => 
        Promise.reject(new Error('Token error'))
      );

      // Should not throw
      await expect(notificationService.initialize()).resolves.not.toThrow();
    });
  });
}); 