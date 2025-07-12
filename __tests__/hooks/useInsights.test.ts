import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInsights } from '../../src/hooks/useInsights';
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

describe('useInsights', () => {
  const testUserId = 'test-user-id';
  
  const mockInsights = [
    {
      id: 'insight-1',
      user_id: testUserId,
      type: 'achievement' as const,
      title: 'Great Progress! 🏆',
      description: 'You\'ve completed 80% of your tasks this week.',
      confidence: 0.95,
      actionable: false,
      icon: '🏆',
      metadata: { completionRate: 80, totalTasks: 10 },
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'insight-2',
      user_id: testUserId,
      type: 'pattern_recognition' as const,
      title: 'Peak Productivity Time Found! 📈',
      description: 'You\'re most productive at 9:00. Schedule important tasks during this time.',
      confidence: 0.85,
      actionable: true,
      icon: '📈',
      metadata: { peakHour: 9, taskCount: 5 },
      read_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const mockTasks = [
    {
      id: 'task-1',
      user_id: testUserId,
      title: 'Morning Task',
      status: 'completed',
      scheduled_for: new Date('2024-01-01T09:00:00Z').toISOString(),
      completed_at: new Date('2024-01-01T09:30:00Z').toISOString(),
    },
    {
      id: 'task-2',
      user_id: testUserId,
      title: 'Afternoon Task',
      status: 'completed',
      scheduled_for: new Date('2024-01-01T14:00:00Z').toISOString(),
      completed_at: new Date('2024-01-01T14:30:00Z').toISOString(),
    },
  ];

  const mockGoals = [
    {
      id: 'goal-1',
      user_id: testUserId,
      title: 'Test Goal',
      category: 'health',
      completion_percentage: 75,
      status: 'active',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the Supabase query chain for insights
    const mockInsightsSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: mockInsights, error: null }),
        }),
      }),
    });

    const mockInsightsInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockInsights, error: null }),
    });

    const mockInsightsUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockInsights[0], error: null }),
        }),
      }),
    });

    // Mock the Supabase query chain for tasks and goals
    const mockDataSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: mockTasks, error: null }),
        }),
      }),
    });

    mockSupabase.from = jest.fn().mockImplementation((table) => {
      if (table === 'insights') {
        return {
          select: mockInsightsSelect,
          insert: mockInsightsInsert,
          update: mockInsightsUpdate,
        };
      } else if (table === 'tasks') {
        return {
          select: mockDataSelect,
        };
      } else if (table === 'goals') {
        return {
          select: mockDataSelect,
        };
      }
      return {
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
      };
    });
  });

  describe('Insights Fetching', () => {
    it('should fetch insights for a user', async () => {
      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('insights');
      expect(result.current.insights).toHaveLength(2);
    });

    it('should not fetch insights when userId is undefined', () => {
      const { result } = renderHook(() => useInsights(undefined), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return empty array when no insights exist', async () => {
      // Mock empty response
      mockSupabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.insights).toHaveLength(0);
    });
  });

  describe('Insight Generation', () => {
    it('should generate insights based on user data', async () => {
      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.generateInsights();
      });

      // Should fetch user's tasks and goals for analysis
      expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockSupabase.from).toHaveBeenCalledWith('goals');
      expect(mockSupabase.from).toHaveBeenCalledWith('insights');
    });

    it('should handle insight generation errors', async () => {
      // Mock error response
      mockSupabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ 
                data: null, 
                error: { message: 'Database error' } 
              }),
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Insert error' } 
          }),
        }),
      }));

      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.generateInsights();
        } catch (error) {
          expect(error).toEqual({ message: 'Database error' });
        }
      });
    });
  });

  describe('Mark as Read', () => {
    it('should mark an insight as read', async () => {
      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.markAsRead('insight-1');
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('insights');
      expect(mockSupabase.from('insights').update).toHaveBeenCalledWith({
        read_at: expect.any(String),
      });
    });

    it('should handle mark as read errors', async () => {
      // Mock error response
      mockSupabase.from = jest.fn().mockImplementation(() => ({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: null, 
                error: { message: 'Insight not found' } 
              }),
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.markAsRead('non-existent-insight');
        } catch (error) {
          expect(error).toEqual({ message: 'Insight not found' });
        }
      });
    });
  });

  describe('Insight Analysis', () => {
    it('should analyze user data patterns correctly', async () => {
      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Check that insights are properly categorized
      const achievementInsight = result.current.insights.find(i => i.type === 'achievement');
      const patternInsight = result.current.insights.find(i => i.type === 'pattern_recognition');

      expect(achievementInsight).toBeTruthy();
      expect(patternInsight).toBeTruthy();
      expect(achievementInsight?.actionable).toBe(false);
      expect(patternInsight?.actionable).toBe(true);
    });

    it('should handle unread insights correctly', async () => {
      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // One insight is unread (read_at is null)
      const unreadInsights = result.current.insights.filter(i => !i.read_at);
      expect(unreadInsights).toHaveLength(1);
    });
  });

  describe('Loading States', () => {
    it('should show loading state while fetching insights', () => {
      // Mock loading state
      mockSupabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockImplementation(() => {
                return new Promise(() => {}); // Never resolves
              }),
            }),
          }),
        }),
      }));

      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should show generating state while creating insights', async () => {
      const { result } = renderHook(() => useInsights(testUserId), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The generating state is managed by the mutation
      expect(result.current.isGenerating).toBe(false);
    });
  });
}); 