import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainApp from '../../src/components/MainApp';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaProvider>
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  </SafeAreaProvider>
);

describe('MainApp', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Authentication Screen', () => {
    it('should render authentication screen when user is not logged in', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      expect(screen.getByText('🧠 Neura')).toBeTruthy();
      expect(screen.getByText('Your AI Productivity Assistant')).toBeTruthy();
      expect(screen.getByText('Welcome Back')).toBeTruthy();
      expect(screen.getByPlaceholderText('Use your real email or test@example.com')).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter password (min 6 characters)')).toBeTruthy();
      expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('should switch between sign in and sign up modes', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Initially shows sign in
      expect(screen.getByText('Welcome Back')).toBeTruthy();
      expect(screen.getByText('Sign In')).toBeTruthy();

      // Switch to sign up
      fireEvent.press(screen.getByText("Don't have an account? Sign Up"));
      
      expect(screen.getByText('Create Account')).toBeTruthy();
      expect(screen.getByText('Create Account')).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter your full name')).toBeTruthy();

      // Switch back to sign in
      fireEvent.press(screen.getByText('Already have an account? Sign In'));
      
      expect(screen.getByText('Welcome Back')).toBeTruthy();
      expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('should validate form inputs', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      // Try to submit without filling required fields
      fireEvent.press(screen.getByText('Sign In'));

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('Please fill in all required fields')).toBeTruthy();
      });
    });
  });

  describe('Dashboard', () => {
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
    };

    const mockTasks = [
      {
        id: 'task-1',
        title: 'Test Task 1',
        status: 'pending',
        scheduled_for: new Date().toISOString(),
        difficulty_level: 3,
        energy_requirement: 'medium',
      },
      {
        id: 'task-2',
        title: 'Test Task 2',
        status: 'completed',
        scheduled_for: new Date().toISOString(),
        difficulty_level: 2,
        energy_requirement: 'low',
      },
    ];

    const mockGoals = [
      {
        id: 'goal-1',
        title: 'Test Goal 1',
        category: 'health',
        completion_percentage: 75,
        status: 'active',
      },
      {
        id: 'goal-2',
        title: 'Test Goal 2',
        category: 'career',
        completion_percentage: 30,
        status: 'active',
      },
    ];

    const mockInsights = [
      {
        id: 'insight-1',
        type: 'achievement',
        title: 'Great Progress! 🏆',
        description: 'You\'ve completed 80% of your tasks this week.',
        confidence: 0.95,
        actionable: false,
        icon: '🏆',
        created_at: new Date().toISOString(),
        read_at: null,
      },
    ];

    beforeEach(() => {
      // Mock the hooks to return authenticated user and data
      jest.doMock('../../src/hooks/useAuth', () => ({
        useAuth: () => ({
          user: mockUser,
          session: { user: mockUser },
          loading: false,
          signOut: jest.fn(),
          isAuthenticated: true,
        }),
      }));

      jest.doMock('../../src/hooks/useTasks', () => ({
        useTasks: () => ({
          todaysTasks: mockTasks,
          taskStats: {
            total: 10,
            completed: 7,
            pending: 3,
            todayTotal: 2,
            todayCompleted: 1,
            completionRate: 70,
            overdue: 0,
          },
          isLoading: false,
          createTask: jest.fn(),
          completeTask: jest.fn(),
          skipTask: jest.fn(),
          isCreating: false,
          isCompleting: false,
        }),
      }));

      jest.doMock('../../src/hooks/useGoals', () => ({
        useGoals: () => ({
          goals: mockGoals,
          isLoading: false,
          createGoal: jest.fn(),
          isCreating: false,
        }),
      }));

      jest.doMock('../../src/hooks/useInsights', () => ({
        useInsights: () => ({
          insights: mockInsights,
          isLoading: false,
          generateInsights: jest.fn(),
          markAsRead: jest.fn(),
          isGenerating: false,
        }),
      }));
    });

    it('should render dashboard when user is authenticated', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      expect(screen.getByText('🧠 Neura')).toBeTruthy();
      expect(screen.getByText('Welcome back, Test User! 👋')).toBeTruthy();
      expect(screen.getByText('+ New Task')).toBeTruthy();
      expect(screen.getByText('+ New Goal')).toBeTruthy();
    });

    it('should display task statistics', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      expect(screen.getByText('1')).toBeTruthy(); // Today completed
      expect(screen.getByText('2')).toBeTruthy(); // Today's tasks
      expect(screen.getByText('70%')).toBeTruthy(); // Success rate
      expect(screen.getByText('2')).toBeTruthy(); // Active goals
    });

    it('should show goals with progress', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      expect(screen.getByText('Test Goal 1')).toBeTruthy();
      expect(screen.getByText('Test Goal 2')).toBeTruthy();
      expect(screen.getByText('75%')).toBeTruthy();
      expect(screen.getByText('30%')).toBeTruthy();
    });

    it('should display AI insights', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      expect(screen.getByText('AI Insights')).toBeTruthy();
      expect(screen.getByText('Great Progress! 🏆')).toBeTruthy();
      expect(screen.getByText('You\'ve completed 80% of your tasks this week.')).toBeTruthy();
      expect(screen.getByText('Generate Insights')).toBeTruthy();
    });

    it('should show today\'s tasks', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      expect(screen.getByText('Today\'s Tasks')).toBeTruthy();
      expect(screen.getByText('Test Task 1')).toBeTruthy();
      expect(screen.getByText('Test Task 2')).toBeTruthy();
    });
  });

  describe('Task Creation', () => {
    it('should open task creation form', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('+ New Task'));

      expect(screen.getByText('Create New Task')).toBeTruthy();
      expect(screen.getByPlaceholderText('What do you want to accomplish?')).toBeTruthy();
    });

    it('should validate task creation form', async () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('+ New Task'));

      // Try to submit without title
      fireEvent.press(screen.getByText('Create Task'));

      await waitFor(() => {
        expect(screen.getByText('Please enter a task title')).toBeTruthy();
      });
    });
  });

  describe('Goal Creation', () => {
    it('should open goal creation form', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('+ New Goal'));

      expect(screen.getByText('Create New Goal')).toBeTruthy();
      expect(screen.getByPlaceholderText('What do you want to achieve?')).toBeTruthy();
    });

    it('should show category options', () => {
      render(
        <TestWrapper>
          <MainApp />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('+ New Goal'));

      expect(screen.getByText('Health')).toBeTruthy();
      expect(screen.getByText('Career')).toBeTruthy();
      expect(screen.getByText('Learning')).toBeTruthy();
      expect(screen.getByText('Habits')).toBeTruthy();
      expect(screen.getByText('Finance')).toBeTruthy();
      expect(screen.getByText('Relationships')).toBeTruthy();
      expect(screen.getByText('Personal')).toBeTruthy();
    });
  });
}); 