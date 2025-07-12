import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks } from '../../src/hooks/useTasks';
import { supabase } from '../../src/lib/supabase';

// Mock Supabase
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useTasks', () => {
  const testUserId = 'test-user-id';
  
  const mockTasks = [
    {
      id: 'task-1',
      user_id: testUserId,
      title: 'Test Task 1',
      description: 'Test description 1',
      scheduled_for: new Date().toISOString(),
      estimated_duration_minutes: 30,
      difficulty_level: 3,
      energy_requirement: 'medium',
      status: 'pending',
      completed_at: null,
      skipped_at: null,
      streak_count: 0,
      ai_generated: false,
      context: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'task-2',
      user_id: testUserId,
      title: 'Test Task 2',
      description: 'Test description 2',
      scheduled_for: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      estimated_duration_minutes: 45,
      difficulty_level: 4,
      energy_requirement: 'high',
      status: 'completed',
      completed_at: new Date().toISOString(),
      skipped_at: null,
      streak_count: 1,
      ai_generated: false,
      context: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the Supabase query chain
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockTasks, error: null }),
      }),
    });

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockTasks[0], error: null }),
      }),
    });

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockTasks[0], error: null }),
        }),
      }),
    });

    const mockDelete = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    mockSupabase.from = jest.fn().mockImplementation((table) => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }));
  });

  describe('Task Fetching', () => {
    it('should fetch tasks for a user', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(result.current.todaysTasks).toHaveLength(2);
    });

    it('should not fetch tasks when userId is undefined', () => {
      const { result } = renderHook(() => useTasks(undefined), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should calculate task statistics correctly', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.taskStats.total).toBe(2);
      expect(result.current.taskStats.completed).toBe(1);
      expect(result.current.taskStats.pending).toBe(1);
      expect(result.current.taskStats.completionRate).toBe(50);
    });
  });

  describe('Task Creation', () => {
    it('should create a new task', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      const newTask = {
        user_id: testUserId,
        title: 'New Test Task',
        description: 'New task description',
        scheduled_for: new Date().toISOString(),
        estimated_duration_minutes: 60,
        difficulty_level: 3,
        energy_requirement: 'medium' as const,
        status: 'pending' as const,
      };

      await act(async () => {
        await result.current.createTask(newTask);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSupabase.from('tasks').insert).toHaveBeenCalledWith(newTask);
    });

    it('should handle task creation errors', async () => {
      // Mock error response
      mockSupabase.from = jest.fn().mockImplementation(() => ({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Database error' } 
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      const newTask = {
        user_id: testUserId,
        title: 'New Test Task',
        description: 'New task description',
        scheduled_for: new Date().toISOString(),
        estimated_duration_minutes: 60,
        difficulty_level: 3,
        energy_requirement: 'medium' as const,
        status: 'pending' as const,
      };

      await act(async () => {
        try {
          await result.current.createTask(newTask);
        } catch (error) {
          expect(error).toEqual({ message: 'Database error' });
        }
      });
    });
  });

  describe('Task Completion', () => {
    it('should complete a task', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.completeTask('task-1');
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSupabase.from('tasks').update).toHaveBeenCalledWith({
        status: 'completed',
        completed_at: expect.any(String),
        streak_count: 1,
      });
    });

    it('should handle completion errors', async () => {
      // Mock error response
      mockSupabase.from = jest.fn().mockImplementation(() => ({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: null, 
                error: { message: 'Task not found' } 
              }),
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.completeTask('non-existent-task');
        } catch (error) {
          expect(error).toEqual({ message: 'Task not found' });
        }
      });
    });
  });

  describe('Task Skipping', () => {
    it('should skip a task with reason', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.skipTask({ 
          taskId: 'task-1', 
          reason: 'Too busy' 
        });
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSupabase.from('tasks').update).toHaveBeenCalledWith({
        status: 'skipped',
        skipped_at: expect.any(String),
        context: { skipReason: 'Too busy' },
      });
    });
  });

  describe('Task Filtering', () => {
    it('should filter today\'s tasks correctly', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Both tasks should be considered "today's tasks" 
      // (one is today, one is overdue from yesterday)
      expect(result.current.todaysTasks).toHaveLength(2);
    });

    it('should identify overdue tasks', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Task 2 is from yesterday and completed, so not overdue
      // Task 1 is from today and pending, so not overdue yet
      expect(result.current.taskStats.overdue).toBe(0);
    });

    it('should identify upcoming tasks', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Task 1 is pending and scheduled for today
      expect(result.current.taskStats.upcoming).toBe(1);
    });
  });

  describe('Task Status Helpers', () => {
    it('should correctly identify task status', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const pendingTask = result.current.todaysTasks.find(t => t.status === 'pending');
      const completedTask = result.current.todaysTasks.find(t => t.status === 'completed');

      expect(result.current.getTaskStatus(pendingTask!)).toBe('pending');
      expect(result.current.getTaskStatus(completedTask!)).toBe('completed');
    });

    it('should correctly identify overdue tasks', async () => {
      const { result } = renderHook(() => useTasks(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const pendingTask = result.current.todaysTasks.find(t => t.status === 'pending');
      
      // Task is not overdue (scheduled for today)
      expect(result.current.isTaskOverdue(pendingTask!)).toBe(false);
    });
  });
}); 